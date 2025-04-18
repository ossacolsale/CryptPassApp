"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class State {
    static get K() {
        return this.__K_;
    }
    static set K(value) {
        this.__K_ = value;
    }
    static get Password() {
        return this.__Password_;
    }
    static set Password(value) {
        this.__Password_ = value;
    }
    static get CryptPass() {
        if (this.__CryptPass_)
            return this.__CryptPass_;
        throw Error('CryptPass null');
    }
    static set CryptPass(value) {
        this.__CryptPass_ = value;
    }
    static get EntriesManage() {
        if (this.__EntriesManage_)
            return this.__EntriesManage_;
        throw Error('EntriesManage null');
    }
    static set EntriesManage(em) {
        this.__EntriesManage_ = em;
    }
    static logout() {
        this.__CryptPass_ = null;
        this.__EntriesManage_ = null;
        this.__K_ = '';
        this.__Password_ = '';
    }
}
State.__K_ = '';
State.__Password_ = '';
document.addEventListener('deviceready', () => ScenarioController.changeScenario(new WelcomeView()), false);
class AppActions {
    Unlock(pwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Config.readData();
            State.CryptPass = new LibCryptPass.CryptPassCached(StandardRnW, data.kp, data.se);
            const k = State.CryptPass.GetK(pwd);
            if (k) {
                State.K = k;
                State.EntriesManage = State.CryptPass.GetEntriesManage(State.K, true);
                State.Password = pwd;
                return true;
            }
            else {
                State.Password = '';
                return false;
            }
        });
    }
}
var _a;
class Config {
    static ConfigInit() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setConfig(this.defaultConfig);
        });
    }
    static readData() {
        return __awaiter(this, void 0, void 0, function* () {
            const kp = yield this.readKeyPass();
            const se = yield this.readSequence();
            return { kp: kp, se: se };
        });
    }
    static setConfig(cfg) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield SecureStorage.setVal(this.configName, JSON.stringify(cfg))) !== false;
        });
    }
    static getConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield SecureStorage.getVal(this.configName);
            if (config !== false)
                return JSON.parse(config);
            else {
                return false;
            }
        });
    }
    static getPreferences() {
        var _b;
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.getConfig();
            if (config !== false) {
                return (_b = config.Preferences) !== null && _b !== void 0 ? _b : this.defaultPreferences;
            }
            else
                throw Error('Failed getting Prefences');
        });
    }
    static setPreferences(preferences) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.getConfig();
            if (config !== false) {
                config.Preferences = preferences;
                return yield this.setConfig(config);
            }
            return false;
        });
    }
    static getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const keypass = yield this.readKeyPass();
            const sequence = yield this.readSequence();
            const keypassOK = keypass !== false;
            const keypassNotEmpty = keypassOK && JSON.stringify(keypass) !== JSON.stringify({});
            const sequenceOK = sequence !== false && sequence.Sequence.length != 0;
            if (keypassNotEmpty && sequenceOK)
                return 'OK';
            if (!keypassOK && !sequenceOK)
                return 'KO';
            if (!keypassOK)
                return 'MissingKeypass';
            if (!keypassNotEmpty)
                return 'EmptyKeypass';
            if (!sequenceOK)
                return 'EmptySequence';
            return 'KO';
        });
    }
    static readSequence() {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = yield this.getConfig();
            if (cfg !== false) {
                return JSON.parse(cfg.Sequence);
            }
            else
                return this.emptySequence;
        });
    }
    static writeSequence(seq) {
        return __awaiter(this, void 0, void 0, function* () {
            const s = JSON.stringify(seq);
            const cfg = yield this.getConfig();
            if (cfg !== false) {
                cfg.Sequence = s;
                return this.setConfig(cfg);
            }
            else {
                const newCfg = this.defaultConfig;
                newCfg.Sequence = s;
                return this.setConfig(newCfg);
            }
        });
    }
    static getKeyPassPath() {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = yield this.getConfig();
            if (cfg !== false) {
                return cfg.KeyFilePath !== '' ?
                    cfg.KeyFilePath : false;
            }
            else
                return false;
        });
    }
    static readKeyPass() {
        return __awaiter(this, void 0, void 0, function* () {
            const kpPath = yield this.getKeyPassPath();
            if (kpPath !== false) {
                const fileContent = yield FS.ReadFile(kpPath);
                return (fileContent !== false && fileContent !== null && fileContent.trim() !== '') ? JSON.parse(fileContent) : false;
            }
            else
                return false;
        });
    }
    static writeKeyPass(kp) {
        return __awaiter(this, void 0, void 0, function* () {
            const kpPath = yield this.getKeyPassPath();
            if (kpPath !== false) {
                return FS.WriteFile(kpPath, JSON.stringify(kp));
            }
            else
                return false;
        });
    }
    static newKeyPass(kp = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = yield FS.NewFile(this.defaultKeyPassFilename, JSON.stringify(kp));
            if (uri !== false) {
                return this.setKeyPassUri(uri);
            }
            else
                return false;
        });
    }
    static selectKeyPassUri() {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield FS.SelectAndReadFile();
            if (file !== false) {
                return file[0].uri;
            }
            else
                return false;
        });
    }
    static setKeyPassUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const cfg = yield this.getConfig();
            if (cfg !== false) {
                cfg.KeyFilePath = uri;
                return this.setConfig(cfg);
            }
            else {
                const newCfg = this.defaultConfig;
                newCfg.KeyFilePath = uri;
                return this.setConfig(newCfg);
            }
        });
    }
}
_a = Config;
Config.defaultPreferences = { ChPwdReminder: true };
Config.emptySequence = { Sequence: [] };
Config.configName = 'cryptPassCfg';
Config.defaultKeyPassFilename = 'keypass.json';
Config.defaultConfig = { KeyFilePath: '',
    Sequence: '{"Sequence": []}',
    Preferences: _a.defaultPreferences };
