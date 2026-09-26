type KOsteps = 'KOStart' | 'Initialize' | 'ProceedInitialization' | 'RestoreAll' | 'Start';

class MainView extends View {
    public onBackButton!: TBackButton;
    
    protected _ca!: ConfigActions;
    protected _aa!: AppActions;

    protected readonly IdPassword1: string = 'password1';
    protected readonly IdPassword2: string = 'password2';
    protected readonly IdHandlePwd: string = 'pwd';
    protected readonly IdUnlockForm: string = 'UnlockForm';
    protected readonly IdRestoreOptions: string = 'RestoreOptions';
    protected readonly IdDeviceUnlock: string = 'DeviceUnlock';
    
    protected readonly IdChangeDescr: string = 'ChangeDescr';
    protected readonly IdManagePwd: string = 'ManagePwd';
    protected readonly IdOther: string = 'Other';

    protected readonly IdChPwdForm: string = 'ChPwdForm';
    protected readonly IdPasswordOld: string = 'PasswordOld';
    protected readonly IdHandleChPwd: string = 'HandleChPwd';
    protected readonly IdDontChPwd: string = 'DontChPwd';

    async Init() {
        
        this._ca = new ConfigActions(State.Password);
        this._aa = new AppActions();

        let status: ConfigStatus = 'FatalError';
        try {
            status = await this._ca.getStatus();
        } catch(e) {
            CommonHelpers.StandardError(e);
        }

        switch(status) {
            case 'KO':
                ScenarioController.changeScenario(new RestoreView(), {
                     desc: `<p>It seems that we have no data storage initialized.</p>
                     <p>Please select one option:</p>`, status: status
                    } as RestoreOptions);
            break;
            case 'OK':
                try {
                    if (State.Password !== '') {
                        if (await this._ca.needToChangePassword()) {
                            this.setApp(`<form id="${this.IdChPwdForm}">
                            <p class="alert alert-danger">Caution! Last time you created or changed or received a reminder to change your password was more than 30 days ago. 
                            It's useful to change your password montly.</p>
                            <p>${ViewHelpers.password(this.IdPasswordOld,'Type old password',this.ClassFormCtrl)}</p>        
                            <p>Remember to choose a strong (very strong) password:</p>
                            <p>${ViewHelpers.password(this.IdPassword1,'Type new password',this.ClassFormCtrl)}</p>
                            <p>${ViewHelpers.password(this.IdPassword2,'Repeat new password',this.ClassFormCtrl)}</p>
                            <p>${ViewHelpers.submit(this.IdHandleChPwd,'Change password',this.ClassFormBtn)}
                            ${ViewHelpers.button(this.IdDontChPwd,'Remind me in a month',this.ClassFormBtnSec)}</p>
                            </form>
                            `);
                        } else {
                            //MainView only for restore purpose; now go directly to PassView
                            ScenarioController.changeScenario(new PassView());
                            /*let out = '';
                            const passDescr = State.CryptPass.getPassDescription().trim();
                            if (passDescr == '')
                                out += `<p class="alert alert-warning">Your password wallet has no description</p>`;
                            else
                                out += `<p class="text-center font-italic">${ViewHelpers.escapeHtmlText(passDescr)}</p>`;
                            out += `
                            <div class="d-grid gap-2 col-8 mx-auto">
                            ${ViewHelpers.button(this.IdChangeDescr,passDescr==''?'Add a description':'Change description',this.ClassMenuBtn)}
                            ${ViewHelpers.button(this.IdManagePwd,'Manage wallet',this.ClassMenuBtn)}
                            ${ViewHelpers.button(this.IdOther,'Other options',this.ClassMenuBtn)}
                            </div>
                            `;
    
                            this.setApp(out);*/
                        }
                    } else {
                        const walletName = await WalletProfiles.activeName();
                        const deviceUnlockRequired = AutoLock.hasDeviceUnlock();
                        this.setApp(`<form id="${this.IdUnlockForm}">
                        <p>${Localization.text('main.walletToUnlock')}: <strong translate="no">${ViewHelpers.escapeHtmlText(walletName === 'My wallet' ? Localization.text('wallet.defaultName') : walletName)}</strong></p>
                        ${deviceUnlockRequired ? `<p>${ViewHelpers.button(this.IdDeviceUnlock, Localization.text('main.deviceUnlock'), this.ClassFormBtn)}</p>` : `
                        <p>${ViewHelpers.password(this.IdPassword1,'Type password',this.ClassFormCtrl)}</p>
                        <p>${ViewHelpers.submit(this.IdHandlePwd,'Unlock',this.ClassFormBtn)}
                        ${ViewHelpers.button(this.IdRestoreOptions,'Restore options',this.ClassFormBtnSec)}</p>`}
                        </form>
                        `);
                        if (!deviceUnlockRequired) this.focusPassword(true);
                    }
                    
                }
                catch (e) {
                    console.error('Could not initialize the encrypted wallet', e);
                    alert(Localization.text('main.accessError'));
                }
                
            break;
            case 'MissingKeypass':
                ScenarioController.changeScenario(new RestoreView(), {
                    errorMsg: 'Error. Keypass file is missing! How do you want to proceed?', status: status
                } as RestoreOptions);
            break;
            case 'EmptySequence':
                ScenarioController.changeScenario(new RestoreView(), {
                    errorMsg: 'Error. Numbers sequence is empty. How do you want to proceed?', status: status
                } as RestoreOptions);
            break;
            case 'EmptyKeypass':
                ScenarioController.changeScenario(new RestoreView(), {
                    errorMsg: 'Error. Keypass file is empty! How do you want to proceed?', status: status
                } as RestoreOptions);
            break;
            case 'FatalError':
                ScenarioController.changeScenario(new RestoreView(), {
                    errorMsg: 'Fatal/unknown error. Try to restore data.', status: status
                } as RestoreOptions);
            break;
        }
    }

