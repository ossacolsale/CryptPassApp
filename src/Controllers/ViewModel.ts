type TBackButton = () => any | Promise<any>;

interface ViewModel {
    Init(options?: any): void,
    onBackButton: TBackButton,
    End?(): void,
    Handlers: EventHandlerModel[]
}

interface EventHandlerModel {
    name: string,
    type: HandledTypes,
    handler: EventHandler
}

abstract class View implements ViewModel {

    protected readonly IdAppDiv: string = 'app';
    protected readonly IdLoaderDiv: string = 'loader';
    protected readonly LoaderShowMs: number = 500;

    protected readonly ClassFormBtn: string = 'btn btn-primary';
    protected readonly ClassFormBtnSec: string = 'btn btn-secondary';
    protected readonly ClassFormBtnBla: string = 'btn btn-dark';

    protected readonly ClassFormCtrl: string = 'form-control';
    protected readonly ClassFormFloat: string = 'form-floating mb-2';

    protected readonly ClassMenuBtn: string = 'btn btn-primary btn-lg my-2';

    abstract Init(options?: any): any;
    abstract onBackButton: TBackButton;
    abstract Handlers: EventHandlerModel[];

    protected showEl(elId: string) {
        $('#'+elId).removeClass('d-none');
    }

    protected clickEl(elId: string) {
        $('#'+elId).trigger('click');
    }

    protected hideEl(elId: string) {
        $('#'+elId).toggleClass('d-none');
    }

    protected setApp(content: string, onBackButton: TBackButton = () => null) {
        this.setMarkup(this.IdAppDiv, content);
        this.onBackButton = onBackButton;
    }

    protected setVal(elId: string, value: string) {
        $('#'+elId).val(value);
    }

    protected setMarkup(elId: string, content: string) {
        $('#'+elId).html(content);
        Localization.apply(this.getEl(elId));
    }

    protected getText(elId: string): string {
        return $('#'+elId).text();
    }

    protected setText(elId: string, content: string): void {
        const element = this.getEl(elId);
        element.textContent = Localization.translate(content);
    }

    protected getEl(elId: string): HTMLElement {
        return $('#'+elId)[0];
    }

    protected isChecked(elId: string): boolean {
        return $('#'+elId).prop('checked');
    }

    protected getVal(elId: string, raw: boolean = false): string {
        const val = (this.getEl(elId) as HTMLInputElement).value;
        return raw ? val : val.trim();
    }

    protected focusEl(elId: string, alsoSelect: boolean = false) {
        const focus = (): void => {
            const input = this.getEl(elId) as HTMLInputElement | null;
            if (!input) return;
            input.focus({ preventScroll: true });
            try {
                const len = input.value.length;
                input.setSelectionRange(len, len);
                if (alsoSelect) input.select();
            } catch (_) { /* Some control types do not expose selection ranges. */ }
        };
        if (cordova.platformId === 'electron' && window.cryptPassDesktop?.focusWindow) {
            void window.cryptPassDesktop.focusWindow().then(focus, focus);
        } else focus();
    }

    private LoaderShowCommands() {
        this.getEl(this.IdAppDiv).style.display = 'none';
        this.getEl(this.IdLoaderDiv).style.display = 'block';
    }
    
    protected LoaderShow(doSomethingBeforeHiding?: () => any, doSomethingAfterHiding?: (res?: any) => any, hideAfter: boolean = true) {
        this.LoaderShowCommands();
        if (doSomethingBeforeHiding !== undefined) 
            setTimeout(() => { 
                let res;
                if (doSomethingBeforeHiding !== undefined) {
                    res = doSomethingBeforeHiding();    
                }
                if (hideAfter) this.LoaderHide(); 
                if (doSomethingAfterHiding !== undefined) 
                    doSomethingAfterHiding(res);
            }, this.LoaderShowMs);
    }

    protected async LoaderShowAsync (doSomethingBeforeHiding?: () => any | Promise<any>, doSomethingAfterHiding?: (res?: any) => any | Promise<any>, hideAfter: boolean = true) {
        this.LoaderShowCommands();
        let result: any = false;
        try {
            if (doSomethingBeforeHiding !== undefined) {
                await new Promise(resolve => window.setTimeout(resolve, this.LoaderShowMs));
                result = await doSomethingBeforeHiding();
            }
        } catch (error) {
            console.error('CryptPass operation failed', error);
            alert(Localization.text('alert.operationFailed'));
            CommonHelpers.StandardError(error);
        } finally {
            if (hideAfter) this.LoaderHide();
        }
        if (doSomethingAfterHiding !== undefined) {
            try {
                await doSomethingAfterHiding(result);
            } catch (error) {
                console.error('CryptPass post-operation action failed', error);
                alert(Localization.text('alert.operationFailed'));
                CommonHelpers.StandardError(error);
            }
        }
    }

    protected LoaderHide() {
        this.getEl(this.IdAppDiv).style.display = 'block';
        this.getEl(this.IdLoaderDiv).style.display = 'none';
    }

    protected sleep(milliseconds: number) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }

    private showInlineFormError(message: string): void {
        const form = document.querySelector('form');
        if (!form) return;
        form.querySelector('#PasswordValidationError')?.remove();
        const error = document.createElement('div');
        error.id = 'PasswordValidationError';
        error.className = 'alert alert-warning';
        error.setAttribute('role', 'alert');
        error.textContent = message;
        form.prepend(error);
    }

    protected async handleChPwd(idpwdold: string, idpwdnew1: string, idpwdnew2: string, onsuccess: () => any, pwdChanger: (Old: string, New: string) => Promise<boolean>) {
        const old = this.getVal(idpwdold,true);
        const pwd1 = this.getVal(idpwdnew1,true);
        const pwd2 = this.getVal(idpwdnew2, true);
        const isElectron = cordova.platformId === 'electron';
        const check = CommonHelpers.CheckChPassword(old, pwd1, pwd2, !isElectron);
        switch (check) {
            case true:
                await this.LoaderShowAsync(
                    async (): Promise<boolean> => await pwdChanger(old, pwd1),
                    async (res) => {
                        if (res) {
                            if (!isElectron) alert('Password correctly changed');
                            await onsuccess();
                        } else {
                            if (isElectron) this.showInlineFormError(Localization.text('alert.operationFailed'));
                            else alert('Something\'s gone wrong. Please retry');
                            this.focusEl(idpwdnew1, true);
                        }
                    }
                );
            break;
            case 'wrongNew':
                if (isElectron) {
                    let message = 'alert.passwordMismatch';
                    if (old === pwd1 || old === pwd2) message = 'alert.passwordSame';
                    else if (pwd1 === '' && pwd2 === '') message = 'alert.passwordRequired';
                    else if (pwd1.length < 10) message = 'alert.passwordShort';
                    this.showInlineFormError(Localization.text(message));
                }
                this.focusEl(idpwdnew1,true);
            break;
            case 'wrongOld':
                if (isElectron) this.showInlineFormError(Localization.text('alert.oldPasswordWrong'));
                this.focusEl(idpwdold,true);
            break;
        }       
    }

}