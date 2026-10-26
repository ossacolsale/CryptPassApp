const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const ts = require('typescript');
const { ConfigCryptPass } = require('cryptpass/dist/crypt');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function loadElectronSecureRuntime({ platform = 'linux', backend = 'gnome_libsecret', available = true, encryptedFile, decrypt, encrypt } = {}) {
    const setup = source('setup-electron.js');
    const start = setup.indexOf('let cryptPassSecureValues =');
    const end = setup.indexOf('function cryptPassMigrationBackupPath');
    assert.ok(start >= 0 && end > start, 'secure-storage runtime block is present');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cryptpass-secure-test-'));
    const filePath = path.join(directory, 'cryptpass-secure.bin');
    if (encryptedFile) fs.writeFileSync(filePath, encryptedFile);
    const cryptPassVaults = new Map();
    const safeStorage = {
        isAsyncEncryptionAvailable: async () => typeof available === 'function' ? available() : available,
        getSelectedStorageBackend: () => backend,
        decryptStringAsync: decrypt || (async () => ({
            result: JSON.stringify({ values: { cryptPassCfg: null, cryptPassWalletProfiles: null }, vaults: {} }),
            shouldReEncrypt: false
        })),
        encryptStringAsync: encrypt || (async value => Buffer.from(`v11:${value}`))
    };
    const context = {
        app: { whenReady: () => Promise.resolve(), getPath: () => directory },
        path, fs, safeStorage, process: { platform }, crypto: require('node:crypto'), cryptPassVaults
    };
    const runtime = setup.slice(start, end) + `\nglobalThis.__runtime = { ready: () => cryptPassReady, values: () => cryptPassSecureValues, persist: () => cryptPassPersist() };`;
    vm.runInNewContext(runtime, context);
    return { runtime: context.__runtime, directory, filePath, safeStorage, cryptPassVaults, cleanup: () => fs.rmSync(directory, { recursive: true, force: true }) };
}

function loadViewHelpers() {
    const input = source('src/Helpers/ViewHelpers.ts');
    const output = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
    const context = {};
    vm.runInNewContext(output + '\nglobalThis.__helpers = ViewHelpers;', context);
    return context.__helpers;
}

test('wallet values render as text and escaped quoted attributes', () => {
    const ViewHelpers = loadViewHelpers();
    const payloads = [
        '<img src=x onerror=alert(1)>',
        '<script>alert(1)</script>',
        '"><img src=x onerror=alert(1)>',
        "' autofocus onfocus=alert(1) x='",
        '&lt;script&gt;',
        '🗝️\u2028</textarea>'
    ];
    for (const payload of payloads) {
        const markup = [
            ViewHelpers.button('entry', payload),
            ViewHelpers.label('entry', payload),
            ViewHelpers.textinput('value', payload, payload),
            ViewHelpers.hiddeninput('hidden', payload)
        ].join('\n');
        const dom = new JSDOM(markup, { runScripts: 'dangerously' });
        assert.equal(dom.window.document.querySelectorAll('script, img, textarea').length, 0);
        for (const element of dom.window.document.querySelectorAll('*')) {
            for (const attribute of element.attributes) assert.doesNotMatch(attribute.name, /^on/i);
        }
        assert.equal(dom.window.document.querySelector('button').textContent, payload);
        assert.equal(dom.window.document.querySelector('label').textContent, payload);
        assert.equal(dom.window.document.querySelector('#value').placeholder, payload);
        assert.equal(dom.window.document.querySelector('#value').value, payload);
        assert.equal(dom.window.document.querySelector('#hidden').value, payload);
    }
});

