/** state variables: */
/*let __K_: string = '';
let __Password_: string = '';
let __EntriesManage_: EntriesManage;
let __CryptPass_: CryptPassCached;*/

class State {
    private static __K_: string = '';
    public static get K(): string {
        return this.__K_;
    }
    public static set K(value: string) {
        this.__K_ = value;
    }
    private static __Password_: string = '';
    public static get Password(): string {
        return this.__Password_;
    }
    public static set Password(value: string) {
        this.__Password_ = value;
    }
    private static __EntriesManage_: EntriesManage | null;
    private static __CryptPass_: CryptPassCached | null;
    
    public static get CryptPass(): CryptPassCached {
        if (this.__CryptPass_)
            return this.__CryptPass_;
        throw Error('CryptPass null');
    }
    public static set CryptPass(value: CryptPassCached | null) {
        this.__CryptPass_ = value;
    }

    public static get EntriesManage(): EntriesManage {
        if (this.__EntriesManage_) return this.__EntriesManage_;
        throw Error('EntriesManage null');
    }
    public static set EntriesManage(em: EntriesManage | null) {
        this.__EntriesManage_ = em;
    }

    public static logout () {
        this.__CryptPass_ = null;
        this.__EntriesManage_ = null;
        this.__K_ = '';
        this.__Password_ = '';
    }
}


document.addEventListener('deviceready',
    () =>
    ScenarioController.changeScenario(new WelcomeView())
,false);
