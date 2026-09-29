type configaction = 'NEW' | 'RestoreKeyPassFile' | 'RestoreSequence' | 'InitKeyPassAndSequence';

class ConfigActions {

    protected _PWD: string;
    protected _CryptPassConfig!: ConfigCryptPass;
    protected readonly _initializedKey: string = 'Initialized';
    protected readonly defaultPasswordExpirationDays: number = 30;

    constructor (password: string, InitializationDone: boolean = false) {
        this._PWD = password;
        if (InitializationDone) {
            this.InitCryptPassConfig();
        }
    }

    public getSequence (): number[] {
        return this._CryptPassConfig.getSequence();
    }

    public refreshSequence (): Promise<boolean> {
        return this._CryptPassConfig.refreshSequence(this._PWD);
    }

    public async setSequenceAndKeyPassUri (seq?: number[], keypassuri?: string): Promise<boolean> {
        let seqOk = true;
        let keyOk = true;
        if (seq !== undefined) {
            let Seq: Sequence = { Sequence: seq };
            seqOk = await Config.writeSequence(Seq);
        }
        if (keypassuri !== undefined)
            keyOk = await Config.setKeyPassUri(keypassuri);
        return seqOk && keyOk;
    }

    public async changePwd (oldPwd: string, newPwd: string): Promise<boolean> {
        const changed = await this._CryptPassConfig.chPwd(oldPwd, newPwd);
        if (changed) {
            this._PWD = newPwd;
            State.logout();
            LocalStorage.PasswordExpirationTimeSet();
            return true;
        } else return false;
    }

    public async needToChangePassword (): Promise<boolean> {
        return ((await Config.getPreferences()).ChPwdReminder &&
        (
            LocalStorage.PasswordExpirationTime() > 0 ? Date.now() >= LocalStorage.PasswordExpirationTime()
            : (Date.now() - this._CryptPassConfig.getLastChange().getTime()) > this.defaultPasswordExpirationDays * 86400000)
        );
    }

    public checkPwd (): boolean {
        return this._CryptPassConfig.checkPwd(this._PWD);
    }

    public async setup (action: configaction, sequence?: number[]): Promise<boolean> {
        switch (action) {
            case 'NEW':
                Config.lastSetupFailureCode = false;
                const newKP = await Config.newKeyPass();
                if (!newKP) {
                    if (!Config.lastSetupFailureCode) Config.lastSetupFailureCode = 'vault-create';
                    return false;
                }
                try {
                    await this.InitCryptPassConfig(true);
                    const initialized = await this._CryptPassConfig.initSeqAndKey(this._PWD);
                    if (!initialized && !Config.lastSetupFailureCode) Config.lastSetupFailureCode = 'crypto-init';
                    return initialized;
                } catch (error) {
                    if (!Config.lastSetupFailureCode) Config.lastSetupFailureCode = 'crypto-init';
                    throw error;
                }
            case 'InitKeyPassAndSequence':
                await this.InitCryptPassConfig();
                return this._CryptPassConfig.initSeqAndKey(this._PWD);
            case 'RestoreKeyPassFile':
                const restoredKP = await Config.readKeyPass() !== false;
                if (restoredKP) {
                    await this.InitCryptPassConfig();
                    return true;
                } else return false;
            case 'RestoreSequence':
                const restoredSEQ = sequence !== undefined && await this._CryptPassConfig.restoreSeq(sequence);
                if (restoredSEQ) {
                    await this.InitCryptPassConfig();
                    return true;
                } else return false;
        }
    }

    public getSetupFailureMessage(): string {
        const messages: Record<string, string> = {
            'vault-create': 'ui.configurationFailureFile',
            'vault-reference': 'ui.configurationFailureReference',
            'secure-config': 'ui.configurationFailureSecureConfig',
            'sequence-save': 'ui.configurationFailureSequence',
            'vault-write': 'ui.configurationFailureVaultWrite',
            'crypto-init': 'ui.configurationFailureCrypto'
        };
        const messageKey = Config.lastSetupFailureCode ? messages[Config.lastSetupFailureCode] : undefined;
        return Localization.text(messageKey || 'ui.configurationFailureUnknown');
    }

    public async getStatus (): Promise<ConfigStatus> {
        if (!await Config.ConfigInit()) return 'FatalError';
        const status = await Config.getStatus();
        if (status == 'OK')
            await this.InitCryptPassConfig();
        return status;
    }

    protected async InitCryptPassConfig(initializingNewWallet: boolean = false) {
        const data = await Config.readData();
        // A new wallet starts with an empty stored sequence. Let initSeqAndKey
        // generate and persist a valid sequence before the model imports one.
        this._CryptPassConfig = new LibCryptPass.ConfigCryptPass(
            StandardRnW,
            data.kp,
            initializingNewWallet ? undefined : data.se
        );
    }
}