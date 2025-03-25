//type KOsteps = 'KOStart' | 'Initialize' | 'ProceedInitialization' | 'RestoreAll' | 'Start';
type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never;

type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A;
  1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A["length"] ? 0 : 1];

type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[]
  ? E
  : never;

type SeqIds = `sequence_${Enumerate<26>}`;

interface RestoreOptions {
    errorMsg?: string,
    desc?: string,
    status: ConfigStatus,
    back?: () => any
}

class RestoreView extends View implements ViewModel {
    onBackButton!: TBackButton;

    protected readonly IdGoToInit: string = 'goToInit';
    protected readonly IdHandleKO: string = 'handleKO';
        
    protected readonly IdPassword1: string = 'password1';
    protected readonly IdPassword2: string = 'password2';
    
    protected _ca!: ConfigActions;
    protected _aa!: AppActions;

    protected readonly IdRestoreAll: string = 'restoreAll';
    protected readonly IdGoBack: string = 'GoBack';
    protected readonly IdStartFromScratch: string = 'startFromScratch';
    
    protected ro!: RestoreOptions;

    protected readonly IdRestoreWallet : string = 'RestoreWallet';
    protected readonly IdMaintainFile : string = 'MaintainFile';
    protected readonly IdChooseFile : string = 'ChooseFile';
    protected readonly IdFileUri : string = 'FileUri';
    protected readonly IdMaintainSequence : string = 'MaintainSequence';
    protected readonly IdInsertSequence : string = 'InsertSequence';
    protected readonly IdFileUriP : string = 'FileUriP';
    protected readonly IdSequenceP : string = 'SequenceP';
    protected readonly IdSequence : string = 'Sequence';
    protected readonly IdSelectSequence : string = 'SelectSequence';
    protected readonly IdSequenceBackspace : string = 'SequenceBackspace';
    protected readonly IdSequenceClear : string = 'SequenceClear';
    protected readonly IdSequenceConfirm : string = 'SequenceConfirm';
    protected readonly IdSequenceComposer : string = 'SequenceComposer';
    protected readonly IdSelectSequenceCancel : string = 'SelectSequenceCancel';
    protected readonly IdConfirm : string = 'Confirm';
    protected readonly IdStartUsingCryptpass: string = 'StartUsingCryptpass';
    protected readonly PrefixSequenceButton: string = 'sequence_';
    protected readonly DefaultNoFile: string = 'No file selected';
    protected readonly DefaultNoSequence: string = 'No sequence selected';
    

    async Init(options?: RestoreOptions) {
        
        if (this.ro === undefined && options === undefined) return;
        else if (this.ro === undefined && options !== undefined) {
            this.ro = options;
        }
        this.setApp(`${this.ro.errorMsg !== undefined ? `<p class="alert alert-danger">${this.ro.errorMsg}</p>` : ''}
                ${this.ro.desc !== undefined ? this.ro.desc : ''}
                <p>${ViewHelpers.button(this.IdRestoreAll,'Restore KeyPass/Sequence',this.ClassFormBtn)}</p>
                <p>${ViewHelpers.button(this.IdStartFromScratch,'Start from scratch',this.ClassFormBtn)}</p>
                ${this.ro.back !== undefined ? `<p>${ViewHelpers.button(this.IdGoBack,'Go Back',this.ClassFormBtnSec)}</p>` : ''}
                `,() => this.clickEl(this.IdGoBack));

        this._ca = new ConfigActions(State.Password);
        this._aa = new AppActions();
    }    

    protected async onClick(e: Event) {
        const id = (e.target as HTMLInputElement).id;
        switch (id) {
            
            case this.IdGoToInit:
                this.Init();
            break;
            case this.IdStartUsingCryptpass:
                this.restart();
            break;
            case this.IdStartFromScratch:
                this.handleKO('Initialize');
            break;
            case this.IdRestoreAll:
                this.handleKO('RestoreAll');
            break;
            case this.IdHandleKO:
                this.handleKO('ProceedInitialization');
            break;
            case this.IdGoBack:
                if (this.ro.back !== undefined)
                    this.ro.back();
            break;

            //restore wallet section:
            case this.IdMaintainFile:
                this.restoreWalletDisplay('maintainFile');
            break;
            case this.IdChooseFile:
                await this.restoreWalletDisplay('chooseFile');
            break;
            case this.IdMaintainSequence:
                this.restoreWalletDisplay('maintainSequence');
            break;
            case this.IdInsertSequence:
                this.restoreWalletDisplay('insertSequence');
            break;
            case this.IdSequenceBackspace:
                this.selectSequence('backspace');
            break;
            case this.IdSequenceClear:
                this.selectSequence('clear');
            break;
            case this.IdSequenceConfirm:
                this.selectSequence('confirm');
            break;
            case this.IdSelectSequenceCancel:
                this.restoreWalletDisplay('selectSequenceCancel');
            break;
            case this.IdConfirm:
                await this.confirmRestoreWallet();
            break;
        }

        if (id.indexOf(this.PrefixSequenceButton) == 0) {
            this.selectSequence(id as SeqIds);
        }
    }

