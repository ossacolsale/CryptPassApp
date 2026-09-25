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

    public static logout (preserveDeviceUnlock: boolean = false) {
        void AutoLock.clearClipboardIfUnchanged();
        AutoLock.stop(!preserveDeviceUnlock);
        this.__CryptPass_ = null;
        this.__EntriesManage_ = null;
        this.__K_ = '';
        this.__Password_ = '';
    }
}


document.addEventListener('deviceready', () => {
    try {
        Localization.initialize();
        ScenarioController.changeScenario(new WelcomeView());
    } catch (_) {
        alert('Localization resources could not be loaded.');
    }
}, false);


class AutoLock {
    private static readonly clipboardClearMs = 60 * 1000;
    private static inactivityTimer: number | undefined;
    private static lastActivity = 0;
    private static deviceUnlockPassword: string | undefined;
    private static locking = false;
    private static clipboardTimer: number | undefined;
    private static copiedSecret: string | null = null;
    private static listening = false;
    private static removeElectronListener: (() => void) | undefined;

    public static start(): void {
        if (!this.listening) {
            this.listening = true;
            ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(type => document.addEventListener(type, this.reset, { passive: true }));
            document.addEventListener('visibilitychange', this.onVisibilityChange);
            document.addEventListener('pause', this.checkInactivity);
            document.addEventListener('resume', this.checkInactivity);
            window.addEventListener('blur', this.onWindowBlur);
            this.removeElectronListener = window.cryptPassDesktop?.onLockRequested?.(this.lock);
        }
        this.reset();
    }

    private static reset = (): void => {
        this.lastActivity = Date.now();
        this.scheduleLock(LocalStorage.AutoLockTimeoutSeconds() * 1000);
    };

    private static scheduleLock(delay: number): void {
        if (this.inactivityTimer !== undefined) window.clearTimeout(this.inactivityTimer);
        if (State.Password !== '') this.inactivityTimer = window.setTimeout(this.checkInactivity, delay);
    }

    private static checkInactivity = (): void => {
        if (State.Password === '') return;
        const remaining = LocalStorage.AutoLockTimeoutSeconds() * 1000 - (Date.now() - this.lastActivity);
        if (remaining <= 0) this.lock();
        else this.scheduleLock(remaining);
    };

    private static onVisibilityChange = (): void => { if (document.visibilityState === 'visible') this.checkInactivity(); };
    private static onWindowBlur = (): void => { if (cordova.platformId === 'electron' && document.visibilityState === 'hidden') this.checkInactivity(); };

    public static stop(clearDeviceUnlock: boolean = true): void {
        if (this.inactivityTimer !== undefined) window.clearTimeout(this.inactivityTimer);
        if (this.clipboardTimer !== undefined) window.clearTimeout(this.clipboardTimer);
        this.inactivityTimer = undefined;
        this.lastActivity = 0;
        if (clearDeviceUnlock) this.deviceUnlockPassword = undefined;
        this.clipboardTimer = undefined;
        this.copiedSecret = null;
        this.removeElectronListener?.();
        this.removeElectronListener = undefined;
        this.listening = false;
        ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(type => document.removeEventListener(type, this.reset));
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        document.removeEventListener('pause', this.checkInactivity);
        document.removeEventListener('resume', this.checkInactivity);
        window.removeEventListener('blur', this.onWindowBlur);
    }

    public static scheduleClipboardCleanup(secret: string): void {
        if (this.clipboardTimer !== undefined) window.clearTimeout(this.clipboardTimer);
        this.copiedSecret = secret;
        this.clipboardTimer = window.setTimeout(() => { void this.clearClipboardIfUnchanged(); }, this.clipboardClearMs);
    }

    public static async clearClipboardIfUnchanged(): Promise<void> {
        const secret = this.copiedSecret;
        this.copiedSecret = null;
        if (this.clipboardTimer !== undefined) window.clearTimeout(this.clipboardTimer);
        this.clipboardTimer = undefined;
        if (!secret) return;
        try {
            if (cordova.platformId === 'android') {
                cordova.plugins.clipboard.paste((value: string) => { if (value === secret) cordova.plugins.clipboard.copy(''); }, () => undefined);
            } else if (navigator.clipboard?.readText && navigator.clipboard?.writeText) {
                const current = await navigator.clipboard.readText();
                if (current === secret) await navigator.clipboard.writeText('');
            }
        } catch (_) { /* Clipboard reads may be denied; preserve whatever is currently copied. */ }
    }

    private static lock = (): void => {
        if (State.Password === '' || this.locking) return;
        this.locking = true;
        void this.lockSession();
    };

    private static async lockSession(): Promise<void> {
        let canUnlockWithDevice = false;
        if (cordova.platformId === 'android') {
            try { canUnlockWithDevice = await DeviceAuth.hasScreenLock(); } catch (_) { /* Master password remains available. */ }
        }
        this.deviceUnlockPassword = canUnlockWithDevice ? State.Password : undefined;
        State.logout(canUnlockWithDevice);
        ScenarioController.changeScenario(new MainView());
        this.locking = false;
    }

    public static hasDeviceUnlock(): boolean { return this.deviceUnlockPassword !== undefined; }

    public static async unlockWithDevice(): Promise<boolean> {
        const password = this.deviceUnlockPassword;
        if (!password) return false;
        let hasScreenLock = false;
        try { hasScreenLock = await DeviceAuth.hasScreenLock(); } catch (_) { /* Fall back to the master password if system auth is unavailable. */ }
        if (!hasScreenLock) {
            this.deviceUnlockPassword = undefined;
            return false;
        }
        let authenticated = false;
        try { authenticated = await DeviceAuth.confirm(); } catch (_) { /* Leave the credential button available for another attempt. */ }
        if (!authenticated) return false;
        this.deviceUnlockPassword = undefined;
        if (!await new AppActions().Unlock(password)) return false;
        ScenarioController.changeScenario(new PassView());
        return true;
    }
}

class DeviceAuth {
    private static call(action: 'hasScreenLock' | 'confirm'): Promise<boolean> {
        return new Promise((resolve, reject) => (cordova.exec as any)(
            (result: string) => resolve(result === 'true'), reject, 'CryptPassDeviceAuth', action, []
        ));
    }
    public static hasScreenLock(): Promise<boolean> { return this.call('hasScreenLock'); }
    public static confirm(): Promise<boolean> {
        return new Promise((resolve, reject) => (cordova.exec as any)(
            (result: string) => resolve(result === 'true'), reject, 'CryptPassDeviceAuth', 'confirm', [
                Localization.text('main.deviceAuthTitle'), Localization.text('main.deviceAuthDescription')
            ]
        ));
    }
    public static showKeyboard(): void {
        if (cordova.platformId !== 'android') return;
        window.setTimeout(() => (cordova.exec as any)(
            () => undefined,
            (error: unknown) => console.error('Could not open the Android keyboard', error),
            'CryptPassDeviceAuth',
            'showKeyboard',
            []
        ), 120);
    }
}
