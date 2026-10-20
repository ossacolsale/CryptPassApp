const assert = require('node:assert/strict');
const { createCipheriv } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { CommonSymEnc } = require('cryptpass/dist/Common');
const { CryptPassCached } = require('cryptpass/dist/crypt');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/AppManage/AppActions.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
const testPassword = 'legacy-migration-test-password';

function encryptLegacy(key, iv, plaintext) {
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]).toString('hex');
}

function makeLegacyVault() {
    const salt = '00112233445566778899aabbccddeeff';
    const masterKey = '0123456789abcdef0123456789abcdef';
    const masterIv = 'abcdef0123456789';
    const passwordKey = CommonSymEnc.LegacyGetEncKey(testPassword, salt);
    const encryptedMaster = encryptLegacy(passwordKey.key, passwordKey.iv, `${masterKey}:${masterIv}`);
    const chunks = Array.from({ length: 26 }, (_, index) => encryptedMaster.slice(
        Math.floor(index * encryptedMaster.length / 26),
        Math.floor((index + 1) * encryptedMaster.length / 26)
    ));
    const entries = {
        'Migration test entry': {
            Name: 'Migration test entry',
            Username: 'test-user',
            Password: 'test-only-value'
        }
    };
    return {
        keyPass: {
            Key: { Salt: salt, MasterKChunks: chunks, LastChange: '2024-01-01T00:00:00.000Z' },
            Pass: { Description: '', Entries: encryptLegacy(masterKey, masterIv, JSON.stringify(entries)) }
        },
        sequence: { Sequence: Array.from({ length: 26 }, (_, index) => index) }
    };
}

function makeHarness({ failWrite = false, corruptPersisted = false, corruptLegacyEntries = false } = {}) {
    const fixture = makeLegacyVault();
    if (corruptLegacyEntries) fixture.keyPass.Pass.Entries = '00';
    const original = JSON.parse(JSON.stringify(fixture.keyPass));
    let persisted = JSON.parse(JSON.stringify(original));
    let backup = null;
    let sawKeepBackup = false;
    let backupAtMigration = null;
    const state = { CryptPass: null, EntriesManage: null, K: '', Password: '' };
    const config = {
        async readData() {
            return { kp: JSON.parse(JSON.stringify(persisted)), se: JSON.parse(JSON.stringify(fixture.sequence)) };
        },
        async getActiveKeyPassUri() { return 'test-vault'; },
        async writeKeyPass(keyPass, keepBackup = false) {
            if (keepBackup) {
                sawKeepBackup = true;
                if (backup === null) backup = JSON.parse(JSON.stringify(persisted));
                backupAtMigration = JSON.parse(JSON.stringify(backup));
            }
            if (failWrite) return false;
            persisted = JSON.parse(JSON.stringify(keyPass));
            if (corruptPersisted) {
                const envelope = JSON.parse(persisted.Pass.Entries);
                envelope.tag = '00'.repeat(16);
                persisted.Pass.Entries = JSON.stringify(envelope);
            }
            return true;
        }
    };
    const fileSystem = {
        async RestoreMigrationBackup() {
            if (backup === null) return false;
            persisted = JSON.parse(JSON.stringify(backup));
            return true;
        },
        async DiscardMigrationBackup() { backup = null; return true; }
    };
    const context = {
        State: state,
        Config: config,
        FS: fileSystem,
        StandardRnW: {
            SequenceWriter: async () => true,
            KeyPassWriter: (keyPass, keepBackup) => config.writeKeyPass(keyPass, keepBackup)
        },
        LibCryptPass: { CryptPassCached },
        AutoLock: { start() {} },
        console
    };
    vm.runInNewContext(output + '\nglobalThis.__AppActions = AppActions;', context);
    return {
        actions: new context.__AppActions(),
        original,
        readPersisted: () => JSON.parse(JSON.stringify(persisted)),
        get backup() { return backup && JSON.parse(JSON.stringify(backup)); },
        get sawKeepBackup() { return sawKeepBackup; },
        get backupAtMigration() { return backupAtMigration && JSON.parse(JSON.stringify(backupAtMigration)); },
        state
    };
}

test('app explicitly migrates a validated legacy vault and verifies the persisted v2 vault before releasing backup', async () => {
    const harness = makeHarness();
    const unlock = await harness.actions.Unlock(testPassword);
    assert.equal(unlock.status, 'migration-required');
    assert.match(unlock.notice, /unauthenticated AES-CBC/);
    assert.deepEqual(harness.readPersisted(), harness.original, 'unlock must leave the source vault unchanged');
    assert.equal(harness.state.EntriesManage, null, 'legacy entries stay unavailable before migration');

    assert.equal(await harness.actions.MigrateLegacy(testPassword), true);
    assert.equal(harness.readPersisted().Key.FormatVersion, 2);
    assert.equal(harness.sawKeepBackup, true);
    assert.deepEqual(harness.backupAtMigration, harness.original, 'the writer backup must contain the original ciphertext');
    assert.equal(harness.backup, null, 'the backup is discarded only after the persisted vault reopens');
    assert.deepEqual(harness.state.EntriesManage.GetEntryNames(), ['Migration test entry']);
});

test('app restores the original vault when persisted migration output fails authenticated reopen', async () => {
    const harness = makeHarness({ corruptPersisted: true });
    assert.equal((await harness.actions.Unlock(testPassword)).status, 'migration-required');
    assert.equal(await harness.actions.MigrateLegacy(testPassword), false);
    assert.deepEqual(harness.readPersisted(), harness.original, 'failed verification must restore the original ciphertext');
    assert.equal(harness.backup, null, 'the backup is removed after a successful restore');
    assert.equal(harness.state.CryptPass, null, 'failed migration must leave the vault locked');
});

test('app restores the original vault when the migration writer reports failure', async () => {
    const harness = makeHarness({ failWrite: true });
    assert.equal((await harness.actions.Unlock(testPassword)).status, 'migration-required');
    assert.equal(await harness.actions.MigrateLegacy(testPassword), false);
    assert.deepEqual(harness.readPersisted(), harness.original);
    assert.equal(harness.backup, null);
    assert.equal(harness.state.CryptPass, null);
});

test('legacy decryption or schema failure is not reported as a confirmed wrong password', async () => {
    const harness = makeHarness({ corruptLegacyEntries: true });
    assert.equal((await harness.actions.Unlock(testPassword)).status, 'legacy-unlock-failed');
    assert.deepEqual(harness.readPersisted(), harness.original);
    assert.equal(harness.state.EntriesManage, null);
    assert.equal(harness.state.CryptPass, null);
});
