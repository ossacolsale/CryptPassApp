
/// <reference path="../.vscode/typings/cordova/cordova.d.ts"/>
/// <reference path="../plugins/cordova-plugin-save-dialog/types/index.d.ts"/>
/// <reference path="../plugins/cordova-plugin-simple-file-chooser/types/index.d.ts"/>

declare class fs {
    static writeFileSync: (fileUri: string, fileContent: string) => Promise<boolean>;
    static readFileSync: (fileUri: string) => Promise<string|false>;
}

interface ElectronFile extends File {
    path: string;
}

interface CordovaPlugins {
    SecureKeyStore: SecureKeyStore;
    clipboard: any;
    permissions: any;
}

interface SecureKeyStore {
    set(onOk: (res: string)=>any, onErr: (err: string)=>any, key: string, value: string): void;
    get(onOk: (res: string)=>any, onErr: (err: string)=>any, key: string): void;
    remove(onOk: (res: string)=>any, onErr: (err: string)=>any, key: string): void;
}

declare class LibCryptPass {
    static ConfigCryptPass: new(obj: StdWriters, KeyPassObj?: {}, SequenceObj?: {}) => ConfigCryptPass;
    static CryptPass: new(password: string, obj: StdWriters, KeyPassObj?: {}, SequenceObj?: {}) => CryptPass;
    static CryptPassCached: new(obj: StdWriters, KeyPassObj?: {}, SequenceObj?: {}) => CryptPassCached;
}

declare class ConfigCryptPass {
    private _SM;
    private _KPM;
    getLastChange(): Date;
    restoreSeq(sequence: number[]): Promise<boolean>;
    getSequence(): number[];
    initSeqAndKey(password: string): Promise<boolean>;
    refreshSequence(password: string): Promise<boolean>;
    checkPwd(password: string): boolean;
    chPwd(oldPassword: string, newPassword: string): Promise<boolean>;
    constructor(ObjRW: StdWriters, KeyPassObj?: {}, SequenceObj?: {});
}
interface StdWriters {
    SequenceWriter: ObjWriter;
    KeyPassWriter: ObjWriter;
}
declare class CryptPass {
    private _Password;
    private _KPM;
    constructor(password: string, ObjRW: StdWriters, KeyPassObj?: {}, SequenceObj?: {});
    getPassDescription(): string;
    setPassDescription(description: string): Promise<boolean>;
    addEntry(entry: EntryView): Promise<boolean>;
    getEntry(name: string): false | EntryView;
    getEntryNames(): string[];
    updateEntry(entry: EntryView): Promise<boolean>;
    updateEntryName(oldName: string, newName: string): Promise<boolean>;
    deleteEntry(name: string): Promise<boolean>;
}

declare class CryptPassCached {
    private _KPM;
    constructor(ObjRW: StdWriters, KeyPassObj?: {}, SequenceObj?: {});
    getPassDescription(): string;
    setPassDescription(description: string): Promise<boolean>;
    SetEntries(entries: Entries, passwordOrK: string, isK?: boolean): Promise<boolean>;
    GetEntriesManage(passwordOrK: string, isK?: boolean): EntriesManage;
    GetK(password: string): string | false;
}

declare type Entries = {
    [Name: string]: EntryView;
};

declare class EntriesManage {
    private _entries;
    constructor(entries: Entries);
    set Entries(entries: Entries);
    GetEntryNames(): string[];
    GetEntry(Name: string): EntryView | false;
    UpdateEntryName(Name: string, NewName: string): boolean;
    UpdateEntry(Value: EntryView): boolean;
    DeleteEntry(Name: string): boolean;
    AddEntry(Value: EntryView): boolean;
    Export(): Entries;
}

declare type ObjWriter = (Obj: {}, KeepBackup?: boolean) => boolean | Promise<boolean>;

interface EntryValue {
    Description?: string;
    Tags?: string;
    Username?: string;
    Password?: string;
    PIN?: string;
    Other?: {
        [Name: string]: string;
    };
}

interface EntryView extends EntryValue {
    Name?: string;
    Date?: Date;
    DateStr?: string;
}

interface SecureStorageInstance {
    /**
     * Recupera un valore dallo storage sicuro.
     * @param successCallback Funzione chiamata con il valore recuperato (stringa)
     * @param errorCallback Funzione chiamata in caso di errore (es. "Key not found")
     * @param key La chiave da cercare
     */
    get(
        successCallback: (value: string) => void,
        errorCallback: (error: any) => void,
        key: string
    ): void;

    /**
     * Salva un valore nello storage sicuro.
     * @param successCallback Funzione chiamata con la chiave salvata in caso di successo
     * @param errorCallback Funzione chiamata in caso di errore
     * @param key La chiave
     * @param value Il valore (stringa)
     */
    set(
        successCallback: (key: string) => void,
        errorCallback: (error: any) => void,
        key: string,
        value: string
    ): void;

    /**
     * Rimuove un valore dallo storage.
     * @param successCallback Funzione chiamata con la chiave rimossa
     * @param errorCallback Funzione chiamata in caso di errore
     * @param key La chiave da rimuovere
     */
    remove(
        successCallback: (key: string) => void,
        errorCallback: (error: any) => void,
        key: string
    ): void;

    /**
     * (Opzionale) Ottiene la lista di tutte le chiavi salvate in questo namespace
     */
    keys(
        successCallback: (keys: string[]) => void,
        errorCallback: (error: any) => void
    ): void;

    /**
     * (Opzionale) Cancella tutto il contenuto di questo namespace
     */
    clear(
        successCallback: () => void,
        errorCallback: (error: any) => void
    ): void;
}

/**
 * Interfaccia per il Costruttore
 * Definisce come si fa il "new"
 */
interface SecureStorageConstructor {
    new (
        successCallback: () => void,
        errorCallback: (error: any) => void,
        namespace: string
    ): SecureStorageInstance;
}

/**
 * Estensione dell'interfaccia globale dei plugin di Cordova
 */
interface CordovaPlugins {
    SecureStorage: SecureStorageConstructor;
}
