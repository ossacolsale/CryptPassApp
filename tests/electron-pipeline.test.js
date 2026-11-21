const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const vm = require('node:vm');
const yaml = require('yaml');
const root = path.join(__dirname, '..');
const buildFile = require.resolve('cordova-electron/lib/build');
const buildRequire = createRequire(buildFile);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('clean installs pack local plugins and their locked versions match the source manifests', () => {
    assert.match(read('.npmrc'), /^install-links=true$/m);
    const manifest = JSON.parse(read('package.json'));
    const lock = JSON.parse(read('package-lock.json'));
    for (const [name, specifier] of Object.entries(manifest.devDependencies)) {
        if (!specifier.startsWith('file:')) continue;
        const plugin = JSON.parse(read(path.join(specifier.slice(5), 'package.json')));
        const locked = lock.packages[`node_modules/${name}`];
        assert.equal(locked.version, plugin.version, name);
        assert.notEqual(locked.link, true, name);
    }
});

function patchInMemory(source) {
    let result;
    const mockFs = { existsSync: () => true, readFileSync: () => source, writeFileSync: (_, value) => { result = value; } };
    vm.runInNewContext(read('scripts/patch-cordova-electron.js'), {
        __dirname: path.join(root, 'scripts'), process: {},
        require(name) {
            if (name === 'fs') return mockFs;
            if (name.endsWith('cordova-electron/package.json')) return { version: '4.0.0' };
            return require(name);
        }
    });
    return result;
}

for (const [platform, native, expected] of [['linux', 'linux', ['AppImage', 'deb']], ['win32', 'win', ['portable']]]) {
    test(`patched Cordova builder selects only native ${platform} x64 targets and never publishes`, async () => {
        const source = patchInMemory(fs.readFileSync(buildFile, 'utf8'));
        assert.equal(patchInMemory(source), source, 'postinstall patch must be idempotent');
        let options;
        const context = {
            module: { exports: {} }, __dirname: path.dirname(buildFile), process: { platform },
            require(name) {
                if (name.endsWith(path.join('build', 'base.json'))) return JSON.parse(fs.readFileSync(name, 'utf8'));
                if (name === 'electron-builder') return { build: async value => { options = value; } };
                return buildRequire(name);
            }
        };
        vm.runInNewContext(source + '\nglobalThis.TestBuilder = ElectronBuilder;', context);
        const builder = new context.TestBuilder({ buildConfig: path.join(root, 'build.json') }, { locations: { www: '/test-app' } });
        builder.buildSettings = builder.configureBuildSettings.call(builder.configureUserBuildSettings());
        await builder.build();
        assert.equal(options.publish, 'never');
        assert.equal(options.targets.size, 1);
        const [[targetPlatform, architectures]] = options.targets;
        assert.equal(targetPlatform.nodeName, platform);
        const { Arch } = buildRequire('app-builder-lib');
        assert.deepEqual(Array.from(architectures.keys()), [Arch.x64]);
        assert.deepEqual(Array.from(architectures.get(Arch.x64)), expected);
        assert.equal(options.config[native].artifactName, `CryptPass-\${version}-${platform === 'linux' ? 'linux' : 'windows'}-x64.\${ext}`);
    });
}

test('version-tag guard accepts aligned stable versions and rejects mismatched/nonstable tags', () => {
    const version = require('../package.json').version;
    for (const [tag, status] of [[`v${version}`, 0], ['v0.0.0', 1], [`v${version}-rc.1`, 1]]) {
        const result = spawnSync(process.execPath, ['scripts/check-release-version.js'], {
            cwd: root, env: { ...process.env, GITHUB_REF_TYPE: 'tag', GITHUB_REF_NAME: tag }
        });
        assert.equal(result.status, status);
    }
});

