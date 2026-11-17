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
                if (name.endsWith('/build/base.json')) return JSON.parse(fs.readFileSync(name, 'utf8'));
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

test('Actions workflow gates release on native builds and limits write permissions to tag publication', () => {
    const workflow = yaml.parse(read('.github/workflows/electron.yml'));
    assert.ok('workflow_dispatch' in workflow.on);
    assert.deepEqual(workflow.on.push.tags, ['v*.*.*']);
    assert.deepEqual(workflow.permissions, { contents: 'read' });
    assert.equal(workflow.jobs.release.needs, 'build');
    assert.match(workflow.jobs.release.if, /github.event_name == 'push'/);
    assert.deepEqual(workflow.jobs.release.permissions, { contents: 'write' });
    assert.deepEqual(workflow.jobs.build.strategy.matrix.include.map(item => item.platform), ['windows', 'linux']);
    const steps = workflow.jobs.build.steps;
    for (const command of ['npm ci', 'npm test', 'npx tsc --noEmit', 'npm run build-electron']) {
        assert.ok(steps.some(step => step.run === command), command);
    }
    assert.ok(steps.findIndex(step => step.run === 'npm run build-electron') < steps.findIndex(step => step.uses?.startsWith('actions/upload-artifact')));
    const uploads = steps.filter(step => step.uses?.startsWith('actions/upload-artifact'));
    assert.equal(uploads.length, 1);
    const downloads = workflow.jobs.release.steps.filter(step => step.uses?.startsWith('actions/download-artifact'));
    assert.deepEqual(downloads.map(step => step.with.name), ['electron-windows-x64', 'electron-linux-x64']);
    assert.ok(downloads.every(step => step.with.path === 'release-assets'));
});
