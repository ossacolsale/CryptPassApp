const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const ts = require('typescript');
const { ConfigCryptPass } = require('cryptpass/dist/crypt');

const root = path.join(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');

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
    assert.match(setup, /safeStorage\.encryptString/);
});

test('Electron secure storage only accepts named app configuration and profile keys', () => {
    const setup = source('setup-electron.js');
    assert.match(setup, /\['cryptPassCfg', 'cryptPassWalletProfiles'\]\.includes\(key\)/);
    assert.match(setup, /safeStorage\.isEncryptionAvailable\(\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureGet\(key\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureSet\(key, value\)/);
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

test('legacy vault entry saves use the new password based migration path', () => {
    const passView = source('src/Views/PassView.ts');
    assert.match(passView, /SetEntries\(State\.EntriesManage\.Export\(\),State\.Password\)/);
    assert.doesNotMatch(passView, /SetEntries\([^\n]*State\.K,true/);
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
