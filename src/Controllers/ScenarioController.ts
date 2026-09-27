interface LockedControlState {
    id: string;
    value?: string;
    checked?: boolean;
    type?: string;
    selectedIndex?: number;
    selectionStart?: number | null;
    selectionEnd?: number | null;
}

interface LockedScenarioSnapshot {
    scenario: ViewModel;
    markup: string;
    controls: LockedControlState[];
    buttonLabels: Array<{ id: string; text: string }> ;
    scrollX: number;
    scrollY: number;
    focusedId?: string;
}

class ScenarioController {
    protected static _currentScenario: ViewModel;
    private static lockedSnapshot?: LockedScenarioSnapshot;

    public static changeScenario(scenario: View, initOptions?: any) {
        this.appInit();
        this.closeScenario();
        this._currentScenario = scenario;
        this.attachHandlers(this._currentScenario);
        this._currentScenario.Init(initOptions);
    }

    public static suspendCurrentScenarioForLock(): void {
        const app = document.getElementById('app');
        if (!app || !this._currentScenario) return;
        const active = document.activeElement as HTMLElement | null;
        const controls: LockedControlState[] = Array.from(app.querySelectorAll('input[id], textarea[id], select[id]')).map(control => {
            const item = control as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const state: LockedControlState = { id: item.id };
            if (item instanceof HTMLInputElement) {
                state.value = item.value;
                state.checked = item.checked;
                state.type = item.type;
                if (item.type === 'text' || item.type === 'search' || item.type === 'password') {
                    try { state.selectionStart = item.selectionStart; state.selectionEnd = item.selectionEnd; } catch (_) { /* Unsupported input type. */ }
                }
            } else if (item instanceof HTMLTextAreaElement) {
                state.value = item.value;
                try { state.selectionStart = item.selectionStart; state.selectionEnd = item.selectionEnd; } catch (_) { /* Selection is optional. */ }
            } else {
                state.value = item.value;
                state.selectedIndex = item.selectedIndex;
            }
            return state;
        });
        this.lockedSnapshot = {
            scenario: this._currentScenario,
            markup: app.innerHTML,
            controls: controls,
            buttonLabels: Array.from(app.querySelectorAll('button[id]')).map(button => ({ id: button.id, text: button.textContent || '' })),
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            focusedId: active && app.contains(active) ? active.id : undefined
        };
    }

    public static restoreLockedScenario(): boolean {
        const snapshot = this.lockedSnapshot;
        const app = document.getElementById('app');
        if (!snapshot || !app) return false;

        this.closeScenario();
        this._currentScenario = snapshot.scenario;
        this._currentScenario.Handlers = this._currentScenario.Handlers.filter(handler => handler.name !== 'ViewBack');
        this.attachHandlers(this._currentScenario);
        app.innerHTML = snapshot.markup;
        app.style.display = 'block';
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        snapshot.controls.forEach(state => {
            const control = document.getElementById(state.id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
            if (!control) return;
            if (state.value !== undefined) control.value = state.value;
            if (control instanceof HTMLInputElement && state.checked !== undefined) control.checked = state.checked;
            if (control instanceof HTMLInputElement && state.type !== undefined) control.type = state.type;
            if (control instanceof HTMLSelectElement && state.selectedIndex !== undefined) control.selectedIndex = state.selectedIndex;
            if ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) && state.selectionStart !== undefined && state.selectionStart !== null) {
                try { control.setSelectionRange(state.selectionStart, state.selectionEnd == null ? state.selectionStart : state.selectionEnd); } catch (_) { /* Selection is optional. */ }
            }
        });
        snapshot.buttonLabels.forEach(state => {
            const button = document.getElementById(state.id);
            if (button) button.textContent = state.text;
        });
        this.lockedSnapshot = undefined;
        window.requestAnimationFrame(() => {
            window.scrollTo(snapshot.scrollX, snapshot.scrollY);
            if (snapshot.focusedId) document.getElementById(snapshot.focusedId)?.focus({ preventScroll: true });
        });
        const resumable = this._currentScenario as ViewModel & { ResumeAfterLock?: () => void };
        resumable.ResumeAfterLock?.();
        return true;
    }

    protected static appInit() {
        if (this._currentScenario === undefined) EventsController.Initialize();
    }

    protected static closeScenario() {
        if (this._currentScenario !== undefined) {
            this.delHandlers();
            if (this._currentScenario.End !== undefined) this._currentScenario.End();
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

    private static attachHandlers(scenario: ViewModel): void {
        scenario.Handlers = scenario.Handlers.filter(handler => handler.name !== 'ViewBack');
        scenario.Handlers.push({ name: 'ViewBack', handler: async (e: Event) => { e.preventDefault(); await scenario.onBackButton(); }, type: 'backbutton' });
        this.addHandlers();
    }
}
