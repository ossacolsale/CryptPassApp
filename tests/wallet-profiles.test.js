const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '..', 'src/Configuration/WalletProfiles.ts'), 'utf8');
function createProfiles(initial = {}) {
    const values = new Map(Object.entries(initial));
    const secureStorage = {
        async getVal(key) { return values.has(key) ? values.get(key) : false; },
        async setVal(key, value) { values.set(key, value); return key; },
        async delVal(key) { values.delete(key); return key; }
    };
    let byteCounter = 0;
    const context = {
        SecureStorage: secureStorage,
        Uint8Array,
        JSON,
        Array,
        String,
        Error,
        window: { crypto: { getRandomValues(bytes) { bytes.forEach((_, i) => { bytes[i] = (byteCounter++ % 255) + 1; }); return bytes; } } }
    };
    const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2017 } }).outputText;
    vm.runInNewContext(js + '\nglobalThis.__profiles = WalletProfiles;', context);
    return { profiles: context.__profiles, values };
}

test('legacy single-wallet configuration migrates intact and profiles keep independent sequences', async () => {
    const legacy = JSON.stringify({ KeyFilePath: 'opaque-handle-A', Sequence: JSON.stringify({ Sequence: [1, 2, 3] }), Preferences: { ChPwdReminder: false } });
    const { profiles, values } = createProfiles({ cryptPassCfg: legacy });
    await profiles.initialize();
    let list = await profiles.list();
    assert.equal(list.length, 1);
    assert.equal(list[0].name, 'My wallet');
    assert.equal(values.get('cryptPassCfg'), legacy, 'migration must retain the old configuration');

    const originalId = list[0].id;
    const secondId = await profiles.add('Work');
    assert.ok(secondId);
    assert.equal(JSON.parse(values.get('cryptPassCfg')).KeyFilePath, '');
    assert.equal(JSON.parse(values.get('cryptPassCfg')).Sequence, '{"Sequence":[]}');
    assert.equal(await profiles.switchTo(originalId), true);
    assert.equal(values.get('cryptPassCfg'), legacy);
    assert.equal(await profiles.rename(secondId, 'Work vault'), true);
    assert.equal(await profiles.switchTo(secondId), true);
    assert.equal(await profiles.remove(originalId), true);
    assert.equal(await profiles.remove(secondId), false, 'active profile cannot be detached');
    list = await profiles.list();
    assert.deepEqual(list.map(item => item.name), ['Work vault']);
});

test('new installs create one profile and reject empty or overlong profile names', async () => {
    const { profiles } = createProfiles();
    await profiles.initialize();
    assert.equal((await profiles.list()).length, 1);
    assert.equal(await profiles.add('  '), false);
    assert.equal(await profiles.rename((await profiles.list())[0].id, 'x'.repeat(81)), false);
    assert.equal((await profiles.list()).length, 1);
});