    protected restart() {
        State.logout();
        ScenarioController.changeScenario(new MainView());
    }

    protected async restoreWalletDisplay (action: 'maintainFile' | 'chooseFile' | 'maintainSequence' | 'insertSequence' | 'selectSequenceCancel') {
        switch (action) {
            case 'maintainFile':
                this.hideEl(this.IdFileUriP);
            break;
            case 'chooseFile':
                const res = await Config.selectKeyPassUri();
                this.showEl(this.IdFileUriP);
                if (res !== false) {
                    this.setInner(this.IdFileUri,res);
                } else {
                    this.setInner(this.IdFileUri,this.DefaultNoFile);
                }
            break;
            case 'maintainSequence':
                this.hideEl(this.IdSequenceP);
            break;
            case 'insertSequence':
                this.hideEl(this.IdRestoreWallet);
                this.showEl(this.IdSequenceP);
                this.showEl(this.IdSelectSequence);
                this.onBackButton = () => this.clickEl(this.IdSelectSequenceCancel);
            break;
            case 'selectSequenceCancel':
                this.showEl(this.IdRestoreWallet);
                this.hideEl(this.IdSelectSequence);
                this.onBackButton = () => this.clickEl(this.IdGoToInit);
            break;
        }
        this.displayConfirm();
    }

    protected async confirmRestoreWallet() {
        const newFile = this.isChecked(this.IdChooseFile) ? this.getInner(this.IdFileUri) : undefined;
        const newSequence = this.isChecked(this.IdInsertSequence) ? this._sequence : undefined;
        const ok = await this._ca.setSequenceAndKeyPassUri(newSequence, newFile);
        if (ok) {
            State.logout();
            ScenarioController.changeScenario(new MainView());
        }
        else alert('Error! Something has gone wrong. Please retry.');
    }

    protected selectSequence (action: SeqIds | 'backspace' | 'clear' | 'confirm') {
        switch (action) {
            case 'backspace':
                const num = this._sequence.pop();
                if (num !== undefined) {
                    this.getEl(this.PrefixSequenceButton+num).removeAttribute('disabled');
                    this.printSequence();    
                }
            break;
            case 'clear':
                this._sequence.forEach(num => {
                    this.getEl(this.PrefixSequenceButton+num).removeAttribute('disabled');
                });
                this._sequence = [];
                this.printSequence();
            break;
            case 'confirm':
                if (this._sequence.length == 26) {
                    this.setInner(this.IdSequence,this.getInner(this.IdSequenceComposer));
                    this.showEl(this.IdRestoreWallet);
                    this.hideEl(this.IdSelectSequence);
                } else {
                    alert('You must complete typing the entire sequence!');
                }
            break;
            default:
                const seqN = parseInt(action.split(this.PrefixSequenceButton)[1]);
                this._sequence.push(seqN);
                this.getEl(action).setAttribute('disabled','disabled');
                this.printSequence();
        }
        this.displayConfirm();
    }

    protected printSequence() {
        this.setInner(this.IdSequenceComposer,this._sequence.join(', '));
    }

