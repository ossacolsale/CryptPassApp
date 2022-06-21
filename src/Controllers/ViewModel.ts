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
        this.setInner(this.IdAppDiv, content);
        this.onBackButton = onBackButton;
    }

    protected setVal(elId: string, value: string) {
        $('#'+elId).val(value);
    }

    protected setInner(elId: string, content: string) {
        $('#'+elId).html(content);
    }

    protected getInner(elId: string): string {
        return $('#'+elId).html();
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
        this.getEl(elId).focus();
        if (alsoSelect) (this.getEl(elId) as HTMLInputElement).select();
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
        if (doSomethingBeforeHiding !== undefined) 
            setTimeout(async () => {
                let res;
                if (doSomethingBeforeHiding !== undefined) {
                    res = await doSomethingBeforeHiding(); 
                }
                if (hideAfter) this.LoaderHide(); 
                if (doSomethingAfterHiding !== undefined) 
                    await doSomethingAfterHiding(res);
            }, this.LoaderShowMs);
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

    protected async handleChPwd(idpwdold: string, idpwdnew1: string, idpwdnew2: string, onsuccess: () => any, pwdChanger: (Old: string, New: string) => Promise<boolean>) {
        const old = this.getVal(idpwdold,true);
        const pwd1 = this.getVal(idpwdnew1,true);
        const check = CommonHelpers.CheckChPassword(old, pwd1, this.getVal(idpwdnew2, true));
        switch (check) {
            case true:
                await this.LoaderShowAsync(
                    async (): Promise<boolean> => {   
                        const done = await pwdChanger(old, pwd1);
                        if (done) {
                            alert('Password correctly changed');
                            onsuccess();
                            return true;
                        } else {
                            alert('Something\'s gone wrong. Please retry');
                            return false;
                        }
                    }, (res) => { if (!res) this.focusEl(idpwdnew1,true); }
                );
            break;
            case 'wrongNew':
                this.focusEl(idpwdnew1,true);
            break;
            case 'wrongOld':
                this.focusEl(idpwdold,true);
            break;
        }       
    }

}