test('artifact guard requires all three final distributables and rejects ZIP-only or empty outputs', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptpass-artifacts-'));
    const version = require('../package.json').version;
    const check = () => spawnSync(process.execPath, ['scripts/check-electron-artifacts.js', 'all', directory], { cwd: root }).status;
    try {
        fs.writeFileSync(path.join(directory, 'actions.zip'), 'not-a-distributable');
        assert.equal(check(), 1);
        const files = [
            [`CryptPass-${version}-windows-x64.exe`, Buffer.from('MZtest')],
            [`CryptPass-${version}-linux-x64.AppImage`, Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0])],
            [`CryptPass-${version}-linux-x64.deb`, Buffer.from('!<arch>\ntest')]
        ];
        for (const [name, value] of files) fs.writeFileSync(path.join(directory, name), value);
        assert.equal(check(), 0);
        fs.writeFileSync(path.join(directory, files[0][0]), '');
        assert.equal(check(), 1);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('CI runs only fast checks on master pushes and pull requests', () => {
    const workflow = yaml.parse(read('.github/workflows/ci.yml'));
    assert.deepEqual(workflow.on, { push: { branches: ['master'] }, pull_request: null });
    assert.deepEqual(workflow.permissions, { contents: 'read' });
    assert.deepEqual(workflow.concurrency, {
        group: '${{ github.workflow }}-${{ github.ref }}', 'cancel-in-progress': true
    });
    assert.deepEqual(Object.keys(workflow.jobs), ['test']);
    const steps = workflow.jobs.test.steps;
    assert.deepEqual(steps.filter(step => step.run).map(step => step.run), ['npm ci', 'npm test', 'npx tsc --noEmit']);
    assert.deepEqual(steps.filter(step => step.uses).map(step => step.uses.split('@')[0]), ['actions/checkout', 'actions/setup-node']);
});

test('manual master releases publish verified assets from both native builds at their exact commit', () => {
    const workflow = yaml.parse(read('.github/workflows/electron.yml'));
    assert.deepEqual(workflow.on, { workflow_dispatch: null });
    assert.equal(workflow.concurrency['cancel-in-progress'], false);
    assert.deepEqual(workflow.permissions, { contents: 'read' });
    assert.equal(workflow.jobs.release.needs, 'build');
    assert.equal(workflow.jobs.release.if, "github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/master'");
    assert.deepEqual(workflow.jobs.release.permissions, { contents: 'write' });
    assert.deepEqual(workflow.jobs.build.strategy.matrix.include.map(item => item.platform), ['windows', 'linux']);
    const steps = workflow.jobs.build.steps;
    for (const command of ['npm ci', 'npm test', 'npx tsc --noEmit', 'npm run build-electron']) {
        assert.ok(steps.some(step => step.run === command), command);
    }
    assert.ok(steps.findIndex(step => step.run === 'npm run build-electron') < steps.findIndex(step => step.uses?.startsWith('actions/upload-artifact')));
    const uploads = steps.filter(step => step.uses?.startsWith('actions/upload-artifact'));
    assert.equal(uploads.length, 1);
    assert.equal(uploads[0].with['retention-days'], 2);
    const downloads = workflow.jobs.release.steps.filter(step => step.uses?.startsWith('actions/download-artifact'));
    assert.deepEqual(downloads.map(step => step.with.name), ['electron-windows-x64', 'electron-linux-x64']);
    assert.ok(downloads.every(step => step.with.path === 'release-assets'));
    const publish = workflow.jobs.release.steps.find(step => step.name === 'Create GitHub release');
    assert.equal(publish.env.RELEASE_TAG, 'v${{ steps.version.outputs.value }}');
    assert.equal(publish.env.RELEASE_COMMIT, '${{ github.sha }}');
    assert.match(publish.run, /gh api --method POST .*\/git\/refs"[\s\S]*-f ref="refs\/tags\/\$RELEASE_TAG" -f sha="\$RELEASE_COMMIT"/);
    assert.match(publish.run, /gh release create "\$RELEASE_TAG" --verify-tag --target "\$RELEASE_COMMIT"/);
    assert.doesNotMatch(publish.run, /--clobber|--force/);
});