    protected async onSubmit(e: Event) {
        switch ((e.target as HTMLFormElement).id) {
            case this.IdUnlockForm:
                this.handlePwd();
            break;
            case this.IdChPwdForm:
                this.handleChPwd(this.IdPasswordOld, this.IdPassword1, this.IdPassword2, () => this.Init(), async (Old: string, New: string) => await this._ca.changePwd(Old, New));
            break;
        }
    }

    protected async onClick(e: Event) {
        switch ((e.target as HTMLInputElement).id) {
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
                } as RestoreOptions);
            break;
            case this.IdDeviceUnlock:
                if (!await AutoLock.unlockWithDevice()) this.Init();
            break;
            case this.IdOther:
                ScenarioController.changeScenario(new OtherView());
            break;
        }
    }

    protected async handlePwd() {
        await this.LoaderShowAsync(
            async (): Promise<boolean> => {   
                const pwd = (this.getEl(this.IdPassword1) as HTMLInputElement).value;
                if (pwd.length < 10) {
                    alert(Localization.text('main.wrongPassword'));
                    return false;
                }
                let pwdCorrect: boolean;
                try {
                    pwdCorrect = await this._aa.Unlock(pwd);
                } catch (error) {
                    console.error('Wallet unlock failed', error);
                    const diagnostic = error instanceof Error ? error.message.split('|') : [];
                    const isLegacy = diagnostic.length > 1 && diagnostic[0] === 'UNLOCK_DIAG' && diagnostic[1] === 'legacy';
                    const message = isLegacy ? 'main.unlockLegacyError' : 'main.unlockError';
                    const details = diagnostic.length === 5 && diagnostic[0] === 'UNLOCK_DIAG'
                        ? `\n\nDiagnostica: vault=${diagnostic[1]}, voci=${diagnostic[2]}, cifrato=${diagnostic[3]} caratteri, errore=${diagnostic[4]}.`
                        : '';
                    alert(Localization.text(message) + details);
                    return false;
                }
                if (pwdCorrect) {
                    await this.Init();
                    return true;
                }
                alert(Localization.text('main.wrongPassword'));
                return false;
            }, (res) => { if (!res) this.focusPassword(true); }
        );
    }

    private focusPassword(select: boolean): void {
        this.focusEl(this.IdPassword1, select);
        DeviceAuth.showKeyboard();
    }

    protected handleDontChPwd() {
        LocalStorage.PasswordExpirationTimeSet();
        this.Init();
    }


    public Handlers: EventHandlerModel[] = [
        {name: 'MainViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'MainViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

    
}