class ConfigActions {
    constructor(password, InitializationDone = false) {
        this._initializedKey = 'Initialized';
        this.defaultPasswordExpirationDays = 30;
        this._PWD = password;
        if (InitializationDone) {
            this.InitCryptPassConfig();
        }
    }
    getSequence() {
        return this._CryptPassConfig.getSequence();
    }
    refreshSequence() {
        return this._CryptPassConfig.refreshSequence(this._PWD);
    }
    setSequenceAndKeyPassUri(seq, keypassuri) {
        return __awaiter(this, void 0, void 0, function* () {
            let seqOk = true;
            let keyOk = true;
            if (seq !== undefined) {
                let Seq = { Sequence: seq };
                seqOk = yield Config.writeSequence(Seq);
            }
            if (keypassuri !== undefined)
                keyOk = yield Config.setKeyPassUri(keypassuri);
            return seqOk && keyOk;
        });
    }
    changePwd(oldPwd, newPwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const changed = yield this._CryptPassConfig.chPwd(oldPwd, newPwd);
            if (changed) {
                this._PWD = newPwd;
                State.logout();
                LocalStorage.PasswordExpirationTimeSet();
                return true;
            }
            else
                return false;
        });
    }
    needToChangePassword() {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield Config.getPreferences()).ChPwdReminder &&
                (LocalStorage.PasswordExpirationTime() > 0 ? Date.now() >= LocalStorage.PasswordExpirationTime()
                    : (Date.now() - this._CryptPassConfig.getLastChange().getTime()) > this.defaultPasswordExpirationDays * 86400000));
        });
    }
    checkPwd() {
        return this._CryptPassConfig.checkPwd(this._PWD);
    }
    setup(action, sequence) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (action) {
                case 'NEW':
                    const newKP = yield Config.newKeyPass();
                    if (newKP) {
                        yield this.InitCryptPassConfig();
                        return this._CryptPassConfig.initSeqAndKey(this._PWD);
                    }
                    else
                        return false;
                case 'InitKeyPassAndSequence':
                    yield this.InitCryptPassConfig();
                    return this._CryptPassConfig.initSeqAndKey(this._PWD);
                case 'RestoreKeyPassFile':
                    const restoredKP = (yield Config.readKeyPass()) !== false;
                    if (restoredKP) {
                        yield this.InitCryptPassConfig();
                        return true;
                    }
                    else
                        return false;
                case 'RestoreSequence':
                    const restoredSEQ = sequence !== undefined && (yield this._CryptPassConfig.restoreSeq(sequence));
                    if (restoredSEQ) {
                        yield this.InitCryptPassConfig();
                        return true;
                    }
                    else
                        return false;
            }
        });
    }
    getStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!LocalStorage.InitializedKey()) {
                const init = yield Config.ConfigInit();
                if (init) {
                    LocalStorage.InitializedKeySet();
                    return 'KO';
                }
                return 'FatalError';
            }
            const status = yield Config.getStatus();
            if (status == 'OK')
                yield this.InitCryptPassConfig();
            return status;
        });
    }
    InitCryptPassConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Config.readData();
            this._CryptPassConfig = new LibCryptPass.ConfigCryptPass(StandardRnW, data.kp, data.se);
        });
    }
}
const StandardRnW = {
    SequenceWriter: (seq) => Config.writeSequence(seq),
    KeyPassWriter: (kp) => Config.writeKeyPass(kp)
};
const handledTypes = ['deviceready', 'click', 'change', 'submit', 'focus', 'blur', 'backbutton', 'touchstart', 'touchend'];
class EventsController {
    static getEventHandler(name, event) {
        return this._events[event][name];
    }
    static addOrSetEventHandler(name, event, handler, setEvent = false) {
        const exists = this.getEventHandler(name, event) !== undefined;
        if ((exists && setEvent) || (!exists && !setEvent)) {
            this._events[event][name] = handler;
            return true;
        }
        else
            return false;
    }
    static addEventHandler(name, event, handler) {
        return this.addOrSetEventHandler(name, event, handler, false);
    }
    static delEventHandler(name, event) {
        delete this._events[event][name];
    }
    static setEventHandler(name, event, handler) {
        return this.addOrSetEventHandler(name, event, handler, true);
    }
    static eventCatcher(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = this._events[e.type];
            for (let ev in events) {
                yield events[ev](e);
            }
        });
    }
    static Initialize() {
        handledTypes.forEach(element => {
            document.addEventListener(element, (ev) => __awaiter(this, void 0, void 0, function* () { return EventsController.eventCatcher(ev); }), element == 'focus' || element == 'blur');
        });
    }
}
EventsController._events = (() => {
    const eh = {};
    handledTypes.forEach(element => {
        eh[element] = {};
    });
    return eh;
})();
class ScenarioController {
    static changeScenario(scenario, initOptions) {
        this.appInit();
        this.closeScenario();
        this._currentScenario = scenario;
        this._currentScenario.Handlers.push({ name: 'ViewBack', handler: (e) => __awaiter(this, void 0, void 0, function* () { e.preventDefault(); yield this._currentScenario.onBackButton(); }), type: 'backbutton' });
        this.addHandlers();
        this._currentScenario.Init(initOptions);
    }
    static appInit() {
        if (this._currentScenario === undefined) {
            EventsController.Initialize();
        }
    }
    static closeScenario() {
        if (this._currentScenario !== undefined) {
            this.delHandlers();
            if (this._currentScenario.End !== undefined) {
                this._currentScenario.End();
            }
        }
    }
    static delHandlers() {
        this._currentScenario.Handlers.forEach((_handler) => {
            EventsController.delEventHandler(_handler.name, _handler.type);
        });
    }
    static addHandlers() {
        this._currentScenario.Handlers.forEach((_handler) => {
            EventsController.addEventHandler(_handler.name, _handler.type, _handler.handler);
        });
    }
}
class View {
    constructor() {
        this.IdAppDiv = 'app';
        this.IdLoaderDiv = 'loader';
        this.LoaderShowMs = 500;
        this.ClassFormBtn = 'btn btn-primary';
        this.ClassFormBtnSec = 'btn btn-secondary';
        this.ClassFormBtnBla = 'btn btn-dark';
        this.ClassFormCtrl = 'form-control';
        this.ClassFormFloat = 'form-floating mb-2';
        this.ClassMenuBtn = 'btn btn-primary btn-lg my-2';
    }
    showEl(elId) {
        $('#' + elId).removeClass('d-none');
    }
    clickEl(elId) {
        $('#' + elId).trigger('click');
    }
    hideEl(elId) {
        $('#' + elId).toggleClass('d-none');
    }
    setApp(content, onBackButton = () => null) {
        this.setInner(this.IdAppDiv, content);
        this.onBackButton = onBackButton;
    }
    setVal(elId, value) {
        $('#' + elId).val(value);
    }
    setInner(elId, content) {
        $('#' + elId).html(content);
    }
    getInner(elId) {
        return $('#' + elId).html();
    }
    getEl(elId) {
        return $('#' + elId)[0];
    }
    isChecked(elId) {
        return $('#' + elId).prop('checked');
    }
    getVal(elId, raw = false) {
        const val = this.getEl(elId).value;
        return raw ? val : val.trim();
    }
    focusEl(elId, alsoSelect = false) {
        const input = this.getEl(elId);
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
        if (alsoSelect)
            this.getEl(elId).select();
    }
    LoaderShowCommands() {
        this.getEl(this.IdAppDiv).style.display = 'none';
        this.getEl(this.IdLoaderDiv).style.display = 'block';
    }
    LoaderShow(doSomethingBeforeHiding, doSomethingAfterHiding, hideAfter = true) {
        this.LoaderShowCommands();
        if (doSomethingBeforeHiding !== undefined)
            setTimeout(() => {
                let res;
                if (doSomethingBeforeHiding !== undefined) {
                    res = doSomethingBeforeHiding();
                }
                if (hideAfter)
                    this.LoaderHide();
                if (doSomethingAfterHiding !== undefined)
                    doSomethingAfterHiding(res);
            }, this.LoaderShowMs);
    }
    LoaderShowAsync(doSomethingBeforeHiding, doSomethingAfterHiding, hideAfter = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.LoaderShowCommands();
            if (doSomethingBeforeHiding !== undefined)
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    let res;
                    if (doSomethingBeforeHiding !== undefined) {
                        res = yield doSomethingBeforeHiding();
                    }
                    if (hideAfter)
                        this.LoaderHide();
                    if (doSomethingAfterHiding !== undefined)
                        yield doSomethingAfterHiding(res);
                }), this.LoaderShowMs);
        });
    }
    LoaderHide() {
        this.getEl(this.IdAppDiv).style.display = 'block';
        this.getEl(this.IdLoaderDiv).style.display = 'none';
    }
    sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
    handleChPwd(idpwdold, idpwdnew1, idpwdnew2, onsuccess, pwdChanger) {
        return __awaiter(this, void 0, void 0, function* () {
            const old = this.getVal(idpwdold, true);
            const pwd1 = this.getVal(idpwdnew1, true);
            const check = CommonHelpers.CheckChPassword(old, pwd1, this.getVal(idpwdnew2, true));
            switch (check) {
                case true:
                    yield this.LoaderShowAsync(() => __awaiter(this, void 0, void 0, function* () {
                        const done = yield pwdChanger(old, pwd1);
                        if (done) {
                            alert('Password correctly changed');
                            onsuccess();
                            return true;
                        }
                        else {
                            alert('Something\'s gone wrong. Please retry');
                            return false;
                        }
                    }), (res) => { if (!res)
                        this.focusEl(idpwdnew1, true); });
                    break;
                case 'wrongNew':
                    this.focusEl(idpwdnew1, true);
                    break;
                case 'wrongOld':
                    this.focusEl(idpwdold, true);
                    break;
            }
        });
    }
}
const defaultMimeType = 'text/plain';
class ElectronFS {
    static fwrite(fileContent, fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.writeFileSync(fileUri, fileContent);
                return true;
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static fread(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return fs.readFileSync(fileUri);
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static selectFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let input = document.createElement('input');
            input.type = 'file';
            input.accept = defaultMimeType;
            return new Promise((resolve, reject) => {
                input.onchange = _this => {
                    if (input.files !== null) {
                        resolve(input.files[0]);
                    }
                    else {
                        reject(null);
                    }
                };
                input.click();
            });
        });
    }
    static NewFile(fileName, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield this.selectFile();
                if (file !== null) {
                    yield this.fwrite(fileContent, file.path);
                    window.localStorage.setItem(file.path, fileContent);
                    return file.path;
                }
                else
                    throw new Error('No file selected');
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static WriteFile(uri, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uri_content = yield this.fread(uri);
                const uri_bk_content = window.localStorage.getItem(uri);
                this.fwrite(fileContent, uri);
                if (uri_content !== false && uri_content != uri_bk_content)
                    window.localStorage.setItem(uri, uri_content);
                if (uri_content === false && uri_bk_content === null)
                    window.localStorage.setItem(uri, fileContent);
                return true;
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static ReadFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.fread(uri);
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static SelectAndReadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield this.selectFile();
                if (file !== null) {
                    const content = yield this.fread(file.path);
                    if (content !== false)
                        return [{
                                uri: file.path,
                                name: file.name,
                                mediaType: file.type,
                                content: content
                            }];
                    else
                        throw new Error('Error reading file');
                }
                else
                    throw new Error('No file selected');
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
}
class AndroidFS {
    static NewFile(fileName, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blob = new Blob([fileContent], { type: defaultMimeType });
                const uri = yield cordova.plugins.saveDialog.getFileUri(blob, fileName);
                yield cordova.plugins.saveDialog.saveFileByUri(blob, uri);
                window.localStorage.setItem(uri, fileContent);
                yield this.getGrantOnDir(uri);
                return uri;
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static WriteFile(uri, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blob = new Blob([fileContent], { type: defaultMimeType });
                const uri_content = yield this.ReadFile(uri);
                const uri_bk_content = window.localStorage.getItem(uri);
                yield cordova.plugins.saveDialog.saveFileByUri(blob, uri);
                if (uri_content !== false && uri_content != uri_bk_content)
                    window.localStorage.setItem(uri, uri_content);
                if (uri_content === false && uri_bk_content === null)
                    window.localStorage.setItem(uri, fileContent);
                return true;
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static ReadFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield chooser.readFile(uri);
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static SelectAndReadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chooserResult = yield chooser.getFiles(defaultMimeType, () => null, () => null);
                if (chooserResult.length > 0) {
                    yield this.getGrantOnDir(chooserResult[0].uri);
                    return chooserResult;
                }
                else
                    return false;
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static getGrantOnDir(startPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
            alert('Please grant permanent access to the selected directory.');
            return yield chooser.grantDir(startPath, () => null, () => null);
        });
    }
}
class FS {
    static NewFile(fileName, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (cordova.platformId) {
                case 'android':
                    return AndroidFS.NewFile(fileName, fileContent);
                case 'electron':
                    alert('You must create an empty txt file and then select it');
                    return ElectronFS.NewFile(fileName, fileContent);
                default:
                    return false;
            }
        });
    }
    static WriteFile(uri, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (cordova.platformId) {
                case 'android':
                    return AndroidFS.WriteFile(uri, fileContent);
                case 'electron':
                    return ElectronFS.WriteFile(uri, fileContent);
                default:
                    return false;
            }
        });
    }
    static ReadFileBackup(uri) {
        return window.localStorage.getItem(uri);
    }
    static ReadFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (cordova.platformId) {
                case 'android':
                    return AndroidFS.ReadFile(uri);
                case 'electron':
                    return ElectronFS.ReadFile(uri);
                default:
                    return false;
            }
        });
    }
    static SelectAndReadFile() {
        return __awaiter(this, void 0, void 0, function* () {
            switch (cordova.platformId) {
                case 'android':
                    return AndroidFS.SelectAndReadFile();
                case 'electron':
                    return ElectronFS.SelectAndReadFile();
                default:
                    return false;
            }
        });
    }
}
class LocalStorage {
    static _Set(key, val) {
        window.localStorage.setItem(key, val);
    }
    static _Get(key) {
        return window.localStorage.getItem(key);
    }
    static _Del(key) {
        window.localStorage.removeItem(key);
    }
    static FirstTime() {
        return this._Get('firstTime') !== this.firsttime;
    }
    static FirstTimeSet() {
        this._Set('firstTime', this.firsttime);
    }
    static InitializedKey() {
        return this._Get('Initialized') !== null;
    }
    static InitializedKeySet() {
        this._Set('Initialized', this.initialized);
    }
    static PasswordExpirationTime() {
        const ped = this._Get('PasswordExpirationTime');
        return ped == null ? 0 : parseInt(ped);
    }
    static PasswordExpirationTimeSet() {
        const newVal = Date.now() + this.passwordexpirationdays * 86400000;
        this._Set('PasswordExpirationTime', newVal.toString());
    }
}
LocalStorage.initialized = '1';
LocalStorage.firsttime = '0';
LocalStorage.passwordexpirationdays = 30;
class SecureStorage {
    static getVal(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (cordova.platformId) {
                    case 'electron':
                        const val = window.localStorage.getItem(key);
                        return val === null ? false : val;
                    case 'android':
                        return new Promise((resolve, reject) => {
                            cordova.plugins.SecureKeyStore.get(resolve, reject, key);
                        });
                    default:
                        return false;
                }
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static setVal(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (cordova.platformId) {
                    case 'electron':
                        window.localStorage.setItem(key, value);
                        return key;
                    case 'android':
                        return new Promise((resolve, reject) => {
                            cordova.plugins.SecureKeyStore.set(resolve, reject, key, value);
                        });
                    default:
                        return false;
                }
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
    static delVal(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (cordova.platformId) {
                    case 'electron':
                        const val = window.localStorage.removeItem(key);
                        return key;
                    case 'android':
                        return new Promise((resolve, reject) => {
                            cordova.plugins.SecureKeyStore.remove(resolve, reject, key);
                        });
                    default:
                        return false;
                }
            }
            catch (e) {
                return CommonHelpers.StandardError(e);
            }
        });
    }
}
class CommonHelpers {
    static StandardError(e) {
        console.log(e);
        return false;
    }
    static CustomError(msg) {
        console.log(msg);
        return false;
    }
    static CheckNewPassword(pwd1, pwd2) {
        let ok = false;
        if (pwd1 == '' && pwd2 == '') {
            alert('You have to type passwords before proceeding');
        }
        else if (pwd1.length < 10) {
            alert('Have you really typed a less than 10 characters password?');
        }
        else if (pwd1 != pwd2) {
            alert('Passwords don\'t match!');
        }
        else {
            ok = true;
        }
        return ok;
    }
    static CheckChPassword(oldpwd, pwd1, pwd2) {
        if (oldpwd !== State.Password) {
            alert('Old password is wrong, please retype');
            return 'wrongOld';
        }
        else if (oldpwd == pwd1 || oldpwd == pwd2) {
            alert('New password must be different from old');
            return 'wrongNew';
        }
        else {
            return this.CheckNewPassword(pwd1, pwd2) ? true : 'wrongNew';
        }
    }
}
CommonHelpers.insensitiveSorter = (a, b) => { a = a.toLowerCase(); b = b.toLowerCase(); if (a < b)
    return -1; if (a > b)
    return 1; return 0; };
