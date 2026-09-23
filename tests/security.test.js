const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const ts = require('typescript');

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

test('Electron secure storage only accepts the whitelisted configuration key', () => {
    const setup = source('setup-electron.js');
    assert.match(setup, /key === 'cryptPassCfg'/);
    assert.match(setup, /key !== 'cryptPassCfg'/);
    assert.match(setup, /safeStorage\.isEncryptionAvailable\(\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureGet\(key\)/);
    assert.match(source('src/DataHandlers/SecureStorage.ts'), /secureSet\(key, value\)/);
});

test('Android chooser uses document URIs and keeps cloud providers available', () => {
    const chooser = source('plugins/cordova-plugin-simple-file-chooser/src/android/Chooser.java');
    const saveDialog = source('plugins/cordova-plugin-save-dialog/src/android/SaveDialog.java');
    assert.match(chooser, /Intent\.ACTION_OPEN_DOCUMENT/);
    assert.doesNotMatch(chooser, /EXTRA_LOCAL_ONLY/);
    assert.match(chooser, /takePersistableUriPermission\(uri, flags\)/);
    assert.match(chooser, /Please relink it/);
    assert.match(saveDialog, /Intent\.ACTION_CREATE_DOCUMENT/);
    assert.match(saveDialog, /resultData\.getFlags\(\) & allowedFlags/);
});

test('legacy vault entry saves use the new password based migration path', () => {
    const passView = source('src/Views/PassView.ts');
    assert.match(passView, /SetEntries\(State\.EntriesManage\.Export\(\),State\.Password\)/);
    assert.doesNotMatch(passView, /SetEntries\([^\n]*State\.K,true/);
});
