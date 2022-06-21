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
            __Password_ = '';
            LocalStorage.PasswordExpirationDaysSet(true);
            return true;
        } else return false;
    }

    public needToChangePassword (): boolean {
        return (new Date()).getTime() - this._CryptPassConfig.getLastChange().getTime() > LocalStorage.PasswordExpirationDays() * 86400000;
    }

    public checkPwd (): boolean {
        return this._CryptPassConfig.checkPwd(this._PWD);
    }

    public async setup (action: configaction, sequence?: number[]): Promise<boolean> {
        switch (action) {
            case 'NEW':
                const newKP = await Config.newKeyPass();
                if (newKP) {
                    await this.InitCryptPassConfig();
                    return this._CryptPassConfig.initSeqAndKey(this._PWD);
                } else return false;
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

    public async getStatus (): Promise<ConfigStatus> {
        if (!LocalStorage.InitializedKey()) {
            const init = await Config.ConfigInit();
            if (init) {
                LocalStorage.InitializedKeySet();
                return 'KO';
            } 
            return 'FatalError';
        }
        const status = await Config.getStatus();
        if (status == 'OK')
            await this.InitCryptPassConfig();
        return status;
    }

    protected async InitCryptPassConfig() {
        const data = await Config.readData();
        this._CryptPassConfig = new LibCryptPass.ConfigCryptPass(StandardRnW, data.kp, data.se);
    }
}