test('Electron renderer has no arbitrary filesystem IPC and main validates IPC sender', () => {
    const setup = source('setup-electron.js');
    const fileSystem = source('src/DataHandlers/FileSystem.ts');
    assert.doesNotMatch(setup, /ipcMain\.handle\(['"]fs(?:read|write)['"]|exposeInMainWorld\(['"]fs['"]|readFileSync\(uri|writeFileSync\(uri/);
    assert.doesNotMatch(fileSystem, /fs\.readFileSync|fs\.writeFileSync|file\.path/);
    assert.match(setup, /function cryptPassAssertSender\(event\)/);
    assert.match(setup, /event\.sender !== mainWindow\.webContents/);
    assert.match(setup, /frame !== mainWindow\.webContents\.mainFrame/);
    assert.match(setup, /dialog\.showOpenDialog/);
    assert.match(setup, /dialog\.showSaveDialog/);
    assert.match(setup, /cryptPassVaults\.get\(handle\)/);
    assert.match(setup, /safeStorage\.encryptStringAsync/);
});

test('Electron sandbox is enabled while the Cordova preload stays within sandbox APIs', () => {
    const settings = JSON.parse(source('src/settings/electron.json'));
    const setup = source('setup-electron.js');
    const patch = source('scripts/electron-after-prepare.js');
    assert.equal(settings.browserWindow.webPreferences.sandbox, true);
    assert.equal(settings.browserWindow.webPreferences.nodeIntegration, false);
    assert.equal(settings.browserWindow.webPreferences.contextIsolation, true);
    assert.match(setup, /browserWindowOpts\.webPreferences\.sandbox = false/);
    assert.match(setup, /const preloadPackageImport = "const \{ cordova \} = require\('\.\/package\.json'\);"/);
    assert.match(setup, /preload = preload\.replace\(preloadPackageImport, `const cordova = \$\{JSON\.stringify\(cordovaConfig\)\};`\)/);
    assert.match(setup, /main = main\.replace\(sandboxOverride, ''\)/);
    for (const setting of ['nodeIntegration = false', 'contextIsolation = true', 'sandbox = true', 'webSecurity = true']) {
        assert.ok(setup.includes(`browserWindowOpts.webPreferences.${setting};`), `missing generated Electron setting ${setting}`);
    }
    assert.match(patch, /require\('\.\.\/setup-electron\.js'\)/);
});

test('Electron bridge covers vault lifecycle, secure storage, locking, and navigation boundaries', () => {
    const setup = source('setup-electron.js');
    for (const channel of [
        'cryptpass:openVault', 'cryptpass:createVault', 'cryptpass:readVault', 'cryptpass:saveVault',
        'cryptpass:secureStorageStatus', 'cryptpass:secureGet', 'cryptpass:secureSet',
        'cryptpass:secureDelete', 'cryptpass:focusWindow'
    ]) assert.ok(setup.includes(channel), `missing Electron bridge channel ${channel}`);
    assert.match(setup, /window\.on\('minimize', \(\) => window\.webContents\.send\('cryptpass:lock'\)\)/);
    assert.match(setup, /contents\.setWindowOpenHandler\(\(\) => \(\{ action: 'deny' \}\)\)/);
    assert.match(setup, /contents\.on\('will-navigate'/);
    assert.match(setup, /frame !== mainWindow\.webContents\.mainFrame/);
});

test('Electron secure storage only accepts named app configuration and profile keys', () => {
    const setup = source('setup-electron.js');
    assert.match(setup, /\['cryptPassCfg', 'cryptPassWalletProfiles'\]\.includes\(key\)/);
    assert.match(setup, /safeStorage\.isAsyncEncryptionAvailable\(\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureGet\(key\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureSet\(key, value\)/);
});

test('Electron secure startup waits for the asynchronous OS-backed storage check', async () => {
    let releaseAvailability;
    const state = loadElectronSecureRuntime({ available: () => new Promise(resolve => { releaseAvailability = resolve; }) });
    try {
        let ready = false;
        state.runtime.ready().then(() => { ready = true; });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(ready, false);
        releaseAvailability(true);
        await state.runtime.ready();
        assert.equal(ready, true);
    } finally { state.cleanup(); }
});

test('Electron secure startup rejects unavailable or weaker Linux storage providers', async () => {
    for (const options of [
        { platform: 'linux', backend: 'basic_text', available: true, encrypt: async () => Buffer.from('v10:weak-fallback') },
        { platform: 'linux', backend: 'unknown', available: true, encrypt: async () => Buffer.from('v10:weak-fallback') },
        { platform: 'linux', backend: 'gnome_libsecret', available: true, encrypt: async () => Buffer.from('v10:weak-fallback') },
        { platform: 'linux', backend: 'gnome_libsecret', available: false },
        { platform: 'win32', available: false },
        { platform: 'darwin', available: false }
    ]) {
        const state = loadElectronSecureRuntime(options);
        try { await assert.rejects(state.runtime.ready(), /Secure storage unavailable/); }
        finally { state.cleanup(); }
    }
});

test('Electron Linux accepts the async Secret Portal provider even when the legacy backend is basic_text', async () => {
    const state = loadElectronSecureRuntime({
        platform: 'linux', backend: 'basic_text', available: true,
        encrypt: async value => Buffer.from(`v12:${value}`)
    });
    try { await state.runtime.ready(); }
    finally { state.cleanup(); }
});

test('Electron secure startup rejects corrupt persisted data and async decryption errors', async () => {
    const invalidData = loadElectronSecureRuntime({
        encryptedFile: Buffer.from('legacy encrypted blob'),
        decrypt: async encrypted => {
            assert.ok(Buffer.isBuffer(encrypted));
            return { result: '{broken', shouldReEncrypt: false };
        }
    });
    try { await assert.rejects(invalidData.runtime.ready()); }
    finally { invalidData.cleanup(); }

    const failedDecrypt = loadElectronSecureRuntime({
        encryptedFile: Buffer.from('legacy encrypted blob'),
        decrypt: async () => { throw new Error('temporarily unavailable'); }
    });
    try { await assert.rejects(failedDecrypt.runtime.ready(), /temporarily unavailable/); }
    finally { failedDecrypt.cleanup(); }
});

test('Electron secure startup retries key rotation and atomically persists async re-encryption', async () => {
    const restored = { values: { cryptPassCfg: 'cfg', cryptPassWalletProfiles: 'profiles' }, vaults: { wallet: '/vault' } };
    let decryptCalls = 0;
    let encryptCalls = 0;
    let releaseReencrypt;
    const state = loadElectronSecureRuntime({
        encryptedFile: Buffer.from('old synchronous ciphertext'),
        decrypt: async encrypted => {
            assert.ok(Buffer.isBuffer(encrypted));
            decryptCalls++;
            return { result: JSON.stringify(restored), shouldReEncrypt: decryptCalls === 1 };
        },
        encrypt: async value => {
            encryptCalls++;
            if (encryptCalls < 3) return Buffer.from('v11:provider-check');
            return new Promise(resolve => { releaseReencrypt = () => resolve(Buffer.from(`v11:async:${value}`)); });
        }
    });
    try {
        let ready = false;
        const readyPromise = state.runtime.ready().then(() => { ready = true; });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(ready, false);
        releaseReencrypt();
        await readyPromise;
        assert.equal(ready, true);
        assert.equal(decryptCalls, 2);
        assert.equal(encryptCalls, 3);
        assert.equal(state.runtime.values().values.cryptPassCfg, 'cfg');
        assert.equal(state.cryptPassVaults.get('wallet'), '/vault');
        assert.match(fs.readFileSync(state.filePath, 'utf8'), /^v11:async:/);
        assert.equal(fs.readdirSync(state.directory).filter(name => name.endsWith('.tmp')).length, 0);
    } finally { state.cleanup(); }
});

test('Electron secure persistence rejects async encryption failures without replacing the file', async () => {
    let encryptCalls = 0;
    const state = loadElectronSecureRuntime({
        encryptedFile: Buffer.from('existing ciphertext'),
        encrypt: async () => {
            encryptCalls++;
            if (encryptCalls === 1) return Buffer.from('v11:provider-check');
            throw new Error('encryption failed');
        }
    });
    try {
        await state.runtime.ready();
        await assert.rejects(state.runtime.persist(), /encryption failed/);
        assert.equal(fs.readFileSync(state.filePath, 'utf8'), 'existing ciphertext');
        assert.equal(fs.readdirSync(state.directory).filter(name => name.endsWith('.tmp')).length, 0);
    } finally { state.cleanup(); }
});

test('Electron does not migrate stale renderer values until secure storage readiness and lookup succeed', () => {
    const secureStorage = source('src/DataHandlers/SecureStorage.ts');
    const electronGet = secureStorage.slice(secureStorage.indexOf("case 'electron':"), secureStorage.indexOf("case 'android':"));
    assert.ok(electronGet.indexOf('secureStorageStatus()') < electronGet.indexOf("if (!status || status.ready !== true) throw"));
    assert.ok(electronGet.indexOf("if (!status || status.ready !== true) throw") < electronGet.indexOf('secureGet(key)'));
    assert.ok(electronGet.indexOf('secureGet(key)') < electronGet.indexOf('window.localStorage.getItem(key)'));
    assert.match(electronGet, /if \(saved === false \|\| saved === undefined\) return false;/);
});

test('Android storage is provided by the repository-local SAF plugin', () => {
    const pluginRoot = 'local-plugins/cordova-plugin-cryptpass-storage/';
    const manifest = source(pluginRoot + 'plugin.xml');
    const native = source(pluginRoot + 'src/android/CryptPassStorage.java');
    const wrapper = source(pluginRoot + 'www/cryptpass-storage.js');
    const appStorage = source('src/DataHandlers/FileSystem.ts');
    const packageJson = JSON.parse(source('package.json'));
    const typings = source('typings/cordova-typings.d.ts');
    const config = source('config.xml');

    assert.match(manifest, /id="cordova-plugin-cryptpass-storage"/);
    assert.match(manifest, /<platform name="android">/);
    assert.match(manifest, /<feature name="CryptPassStorage">/);
    assert.match(native, /Intent\.ACTION_OPEN_DOCUMENT_TREE/);
    assert.match(native, /takePersistableUriPermission/);
    assert.match(native, /isReadPermission\(\)/);
    assert.match(native, /isWritePermission\(\)/);
    assert.match(native, /DocumentsContract\.getTreeDocumentId/);
    assert.match(native, /buildChildDocumentsUriUsingTree/);
    assert.match(native, /buildDocumentUriUsingTree/);
    assert.match(native, /DocumentsContract\.createDocument/);
    assert.match(native, /openInputStream/);
    assert.match(native, /openOutputStream/);
    assert.doesNotMatch(native, /Intent\.ACTION_OPEN_DOCUMENT(?!_TREE)/);
    assert.doesNotMatch(native, /Intent\.ACTION_CREATE_DOCUMENT/);
    assert.doesNotMatch(native, /EXTRA_LOCAL_ONLY/);
    assert.match(wrapper, /'CryptPassStorage'/);
    assert.match(appStorage, /cordova\.plugins\.cryptPassStorage/);
    assert.doesNotMatch(appStorage, /saveDialog|chooser\.readFile|cordova\.exec/);
    assert.equal(packageJson.devDependencies['cordova-plugin-cryptpass-storage'], 'file:local-plugins/cordova-plugin-cryptpass-storage');
    assert.equal(packageJson.devDependencies['cordova-plugin-cryptpass-secure-storage'], 'file:local-plugins/cordova-plugin-cryptpass-secure-storage');
    assert.ok(!JSON.stringify(packageJson).includes('cordova-plugin-save-dialog'));
    assert.ok(!JSON.stringify(packageJson).includes('cordova-plugin-simple-file-chooser'));
    assert.doesNotMatch(typings, /cordova-plugin-(save-dialog|simple-file-chooser)/);
    assert.doesNotMatch(config, /android-after-prepare/);
    assert.equal(fs.existsSync(path.join(root, 'scripts/android-after-prepare.js')), false);
});


test('Android DeviceAuth is registered in the existing local storage plugin', () => {
    const pluginRoot = 'local-plugins/cordova-plugin-cryptpass-storage/';
    const manifest = source(pluginRoot + 'plugin.xml');
    const native = source(pluginRoot + 'src/android/CryptPassDeviceAuth.java');
    const wrapper = source(pluginRoot + 'www/cryptpass-storage.js');
    const app = source('src/main.ts');
    const typings = source('typings/cordova-typings.d.ts');
    assert.match(manifest, /name="CryptPassDeviceAuth"[\s\S]*?com\.cryptpass\.storage\.CryptPassDeviceAuth/);
    assert.match(native, /"hasScreenLock"/);
    assert.match(native, /"confirm"/);
    assert.match(native, /"showKeyboard"/);
    assert.match(wrapper, /callDeviceAuth\('hasScreenLock'/);
    assert.match(wrapper, /callDeviceAuth\('confirm'/);
    assert.match(wrapper, /callDeviceAuth\('showKeyboard'/);
    assert.match(app, /cordova\.plugins\.cryptPassStorage\.deviceAuth\.confirm/);
    assert.match(typings, /cryptPassStorage: CryptPassStoragePlugin/);
});

test('local secure-storage fork preserves aliases and supports locked and unlocked devices', () => {
    const pluginRoot = 'local-plugins/cordova-plugin-cryptpass-secure-storage/';
    const packageJson = JSON.parse(source(pluginRoot + 'package.json'));
    const manifest = source(pluginRoot + 'plugin.xml');
    const rsa = source(pluginRoot + 'src/android/RSA.java');
    const secureStorage = source(pluginRoot + 'src/android/SecureStorage.java');
    assert.equal(packageJson.cordova.id, 'cordova-plugin-cryptpass-secure-storage');
    assert.match(manifest, /name="SecureStorage"/);
    assert.match(rsa, /boolean deviceSecure = keyguard != null && keyguard\.isDeviceSecure\(\)/);
    assert.match(rsa, /setUserAuthenticationRequired\(deviceSecure\)/);
    assert.match(secureStorage, /String res = INIT_PACKAGENAME \+ "\." \+ service/);
    assert.match(secureStorage, /INIT_SERVICE = service;[\s\S]*?SERVICE_STORAGE\.put\(service, PREFS\);\s*if \(!rsa\.encryptionKeysAvailable\(alias\)\)/);
    assert.doesNotMatch(secureStorage, /if \(!isDeviceSecure\(\)\) \{\s*Log\.e\(TAG, MSG_DEVICE_NOT_SECURE\)/);
});

test('Android Gradle debug suffix is versioned and the Android prepare hook is gone', () => {
    const config = source('config.xml');
    const extras = source('res/android/build-extras.gradle');
    assert.match(config, /<resource-file src="res\/android\/build-extras\.gradle" target="app\/build-extras\.gradle"/);
    assert.doesNotMatch(config, /android-after-prepare/);
    assert.match(extras, /debug \{[\s\S]*applicationIdSuffix '\.debug'/);
    assert.doesNotMatch(extras, /release \{[\s\S]*applicationIdSuffix/);
});

test('new wallet setup generates a valid sequence before importing stored sequence data', async () => {
    const configActions = source('src/Configuration/ConfigActions.ts');
    assert.match(configActions, /await this\.InitCryptPassConfig\(true\)/);
    assert.match(configActions, /initializingNewWallet \? undefined : data\.se/);

    const writes = {};
    const writers = {
        SequenceWriter: async value => { writes.sequence = value; return true; },
        KeyPassWriter: async value => { writes.keypass = value; return true; }
    };
    assert.throws(
        () => new ConfigCryptPass(writers, {}, { Sequence: [] }),
        /Invalid sequence/
    );
    const freshConfig = new ConfigCryptPass(writers, {});
    assert.equal(await freshConfig.initSeqAndKey('a-long-test-password'), true);
    assert.equal(writes.sequence.Sequence.length, 26);
    assert.equal(writes.keypass.Key.MasterKChunks.length, 26);
});

test('unlock rejects hostile scrypt metadata before deriving a key', async () => {
    const writes = {};
    const writers = {
        SequenceWriter: async value => { writes.sequence = value; return true; },
        KeyPassWriter: async value => { writes.keypass = value; return true; }
    };
    const setup = new ConfigCryptPass(writers, {});
    assert.equal(await setup.initSeqAndKey('a-long-test-password'), true);

    const keypass = JSON.parse(JSON.stringify(writes.keypass));
    const sequence = JSON.parse(JSON.stringify(writes.sequence));
    keypass.Key.Kdf = { name: 'scrypt', N: 1048576, r: 32, p: 16 };

    const scrypt = require('scrypt-js');
    const originalSyncScrypt = scrypt.syncScrypt;
    let calls = 0;
    scrypt.syncScrypt = (...args) => { calls++; return originalSyncScrypt(...args); };
    try {
        const unlock = new ConfigCryptPass(writers, keypass, sequence);
        assert.equal(unlock.checkPwd('a-long-test-password'), false);
        assert.equal(calls, 0, 'hostile vault metadata must be rejected before scrypt');
    } finally {
        scrypt.syncScrypt = originalSyncScrypt;
    }
});

test('Android stable vault references retain their localStorage grant mapping', () => {
    const appStorage = source('src/DataHandlers/FileSystem.ts');
    assert.match(appStorage, /'cryptPassDocumentTree:' \+ uri/);
    assert.match(appStorage, /JSON\.stringify\(\{ treeUri: treeUri, name: name \}\)/);
    assert.match(appStorage, /'cryptpass-tree:' \+ encodeURIComponent\(selectedFolder\.treeUri\) \+ '#\/' \+ encodeURIComponent\(fileName\)/);
    assert.match(appStorage, /'cryptpass-tree:' \+ encodeURIComponent\(selectedFolder\.treeUri\) \+ '#\/' \+ encodeURIComponent\(file\.relativePath\)/);
    assert.match(appStorage, /window\.localStorage\.getItem\(this\.treeGrantKey\(uri\)\)/);
});

test('AutoLock timer callbacks avoid shared static-field aliases in the bundled script', () => {
    const application = source('src/main.ts');
    const start = application.indexOf('class AutoLock {');
    const end = application.indexOf('\nclass DeviceAuth {', start);
    assert.ok(start >= 0 && end > start, 'AutoLock source should be present');
    const autoLock = application.slice(start, end);
    assert.match(autoLock, /private static reset\(\): void/);
    assert.match(autoLock, /AutoLock\.scheduleLock\(LocalStorage\.AutoLockTimeoutSeconds\(\) \* 1000\)/);
    assert.doesNotMatch(autoLock, /private static (?:reset|checkInactivity|onVisibilityChange|onWindowBlur|lock)\s*=/);
    const emitted = ts.transpileModule(autoLock, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
    assert.match(emitted, /static scheduleLock\(delay\)/);
    assert.doesNotMatch(emitted, /_a\.scheduleLock/);
});

test('legacy vaults require the explicit CryptPass migration API before entries are exposed', () => {
    const actions = source('src/AppManage/AppActions.ts');
    assert.match(actions, /State\.CryptPass\.MigrationRequired/);
    assert.match(actions, /State\.CryptPass\.MigrationNotice/);
    assert.match(actions, /status: isLegacy \? 'legacy-unlock-failed' : 'wrong-password'/);
    assert.match(actions, /cryptPass\.MigrateLegacy\(pwd\)/);
    assert.match(actions, /new LibCryptPass\.CryptPassCached\(StandardRnW, persisted\.kp, persisted\.se\)/);
    assert.match(actions, /FS\.RestoreMigrationBackup\(vaultUri\)/);
    const mainView = source('src/Views/MainView.ts');
    assert.match(mainView, /window\.confirm\(Localization\.text\('main\.legacyMigrationConfirm'\)\)/);
    assert.match(mainView, /main\.legacyMigrationConfirm/);
    const passView = source('src/Views/PassView.ts');
    assert.match(passView, /SetEntries\(State\.EntriesManage\.Export\(\),State\.Password\)/);
    assert.doesNotMatch(passView, /SetEntries\([^\n]*State\.K,true/);
});

test('legacy migration writer retains a rollback copy and reopens from persisted storage', () => {
    const appFiles = source('src/DataHandlers/FileSystem.ts') + source('src/Configuration/Config.ts');
    assert.match(source('src/Configuration/StdReadersAndWriters.ts'), /KeyPassWriter: \(kp, keepBackup\) => Config\.writeKeyPass\(kp, keepBackup\)/);
    assert.match(appFiles, /FS\.WriteFile\(kpPath, JSON\.stringify\(kp\), keepBackup\)/);
    assert.match(appFiles, /cryptPassMigrationBackup:/);
    const setup = source('setup-electron.js');
    assert.match(setup, /copyFile\(filePath, cryptPassMigrationBackupPath\(filePath\), fs\.constants\.COPYFILE_EXCL\)/);
    assert.match(setup, /cryptpass:restoreVaultBackup/);
    assert.match(setup, /cryptpass:discardVaultBackup/);
});


test('English and Italian locales have matching keys and missing values fall back to English', () => {
    const en = JSON.parse(source('locales/en.json'));
    const it = JSON.parse(source('locales/it.json'));
    assert.deepEqual(Object.keys(it).sort(), Object.keys(en).sort());
    assert.ok(Object.values(it).every(value => typeof value === 'string' && value.length > 0));
    const localeCallSites = source('src/Helpers/ViewHelpers.ts') + source('src/Views/PassView.ts') + source('src/Views/WalletProfilesView.ts');
    const referencedKeys = [...localeCallSites.matchAll(/Localization\.text\('([^']+)'\)/g)].map(match => match[1]);
    for (const key of referencedKeys) assert.ok(Object.hasOwn(en, key), `missing English translation for ${key}`);
    const localization = source('src/Helpers/Localization.ts');
    assert.ok(localization.includes('window.CRYPTPASS_LOCALES?.en?.[key] || key'));
});

test('Italian localization translates UI text and alerts, preserves marked wallet data and leaves user values untouched', () => {
    const dom = new JSDOM('<main><h2>Other options</h2><p translate="no">Wallets</p><input placeholder="Type password" value="Password"></main>', { url: 'https://app.test' });
    const localeMap = { en: JSON.parse(source('locales/en.json')), it: JSON.parse(source('locales/it.json')) };
    dom.window.CRYPTPASS_LOCALES = localeMap;
    const alerts = [];
    dom.window.alert = message => alerts.push(message);
    const context = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator, NodeFilter: dom.window.NodeFilter };
    const output = ts.transpileModule(source('src/Helpers/Localization.ts'), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(output + '\nglobalThis.__localization = Localization;', context);
    const localization = context.__localization;
    localization.initialize();
    localization.setLanguage('it', false);
    localization.apply(dom.window.document.querySelector('main'));
    dom.window.alert('Wrong password!');
    assert.equal(dom.window.document.querySelector('h2').textContent, 'Altre opzioni');
    assert.equal(dom.window.document.querySelector('[translate="no"]').textContent, 'Wallets');
    assert.equal(dom.window.document.querySelector('input').placeholder, 'Inserisci la password');
    assert.equal(dom.window.document.querySelector('input').value, 'Password');
    assert.deepEqual(alerts, ['Password errata!']);
    delete localeMap.it['other.title'];
    assert.equal(localization.text('other.title'), 'Other options');
});
