class DescrView extends View implements ViewModel {
    onBackButton!: TBackButton;

    protected readonly IdGoToInit: string = 'goToInit';
    
    protected readonly IdDescription: string = 'description';
    protected readonly IdSetDescription: string = 'setDescription';
    protected readonly IdRemoveDescription: string = 'removeDescription';
    protected readonly IdDescriptionForm: string = 'descriptionForm';

    async Init() {

        const passDescr = State.CryptPass.getPassDescription().trim();
        this.setApp(`<h2>${Localization.text(passDescr===''?'description.add':'description.edit')}</h2>
        <form id="${this.IdDescriptionForm}">
        <p>${ViewHelpers.textinput(this.IdDescription,passDescr,Localization.text('description.placeholder'),this.ClassFormCtrl)}</p>
        <p class="alert alert-warning">${Localization.text('description.warningPrefix')} <strong>${Localization.text('description.warningNotEncrypted')}</strong>.
        ${Localization.text('description.warningSuffix')}</p>
        <p>${ViewHelpers.button(this.IdGoToInit,'Go back',this.ClassFormBtnSec)}
        ${ViewHelpers.submit(this.IdSetDescription,Localization.text('description.confirm'),this.ClassFormBtn)}
        ${passDescr === '' ? '' : ViewHelpers.button(this.IdRemoveDescription,Localization.text('description.remove'),this.ClassFormBtn)}</p>
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
                alert(Localization.text('description.error'));
                this.focusEl(this.IdDescription);
            }
        } else {
            alert(Localization.text('description.empty'));
            this.focusEl(this.IdDescription);
        }
        
    }

    public Handlers: EventHandlerModel[] = [
        {name: 'DescrViewClick', handler: (e) => this.onClick(e), type: 'click'},
        {name: 'DescrViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}
    ];   

    
}