    protected async handleKO (step: KOsteps = 'KOStart') {
        switch (step) {
            case 'ProceedInitialization':
                const pwd1 = this.getVal(this.IdPassword1,true);
                const pwd2 = this.getVal(this.IdPassword2,true);
                if (!CommonHelpers.CheckNewPassword(pwd1,pwd2)) {
                    this.focusEl(this.IdPassword1);
                } else {
                    this._ca = new ConfigActions(pwd1);
                    this.LoaderShow();
                    const configured = await this._ca.setup('NEW');
                    this.LoaderHide();
                    if (configured) {
    this.setApp(`<p>Configuration done.</p>
    <p class="alert alert-danger">Caution! The following sequence of numbers, along with your personal password, is indispensable
     to recover your stored secrets, starting from the previously saved file, in case you reset or lost your device.</p>

    <p class="h3">${this._ca.getSequence().join(', ')}</p>

     <p class="alert alert-danger">Now, please make a note or a screenshot of this number sequence (in correct order).
     Remember anyway that this sequence of numbers can also be displayed at a later time through the appropriate menu item 
     (<strong>best before you reset or lost your device...</strong>)</p>
     <p>${ViewHelpers.button(this.IdStartUsingCryptpass,'Start using CryptPassApp',this.ClassFormBtn)}</p>

    `);
                    } else {
                        this.setApp(`
    <p>Something went wrong with starting configuration</p>
    <p>${ViewHelpers.button(this.IdGoToInit,'Retry',this.ClassFormBtn)}</p>
    `,() => this.clickEl(this.IdGoToInit));
                    }
                }
            break;
            case 'Initialize':
                this.setApp(`
                <h2>Start from scratch</h2>
                <ol>
                <li>
                    <p>Choose a strong (very strong) password:</p>
                    <p>${ViewHelpers.password(this.IdPassword1,'Type password', this.ClassFormCtrl)}</p>
                    <p>${ViewHelpers.password(this.IdPassword2,'Repeat password', this.ClassFormCtrl)}</p>
                </li>

                <li>
                    <p>Select the folder (or create the new one) where passwords will be stored:</p>
                    <p>${ViewHelpers.button(this.IdHandleKO,'Proceed',this.ClassFormBtn)}</p>
                </li>
                </ol>
                <p>${ViewHelpers.button(this.IdGoToInit,'Go Back',this.ClassFormBtnSec)}</p>
                `,() => this.clickEl(this.IdGoToInit));
            break;
            case 'RestoreAll':

                const status = this.ro.status;
                const mustPickFile = status == 'EmptyKeypass' || status == 'MissingKeypass' || status == 'KO';
                const mustInsertSequence = status == 'EmptySequence' || status == 'KO';

                this.setApp(`
                <div id="${this.IdRestoreWallet}">
                <h2>Restore wallet</h2>

                <div class="mt-2 btn-group" role="group">
                    <span${mustPickFile?' class="d-none"':''}><input type="radio" class="btn-check" name="btnradio" id="${this.IdMaintainFile}" autocomplete="off"${mustPickFile?'':' checked="checked"'}>
                    <label class="btn btn-outline-primary" for="${this.IdMaintainFile}">Maintain current file</label></span>

                    <input type="radio" class="btn-check" name="btnradio" id="${this.IdChooseFile}" autocomplete="off"${mustPickFile?' checked="checked"':''}>
                    <label class="btn btn-outline-primary" for="${this.IdChooseFile}">Choose new file</label>
                </div>

                <p id="${this.IdFileUriP}"${mustPickFile?'':' class="d-none"'}>New file: <span class="fw-bold text-break" id="${this.IdFileUri}">${this.DefaultNoFile}</span></p>                    

                <div class="mt-2 btn-group" role="group"${mustInsertSequence?' class="d-none"':''}>
                    <span${mustInsertSequence?' class="d-none"':''}><input type="radio" class="btn-check" name="btnradio1" id="${this.IdMaintainSequence}" autocomplete="off"${mustInsertSequence?'':' checked="checked"'}>
                    <label class="btn btn-outline-primary" for="${this.IdMaintainSequence}">Maintain current sequence</label></span>

                    <input type="radio" class="btn-check" name="btnradio1" id="${this.IdInsertSequence}" autocomplete="off"${mustInsertSequence?' checked="checked"':''}>
                    <label class="btn btn-outline-primary" for="${this.IdInsertSequence}">Insert new sequence</label>
                </div>

                <p id="${this.IdSequenceP}"${mustInsertSequence?'':' class="d-none"'}>New sequence: <span class="fw-bold" id="${this.IdSequence}">${this.DefaultNoSequence}</span></p>
                
                <p class="mt-3">${ViewHelpers.button(this.IdConfirm,'Confirm choices',this.ClassFormBtn)}
                ${ViewHelpers.button(this.IdGoToInit,'Go Back',this.ClassFormBtnSec)}</p>
                </div>

                <div id="${this.IdSelectSequence}" class="d-none">
                <p>Press sequence numbers in correct order:</p>
                <p>${this.printSequenceButtons()}</p>
                <p>${ViewHelpers.button(this.IdSequenceBackspace,'⇐ Backspace',this.ClassFormBtnSec)}
                ${ViewHelpers.button(this.IdSequenceClear,'Clear all',this.ClassFormBtnSec)}
                ${ViewHelpers.button(this.IdSequenceConfirm,'Confirm',this.ClassFormBtn)}
                </p>

                <p id="${this.IdSequenceComposer}" class="fw-bold"></p>
                <p>${ViewHelpers.button(this.IdSelectSequenceCancel,'Cancel',this.ClassFormBtnSec)}</p>
                </div>
                `,() => this.clickEl(this.IdGoToInit));
                this.displayConfirm();
            break;

            
        }
    }

    protected displayConfirm() {
        if (
            (
                !this.isChecked(this.IdMaintainFile) || !this.isChecked(this.IdMaintainSequence)
            )
            &&   
            (
                this.isChecked(this.IdMaintainFile) ||
                (this.isChecked(this.IdChooseFile) && this.getInner(this.IdFileUri) != this.DefaultNoFile)
            )
            &&
            (
                this.isChecked(this.IdMaintainSequence) ||
                (this.isChecked(this.IdInsertSequence) && this.getInner(this.IdSequence) != this.DefaultNoSequence)
            )
        ) this.showEl(this.IdConfirm);
        else this.hideEl(this.IdConfirm);
    }
   

    protected printSequenceButtons () {
        let out = '';
        for (let i=0; i<26; ++i) {
            out += ` ${ViewHelpers.button(this.PrefixSequenceButton+i, ` ${i} `, this.ClassFormBtnBla + ' m-2')} `;
        }
        return out;
    }

    protected _sequence: number[] = [];


    public Handlers: EventHandlerModel[] = [
        {name: 'RestoreViewClick', handler: (e) => this.onClick(e), type: 'click'}/*,
    {name: 'RestoreViewSubmit', handler: (e) => { e.preventDefault(); this.onSubmit(e); }, type: 'submit'}*/
    ];   

    
}


