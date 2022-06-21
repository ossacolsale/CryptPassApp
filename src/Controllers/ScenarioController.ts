class ScenarioController {
    
    protected static _currentScenario: ViewModel;

    public static changeScenario(scenario: View, initOptions?: any) {
        this.appInit();
        this.closeScenario();
        this._currentScenario = scenario;
        this._currentScenario.Handlers.push({name: 'ViewBack', handler: async (e: Event) => {e.preventDefault(); await this._currentScenario.onBackButton(); }, type: 'backbutton'});
        this.addHandlers();

        this._currentScenario.Init(initOptions);
    }

    protected static appInit() {
        if (this._currentScenario === undefined) {
            //EventsController.addEventHandler('deviceready','deviceready',() => Main.onDeviceReady());
            EventsController.Initialize();
        }
    }

    protected static closeScenario() {
        if (this._currentScenario !== undefined) {
            this.delHandlers();
            if (this._currentScenario.End !== undefined) {
                this._currentScenario.End();
            }
        }        
    }

    protected static delHandlers() {
        this._currentScenario.Handlers.forEach((_handler) => {
            EventsController.delEventHandler(_handler.name, _handler.type);
        });
    }

    protected static addHandlers() {
        this._currentScenario.Handlers.forEach((_handler) => {
            EventsController.addEventHandler(_handler.name, _handler.type, _handler.handler);
        });
    }
}

