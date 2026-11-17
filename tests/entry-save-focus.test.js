const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const { ConfigCryptPass, CryptPassCached } = require('cryptpass/dist/crypt');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const password = 'test-only-entry-password';
let fixture;

test.before(async () => {
    const data = {};
    const writers = {
        KeyPassWriter: async value => { data.kp = clone(value); return true; },
        SequenceWriter: async value => { data.se = clone(value); return true; }
    };
    await new ConfigCryptPass(writers, {}).initSeqAndKey(password);
    const crypt = new CryptPassCached(writers, data.kp, data.se);
    data.key = crypt.GetK(password);
    await crypt.SetEntries({ Original: { Password: 'old-test-value', Other: { Custom: 'old-custom' } } }, data.key, true);
    fixture = clone(data);
});

async function until(check) {
    for (let i = 0; i < 100; i++) {
        if (check()) return;
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.fail('Expected asynchronous state was not reached');
}

function ui(platform = 'electron', lang = 'en') {
    const dom = new JSDOM('<div id="app"></div><div id="loader"></div>', {
        url: 'https://cryptpass.test', runScripts: 'outside-only', pretendToBeVisual: true
    });
    const win = dom.window;
    win.eval(read('www/js/jquery-3.6.0.min.js'));
    win.requestAnimationFrame = callback => win.setTimeout(callback, 0);
    const locale = JSON.parse(read(`locales/${lang}.json`));
    win.Localization = { text: key => { assert.ok(key in locale, `Missing locale: ${key}`); return locale[key]; }, translate: text => text, apply() {} };
    win.cordova = { platformId: platform, plugins: { clipboard: {}, cryptPassStorage: {} } };
    win.LibCryptPass = { CryptPassCached };
    win.StandardRnW = { SequenceWriter: async () => true, KeyPassWriter: async () => true };
    win.alert = message => assert.fail(`Unexpected alert: ${message}`);
    win.DeviceAuth = { showKeyboard() {} };
    let osFocus = 0;
    let lockRequested;
    win.cryptPassDesktop = {
        focusWindow: async activate => { if (activate !== false) osFocus++; return true; },
        onLockRequested: callback => { lockRequested = callback; return () => { lockRequested = undefined; }; }
    };
    const sources = [
        'src/Helpers/CommonHelpers.ts', 'src/Helpers/ViewHelpers.ts', 'src/Helpers/TagHelpers.ts',
        'src/Controllers/ViewModel.ts', 'src/Views/MainView.ts', 'src/Views/PassView.ts',
        'src/DataHandlers/FileSystem.ts', 'src/main.ts'
    ].map(read).join('\n');
    vm.runInContext(ts.transpileModule(sources, { compilerOptions: { target: ts.ScriptTarget.ES2017 } }).outputText +
        '\nglobalThis.types = { State, AutoLock, MainView, PassView, FS };', dom.getInternalVMContext());
    return { dom, win, ...win.types, osFocus: () => osFocus, requestLock: () => lockRequested() };
}

function saveUI(platform, edit, lang = 'en') {
    const env = ui(platform, lang);
    const { win, State, PassView } = env;
    let persisted = clone(fixture.kp);
    let release;
    let started;
    let calls = 0;
    let fail = false;
    const writeStarted = new Promise(resolve => { started = resolve; });
    const writer = async (uri, content) => {
        calls++;
        assert.equal(uri, 'vault-A');
        started();
        await new Promise(resolve => { release = resolve; });
        if (fail) throw new Error('Test storage unavailable');
        persisted = JSON.parse(content);
        return true;
    };
    win.cryptPassDesktop.saveVault = writer;
    win.cordova.plugins.cryptPassStorage = {
        writeFile: writer, readFile: async () => JSON.stringify(persisted)
    };
    State.Password = password;
    State.K = fixture.key;
    State.CryptPass = new CryptPassCached(win.StandardRnW, clone(persisted), clone(fixture.se));
    State.EntriesManage = State.CryptPass.GetEntriesManage(fixture.key, true);
    win.Config = {
        readData: async () => ({ kp: clone(persisted), se: clone(fixture.se) }),
        getActiveKeyPassUri: async () => 'vault-A'
    };
    const view = new PassView();
    if (edit) { view.viewEntry('Original'); view.handleEdit(); } else view.handleNew();
    win.document.getElementById('Name').value = edit ? 'Renamed' : 'Added';
    const secret = win.document.getElementById('Password');
    secret.focus();
    view.onFocus({ target: secret });
    secret.value = 'latest-test-value';
    const form = win.document.querySelector('form');
    const submit = () => view.onSubmit({ target: form });
    const dispatch = () => form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
    win.document.addEventListener('submit', view.Handlers.find(handler => handler.type === 'submit').handler);
    return {
        ...env, view, form, submit, dispatch, writeStarted,
        calls: () => calls, release: () => release(), setFail: value => { fail = value; },
        persisted: () => clone(persisted)
    };
}

for (const platform of ['android', 'electron']) {
    for (const edit of [false, true]) {
        test(`${platform}: ${edit ? 'edit/rename' : 'add'} saves once, waits for persistence and captures focused keyboard input`, async () => {
            const env = saveUI(platform, edit, platform === 'android' ? 'it' : 'en');
            try {
                const original = env.State.CryptPass;
                const pending = env.submit();
                assert.equal(env.form.getAttribute('aria-busy'), 'true');
                assert.equal(env.form.querySelector('[type=submit]').disabled, true);
                assert.match(env.form.querySelector('[role=status]').textContent, /Saving in progress|Salvataggio in corso/);
                assert.ok(env.form.querySelector('.spinner-border'));
                assert.equal(env.win.document.getElementById('app').style.display, '');
                env.dispatch(); env.dispatch(); // repeated Enter/programmatic submit
                env.form.querySelector('[type=submit]').click(); // native double click protection
                await env.submit();
                await env.writeStarted;
                assert.equal(env.calls(), 1);
                assert.equal(env.State.CryptPass, original);
                assert.equal(env.State.EntriesManage.GetEntry(edit ? 'Renamed' : 'Added'), false);
                env.release();
                await pending;
                assert.equal(env.calls(), 1);
                const name = edit ? 'Renamed' : 'Added';
                assert.equal(env.State.EntriesManage.GetEntry(name).Password, 'latest-test-value');
                assert.equal(env.win.document.getElementById('NameTitle').textContent, name);
                const reopened = new CryptPassCached(env.win.StandardRnW, env.persisted(), clone(fixture.se));
                assert.equal(reopened.GetEntriesManage(fixture.key, true).GetEntry(name).Password, 'latest-test-value');
                if (edit) assert.equal(env.State.EntriesManage.GetEntry('Original'), false);
            } finally { env.dom.window.close(); }
        });

        test(`${platform}: ${edit ? 'edit/rename' : 'add'} failure preserves committed state and form, then retries`, async () => {
            const env = saveUI(platform, edit);
            try {
                env.setFail(true);
                const original = env.State.CryptPass;
                const before = clone(env.State.EntriesManage.Export());
                const pending = env.submit();
                await env.writeStarted;
                env.release();
                await pending;
                assert.equal(env.State.CryptPass, original);
                assert.deepEqual(clone(env.State.EntriesManage.Export()), before);
                assert.deepEqual(env.persisted(), fixture.kp);
                assert.equal(env.form.isConnected, true);
                assert.equal(env.form.getAttribute('aria-busy'), 'false');
                assert.equal(env.form.querySelector('[type=submit]').disabled, false);
                assert.match(env.form.querySelector('[role=status]').textContent, /error during wallet saving/);
                assert.equal(env.win.document.getElementById('Name').value, edit ? 'Renamed' : 'Added');
                assert.equal(env.win.document.getElementById('Password').value, 'latest-test-value');
                env.setFail(false);
                const retry = env.submit();
                await until(() => env.calls() === 2);
                env.release();
                await retry;
                assert.equal(env.State.EntriesManage.GetEntry(edit ? 'Renamed' : 'Added').Password, 'latest-test-value');
            } finally { env.dom.window.close(); }
        });
    }
}

test('browser writer fails explicitly and restores interactive form without a false save', async () => {
    const env = saveUI('browser', false);
    try {
        const original = env.State.CryptPass;
        await env.submit();
        assert.equal(env.calls(), 0);
        assert.equal(env.State.CryptPass, original);
        assert.equal(env.State.EntriesManage.GetEntry('Added'), false);
        assert.equal(env.form.isConnected, true);
        assert.equal(env.form.querySelector('[type=submit]').disabled, false);
        assert.match(env.form.querySelector('[role=status]').textContent, /error during wallet saving/);
    } finally { env.dom.window.close(); }
});

for (const succeeds of [true, false]) {
    test(`pending save ${succeeds ? 'success' : 'failure'} cannot replace lock UI and recovers on resume`, async () => {
        const env = saveUI('electron', false);
        try {
            env.setFail(!succeeds);
            const pending = env.submit();
            await env.writeStarted;
            const snapshot = env.win.document.getElementById('app').innerHTML;
            env.view.End();
            env.State.Password = '';
            env.win.document.getElementById('app').innerHTML = '<form id="UnlockForm"></form>';
            env.release(); await pending;
            assert.ok(env.win.document.getElementById('UnlockForm'));
            env.State.Password = password;
            env.win.document.getElementById('app').innerHTML = snapshot;
            env.view.ResumeAfterLock();
            if (succeeds) assert.equal(env.win.document.getElementById('NameTitle').textContent, 'Added');
            else assert.equal(env.win.document.querySelector('[type=submit]').disabled, false);
        } finally { env.view.End(); env.dom.window.close(); }
    });
}

for (const mode of ['background', 'minimized', 'active']) {
    test(`Electron ${mode}: AutoLock does not activate OS window and password accepts focus on voluntary return`, async () => {
        const env = ui();
        const { win, State, AutoLock, MainView } = env;
        let active = mode === 'active';
        let minimized = mode === 'minimized';
        Object.defineProperty(win.document, 'hasFocus', { value: () => active });
        Object.defineProperty(win.document, 'visibilityState', { get: () => minimized ? 'hidden' : 'visible' });
        win.LocalStorage = { AutoLockTimeoutSeconds: () => 10 };
        win.ConfigActions = class { async getStatus() { return 'OK'; } };
        win.AppActions = class {};
        win.WalletProfiles = { activeName: async () => 'My wallet' };
        let login;
        win.ScenarioController = { suspendCurrentScenarioForLock() {}, changeScenario(view) { login = view; return view.Init(); } };
        try {
            State.Password = password;
            AutoLock.start();
            if (minimized) {
                // Exercise the actual generated main-process minimize hook and preload callback.
                const setup = read('setup-electron.js');
                const start = setup.indexOf("app.on('browser-window-created'");
                const end = setup.indexOf("require('electron').Menu", start);
                const fakeWindow = {
                    webContents: { send: channel => { assert.equal(channel, 'cryptpass:lock'); env.requestLock(); } },
                    on: (event, callback) => { assert.equal(event, 'minimize'); callback(); }
                };
                vm.runInNewContext(setup.slice(start, end), { app: { on: (_, callback) => callback(null, fakeWindow) } });
            } else {
                AutoLock.lastActivity = Date.now() - 11000;
                AutoLock.checkInactivity();
            }
            await until(() => win.document.getElementById('password1'));
            await new Promise(resolve => setTimeout(resolve, 10));
            assert.equal(State.Password, '');
            assert.equal(env.osFocus(), 0);
            assert.equal(minimized, mode === 'minimized');
            assert.equal(win.document.activeElement.id === 'password1', active);
            active = true; minimized = false;
            win.dispatchEvent(new win.Event('focus'));
            await until(() => win.document.activeElement.id === 'password1');
            const input = win.document.getElementById('password1');
            assert.equal(input.disabled, false);
            assert.equal(input.readOnly, false);
            input.value = 'test-unlock-input';
            assert.equal(input.value, 'test-unlock-input');
            assert.equal(env.osFocus(), 0);
            login.End();
            // Preserve explicit foreground behavior for unrelated focusEl callers.
            new MainView().focusEl('password1');
            assert.equal(env.osFocus(), 1);
        } finally { AutoLock.stop(); login?.End(); env.dom.window.close(); }
    });
}

for (const mode of ['background', 'minimized', 'active']) {
    test(`Electron main-process input recovery in ${mode} never restores/shows/activates a window`, async () => {
        const setup = read('setup-electron.js');
        const start = setup.indexOf("cryptPassHandle('cryptpass:focusWindow'");
        const end = setup.indexOf("cryptPassHandle('cryptpass:secureGet'", start);
        let handler;
        let contentFocus = 0;
        const window = {
            isDestroyed: () => false, isMinimized: () => mode === 'minimized',
            isVisible: () => mode !== 'minimized', isFocused: () => mode === 'active',
            show: () => assert.fail('Unexpected show'), restore: () => assert.fail('Unexpected restore'),
            focus: () => assert.fail('Unexpected OS activation'), webContents: { focus: () => { contentFocus++; } }
        };
        vm.runInNewContext(setup.slice(start, end), { mainWindow: window, cryptPassHandle: (_, callback) => { handler = callback; } });
        assert.equal(await handler(false), mode === 'active');
        assert.equal(contentFocus, mode === 'active' ? 1 : 0);
    });
}
