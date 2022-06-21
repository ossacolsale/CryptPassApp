class WelcomeView extends View implements ViewModel {
    onBackButton!: TBackButton;
    protected readonly firstTimeKey: string = 'firstTime';
    
    protected readonly IdGoToMain: string = 'goToMain';
    protected readonly IdDontShowAnymore: string = 'dontShowAnymore';
    
    public readonly Handlers: EventHandlerModel[] = [
        {name: 'WelcomeViewClick', handler: (e) => this.onClick(e), type: 'click'}
    ];

    protected async onClick(e: Event) {
        switch ((e.target as HTMLInputElement).id) {
            case this.IdGoToMain:
                if ((this.getEl(this.IdDontShowAnymore) as HTMLInputElement).checked)
                    LocalStorage.FirstTimeSet();
                this.goToMain();
            break;
        }
    }

    public async Init() {
        this.LoaderHide();
        if (LocalStorage.FirstTime()) {
            this.firstTime();
        } else {
            this.goToMain();
        }
    }

    protected goToMain() {
        ScenarioController.changeScenario(new MainView());
    }

    public firstTime() {
        
        this.setApp(`
        <p>Welcome to CryptPassApp</p>
        ${ViewHelpers.Instructions}
        <p><input type="checkbox" id="${this.IdDontShowAnymore}" /> <label for="${this.IdDontShowAnymore}">Don't show this message anymore</label></p>
        <p>${ViewHelpers.button(this.IdGoToMain,'LET\'S START',this.ClassFormBtn)}</p>
        `);
    }
}

