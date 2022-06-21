declare let __K_: string;
declare let __Password_: string;
declare let __EntriesManage_: EntriesManage;
declare let __CryptPass_: CryptPassCached;
declare class AppActions {
    Unlock(pwd: string): Promise<boolean>;
}
interface config {
    KeyFilePath: string;
    Sequence: string;
}
declare type Sequence = {
    Sequence: number[];
};
declare type ConfigStatus = 'OK' | 'FatalError' | 'KO' | 'MissingKeypass' | 'EmptySequence' | 'EmptyKeypass';
declare class Config {
    protected static readonly emptySequence: Sequence;
    protected static readonly configName = "cryptPassCfg";
    protected static readonly defaultKeyPassFilename = "keypass.json";
    protected static readonly defaultConfig: config;
    static ConfigInit(): Promise<boolean>;
    static readData(): Promise<{
        kp: {};
        se: {};
    }>;
    protected static setConfig(cfg: config): Promise<boolean>;
    protected static getConfig(): Promise<config | false>;
    static getStatus(): Promise<ConfigStatus>;
    protected static readSequence(): Promise<{}>;
    static writeSequence(seq: {}): Promise<boolean>;
    protected static getKeyPassPath(): Promise<string | false>;
    static readKeyPass(): Promise<{} | false>;
    static writeKeyPass(kp: {}): Promise<boolean>;
    static newKeyPass(kp?: {}): Promise<boolean>;
    static selectKeyPassUri(): Promise<string | false>;
    static setKeyPassUri(uri: string): Promise<boolean>;
}
declare type configaction = 'NEW' | 'RestoreKeyPassFile' | 'RestoreSequence' | 'InitKeyPassAndSequence';
declare class ConfigActions {
    protected _PWD: string;
    protected _CryptPassConfig: ConfigCryptPass;
    protected readonly _initializedKey: string;
    protected readonly defaultPasswordExpirationDays: number;
    constructor(password: string, InitializationDone?: boolean);
    getSequence(): number[];
    refreshSequence(): Promise<boolean>;
    setSequenceAndKeyPassUri(seq?: number[], keypassuri?: string): Promise<boolean>;
    changePwd(oldPwd: string, newPwd: string): Promise<boolean>;
    needToChangePassword(): boolean;
    checkPwd(): boolean;
    setup(action: configaction, sequence?: number[]): Promise<boolean>;
    getStatus(): Promise<ConfigStatus>;
    protected InitCryptPassConfig(): Promise<void>;
}
declare const StandardRnW: StdWriters;
declare const handledTypes: readonly ["deviceready", "click", "change", "submit", "focus", "blur", "backbutton", "touchstart", "touchend"];
declare type HandledTypes = typeof handledTypes[number];
declare type EventHandlersCollection = {
    [key in HandledTypes]: EventHandlers;
};
declare type EventHandlers = {
    [key: string]: EventHandler;
};
declare type EventHandler = (e: Event) => void | Promise<void>;
declare class EventsController {
    protected static _events: EventHandlersCollection;
    protected static getEventHandler(name: string, event: HandledTypes): EventHandler;
    protected static addOrSetEventHandler(name: string, event: HandledTypes, handler: EventHandler, setEvent?: boolean): boolean;
    static addEventHandler(name: string, event: HandledTypes, handler: EventHandler): boolean;
    static delEventHandler(name: string, event: HandledTypes): void;
    static setEventHandler(name: string, event: HandledTypes, handler: EventHandler): boolean;
    static eventCatcher(e: Event): Promise<void>;
    static Initialize(): void;
}
declare class ScenarioController {
    protected static _currentScenario: ViewModel;
    static changeScenario(scenario: View, initOptions?: any): void;
    protected static appInit(): void;
    protected static closeScenario(): void;
    protected static delHandlers(): void;
    protected static addHandlers(): void;
}
declare type TBackButton = () => any | Promise<any>;
interface ViewModel {
    Init(options?: any): void;
    onBackButton: TBackButton;
    End?(): void;
    Handlers: EventHandlerModel[];
}
interface EventHandlerModel {
    name: string;
    type: HandledTypes;
    handler: EventHandler;
}
declare abstract class View implements ViewModel {
    protected readonly IdAppDiv: string;
    protected readonly IdLoaderDiv: string;
    protected readonly LoaderShowMs: number;
    protected readonly ClassFormBtn: string;
    protected readonly ClassFormBtnSec: string;
    protected readonly ClassFormBtnBla: string;
    protected readonly ClassFormCtrl: string;
    protected readonly ClassFormFloat: string;
    protected readonly ClassMenuBtn: string;
    abstract Init(options?: any): any;
    abstract onBackButton: TBackButton;
    abstract Handlers: EventHandlerModel[];
    protected showEl(elId: string): void;
    protected clickEl(elId: string): void;
    protected hideEl(elId: string): void;
    protected setApp(content: string, onBackButton?: TBackButton): void;
    protected setVal(elId: string, value: string): void;
    protected setInner(elId: string, content: string): void;
    protected getInner(elId: string): string;
    protected getEl(elId: string): HTMLElement;
    protected isChecked(elId: string): boolean;
    protected getVal(elId: string, raw?: boolean): string;
    protected focusEl(elId: string, alsoSelect?: boolean): void;
    private LoaderShowCommands;
    protected LoaderShow(doSomethingBeforeHiding?: () => any, doSomethingAfterHiding?: (res?: any) => any, hideAfter?: boolean): void;
    protected LoaderShowAsync(doSomethingBeforeHiding?: () => any | Promise<any>, doSomethingAfterHiding?: (res?: any) => any | Promise<any>, hideAfter?: boolean): Promise<void>;
    protected LoaderHide(): void;
    protected sleep(milliseconds: number): void;
    protected handleChPwd(idpwdold: string, idpwdnew1: string, idpwdnew2: string, onsuccess: () => any, pwdChanger: (Old: string, New: string) => Promise<boolean>): Promise<void>;
}
declare const defaultMimeType: string;
declare class ElectronFS {
    protected static fwrite(fileContent: string, fileUri: string): Promise<boolean>;
    protected static fread(fileUri: string): Promise<string | false>;
    protected static selectFile(): Promise<ElectronFile | null>;
    static NewFile(fileName: string, fileContent: string): Promise<string | false>;
    static WriteFile(uri: string, fileContent: string): Promise<boolean>;
    static ReadFile(uri: string): Promise<string | false>;
    static SelectAndReadFile(): Promise<Array<FileChooserResult> | false>;
}
declare class AndroidFS {
    static NewFile(fileName: string, fileContent: string): Promise<string | false>;
    static WriteFile(uri: string, fileContent: string): Promise<boolean>;
    static ReadFile(uri: string): Promise<string | false>;
    static SelectAndReadFile(): Promise<Array<FileChooserResult> | false>;
    protected static getGrantOnDir(startPath: string): Promise<boolean>;
}
declare class FS {
    static NewFile(fileName: string, fileContent: string): Promise<string | false>;
    static WriteFile(uri: string, fileContent: string): Promise<boolean>;
    static ReadFileBackup(uri: string): string | null;
    static ReadFile(uri: string): Promise<string | false>;
    static SelectAndReadFile(): Promise<Array<FileChooserResult> | false>;
}
declare type LocalStorageKeys = 'firstTime' | 'Initialized' | 'PasswordExpirationDays';
declare class LocalStorage {
    protected static readonly initialized: string;
    protected static readonly firsttime: string;
    protected static readonly passwordexpirationdays: number;
    protected static _Set(key: LocalStorageKeys, val: string): void;
    protected static _Get(key: LocalStorageKeys): string | null;
    protected static _Del(key: LocalStorageKeys): void;
    static FirstTime(): boolean;
    static FirstTimeSet(): void;
    static InitializedKey(): boolean;
    static InitializedKeySet(): void;
    static PasswordExpirationDays(): number;
    static PasswordExpirationDaysSet(reset?: boolean): void;
}
declare class SecureStorage {
    static getVal(key: string): Promise<string | false>;
    static setVal(key: string, value: string): Promise<string | false>;
    static delVal(key: string): Promise<string | false>;
}
declare class CommonHelpers {
    static StandardError(e: unknown): false;
    static CustomError(msg: string): false;
    static CheckNewPassword(pwd1: string, pwd2: string): boolean;
    static CheckChPassword(oldpwd: string, pwd1: string, pwd2: string): true | 'wrongOld' | 'wrongNew';
    static insensitiveSorter: (a: string, b: string) => number;
}
declare class TagHelpers {
    static getTagsFromString(tagString: string): string[];
    static tagExists(tag: string, tagString: string): boolean;
    static getAllTags(em: EntriesManage, exceptTags?: string[]): string[];
    protected static getEntriesFromEM(em: EntriesManage): EntryView[];
    static getAllTagsFromArr(e: EntryView[], exceptTags?: string[]): string[];
    static getAllEntriesFromTags(tags: string[], em: EntriesManage): EntryView[];
    protected static getEntriesFromTags(tags: string[], ev: EntryView[]): EntryView[];
}
interface InputAttrs {
    id: string;
    type: string;
    val?: string;
    checked?: boolean;
    readonly?: boolean;
    _class?: string;
    placeholder?: string;
    noautocaps?: boolean;
    inputmode?: 'numeric' | 'text' | 'tel' | 'email' | 'decimal';
    custom?: string;
}
declare class ViewHelpers {
    static get Instructions(): string;
    static submit(id: string, val: string, _class?: string): string;
    static button(id: string, val: string, _class?: string, custom?: string): string;
    static label(forId: string, val: string, _class?: string): string;
    protected static genericInput(attrs: InputAttrs): string;
    static checkbox(id: string, val?: string, checked?: boolean, _class?: string, custom?: string): string;
    static textinput(id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean, noautocaps?: boolean): string;
    static hiddeninput(id: string, val?: string): string;
    static numericinput(id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean): string;
    static password(id: string, placeholder?: string, _class?: string, readonly?: boolean): string;
    static cleanVal(val?: string): string;
    protected static getClass(_class?: string): string;
    protected static getChecked(checked?: boolean): string;
    protected static getReadonly(readonly?: boolean): string;
    protected static getNoautocaps(noautocaps?: boolean): string;
    protected static getInputmode(inputmode?: string): string;
    protected static getPlaceholder(placeholder?: string): string;
    protected static getValue(value?: string): string;
    protected static getCustom(value?: string): string;
}
declare class DescrView extends View implements ViewModel {
    onBackButton: TBackButton;
    protected readonly IdGoToInit: string;
    protected readonly IdDescription: string;
    protected readonly IdSetDescription: string;
    protected readonly IdDescriptionForm: string;
    Init(): Promise<void>;
    protected onSubmit(e: Event): Promise<void>;
    protected onClick(e: Event): Promise<void>;
    protected handleSet(): Promise<void>;
    Handlers: EventHandlerModel[];
}
declare type KOsteps = 'KOStart' | 'Initialize' | 'ProceedInitialization' | 'RestoreAll' | 'Start';
declare class MainView extends View {
    onBackButton: TBackButton;
    protected _ca: ConfigActions;
    protected _aa: AppActions;
    protected readonly IdPassword1: string;
    protected readonly IdPassword2: string;
    protected readonly IdHandlePwd: string;
    protected readonly IdUnlockForm: string;
    protected readonly IdRestoreOptions: string;
    protected readonly IdChangeDescr: string;
    protected readonly IdManagePwd: string;
    protected readonly IdOther: string;
    protected readonly IdChPwdForm: string;
    protected readonly IdPasswordOld: string;
    protected readonly IdHandleChPwd: string;
    protected readonly IdDontChPwd: string;
    Init(): Promise<void>;
    protected onSubmit(e: Event): Promise<void>;
    protected onClick(e: Event): Promise<void>;
    protected handlePwd(): Promise<void>;
    protected handleDontChPwd(): void;
    Handlers: EventHandlerModel[];
}
declare class OtherView extends View implements ViewModel {
    onBackButton: TBackButton;
    protected readonly IdGoToInit: string;
    protected readonly IdGoToMainMenu: string;
    protected readonly IdRestore: string;
    protected readonly IdChangePwd: string;
    protected readonly IdViewSequence: string;
    protected readonly IdInstructions: string;
    protected readonly IdRefreshSequence: string;
    protected readonly IdConfirmSequenceRefresh: string;
    protected readonly IdPassword1: string;
    protected readonly IdPassword2: string;
    protected readonly IdChPwdForm: string;
    protected readonly IdPasswordOld: string;
    protected readonly IdHandleChPwd: string;
    protected _ca: ConfigActions;
    Init(): Promise<void>;
    protected onClick(e: Event): Promise<void>;
    protected onSubmit(e: Event): Promise<void>;
    protected changePassword(): Promise<void>;
    protected showInstructions(): void;
    protected RefreshSequence(): void;
    protected handleSequenceRefresh(): Promise<void>;
    protected ViewSequence(msg?: string): void;
    Handlers: EventHandlerModel[];
}
declare class PassView extends View implements ViewModel {
    protected readonly IdGoToInit: string;
    protected readonly IdGoToMainMenu: string;
    protected readonly IdEntriesList: string;
    protected readonly IdNewEntry: string;
    protected readonly IdSearch: string;
    protected readonly IdSearchDiv: string;
    protected readonly IdTagFilter: string;
    protected readonly IdShowHideTags: string;
    protected readonly IdAddEntryForm: string;
    protected readonly IdAddEntry: string;
    protected readonly IdName: string;
    protected readonly IdDesc: string;
    protected readonly IdTags: string;
    protected readonly IdSpanSelExistingTags: string;
    protected readonly IdSelExistingTags: string;
    protected readonly IdExistingTags: string;
    protected readonly IdCloseSelExistingTags: string;
    protected readonly IdUsername: string;
    protected readonly IdPassword: string;
    protected readonly IdPIN: string;
    protected readonly IdOther: string;
    protected readonly IdOtherKey: string;
    protected readonly IdOtherValue: string;
    protected readonly IdOtherDelete: string;
    protected readonly IdOtherAdd: string;
    protected readonly IdOtherP: string;
    protected readonly IdNameTitle: string;
    protected readonly IdEdit: string;
    protected readonly IdBackToView: string;
    protected readonly IdEditEntryForm: string;
    protected readonly IdEditEntry: string;
    protected readonly IdNameOld: string;
    protected readonly IdDeleteEntry: string;
    protected readonly IdConfirmDeleteEntry: string;
    protected readonly IdGoToView: string;
    protected readonly hideVal: string;
    protected readonly valExt: string;
    protected readonly vocBarPre: string;
    Init(): Promise<void>;
    protected searchRoutine(names: string[]): void;
    protected showHideTags(): void;
    protected PrintViewOrCopyBar(refId: string, label: string): string;
    protected showHideTagsStatus: 'show' | 'hide';
    protected searchEntry: string;
    protected searchEntryName(names: string[], name: string): string[];
    protected onSubmit(e: Event): Promise<void>;
    onBackButton: TBackButton;
    protected onClick(e: Event): Promise<void>;
    protected doVoc(refId: string, action: 'view' | 'copy' | 'cancel'): void;
    protected selectTag(tag?: string): void;
    protected CheckedTags: string[];
    protected PrintTags(tags: string[]): string;
    protected PrintEntriesName(entriesName: string[]): string;
    protected onFocus(e: Event): Promise<void>;
    protected onBlur(e: Event): void;
    protected setHidden(id: string, action: 'show' | 'hide'): void;
    protected BackButton: () => Promise<any> | any;
    protected addTag(tag: string): void;
    protected viewExistingTags(action: 'open' | 'close'): void;
    protected handleEdit(): void;
    protected handleDelete(): void;
    protected viewEntry(EntryName: string): void;
    protected composeEntry(): EntryView;
    protected deleteEntry(): Promise<void>;
    protected editEntry(): Promise<void>;
    protected addEntry(): Promise<void>;
    protected handleNew(): Promise<void>;
    protected OtherCounter: number;
    protected entryMask(entry?: EntryView, readonly?: boolean): string;
    protected otherInput(entryKey: string, entryVal: string, readonly: boolean, counter: number): string;
    protected attrInput(attrId: string, attrLabel: string, attrPlaceholder: string, attrVal?: string, attrReadonly?: boolean, attrNoautocaps?: boolean, numeric?: boolean, hidden?: boolean): string;
    protected addOther(): void;
    protected delOther(counter?: string): void;
    Handlers: EventHandlerModel[];
}
declare type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T ? ((t: T, ...a: A) => void) extends (...x: infer X) => void ? X : never : never;
declare type EnumerateInternal<A extends Array<unknown>, N extends number> = {
    0: A;
    1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A["length"] ? 0 : 1];
