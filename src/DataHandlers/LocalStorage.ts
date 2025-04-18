type LocalStorageKeys = 'firstTime' | 'Initialized' | 'PasswordExpirationTime';

class LocalStorage {

    protected static readonly initialized: string = '1';
    protected static readonly firsttime: string = '0';
    protected static readonly passwordexpirationdays: number = 30;

    protected static _Set(key: LocalStorageKeys, val: string) {
        window.localStorage.setItem(key, val);
    }

    protected static _Get(key: LocalStorageKeys): string | null {
        return window.localStorage.getItem(key);
    }

    protected static _Del(key: LocalStorageKeys) {
        window.localStorage.removeItem(key);
    }

    public static FirstTime (): boolean {
        return this._Get('firstTime') !== this.firsttime;
    }

    public static FirstTimeSet () {
        this._Set('firstTime',this.firsttime);
    }

    public static InitializedKey(): boolean {
        return this._Get('Initialized') !== null;
    }

    public static InitializedKeySet() {
        this._Set('Initialized',this.initialized);
    }

    public static PasswordExpirationTime(): number {
        const ped = this._Get('PasswordExpirationTime');
        return ped == null ? 0 : parseInt(ped);
    }

    public static PasswordExpirationTimeSet() {
        const newVal = Date.now() + this.passwordexpirationdays * 86400000;
        this._Set('PasswordExpirationTime',newVal.toString());
    }
}

