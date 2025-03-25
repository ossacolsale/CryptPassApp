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

        const status = await this._ca.getStatus();

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
                            <p class="alert alert-danger">Caution! Last time you created or changed your password was more than ${LocalStorage.PasswordExpirationDays()} days ago. 
                            It's strictly recommended to change your password montly.</p>
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
                                out += `<p class="text-center font-italic">${passDescr}</p>`;
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
                        this.setApp(`<form id="${this.IdUnlockForm}">
                        <p>${ViewHelpers.password(this.IdPassword1,'Type password',this.ClassFormCtrl)}</p>
                        <p>${ViewHelpers.submit(this.IdHandlePwd,'Unlock',this.ClassFormBtn)}
                        ${ViewHelpers.button(this.IdRestoreOptions,'Restore options',this.ClassFormBtnSec)}</p>
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
                    alert('Wrong password');
                    return false;
                } else {
                    const pwdCorrect = await this._aa.Unlock(pwd);
                    if (pwdCorrect) {
                        this.Init();
                        return true;
                    } else {
                        alert('Wrong password!');
                        return false;
                    }
                }
            }, (res) => { if (!res) this.focusEl(this.IdPassword1,true); }
        );
    }

    protected handleDontChPwd() {
        LocalStorage.PasswordExpirationDaysSet();
        this.Init();
    }


    public Handlers: EventHandlerModel[] = [
        {name: 'MainViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'MainViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

    
}