declare type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never;
declare type SeqIds = `sequence_${Enumerate<26>}`;
interface RestoreOptions {
    errorMsg?: string;
    desc?: string;
    status: ConfigStatus;
    back?: () => any;
}
declare class RestoreView extends View implements ViewModel {
    onBackButton: TBackButton;
    protected readonly IdGoToInit: string;
    protected readonly IdHandleKO: string;
    protected readonly IdPassword1: string;
    protected readonly IdPassword2: string;
    protected _ca: ConfigActions;
    protected _aa: AppActions;
    protected readonly IdRestoreAll: string;
    protected readonly IdGoBack: string;
    protected readonly IdStartFromScratch: string;
    protected ro: RestoreOptions;
    protected readonly IdRestoreWallet: string;
    protected readonly IdMaintainFile: string;
    protected readonly IdChooseFile: string;
    protected readonly IdFileUri: string;
    protected readonly IdMaintainSequence: string;
    protected readonly IdInsertSequence: string;
    protected readonly IdFileUriP: string;
    protected readonly IdSequenceP: string;
    protected readonly IdSequence: string;
    protected readonly IdSelectSequence: string;
    protected readonly IdSequenceBackspace: string;
    protected readonly IdSequenceClear: string;
    protected readonly IdSequenceConfirm: string;
    protected readonly IdSequenceComposer: string;
    protected readonly IdSelectSequenceCancel: string;
    protected readonly IdConfirm: string;
    protected readonly IdStartUsingCryptpass: string;
    protected readonly PrefixSequenceButton: string;
    protected readonly DefaultNoFile: string;
    protected readonly DefaultNoSequence: string;
    Init(options?: RestoreOptions): Promise<void>;
    protected onClick(e: Event): Promise<void>;
    protected restart(): void;
    protected restoreWalletDisplay(action: 'maintainFile' | 'chooseFile' | 'maintainSequence' | 'insertSequence' | 'selectSequenceCancel'): Promise<void>;
    protected confirmRestoreWallet(): Promise<void>;
    protected selectSequence(action: SeqIds | 'backspace' | 'clear' | 'confirm'): void;
    protected printSequence(): void;
    protected handleKO(step?: KOsteps): Promise<void>;
    protected displayConfirm(): void;
    protected printSequenceButtons(): string;
    protected _sequence: number[];
    Handlers: EventHandlerModel[];
}
declare class WelcomeView extends View implements ViewModel {
    onBackButton: TBackButton;
    protected readonly firstTimeKey: string;
    protected readonly IdGoToMain: string;
    protected readonly IdDontShowAnymore: string;
    readonly Handlers: EventHandlerModel[];
    protected onClick(e: Event): Promise<void>;
    Init(): Promise<void>;
    protected goToMain(): void;
    firstTime(): void;
}
