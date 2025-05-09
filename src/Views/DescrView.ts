class DescrView extends View implements ViewModel {
    onBackButton!: TBackButton;

    protected readonly IdGoToInit: string = 'goToInit';
    
    protected readonly IdDescription: string = 'description';
    protected readonly IdSetDescription: string = 'setDescription';
    protected readonly IdRemoveDescription: string = 'removeDescription';
    protected readonly IdDescriptionForm: string = 'descriptionForm';

    async Init() {

        const passDescr = State.CryptPass.getPassDescription().trim();
        this.setApp(`<h2>${passDescr===''?'Add description':'Edit description'}</h2>
        <form id="${this.IdDescriptionForm}">
        <p>${ViewHelpers.textinput(this.IdDescription,passDescr,'Put the description here',this.ClassFormCtrl)}</p>
        <p class="alert alert-warning">Warning! This description <strong>won't be encrypted</strong>.
        So take care not to put any significant or important information in it but keep it as generic as possible.</p>
        <p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)}
        ${ViewHelpers.submit(this.IdSetDescription,'Confirm new description',this.ClassFormBtn)}
        ${passDescr === '' ? '' : ViewHelpers.button(this.IdRemoveDescription,'Remove description',this.ClassFormBtn)}</p>
        </form>
        `,() => this.clickEl(this.IdGoToInit));
    }

    protected async onSubmit(e: Event) {
        switch ((e.target as HTMLFormElement).id) {
            case this.IdDescriptionForm:
                this.handleSet();
            break;
        }
    }
    

    protected async onClick(e: Event) {
        switch ((e.target as HTMLInputElement).id) {
            case this.IdGoToInit:
                ScenarioController.changeScenario(new OtherView());
            break;
            case this.IdRemoveDescription:
                this.handleSet(true);
            break;
        }
    }

    protected async handleSet(remove: boolean = false) {
        const descr = (this.getEl(this.IdDescription) as HTMLInputElement).value.trim();
        if (descr.length > 0 || remove) {
            this.LoaderShow();
            const res = await State.CryptPass.setPassDescription(remove ? '' : descr);
            this.LoaderHide();
            if (res) {
                ScenarioController.changeScenario(new OtherView());
            } else {
                alert('Sorry. We encountered an error setting up the description');
                this.focusEl(this.IdDescription);
            }
        } else {
            alert('Error. Empty description.');
            this.focusEl(this.IdDescription);
        }
        
    }

    public Handlers: EventHandlerModel[] = [
        {name: 'DescrViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'DescrViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

    
}

