class WalletProfilesView extends View implements ViewModel {
    onBackButton!: TBackButton;
    protected readonly IdWalletManager = 'WalletManager';
    protected readonly IdWalletName = 'WalletName';
    protected readonly IdAddWallet = 'AddWallet';
    protected readonly IdAddExisting = 'AddExistingWallet';
    protected readonly IdNewPassword = 'NewWalletPassword';
    protected readonly IdRepeatPassword = 'RepeatWalletPassword';

    public Handlers: EventHandlerModel[] = [
        { name: 'WalletProfilesClick', handler: event => { void this.onClick(event); }, type: 'click' }
    ];

    async Init(): Promise<void> {
        const profiles = await WalletProfiles.list();
        const rows = profiles.map(profile => `<div class="border rounded p-2 my-2">
            <strong translate="no">${ViewHelpers.escapeHtmlText(profile.name === 'My wallet' ? Localization.text('wallet.defaultName') : profile.name)}</strong>${profile.active ? ` (${Localization.text('wallet.active')})` : ''}<br>
            ${profile.active ? '' : ViewHelpers.button('wallet_switch_' + profile.id, 'Open', this.ClassFormBtn, { 'data-wallet': profile.id })}
            ${ViewHelpers.button('wallet_rename_' + profile.id, 'Rename', this.ClassFormBtnSec, { 'data-wallet': profile.id })}
            ${profile.active || profiles.length < 2 ? '' : ViewHelpers.button('wallet_remove_' + profile.id, 'Remove from app', this.ClassFormBtnSec, { 'data-wallet': profile.id })}
        </div>`).join('');
        this.setApp(`<h2>Wallets</h2>
            <p>Each wallet keeps its own file and recovery sequence. Removing a wallet only removes its local profile; it does not delete the vault file.</p>
            ${rows}
            <form id="${this.IdWalletManager}">
                <label for="${this.IdWalletName}">New wallet name</label>
                <input class="form-control" id="${this.IdWalletName}" maxlength="80" required>
                <label for="${this.IdNewPassword}">${Localization.text('wallet.password')}</label>
                ${ViewHelpers.password(this.IdNewPassword, 'Type password', this.ClassFormCtrl)}
                <label for="${this.IdRepeatPassword}">${Localization.text('wallet.passwordRepeat')}</label>
                ${ViewHelpers.password(this.IdRepeatPassword, 'Repeat password', this.ClassFormCtrl)}
                <p class="mt-2">${ViewHelpers.submit(this.IdAddWallet, 'Create wallet', this.ClassFormBtn)}
                ${ViewHelpers.submit(this.IdAddExisting, Localization.text('wallet.addExisting'), this.ClassFormBtnSec)}
                ${ViewHelpers.button('WalletBack', 'Go back', this.ClassFormBtnSec)}</p>
            </form>`, () => this.clickEl('WalletBack'));
    }

    protected async onClick(event: Event): Promise<void> {
        const target = event.target as HTMLElement;
        const id = target.id;
        if (id === 'WalletBack') {
            ScenarioController.changeScenario(new OtherView());
            return;
        }
        const walletId = target.getAttribute('data-wallet');
        if (!walletId) return;
        if (id.indexOf('wallet_switch_') === 0) {
            State.logout();
            if (await WalletProfiles.switchTo(walletId)) {
                ScenarioController.changeScenario(new MainView());
            } else alert(Localization.text('wallet.openError'));
        } else if (id.indexOf('wallet_rename_') === 0) {
            const profiles = await WalletProfiles.list();
            const profile = profiles.find(item => item.id === walletId);
            const name = profile && window.prompt(Localization.text('wallet.renamePrompt'), profile.name);
            if (name && await WalletProfiles.rename(walletId, name)) this.Init();
        } else if (id.indexOf('wallet_remove_') === 0) {
            if (window.confirm(Localization.text('wallet.removeConfirm'))) {
                if (await WalletProfiles.remove(walletId)) this.Init();
                else alert(Localization.text('wallet.removeError'));
            }
        }
    }

    protected async onSubmit(event: Event): Promise<void> {
        if ((event.target as HTMLFormElement).id !== this.IdWalletManager) return;
        event.preventDefault();
        const name = (this.getEl(this.IdWalletName) as HTMLInputElement).value.trim();
        const submitterId = (event as SubmitEvent).submitter?.id;
        const isExistingVault = submitterId === this.IdAddExisting;
        const password = (this.getEl(this.IdNewPassword) as HTMLInputElement).value;
        const repeatedPassword = (this.getEl(this.IdRepeatPassword) as HTMLInputElement).value;
        if (!isExistingVault && !CommonHelpers.CheckNewPassword(password, repeatedPassword)) return;
        if (!name || name.length > 80) {
            alert(Localization.text('wallet.createError'));
            return;
        }
        const previous = (await WalletProfiles.list()).find(profile => profile.active);
        State.logout();
        const id = await WalletProfiles.add(name);
        if (id === false) {
            alert(Localization.text('wallet.createError'));
            return;
        }
        if (isExistingVault) {
            const rollback = async () => {
                if (previous) await WalletProfiles.switchTo(previous.id);
                await WalletProfiles.remove(id);
                State.logout();
                ScenarioController.changeScenario(new MainView());
            };
            ScenarioController.changeScenario(new RestoreView(), { status: 'KO', back: rollback, desc: `<p>${Localization.text('wallet.existingInstructions')}</p>` } as RestoreOptions);
            return;
        }
        const created = await new ConfigActions(password).setup('NEW');
        if (!created && previous) {
            await WalletProfiles.switchTo(previous.id);
            await WalletProfiles.remove(id);
        }
        if (created) ScenarioController.changeScenario(new WalletCreatedView());
        else ScenarioController.changeScenario(new MainView());
    }

    public constructor() {
        super();
        this.Handlers.push({ name: 'WalletProfilesSubmit', handler: event => { void this.onSubmit(event); }, type: 'submit' });
    }
}


class WalletCreatedView extends View implements ViewModel {
    onBackButton!: TBackButton;
    public Handlers: EventHandlerModel[] = [
        { name: 'WalletCreatedClick', handler: event => { if ((event.target as HTMLElement).id === 'ContinueToWallet') ScenarioController.changeScenario(new MainView()); }, type: 'click' }
    ];

    public async Init(): Promise<void> {
        const data = await Config.readData();
        const sequence = (data.se as Sequence).Sequence.join(', ');
        this.setApp(`<h2>${Localization.text('wallet.created')}</h2>
            <p class="alert alert-danger">${Localization.text('wallet.sequenceWarning')}</p>
            <p class="h3" id="CreatedWalletSequence"></p>
            <p>${ViewHelpers.button('ContinueToWallet', Localization.text('wallet.continue'), this.ClassFormBtn)}</p>`, () => ScenarioController.changeScenario(new MainView()));
        this.setText('CreatedWalletSequence', sequence);
    }
}