class TagHelpers {
    static getTagsFromString(tagString) {
        let tags = new Array();
        const sp = tagString.split('"').join('').split(',');
        for (let tag of sp) {
            tags.push(tag.trim().toLowerCase());
        }
        return tags;
    }
    static tagExists(tag, tagString) {
        return this.getTagsFromString(tagString).indexOf(tag) != -1;
    }
    static getAllTags(em, exceptTags) {
        return this.getAllTagsFromArr(this.getEntriesFromEM(em), exceptTags);
    }
    static getEntriesFromEM(em) {
        let entries = new Array();
        let E = em.Export();
        for (let e in E) {
            const entry = em.GetEntry(e);
            if (entry !== false)
                entries.push(entry);
        }
        return entries.sort((a, b) => CommonHelpers.insensitiveSorter(a.Name, b.Name));
    }
    static getAllTagsFromArr(e, exceptTags) {
        let outTags = new Array();
        for (let en of e) {
            let entryTags = en.Tags;
            if (entryTags !== undefined) {
                let tags = this.getTagsFromString(entryTags);
                tags.forEach((val) => {
                    if (((exceptTags !== undefined && exceptTags.indexOf(val) == -1) || exceptTags === undefined) && outTags.indexOf(val) == -1)
                        outTags.push(val);
                });
            }
        }
        return outTags.sort(CommonHelpers.insensitiveSorter);
    }
    static getAllEntriesFromTags(tags, em) {
        return this.getEntriesFromTags(tags, this.getEntriesFromEM(em));
    }
    static getEntriesFromTags(tags, ev) {
        if (tags.length > 0) {
            let outEntries = new Array();
            for (let en of ev) {
                let entryTags = en.Tags;
                if (entryTags !== undefined) {
                    let entrytags = this.getTagsFromString(entryTags);
                    let found = true;
                    for (let tag of tags) {
                        if (entrytags.indexOf(tag) == -1) {
                            found = false;
                            break;
                        }
                    }
                    if (found)
                        outEntries.push(en);
                }
            }
            return outEntries;
        }
        else
            return ev;
    }
}
class ViewHelpers {
    static get Instructions() {
        return `
        <p><strong>CryptPass</strong> is a password wallet manager, with which you can store your passwords and more (usernames, PINs, custom fields)
         with strong encryption.</p>
        <p>CryptPass stores your passwords into a file that can be saved anywhere. This way, you can backup and synchronize this file with
         any of your favorites cloud storage services (such as Dropbox and many others). This file is protected and encrypted with a combination of two methods:</p>
         <ol>
            <li>A <strong>master password</strong> of your choice (this should be really really strong)</li>
            <li>A <strong>sequence of 26 numbers</strong>, from 0 to 25, that are randomly ordered by CryptPass</li>
         </ol>
        <p>The <strong>sequence in the correct order</strong> must be carefully kept in a safe place (e.g. a screenshot or transcribing it on a paper sheet and so on...)
        because it will be stored only inside the app. This means that if you reset or lost your device, the sequence can be restored only retyping it manually.</p>
        `;
    }
    static submit(id, val, _class) {
        return `<input type="submit"${this.getClass(_class)} id="${id}" value="${this.cleanVal(val)}" />`;
    }
    static button(id, val, _class, custom) {
        return `<button${this.getClass(_class)} type="button" id="${id}"${custom !== undefined ? ' ' + custom : ''}>${val}</button>`;
    }
    static label(forId, val, _class) {
        return `<label${this.getClass(_class)} for="${forId}">${val}</label>`;
    }
    static genericInput(attrs) {
        return `<input${this.getClass(attrs._class)}${this.getChecked(attrs.checked)}${this.getInputmode(attrs.inputmode)}${this.getReadonly(attrs.readonly)}${this.getPlaceholder(attrs.placeholder)}${this.getNoautocaps(attrs.noautocaps)}${this.getValue(attrs.val)}${this.getCustom(attrs.custom)} type="${attrs.type}" id="${attrs.id}" />`;
    }
    static checkbox(id, val, checked = false, _class, custom) {
        return this.genericInput({ id: id, val: this.cleanVal(val), checked: checked, _class: _class, type: 'checkbox', custom: custom });
    }
    static textinput(id, val, placeholder, _class, readonly, noautocaps) {
        return this.genericInput({ id: id, val: this.cleanVal(val), placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', noautocaps: noautocaps });
    }
    static hiddeninput(id, val) {
        return this.genericInput({ id: id, val: this.cleanVal(val), type: 'hidden' });
    }
    static numericinput(id, val, placeholder, _class, readonly) {
        return this.genericInput({ id: id, val: val, placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', inputmode: 'numeric' });
    }
    static password(id, placeholder, _class, readonly) {
        return this.genericInput({ id: id, placeholder: placeholder, readonly: readonly, _class: _class, type: 'password' });
    }
    static cleanVal(val) {
        if (val !== undefined)
            return val.split('"').join('&quot;');
        return '';
    }
    static getClass(_class) {
        return _class !== undefined ? ` class="${_class}"` : '';
    }
    static getChecked(checked) {
        return checked ? ' checked="checked"' : '';
    }
    static getReadonly(readonly) {
        return readonly ? ' readonly="readonly"' : '';
    }
    static getNoautocaps(noautocaps) {
        return noautocaps ? ' autocapitalize="off"' : '';
    }
    static getInputmode(inputmode) {
        return inputmode !== undefined ? ` inputmode="${inputmode}"` : '';
    }
    static getPlaceholder(placeholder) {
        return (placeholder === null || placeholder === void 0 ? void 0 : placeholder.trim()) != '' && placeholder !== undefined ? ` placeholder="${placeholder}"` : '';
    }
    static getValue(value) {
        return (value === null || value === void 0 ? void 0 : value.trim()) != '' && value !== undefined ? ` value="${value}"` : '';
    }
    static getCustom(value) {
        return (value === null || value === void 0 ? void 0 : value.trim()) != '' && value !== undefined ? ` ${value}` : '';
    }
}
class DescrView extends View {
    constructor() {
        super(...arguments);
        this.IdGoToInit = 'goToInit';
        this.IdDescription = 'description';
        this.IdSetDescription = 'setDescription';
        this.IdRemoveDescription = 'removeDescription';
        this.IdDescriptionForm = 'descriptionForm';
        this.Handlers = [
            { name: 'DescrViewClick', handler: (e) => this.onClick(e), type: 'click' },
            { name: 'DescrViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit' }
        ];
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            const passDescr = State.CryptPass.getPassDescription().trim();
            this.setApp(`<h2>${passDescr === '' ? 'Add description' : 'Edit description'}</h2>
        <form id="${this.IdDescriptionForm}">
        <p>${ViewHelpers.textinput(this.IdDescription, passDescr, 'Put the description here', this.ClassFormCtrl)}</p>
        <p class="alert alert-warning">Warning! This description <strong>won't be encrypted</strong>.
        So take care not to put any significant or important information in it but keep it as generic as possible.</p>
        <p>${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}
        ${ViewHelpers.submit(this.IdSetDescription, 'Confirm new description', this.ClassFormBtn)}
        ${passDescr === '' ? '' : ViewHelpers.button(this.IdRemoveDescription, 'Remove description', this.ClassFormBtn)}</p>
        </form>
        `, () => this.clickEl(this.IdGoToInit));
        });
    }
    onSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdDescriptionForm:
                    this.handleSet();
                    break;
            }
        });
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdGoToInit:
                    ScenarioController.changeScenario(new OtherView());
                    break;
                case this.IdRemoveDescription:
                    this.handleSet(true);
                    break;
            }
        });
    }
    handleSet(remove = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const descr = this.getEl(this.IdDescription).value.trim();
            if (descr.length > 0 || remove) {
                this.LoaderShow();
                const res = yield State.CryptPass.setPassDescription(remove ? '' : descr);
                this.LoaderHide();
                if (res) {
                    ScenarioController.changeScenario(new OtherView());
                }
                else {
                    alert('Sorry. We encountered an error setting up the description');
                    this.focusEl(this.IdDescription);
                }
            }
            else {
                alert('Error. Empty description.');
                this.focusEl(this.IdDescription);
            }
        });
    }
}
class MainView extends View {
    constructor() {
        super(...arguments);
        this.IdPassword1 = 'password1';
        this.IdPassword2 = 'password2';
        this.IdHandlePwd = 'pwd';
        this.IdUnlockForm = 'UnlockForm';
        this.IdRestoreOptions = 'RestoreOptions';
        this.IdChangeDescr = 'ChangeDescr';
        this.IdManagePwd = 'ManagePwd';
        this.IdOther = 'Other';
        this.IdChPwdForm = 'ChPwdForm';
        this.IdPasswordOld = 'PasswordOld';
        this.IdHandleChPwd = 'HandleChPwd';
        this.IdDontChPwd = 'DontChPwd';
        this.Handlers = [
            { name: 'MainViewClick', handler: (e) => this.onClick(e), type: 'click' },
            { name: 'MainViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit' }
        ];
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._ca = new ConfigActions(State.Password);
            this._aa = new AppActions();
            const status = yield this._ca.getStatus();
            switch (status) {
                case 'KO':
                    ScenarioController.changeScenario(new RestoreView(), {
                        desc: `<p>It seems that we have no data storage initialized.</p>
                     <p>Please select one option:</p>`, status: status
                    });
                    break;
                case 'OK':
                    try {
                        if (State.Password !== '') {
                            if (yield this._ca.needToChangePassword()) {
                                this.setApp(`<form id="${this.IdChPwdForm}">
                            <p class="alert alert-danger">Caution! Last time you created or changed or received a reminder to change your password was more than 30 days ago. 
                            It's useful to change your password montly.</p>
                            <p>${ViewHelpers.password(this.IdPasswordOld, 'Type old password', this.ClassFormCtrl)}</p>        
                            <p>Remember to choose a strong (very strong) password:</p>
                            <p>${ViewHelpers.password(this.IdPassword1, 'Type new password', this.ClassFormCtrl)}</p>
                            <p>${ViewHelpers.password(this.IdPassword2, 'Repeat new password', this.ClassFormCtrl)}</p>
                            <p>${ViewHelpers.submit(this.IdHandleChPwd, 'Change password', this.ClassFormBtn)}
                            ${ViewHelpers.button(this.IdDontChPwd, 'Remind me in a month', this.ClassFormBtnSec)}</p>
                            </form>
                            `);
                            }
                            else {
                                ScenarioController.changeScenario(new PassView());
                            }
                        }
                        else {
                            this.setApp(`<form id="${this.IdUnlockForm}">
                        <p>${ViewHelpers.password(this.IdPassword1, 'Type password', this.ClassFormCtrl)}</p>
                        <p>${ViewHelpers.submit(this.IdHandlePwd, 'Unlock', this.ClassFormBtn)}
                        ${ViewHelpers.button(this.IdRestoreOptions, 'Restore options', this.ClassFormBtnSec)}</p>
                        </form>
                        `);
                            this.focusEl(this.IdPassword1);
                        }
                    }
                    catch (e) {
                        alert(e);
                    }
                    break;
                case 'MissingKeypass':
                    ScenarioController.changeScenario(new RestoreView(), {
                        errorMsg: 'Error. Keypass file is missing! How do you want to proceed?', status: status
                    });
                    break;
                case 'EmptySequence':
                    ScenarioController.changeScenario(new RestoreView(), {
                        errorMsg: 'Error. Numbers sequence is empty. How do you want to proceed?', status: status
                    });
                    break;
                case 'EmptyKeypass':
                    ScenarioController.changeScenario(new RestoreView(), {
                        errorMsg: 'Error. Keypass file is empty! How do you want to proceed?', status: status
                    });
                    break;
            }
        });
    }
    onSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdUnlockForm:
                    this.handlePwd();
                    break;
                case this.IdChPwdForm:
                    this.handleChPwd(this.IdPasswordOld, this.IdPassword1, this.IdPassword2, () => this.Init(), (Old, New) => __awaiter(this, void 0, void 0, function* () { return yield this._ca.changePwd(Old, New); }));
                    break;
            }
        });
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdChangeDescr:
                    ScenarioController.changeScenario(new DescrView());
                    break;
                case this.IdManagePwd:
                    ScenarioController.changeScenario(new PassView());
                    break;
                case this.IdDontChPwd:
                    this.handleDontChPwd();
                    break;
                case this.IdRestoreOptions:
                    ScenarioController.changeScenario(new RestoreView(), {
                        back: () => ScenarioController.changeScenario(new MainView()), desc: '<p>Select a restore option:</p>', status: 'OK'
                    });
                    break;
                case this.IdOther:
                    ScenarioController.changeScenario(new OtherView());
                    break;
            }
        });
    }
    handlePwd() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.LoaderShowAsync(() => __awaiter(this, void 0, void 0, function* () {
                const pwd = this.getEl(this.IdPassword1).value;
                if (pwd.length < 10) {
                    alert('Wrong password');
                    return false;
                }
                else {
                    const pwdCorrect = yield this._aa.Unlock(pwd);
                    if (pwdCorrect) {
                        this.Init();
                        return true;
                    }
                    else {
                        alert('Wrong password!');
                        return false;
                    }
                }
            }), (res) => { if (!res)
                this.focusEl(this.IdPassword1, true); });
        });
    }
    handleDontChPwd() {
        LocalStorage.PasswordExpirationTimeSet();
        this.Init();
    }
}
class OtherView extends View {
    constructor() {
        super(...arguments);
        this.IdGoToInit = 'goToInit';
        this.IdGoToMainMenu = 'goToMainMenu';
        this.IdPreferences = 'Preferences';
        this.IdRestore = 'Restore';
        this.IdChangePwd = 'ChangePwd';
        this.IdViewSequence = 'ViewSequence';
        this.IdChangeDescr = 'IdChangeDescr';
        this.IdInstructions = 'Instructions';
        this.IdChPwdRemind = 'RememberChPwd';
        this.IdSavePreferences = 'SavePreferences';
        this.IdRetryLoad = 'RetryLoad';
        this.IdRefreshSequence = 'RefreshSequence';
        this.IdConfirmSequenceRefresh = 'ConfirmSequenceRefresh';
        this.IdPassword1 = 'password1';
        this.IdPassword2 = 'password2';
        this.IdChPwdForm = 'ChPwdForm';
        this.IdChPreferencesForm = 'PrefencesForm';
        this.IdPasswordOld = 'PasswordOld';
        this.IdHandleChPwd = 'HandleChPwd';
        this.RemindValue = 'Remind';
        this.Handlers = [
            { name: 'OtherViewClick', handler: (e) => this.onClick(e), type: 'click' },
            { name: 'OtherViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit' }
        ];
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            this._ca = new ConfigActions(State.Password, true);
            const passDescr = State.CryptPass.getPassDescription().trim();
            this.setApp(`
        <h2>Other options</h2>
        <div class="d-grid gap-2 col-8 mx-auto">
        ${ViewHelpers.button(this.IdPreferences, 'Preferences', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdViewSequence, 'View sequence', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdChangePwd, 'Change password', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdRestore, 'Restore/reset wallet', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdInstructions, 'Read instructions', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdChangeDescr, passDescr == '' ? 'Add a description to your wallet' : 'Change description to your wallet', this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdGoToMainMenu, 'Go back', this.ClassFormBtnSec)}
        </div>
        `, () => this.clickEl(this.IdGoToMainMenu));
        });
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdGoToInit:
                    this.Init();
                    break;
                case this.IdGoToMainMenu:
                    ScenarioController.changeScenario(new PassView());
                    break;
                case this.IdSavePreferences:
                    this.SavePreferences();
                    break;
                case this.IdChangeDescr:
                    ScenarioController.changeScenario(new DescrView());
                    break;
                case this.IdRetryLoad:
                case this.IdPreferences:
                    this.ViewPreferences();
                    break;
                case this.IdRestore:
                    const seq = this._ca.getSequence().join(', ');
                    ScenarioController.changeScenario(new RestoreView(), {
                        back: () => ScenarioController.changeScenario(new OtherView()),
                        desc: `<div class="alert alert-warning"><p>Here you can restore or create a new &quot;Sequence/KeyPassFile&quot; couple.</p>
                    <p>In each case, while your current KeyPassFile won't be erased, the original sequence could be instead.
                    So remember to store your current sequence (e.g. with a screenshot) 
                    in a safe place place before creating or restoring a wallet.</p>
                    <p>Current sequence: <span class="fw-bold">${seq}</span></p></div>`,
                        status: 'OK'
                    });
                    break;
                case this.IdViewSequence:
                    this.ViewSequence();
                    break;
                case this.IdRefreshSequence:
                    this.RefreshSequence();
                    break;
                case this.IdConfirmSequenceRefresh:
                    yield this.handleSequenceRefresh();
                    break;
                case this.IdInstructions:
                    this.showInstructions();
                    break;
                case this.IdChangePwd:
                    yield this.changePassword();
                    break;
            }
        });
    }
    onSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdChPwdForm:
                    this.handleChPwd(this.IdPasswordOld, this.IdPassword1, this.IdPassword2, () => ScenarioController.changeScenario(new MainView()), (Old, New) => __awaiter(this, void 0, void 0, function* () { return yield this._ca.changePwd(Old, New); }));
                    break;
            }
        });
    }
    ViewPreferences() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.preferences = yield Config.getPreferences();
                this.setApp(`<h2>Preferences</h2>
            <form id="${this.IdChPreferencesForm}">
            <p>${ViewHelpers.checkbox(this.IdChPwdRemind, this.RemindValue, this.preferences.ChPwdReminder)} ${ViewHelpers.label(this.IdChPwdRemind, 'Remind me to change password every month')}</p>
            <p>${ViewHelpers.submit(this.IdSavePreferences, 'Save preferences', this.ClassFormBtn)}
            ${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}</p>
            </form>
                `, () => this.clickEl(this.IdGoToInit));
            }
            catch (e) {
                this.setApp(`<h2>Preferences</h2>
                <p>Error: ${e.message}</p>
                <form id="${this.IdChPreferencesForm}">
                <p>${ViewHelpers.submit(this.IdRetryLoad, 'Retry to load preferences', this.ClassFormBtn)}
            ${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}</p>
            </form>
                `, () => this.clickEl(this.IdGoToInit));
            }
        });
    }
    SavePreferences() {
        return __awaiter(this, void 0, void 0, function* () {
            alert(this.getVal(this.IdChPwdRemind));
            this.preferences.ChPwdReminder = this.getVal(this.IdChPwdRemind) === this.RemindValue;
        });
    }
    changePassword() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setApp(`<h2>Change password</h2>
        <form id="${this.IdChPwdForm}">
        <p>${ViewHelpers.password(this.IdPasswordOld, 'Type old password', this.ClassFormCtrl)}</p>        
        <p>Remember to choose a strong (very strong) password:</p>
        <p>${ViewHelpers.password(this.IdPassword1, 'Type new password', this.ClassFormCtrl)}</p>
        <p>${ViewHelpers.password(this.IdPassword2, 'Repeat new password', this.ClassFormCtrl)}</p>
        <p>${ViewHelpers.submit(this.IdHandleChPwd, 'Change password', this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}</p>
        </form>
        `, () => this.clickEl(this.IdGoToInit));
        });
    }
    showInstructions() {
        this.setApp(`
        <h2>Instructions</h2>
        ${ViewHelpers.Instructions}
        <p>${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}</p>
        `, () => this.clickEl(this.IdGoToInit));
    }
    RefreshSequence() {
        this.setApp(`
        <h2>Refresh sequence</h2>
        <div class="alert alert-danger">If you confirm, the current sequence will be replaced with another one, always randomic.
        Remember to store the new sequence in a safe place (e.g. with a screenshot). <span class="fw-bold">Are you sure to proceed?</span></div>
        <p>${ViewHelpers.button(this.IdConfirmSequenceRefresh, 'Confirm sequence refresh', this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdViewSequence, 'Go back', this.ClassFormBtnSec)}</p>
        `, () => this.clickEl(this.IdViewSequence));
    }
    handleSequenceRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.LoaderShowAsync(() => __awaiter(this, void 0, void 0, function* () {
                return yield this._ca.refreshSequence();
            }), (res) => {
                if (res) {
                    this.ViewSequence('<p class="alert alert-success">Here it is the new sequence:</p>');
                }
                else
                    alert('Error refreshing sequence!');
            });
        });
    }
    ViewSequence(msg) {
        this.setApp(`<h2>View sequence</h2>
        ${msg !== undefined ? msg : ''}
        <p class="h3 my-4">${this._ca.getSequence().join(', ')}</p>
        <p>${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)} 
        ${ViewHelpers.button(this.IdRefreshSequence, 'Refresh sequence', this.ClassFormBtn)}</p>
        `, () => this.clickEl(this.IdGoToInit));
    }
}
class PassView extends View {
    constructor() {
        super(...arguments);
        this.IdGoToInit = 'goToInit';
        this.IdLogout = 'goToMainMenu';
        this.IdOtherOptions = 'goToOtherOptions';
        this.IdEntriesList = 'entries';
        this.IdNewEntry = 'newEntry';
        this.IdSearch = 'Search';
        this.IdSearchDiv = 'SearchDiv';
        this.IdTagFilter = 'TagFilter';
        this.IdShowHideTags = 'ShowHideTags';
        this.IdAddEntryForm = 'AddEntryForm';
        this.IdAddEntry = 'AddEntry';
        this.IdName = 'Name';
        this.IdDesc = 'Desc';
        this.IdTags = 'Tags';
        this.IdSpanSelExistingTags = 'SpanSelExistingTags';
        this.IdSelExistingTags = 'SelExistingTags';
        this.IdExistingTags = 'ExistingTags';
        this.IdCloseSelExistingTags = 'CloseSelExistingTags';
        this.IdUsername = 'Username';
        this.IdPassword = 'Password';
        this.IdPIN = 'PIN';
        this.IdOther = 'Other';
        this.IdOtherKey = 'OtherKey';
        this.IdOtherValue = 'OtherValue';
        this.IdOtherDelete = 'OtherDelete';
        this.IdOtherAdd = 'OtherAdd';
        this.IdOtherP = 'OtherP';
        this.IdNameTitle = 'NameTitle';
        this.IdEdit = 'Edit';
        this.IdBackToView = 'BackToView';
        this.IdEditEntryForm = 'EditEntryForm';
        this.IdEditEntry = 'EditEntry';
        this.IdNameOld = 'NameOld';
        this.IdDeleteEntry = 'DeleteEntry';
        this.IdConfirmDeleteEntry = 'ConfirmDeleteEntry';
        this.IdGoToView = 'GoToView';
        this.hideVal = '•••••••••••••••';
        this.valExt = '_val';
        this.vocBarPre = 'vocbar_';
        this.showHideTagsStatus = 'hide';
        this.searchEntry = '';
        this.CheckedTags = [];
        this.TagsToRecheck = [];
        this.OtherCounter = 0;
        this.Handlers = [
            { name: 'PassViewClick', handler: (e) => this.onClick(e), type: 'click' },
            { name: 'PassViewBlur', handler: (e) => this.onBlur(e), type: 'blur' },
            { name: 'PassViewFocus', handler: (e) => this.onFocus(e), type: 'focus' },
            { name: 'PassViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit' }
        ];
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.TagsToRecheck = this.CheckedTags;
            this.CheckedTags = [];
            this.showHideTagsStatus = 'hide';
            const passDescr = State.CryptPass.getPassDescription().trim();
            this.OtherCounter = 0;
            const names = State.EntriesManage.GetEntryNames().sort(CommonHelpers.insensitiveSorter);
            let out = `${passDescr === '' ? '' : '<p>Wallet &quot;<em>' + passDescr + '</em>&quot;</p>'}
        <p>${ViewHelpers.button(this.IdLogout, 'Logout', this.ClassFormBtnSec)}
        ${ViewHelpers.button(this.IdNewEntry, 'Add a new entry', this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdOtherOptions, 'Other options', this.ClassFormBtn)}</p>`;
            if (names.length == 0) {
                out += `<p class="alert alert-warning">Your wallet is empty</p>`;
            }
            else {
                let tags = TagHelpers.getAllTags(State.EntriesManage);
                let tagsFilter = '';
                if (tags.length > 0) {
                    tagsFilter = `<div id="${this.IdTagFilter}" class="my-4 d-none">${this.PrintTags(tags)}</div>`;
                }
                out += `
            <div class="container">
                <div class="row">
                    <div class="col" id="${this.IdSearchDiv}">${ViewHelpers.textinput(this.IdSearch, this.searchEntry, 'Find entry...', this.ClassFormCtrl, false, true)}</div>
                    <div class="col">${ViewHelpers.button(this.IdShowHideTags, 'Tags search', this.ClassFormBtn)}</div>
                </div>
            </div>
            ${tagsFilter}
            <p>Select an entry to view:</p>
            <ul id="${this.IdEntriesList}">${this.PrintEntriesName(names)}</ul>`;
            }
            this.setApp(out, () => this.clickEl(this.IdLogout));
            this.searchRoutine(names, true);
            if (this.searchEntry !== '')
                this.focusEl(this.IdSearch);
            if (this.TagsToRecheck.length > 0) {
                this.showHideTags();
                this.TagsToRecheck.forEach(t => {
                    this.selectTag(t);
                });
            }
        });
    }
    searchRoutine(names, firstTime = false) {
        setTimeout(() => {
            try {
                const s = this.getVal(this.IdSearch).trim();
                if (s != this.searchEntry || (firstTime && this.searchEntry !== '')) {
                    this.searchEntry = s;
                    this.setInner(this.IdEntriesList, this.PrintEntriesName(this.searchEntryName(names, s)));
                }
            }
            catch (e) { }
            this.searchRoutine(names);
        }, 150);
    }
    showHideTags() {
        switch (this.showHideTagsStatus) {
            case 'hide':
                this.setVal(this.IdSearch, '');
                this.showEl(this.IdTagFilter);
                this.hideEl(this.IdSearchDiv);
                this.setInner(this.IdShowHideTags, 'Hide tags filter');
                this.showHideTagsStatus = 'show';
                break;
            case 'show':
                this.selectTag();
                this.hideEl(this.IdTagFilter);
                this.showEl(this.IdSearchDiv);
                this.setInner(this.IdShowHideTags, 'Select by tags');
                this.showHideTagsStatus = 'hide';
                break;
        }
    }
    PrintViewOrCopyBar(refId, label) {
        return `<span id="${this.vocBarPre + refId}" class="d-none">
        ${ViewHelpers.button('view_' + refId, 'View ' + label, this.ClassFormBtnSec, ` data-view="${refId}"`)}
        ${ViewHelpers.button('copy_' + refId, 'Copy ' + label, this.ClassFormBtnSec, ` data-copy="${refId}"`)}
        ${ViewHelpers.button('cancel_' + refId, ' X ', this.ClassFormBtnSec, ` data-cancel="${refId}"`)}
        </span>`;
    }
    searchEntryName(names, name) {
        let outNames = new Array();
        name = name.toLowerCase();
        for (let n of names) {
            if (n.toLowerCase().indexOf(name) != -1)
                outNames.push(n);
        }
        return outNames;
    }
    onSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdAddEntryForm:
                    this.addEntry();
                    break;
                case this.IdEditEntryForm:
                    this.editEntry();
                    break;
            }
        });
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = e.target;
            switch (el.id) {
                case this.IdOtherOptions:
                    ScenarioController.changeScenario(new OtherView());
                    break;
                case this.IdLogout:
                    if (confirm('Are you sure to logout?')) {
                        State.logout();
                        ScenarioController.changeScenario(new MainView());
                    }
                    break;
                case this.IdGoToInit:
                    this.Init();
                    break;
                case this.IdNewEntry:
                    this.handleNew();
                    break;
                case this.IdOtherAdd:
                    this.addOther();
                    break;
                case this.IdEdit:
                    this.handleEdit();
                    break;
                case this.IdGoToView:
                    this.viewEntry(this.getVal(this.IdNameOld));
                    break;
                case this.IdSelExistingTags:
                    this.viewExistingTags('open');
                    break;
                case this.IdCloseSelExistingTags:
                    this.viewExistingTags('close');
                    break;
                case this.IdShowHideTags:
                    this.showHideTags();
                    break;
                case this.IdDeleteEntry:
                    this.handleDelete();
                    break;
                case this.IdConfirmDeleteEntry:
                    this.deleteEntry();
                    break;
            }
            if (el.id.indexOf(this.IdOtherDelete) == 0) {
                this.delOther(el.dataset['counter']);
            }
            else {
                if (el.dataset['name'] !== undefined) {
                    this.viewEntry(el.dataset['name']);
                }
                else if (el.dataset['tag'] !== undefined) {
                    this.addTag(el.dataset['tag']);
                }
                else if (el.dataset['tagfilter'] !== undefined) {
                    this.selectTag(el.dataset['tagfilter']);
                }
                else if (el.dataset['view'] !== undefined) {
                    this.doVoc(el.dataset['view'], 'view');
                }
                else if (el.dataset['copy'] !== undefined) {
                    this.doVoc(el.dataset['copy'], 'copy');
                }
                else if (el.dataset['cancel'] !== undefined) {
                    this.doVoc(el.dataset['cancel'], 'cancel');
                }
            }
        });
    }
    doVoc(refId, action) {
        switch (action) {
            case 'view':
                this.setVal(refId, this.getVal(refId + this.valExt));
                break;
            case 'copy':
                switch (cordova.platformId) {
                    case 'android':
                        cordova.plugins.clipboard.copy(this.getVal(refId + this.valExt));
                        break;
                    case 'electron':
                        const old_val = this.getVal(refId);
                        const val = this.getVal(refId + this.valExt);
                        this.setVal(refId, val);
                        const el = this.getEl(refId);
                        el.select();
                        navigator.clipboard.writeText(el.value);
                        this.setVal(refId, old_val);
                        break;
                }
                break;
            case 'cancel':
                this.setVal(refId, this.hideVal);
                this.hideEl(this.vocBarPre + refId);
                break;
        }
    }
    selectTag(tag) {
        let entries = [];
        let tags = [];
        switch (tag) {
            case undefined:
                tags = TagHelpers.getAllTags(State.EntriesManage);
                entries = State.EntriesManage.GetEntryNames();
                for (let i = 1; i <= tags.length; ++i)
                    this.getEl('tag' + i).checked = false;
                this.CheckedTags = [];
                break;
            default:
                const index = this.CheckedTags.indexOf(tag);
                if (index == -1) {
                    this.CheckedTags.push(tag);
                }
                else {
                    this.CheckedTags.splice(index, 1);
                }
                const ev = TagHelpers.getAllEntriesFromTags(this.CheckedTags, State.EntriesManage);
                entries = ev.map((val) => val.Name !== undefined ? val.Name : '');
        }
        this.setInner(this.IdEntriesList, this.PrintEntriesName(entries));
    }
    PrintTags(tags) {
        let tagsButtons = new Array();
        let tagCounter = 0;
        tags.forEach((tag) => {
            const checked = this.TagsToRecheck.indexOf(tag) != -1;
            let id = ++tagCounter;
            tagsButtons.push(`${ViewHelpers.checkbox('tag' + id, tag, checked, 'btn-check', `data-tagfilter="${tag}"`)}
                ${ViewHelpers.label('tag' + id, tag, 'my-1 btn btn-primary btn-sm')}`);
        });
        return `TAGS: ${tagsButtons.join(' ')}`;
    }
    PrintEntriesName(entriesName) {
        let out = '';
        let counter = 0;
        entriesName.forEach((val) => out += `<li class="my-3">${ViewHelpers.button('Entry' + (counter++), val, this.ClassFormBtnBla, `data-name="${ViewHelpers.cleanVal(val)}"`)}</li>`);
        return out;
    }
    onFocus(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const el = e.target;
            switch (el.id) {
                case this.IdTags:
                    this.showEl(this.IdSelExistingTags);
                    break;
            }
            this.setHidden(el.id, 'show');
        });
    }
    onBlur(e) {
        const el = e.target;
        this.setHidden(el.id, 'hide');
    }
    setHidden(id, action) {
        const hiddenId = id + this.valExt;
        const vocId = this.vocBarPre + id;
        if (action == 'show' && this.getEl(vocId) !== undefined) {
            this.showEl(vocId);
        }
        else if (this.getEl(vocId) === undefined && this.getEl(hiddenId) !== undefined) {
            switch (action) {
                case 'show':
                    this.setVal(id, this.getVal(hiddenId));
                    break;
                case 'hide':
                    this.setVal(hiddenId, this.getVal(id));
                    this.setVal(id, this.hideVal);
                    break;
            }
        }
    }
    addTag(tag) {
        const tagString = this.getVal(this.IdTags);
        if (!TagHelpers.tagExists(tag, tagString)) {
            this.setVal(this.IdTags, tagString + (tagString.trim() == '' ? '' : ', ') + tag);
        }
    }
    viewExistingTags(action) {
        switch (action) {
            case 'open':
                this.hideEl(this.IdSpanSelExistingTags);
                this.showEl(this.IdExistingTags);
                break;
            case 'close':
                this.showEl(this.IdSpanSelExistingTags);
                this.hideEl(this.IdExistingTags);
                break;
        }
    }
    handleEdit() {
        const entry = State.EntriesManage.GetEntry(this.getInner(this.IdNameTitle));
        if (entry !== false) {
            this.setApp(`<p>${ViewHelpers.button(this.IdGoToView, 'Cancel', this.ClassFormBtnSec)}
            ${ViewHelpers.button(this.IdDeleteEntry, 'Delete entry', this.ClassFormBtnSec)}</p>
            <h2>Edit entry</h2>
            <form id="${this.IdEditEntryForm}">
            ${this.entryMask(entry, false)}
            <p>${ViewHelpers.submit(this.IdEditEntry, 'Save entry', this.ClassFormBtn)}</p>
            </form>
            `, () => this.clickEl(this.IdGoToView));
        }
        else
            alert('Error: entry not found');
    }
    handleDelete() {
        const entryName = this.getVal(this.IdNameOld);
        this.setApp(`
        <h2>Delete entry &quot;<span id="${this.IdNameTitle}">${entryName}</span>&quot;</h2>
        <p>Are you sure to proceed?</p>
        <p>${ViewHelpers.submit(this.IdConfirmDeleteEntry, 'Confirm delete', this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdEdit, 'Cancel', this.ClassFormBtnSec)}</p>
        `, () => this.clickEl(this.IdEdit));
    }
    viewEntry(EntryName) {
        const entry = State.EntriesManage.GetEntry(EntryName);
        if (entry !== false)
            this.setApp(`<p>${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)} ${ViewHelpers.button(this.IdEdit, 'Edit entry', this.ClassFormBtn)}</p>
            <h2 id="${this.IdNameTitle}">${entry.Name}</h2>
            ${this.entryMask(entry)}
            `, () => this.clickEl(this.IdGoToInit));
        else
            alert('Error: entry not found');
    }
    composeEntry() {
        const Name = this.getVal(this.IdName);
        const Description = this.getVal(this.IdDesc);
        const Tags = this.getVal(this.IdTags);
        const Username = this.getVal(this.IdUsername + this.valExt);
        const Password = this.getVal(this.IdPassword + this.valExt);
        const PIN = this.getVal(this.IdPIN + this.valExt);
        let Other = {};
        if (this.OtherCounter > 0) {
            let counter = 0;
            Other = {};
            while (this.OtherCounter > counter) {
                let id = this.IdOtherKey + counter;
                if ($('#' + id)[0] !== undefined) {
                    let key = this.getVal(id);
                    let val = this.getVal(this.IdOtherValue + counter + this.valExt);
                    if (key !== '' && val != '')
                        Other[key] = val;
                }
                ++counter;
            }
        }
        return {
            Name: Name,
            Description: Description !== '' ? Description : undefined,
            Tags: Tags !== '' ? Tags : undefined,
            Username: Username !== '' ? Username : undefined,
            Password: Password !== '' ? Password : undefined,
            PIN: PIN !== '' ? PIN : undefined,
            Other: Other
        };
    }
    deleteEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            const Name = this.getInner(this.IdNameTitle);
            if (State.EntriesManage.DeleteEntry(Name)) {
                this.LoaderShow();
                const setresult = yield State.CryptPass.SetEntries(State.EntriesManage.Export(), State.K, true);
                this.LoaderHide();
                if (setresult) {
                    alert('Entry "' + Name + '" successfully removed');
                    this.Init();
                }
                else {
                    alert('Sorry, generic error during entry removing. Please retry.');
                }
            }
            else {
                alert('Sorry, generic error during entry removing. Please retry.');
            }
        });
    }
    editEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            const NameOld = this.getVal(this.IdNameOld);
            const Name = this.getVal(this.IdName);
            if (Name != '') {
                let checkName = 'Invalid';
                if (Name != NameOld) {
                    if (State.EntriesManage.GetEntry(Name) === false) {
                        checkName = 'Changed';
                    }
                    else {
                        alert('An entry named "' + Name + '" already exists. Please choose another name.');
                        this.focusEl(this.IdName);
                    }
                }
                else
                    checkName = 'OK';
                if (checkName != 'Invalid') {
                    if ((checkName == 'Changed' && State.EntriesManage.UpdateEntryName(NameOld, Name)) || checkName == 'OK') {
                        if (State.EntriesManage.UpdateEntry(this.composeEntry())) {
                            this.LoaderShow();
                            const setresult = yield State.CryptPass.SetEntries(State.EntriesManage.Export(), State.K, true);
                            this.LoaderHide();
                            if (setresult) {
                                this.viewEntry(Name);
                            }
                            else {
                                alert('Sorry, generic error during wallet saving. Please retry.');
                            }
                        }
                        else {
                            alert('Sorry, generic error during entry updating. Please retry.');
                        }
                    }
                    else {
                        alert('Sorry, generic error during entry name changing. Please retry.');
                    }
                }
            }
            else {
                alert('Insert a name for this entry!');
                this.focusEl(this.IdName);
            }
        });
    }
    addEntry() {
        return __awaiter(this, void 0, void 0, function* () {
            const Name = this.getVal(this.IdName);
            if (Name != '') {
                if (State.EntriesManage.GetEntry(Name) === false) {
                    if (State.EntriesManage.AddEntry(this.composeEntry())) {
                        this.LoaderShow();
                        const setresult = yield State.CryptPass.SetEntries(State.EntriesManage.Export(), State.K, true);
                        this.LoaderHide();
                        if (setresult) {
                            this.viewEntry(Name);
                        }
                        else {
                            alert('Sorry, generic error. Please retry.');
                        }
                    }
                    else {
                        alert('Sorry, generic error. Please retry.');
                    }
                }
                else {
                    alert('An entry named "' + Name + '" already exists. Please choose another name.');
                    this.focusEl(this.IdName);
                }
            }
            else {
                alert('Insert a name for this entry!');
                this.focusEl(this.IdName);
            }
        });
    }
    handleNew() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setApp(`<p>${ViewHelpers.button(this.IdGoToInit, 'Go back', this.ClassFormBtnSec)}</p>
        <h2>Add new entry</h2>
        <form id="${this.IdAddEntryForm}">
        ${this.entryMask(undefined, false)}
        <p>${ViewHelpers.submit(this.IdAddEntry, 'Save entry', this.ClassFormBtn)}</p>
        </form>`, () => this.clickEl(this.IdGoToInit));
        });
    }
    entryMask(entry, readonly = true) {
        let out = '';
        if (entry === undefined)
            entry = {};
        else
            out += ViewHelpers.hiddeninput(this.IdNameOld, entry.Name);
        if (readonly && entry.Date !== undefined)
            out += `<p class="fst-italic">Last edit: <strong>${entry.Date}</strong></p>`;
        if (!readonly)
            out += this.attrInput(this.IdName, 'Name * (mandatory)', 'Put here the entry name', entry.Name === undefined ? '' : entry.Name);
        if (!readonly || entry.Tags !== undefined)
            out += this.attrInput(this.IdTags, 'Tags', 'Tags comma separated (eg. &quot;work, Windows&quot;))', entry.Tags === undefined ? '' : entry.Tags, readonly, true);
        if (!readonly) {
            const tags = TagHelpers.getAllTags(State.EntriesManage);
            if (tags.length > 0) {
                let tagsButtons = new Array();
                let tagCounter = 0;
                tags.forEach((tag) => {
                    tagsButtons.push(ViewHelpers.button('tag' + (++tagCounter), tag, this.ClassFormBtn + ' my-1', `data-tag="${tag}"`));
                });
                out += `<div><span id="${this.IdSpanSelExistingTags}">${ViewHelpers.button(this.IdSelExistingTags, 'Select existing tags', 'my-1 d-none ' + this.ClassFormBtnSec)}</span>
                <span id="${this.IdExistingTags}" class="d-none">${tagsButtons.join(' ')}
                ${ViewHelpers.button(this.IdCloseSelExistingTags, ' CLOSE ', this.ClassFormBtnSec)}</span></div>`;
            }
        }
        if (!readonly || entry.Description !== undefined)
            out += this.attrInput(this.IdDesc, 'Description', 'Put here an entry description', entry.Description === undefined ? '' : entry.Description, readonly);
        if (!readonly || entry.Username !== undefined)
            out += this.attrInput(this.IdUsername, 'Username', 'Put here an entry username', entry.Username === undefined ? '' : entry.Username, readonly, true, false, true);
        if (!readonly || entry.Password !== undefined)
            out += this.attrInput(this.IdPassword, 'Password', 'Put here an entry password', entry.Password === undefined ? '' : entry.Password, readonly, true, false, true);
        if (!readonly || entry.PIN !== undefined)
            out += this.attrInput(this.IdPIN, 'PIN', 'Put here an entry PIN', entry.PIN === undefined ? '' : entry.PIN, readonly, undefined, true, true);
        out += `<div id="${this.IdOther}">`;
        if (!readonly)
            out += `<h3>Custom fields</h3>`;
        if (entry.Other !== undefined) {
            let counter = 0;
            for (let ot in entry.Other) {
                if (readonly && counter == 0)
                    out += `<h3>Custom fields</h3>`;
                out += this.otherInput(ot, entry.Other[ot], readonly, counter);
                ++counter;
            }
            this.OtherCounter = counter;
        }
        out += `</div>`;
        if (!readonly)
            out += `<p>${ViewHelpers.button(this.IdOtherAdd, 'Add a custom field', this.ClassFormBtnSec)}</p>`;
        return out;
    }
    otherInput(entryKey, entryVal, readonly, counter) {
        return `<div class="container">
        <div class="row mb-4" id="${this.IdOtherP + counter}">
            <div class="col-9">
                <p class="row my-1">${readonly ? this.PrintViewOrCopyBar(this.IdOtherValue + counter, entryKey) : ''}
                ${readonly ? `<strong>${entryKey}</strong>` : ViewHelpers.textinput(this.IdOtherKey + counter, entryKey, 'Put here a custom label', this.ClassFormCtrl, readonly)}
                </p>
                <p class="row my-1">${ViewHelpers.hiddeninput(this.IdOtherValue + counter + this.valExt, entryVal)}
                ${ViewHelpers.textinput(this.IdOtherValue + counter, this.hideVal, readonly ? '' : 'Put here a custom value', this.ClassFormCtrl + ' ', readonly, true)}
                </p>
            </div>
            <div class="col-3 align-self-center">
                ${readonly ? '' : ViewHelpers.button(this.IdOtherDelete + counter, '&nbsp;X&nbsp;', this.ClassFormBtn, `data-counter="${counter}"`)}
            </div>
        </div></div>`;
    }
    attrInput(attrId, attrLabel, attrPlaceholder, attrVal, attrReadonly, attrNoautocaps, numeric, hidden) {
        return `${(hidden && attrReadonly ? `<p>${this.PrintViewOrCopyBar(attrId, attrLabel)}</p>` : '')}<div class="${this.ClassFormFloat}">${hidden === true ? `${ViewHelpers.hiddeninput(attrId + this.valExt, attrVal)}` : ''}
        ${numeric ? ViewHelpers.numericinput(attrId, hidden ? this.hideVal : attrVal, attrReadonly ? '' : attrPlaceholder, this.ClassFormCtrl, attrReadonly) :
            ViewHelpers.textinput(attrId, hidden ? this.hideVal : attrVal, attrReadonly ? '' : attrPlaceholder, this.ClassFormCtrl, attrReadonly, attrNoautocaps)}
        ${ViewHelpers.label(attrId, attrLabel)}
        </div>
        `;
    }
    addOther() {
        $('#' + this.IdOther).append(this.otherInput('', '', false, this.OtherCounter++));
        this.focusEl(this.IdOtherKey + (this.OtherCounter - 1));
    }
    delOther(counter) {
        if (counter !== undefined)
            $('#' + this.IdOtherP + counter).remove();
    }
}
class RestoreView extends View {
    constructor() {
        super(...arguments);
        this.IdGoToInit = 'goToInit';
        this.IdHandleKO = 'handleKO';
        this.IdPassword1 = 'password1';
        this.IdPassword2 = 'password2';
        this.IdRestoreAll = 'restoreAll';
        this.IdGoBack = 'GoBack';
        this.IdStartFromScratch = 'startFromScratch';
        this.IdRestoreWallet = 'RestoreWallet';
        this.IdMaintainFile = 'MaintainFile';
        this.IdChooseFile = 'ChooseFile';
        this.IdFileUri = 'FileUri';
        this.IdMaintainSequence = 'MaintainSequence';
        this.IdInsertSequence = 'InsertSequence';
        this.IdFileUriP = 'FileUriP';
        this.IdSequenceP = 'SequenceP';
        this.IdSequence = 'Sequence';
        this.IdSelectSequence = 'SelectSequence';
        this.IdSequenceBackspace = 'SequenceBackspace';
        this.IdSequenceClear = 'SequenceClear';
        this.IdSequenceConfirm = 'SequenceConfirm';
        this.IdSequenceComposer = 'SequenceComposer';
        this.IdSelectSequenceCancel = 'SelectSequenceCancel';
        this.IdConfirm = 'Confirm';
        this.IdStartUsingCryptpass = 'StartUsingCryptpass';
        this.PrefixSequenceButton = 'sequence_';
        this.DefaultNoFile = 'No file selected';
        this.DefaultNoSequence = 'No sequence selected';
        this._sequence = [];
        this.Handlers = [
            { name: 'RestoreViewClick', handler: (e) => this.onClick(e), type: 'click' }
        ];
    }
    Init(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ro === undefined && options === undefined)
                return;
            else if (this.ro === undefined && options !== undefined) {
                this.ro = options;
            }
            this.setApp(`${this.ro.errorMsg !== undefined ? `<p class="alert alert-danger">${this.ro.errorMsg}</p>` : ''}
                ${this.ro.desc !== undefined ? this.ro.desc : ''}
                <p>${ViewHelpers.button(this.IdRestoreAll, 'Restore KeyPass/Sequence', this.ClassFormBtn)}</p>
                <p>${ViewHelpers.button(this.IdStartFromScratch, 'Start from scratch', this.ClassFormBtn)}</p>
                ${this.ro.back !== undefined ? `<p>${ViewHelpers.button(this.IdGoBack, 'Go Back', this.ClassFormBtnSec)}</p>` : ''}
                `, () => this.clickEl(this.IdGoBack));
            this._ca = new ConfigActions(State.Password);
            this._aa = new AppActions();
        });
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = e.target.id;
            switch (id) {
                case this.IdGoToInit:
                    this.Init();
                    break;
                case this.IdStartUsingCryptpass:
                    this.restart();
                    break;
                case this.IdStartFromScratch:
                    this.handleKO('Initialize');
                    break;
                case this.IdRestoreAll:
                    this.handleKO('RestoreAll');
                    break;
                case this.IdHandleKO:
                    this.handleKO('ProceedInitialization');
                    break;
                case this.IdGoBack:
                    if (this.ro.back !== undefined)
                        this.ro.back();
                    break;
                case this.IdMaintainFile:
                    this.restoreWalletDisplay('maintainFile');
                    break;
                case this.IdChooseFile:
                    yield this.restoreWalletDisplay('chooseFile');
                    break;
                case this.IdMaintainSequence:
                    this.restoreWalletDisplay('maintainSequence');
                    break;
                case this.IdInsertSequence:
                    this.restoreWalletDisplay('insertSequence');
                    break;
                case this.IdSequenceBackspace:
                    this.selectSequence('backspace');
                    break;
                case this.IdSequenceClear:
                    this.selectSequence('clear');
                    break;
                case this.IdSequenceConfirm:
                    this.selectSequence('confirm');
                    break;
                case this.IdSelectSequenceCancel:
                    this.restoreWalletDisplay('selectSequenceCancel');
                    break;
                case this.IdConfirm:
                    yield this.confirmRestoreWallet();
                    break;
            }
            if (id.indexOf(this.PrefixSequenceButton) == 0) {
                this.selectSequence(id);
            }
        });
    }
    restart() {
        State.logout();
        ScenarioController.changeScenario(new MainView());
    }
    restoreWalletDisplay(action) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (action) {
                case 'maintainFile':
                    this.hideEl(this.IdFileUriP);
                    break;
                case 'chooseFile':
                    const res = yield Config.selectKeyPassUri();
                    this.showEl(this.IdFileUriP);
                    if (res !== false) {
                        this.setInner(this.IdFileUri, res);
                    }
                    else {
                        this.setInner(this.IdFileUri, this.DefaultNoFile);
                    }
                    break;
                case 'maintainSequence':
                    this.hideEl(this.IdSequenceP);
                    break;
                case 'insertSequence':
                    this.hideEl(this.IdRestoreWallet);
                    this.showEl(this.IdSequenceP);
                    this.showEl(this.IdSelectSequence);
                    this.onBackButton = () => this.clickEl(this.IdSelectSequenceCancel);
                    break;
                case 'selectSequenceCancel':
                    this.showEl(this.IdRestoreWallet);
                    this.hideEl(this.IdSelectSequence);
                    this.onBackButton = () => this.clickEl(this.IdGoToInit);
                    break;
            }
            this.displayConfirm();
        });
    }
    confirmRestoreWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const newFile = this.isChecked(this.IdChooseFile) ? this.getInner(this.IdFileUri) : undefined;
            const newSequence = this.isChecked(this.IdInsertSequence) ? this._sequence : undefined;
            const ok = yield this._ca.setSequenceAndKeyPassUri(newSequence, newFile);
            if (ok) {
                State.logout();
                ScenarioController.changeScenario(new MainView());
            }
            else
                alert('Error! Something has gone wrong. Please retry.');
        });
    }
    selectSequence(action) {
        switch (action) {
            case 'backspace':
                const num = this._sequence.pop();
                if (num !== undefined) {
                    this.getEl(this.PrefixSequenceButton + num).removeAttribute('disabled');
                    this.printSequence();
                }
                break;
            case 'clear':
                this._sequence.forEach(num => {
                    this.getEl(this.PrefixSequenceButton + num).removeAttribute('disabled');
                });
                this._sequence = [];
                this.printSequence();
                break;
            case 'confirm':
                if (this._sequence.length == 26) {
                    this.setInner(this.IdSequence, this.getInner(this.IdSequenceComposer));
                    this.showEl(this.IdRestoreWallet);
                    this.hideEl(this.IdSelectSequence);
                }
                else {
                    alert('You must complete typing the entire sequence!');
                }
                break;
            default:
                const seqN = parseInt(action.split(this.PrefixSequenceButton)[1]);
                this._sequence.push(seqN);
                this.getEl(action).setAttribute('disabled', 'disabled');
                this.printSequence();
        }
        this.displayConfirm();
    }
    printSequence() {
        this.setInner(this.IdSequenceComposer, this._sequence.join(', '));
    }
    handleKO(step = 'KOStart') {
        return __awaiter(this, void 0, void 0, function* () {
            switch (step) {
                case 'ProceedInitialization':
                    const pwd1 = this.getVal(this.IdPassword1, true);
                    const pwd2 = this.getVal(this.IdPassword2, true);
                    if (!CommonHelpers.CheckNewPassword(pwd1, pwd2)) {
                        this.focusEl(this.IdPassword1);
                    }
                    else {
                        this._ca = new ConfigActions(pwd1);
                        this.LoaderShow();
                        const configured = yield this._ca.setup('NEW');
                        this.LoaderHide();
                        if (configured) {
                            this.setApp(`<p>Configuration done.</p>
    <p class="alert alert-danger">Caution! The following sequence of numbers, along with your personal password, is indispensable
     to recover your stored secrets, starting from the previously saved file, in case you reset or lost your device.</p>

    <p class="h3">${this._ca.getSequence().join(', ')}</p>

     <p class="alert alert-danger">Now, please make a note or a screenshot of this number sequence (in correct order).
     Remember anyway that this sequence of numbers can also be displayed at a later time through the appropriate menu item 
     (<strong>best before you reset or lost your device...</strong>)</p>
     <p>${ViewHelpers.button(this.IdStartUsingCryptpass, 'Start using CryptPassApp', this.ClassFormBtn)}</p>

    `);
                        }
                        else {
                            this.setApp(`
    <p>Something went wrong with starting configuration</p>
    <p>${ViewHelpers.button(this.IdGoToInit, 'Retry', this.ClassFormBtn)}</p>
    `, () => this.clickEl(this.IdGoToInit));
                        }
                    }
                    break;
                case 'Initialize':
                    this.setApp(`
                <h2>Start from scratch</h2>
                <ol>
                <li>
                    <p>Choose a strong (very strong) password:</p>
                    <p>${ViewHelpers.password(this.IdPassword1, 'Type password', this.ClassFormCtrl)}</p>
                    <p>${ViewHelpers.password(this.IdPassword2, 'Repeat password', this.ClassFormCtrl)}</p>
                </li>

                <li>
                    <p>Select the folder (or create the new one) where passwords will be stored:</p>
                    <p>${ViewHelpers.button(this.IdHandleKO, 'Proceed', this.ClassFormBtn)}</p>
                </li>
                </ol>
                <p>${ViewHelpers.button(this.IdGoToInit, 'Go Back', this.ClassFormBtnSec)}</p>
                `, () => this.clickEl(this.IdGoToInit));
                    break;
                case 'RestoreAll':
                    const status = this.ro.status;
                    const mustPickFile = status == 'EmptyKeypass' || status == 'MissingKeypass' || status == 'KO';
                    const mustInsertSequence = status == 'EmptySequence' || status == 'KO';
                    this.setApp(`
                <div id="${this.IdRestoreWallet}">
                <h2>Restore wallet</h2>

                <div class="mt-2 btn-group" role="group">
                    <span${mustPickFile ? ' class="d-none"' : ''}><input type="radio" class="btn-check" name="btnradio" id="${this.IdMaintainFile}" autocomplete="off"${mustPickFile ? '' : ' checked="checked"'}>
                    <label class="btn btn-outline-primary" for="${this.IdMaintainFile}">Maintain current file</label></span>

                    <input type="radio" class="btn-check" name="btnradio" id="${this.IdChooseFile}" autocomplete="off"${mustPickFile ? ' checked="checked"' : ''}>
                    <label class="btn btn-outline-primary" for="${this.IdChooseFile}">Choose new file</label>
                </div>

                <p id="${this.IdFileUriP}"${mustPickFile ? '' : ' class="d-none"'}>New file: <span class="fw-bold text-break" id="${this.IdFileUri}">${this.DefaultNoFile}</span></p>                    

                <div class="mt-2 btn-group" role="group"${mustInsertSequence ? ' class="d-none"' : ''}>
                    <span${mustInsertSequence ? ' class="d-none"' : ''}><input type="radio" class="btn-check" name="btnradio1" id="${this.IdMaintainSequence}" autocomplete="off"${mustInsertSequence ? '' : ' checked="checked"'}>
                    <label class="btn btn-outline-primary" for="${this.IdMaintainSequence}">Maintain current sequence</label></span>

                    <input type="radio" class="btn-check" name="btnradio1" id="${this.IdInsertSequence}" autocomplete="off"${mustInsertSequence ? ' checked="checked"' : ''}>
                    <label class="btn btn-outline-primary" for="${this.IdInsertSequence}">Insert new sequence</label>
                </div>

                <p id="${this.IdSequenceP}"${mustInsertSequence ? '' : ' class="d-none"'}>New sequence: <span class="fw-bold" id="${this.IdSequence}">${this.DefaultNoSequence}</span></p>
                
                <p class="mt-3">${ViewHelpers.button(this.IdConfirm, 'Confirm choices', this.ClassFormBtn)}
                ${ViewHelpers.button(this.IdGoToInit, 'Go Back', this.ClassFormBtnSec)}</p>
                </div>

                <div id="${this.IdSelectSequence}" class="d-none">
                <p>Press sequence numbers in correct order:</p>
                <p>${this.printSequenceButtons()}</p>
                <p>${ViewHelpers.button(this.IdSequenceBackspace, '⇐ Backspace', this.ClassFormBtnSec)}
                ${ViewHelpers.button(this.IdSequenceClear, 'Clear all', this.ClassFormBtnSec)}
                ${ViewHelpers.button(this.IdSequenceConfirm, 'Confirm', this.ClassFormBtn)}
                </p>

                <p id="${this.IdSequenceComposer}" class="fw-bold"></p>
                <p>${ViewHelpers.button(this.IdSelectSequenceCancel, 'Cancel', this.ClassFormBtnSec)}</p>
                </div>
                `, () => this.clickEl(this.IdGoToInit));
                    this.displayConfirm();
                    break;
            }
        });
    }
    displayConfirm() {
        if ((!this.isChecked(this.IdMaintainFile) || !this.isChecked(this.IdMaintainSequence))
            &&
                (this.isChecked(this.IdMaintainFile) ||
                    (this.isChecked(this.IdChooseFile) && this.getInner(this.IdFileUri) != this.DefaultNoFile))
            &&
                (this.isChecked(this.IdMaintainSequence) ||
                    (this.isChecked(this.IdInsertSequence) && this.getInner(this.IdSequence) != this.DefaultNoSequence)))
            this.showEl(this.IdConfirm);
        else
            this.hideEl(this.IdConfirm);
    }
    printSequenceButtons() {
        let out = '';
        for (let i = 0; i < 26; ++i) {
            out += ` ${ViewHelpers.button(this.PrefixSequenceButton + i, ` ${i} `, this.ClassFormBtnBla + ' m-2')} `;
        }
        return out;
    }
}
class WelcomeView extends View {
    constructor() {
        super(...arguments);
        this.firstTimeKey = 'firstTime';
        this.IdGoToMain = 'goToMain';
        this.IdDontShowAnymore = 'dontShowAnymore';
        this.Handlers = [
            { name: 'WelcomeViewClick', handler: (e) => this.onClick(e), type: 'click' }
        ];
    }
    onClick(e) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (e.target.id) {
                case this.IdGoToMain:
                    if (this.getEl(this.IdDontShowAnymore).checked)
                        LocalStorage.FirstTimeSet();
                    this.goToMain();
                    break;
            }
        });
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.LoaderHide();
            if (LocalStorage.FirstTime()) {
                this.firstTime();
            }
            else {
                this.goToMain();
            }
        });
    }
    goToMain() {
        ScenarioController.changeScenario(new MainView());
    }
    firstTime() {
        this.setApp(`
        <p>Welcome to CryptPassApp</p>
        ${ViewHelpers.Instructions}
        <p><input type="checkbox" id="${this.IdDontShowAnymore}" /> <label for="${this.IdDontShowAnymore}">Don't show this message anymore</label></p>
        <p>${ViewHelpers.button(this.IdGoToMain, 'LET\'S START', this.ClassFormBtn)}</p>
        `);
    }
}
//# sourceMappingURL=cryptpassapp.js.map