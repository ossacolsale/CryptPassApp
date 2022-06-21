class OtherView extends View implements ViewModel {
    onBackButton!: TBackButton;

    protected readonly IdGoToInit: string = 'goToInit';
    protected readonly IdGoToMainMenu: string = 'goToMainMenu';


    protected readonly IdRestore: string = 'Restore';
    protected readonly IdChangePwd: string = 'ChangePwd';
    protected readonly IdViewSequence: string = 'ViewSequence';
    protected readonly IdInstructions: string = 'Instructions';

    protected readonly IdRefreshSequence: string = 'RefreshSequence';
    protected readonly IdConfirmSequenceRefresh: string = 'ConfirmSequenceRefresh';

    protected readonly IdPassword1: string = 'password1';
    protected readonly IdPassword2: string = 'password2';
    protected readonly IdChPwdForm: string = 'ChPwdForm';
    protected readonly IdPasswordOld: string = 'PasswordOld';
    protected readonly IdHandleChPwd: string = 'HandleChPwd';



    protected _ca!: ConfigActions;

    async Init() {
        

        this._ca = new ConfigActions(__Password_, true);
        

        this.setApp(`
        <h2>Other options</h2>
        <div class="d-grid gap-2 col-8 mx-auto">
        ${ViewHelpers.button(this.IdViewSequence,'View sequence',this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdChangePwd,'Change password',this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdRestore,'Restore/reset wallet',this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdInstructions,'Read instructions',this.ClassMenuBtn)}
        ${ViewHelpers.button(this.IdGoToMainMenu,'Go back',this.ClassFormBtnSec)}
        </div>
        `,() => this.clickEl(this.IdGoToMainMenu));
    }

    protected async onClick(e: Event) {
        switch ((e.target as HTMLInputElement).id) {
            case this.IdGoToInit:
                this.Init();
                break;
            case this.IdGoToMainMenu:
                ScenarioController.changeScenario(new MainView());
                break;
            case this.IdRestore:     
                const seq = this._ca.getSequence().join(', ');              
                ScenarioController.changeScenario(new RestoreView(), { 
                    back: () => ScenarioController.changeScenario(new OtherView()),
                    desc: `<div class="alert alert-warning"><p>Here you can restore or create a new &quot;Sequence/KeyPassFile&quot; couple.</p>
                    <p>In each case, while your current KeyPassFile won't be erased, the original sequence could be instead.
                    So remember to store your current sequence (e.g. with a screenshot) 
                    in a safe place place before creating or restoring a wallet.</p>
                    <p>Current sequence: <span class="fw-bold">${seq}</span></p></div>`,
                    status: 'OK' } as RestoreOptions);
                break;
            case this.IdViewSequence:
                this.ViewSequence();
                break;
            case this.IdRefreshSequence:
                this.RefreshSequence();
                break;
            case this.IdConfirmSequenceRefresh:
                await this.handleSequenceRefresh();
                break;
            case this.IdInstructions:
                this.showInstructions();
                break;
            case this.IdChangePwd:
                await this.changePassword();
                break;

        }
    }

    protected async onSubmit(e: Event) {
        switch ((e.target as HTMLFormElement).id) {
            case this.IdChPwdForm:
                this.handleChPwd(this.IdPasswordOld, this.IdPassword1, this.IdPassword2, () => ScenarioController.changeScenario(new MainView()), async (Old: string, New: string) => await this._ca.changePwd(Old, New));
            break;

        }
    }

    protected async changePassword() {
        this.setApp(`<h2>Change password</h2>
        <form id="${this.IdChPwdForm}">
        <p>${ViewHelpers.password(this.IdPasswordOld,'Type old password',this.ClassFormCtrl)}</p>        
        <p>Remember to choose a strong (very strong) password:</p>
        <p>${ViewHelpers.password(this.IdPassword1,'Type new password',this.ClassFormCtrl)}</p>
        <p>${ViewHelpers.password(this.IdPassword2,'Repeat new password',this.ClassFormCtrl)}</p>
        <p>${ViewHelpers.submit(this.IdHandleChPwd,'Change password',this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)}</p>
        </form>
        `,() => this.clickEl(this.IdGoToInit));
    }

    protected showInstructions() {
        this.setApp(`
        <h2>Instructions</h2>
        ${ViewHelpers.Instructions}
        <p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)}</p>
        `,() => this.clickEl(this.IdGoToInit));
    }

    protected RefreshSequence () {
        this.setApp(`
        <h2>Refresh sequence</h2>
        <div class="alert alert-danger">If you confirm, the current sequence will be replaced with another one, always randomic.
        Remember to store the new sequence in a safe place (e.g. with a screenshot). <span class="fw-bold">Are you sure to proceed?</span></div>
        <p>${ViewHelpers.button(this.IdConfirmSequenceRefresh,'Confirm sequence refresh',this.ClassFormBtn)}
        ${ViewHelpers.button(this.IdViewSequence,'Go back',this.ClassFormBtnSec)}</p>
        `,() => this.clickEl(this.IdViewSequence));
    }

    protected async handleSequenceRefresh() {
        await this.LoaderShowAsync(
            async (): Promise<boolean> => {   
                return await this._ca.refreshSequence();
            }, (res) => { 
                if (res) {
                    this.ViewSequence('<p class="alert alert-success">Here it is the new sequence:</p>');
                } else alert('Error refreshing sequence!');
             }
        );
    }

    protected ViewSequence(msg?: string) {
        this.setApp(`<h2>View sequence</h2>
        ${msg !== undefined ? msg : ''}
        <p class="h3 my-4">${this._ca.getSequence().join(', ')}</p>
        <p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)} 
        ${ViewHelpers.button(this.IdRefreshSequence,'Refresh sequence',this.ClassFormBtn)}</p>
        `,() => this.clickEl(this.IdGoToInit));
    }

    public Handlers: EventHandlerModel[] = [
        {name: 'OtherViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'OtherViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

}
