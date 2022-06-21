type LocalStorageKeys = 'firstTime' | 'Initialized' | 'PasswordExpirationDays';

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

    public static PasswordExpirationDays(): number {
        const ped = this._Get('PasswordExpirationDays');
        return ped == null ? this.passwordexpirationdays : parseInt(ped);
    }

    public static PasswordExpirationDaysSet(reset: boolean = false) {
        const newVal = reset ? this.passwordexpirationdays : this.PasswordExpirationDays() + this.passwordexpirationdays;
        this._Set('PasswordExpirationDays',newVal.toString());
    }
}

