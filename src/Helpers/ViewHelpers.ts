interface InputAttrs {
    id: string,
    type: string,
    val?: string,
    checked?: boolean,
    readonly?: boolean,
    _class?: string,
    placeholder?: string,
    noautocaps?: boolean,
    inputmode?: 'numeric' | 'text' | 'tel' | 'email' | 'decimal',
    custom?: string
}

class ViewHelpers {

    public static get Instructions (): string {
        return `
        <p><strong>CryptPass</strong> is a password wallet manager, with which you can store your passwords and more (usernames, PINs, custom fields)
         with strong encryption.</p>
        <p>CryptPass stores your passwords into a file that can be saved anywhere. This way, you can backup and synchronize this file with
         any of your favorites cloud storage services (such as Dropbox and many others). This file is protected and encrypted with a combination of two methods:</p>
         <ol>
            <li>A <strong>master password</strong> of your choice (this should be really really strong)</li>
            <li>A <strong>sequence of 26 numbers</strong>, from 0 to 25, that are randomly ordered by CryptPass</li>
         </ol>
        <p>The <strong>sequence in the correct order</strong> must be carefully kept in a safe place (e.g. a screenshot or transcribing it on a paper sheet and so on...)
        because it will be stored only inside the app. This means that if you reset or lost your device, the sequence can be restored only retyping it manually.</p>
        `;
    }

    public static submit (id: string, val: string, _class?: string): string {
        return `<input type="submit"${this.getClass(_class)} id="${id}" value="${this.cleanVal(val)}" />`;
    }

    public static button (id: string, val: string, _class?: string, custom?: string): string {
        return `<button${this.getClass(_class)} type="button" id="${id}"${custom !== undefined ? ' '+custom:''}>${val}</button>`;
    }

    public static label (forId: string, val: string, _class?: string): string {
        return `<label${this.getClass(_class)} for="${forId}">${val}</label>`;
    }

    protected static genericInput (attrs: InputAttrs) {
        return `<input${this.getClass(attrs._class)}${this.getChecked(attrs.checked)}${this.getInputmode(attrs.inputmode)}${this.getReadonly(attrs.readonly)}${this.getPlaceholder(attrs.placeholder)}${this.getNoautocaps(attrs.noautocaps)}${this.getValue(attrs.val)}${this.getCustom(attrs.custom)} type="${attrs.type}" id="${attrs.id}" />`;
    }

    public static checkbox (id: string, val?: string, checked: boolean = false, _class?: string, custom?: string): string {
        return this.genericInput({ id: id, val: this.cleanVal(val), checked: checked, _class: _class, type: 'checkbox', custom: custom });
    }

    public static textinput (id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean, noautocaps?: boolean): string {
        return this.genericInput({ id: id, val: this.cleanVal(val), placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', noautocaps: noautocaps });
    }

    public static hiddeninput (id: string, val?: string): string {
        return this.genericInput({ id: id, val: this.cleanVal(val), type: 'hidden' });
    }

    public static numericinput (id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean): string {
        return this.genericInput({ id: id, val: val, placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', inputmode: 'numeric' });
    }

    public static password (id: string, placeholder?: string, _class?: string, readonly?: boolean): string {
        return this.genericInput({ id: id, placeholder: placeholder, readonly: readonly, _class: _class, type: 'password' });
    }

    public static cleanVal(val?: string): string {
        if (val !== undefined)
            return val.split('"').join('&quot;');
        return '';
    }

    protected static getClass(_class?:string): string {
        return _class!==undefined?` class="${_class}"`:'';
    }

    protected static getChecked(checked?: boolean): string {
        return checked?' checked="checked"':'';
    }

    protected static getReadonly(readonly?: boolean): string {
        return readonly?' readonly="readonly"':'';
    }

    protected static getNoautocaps(noautocaps?: boolean): string {
        return noautocaps?' autocapitalize="off"':'';
    }

    protected static getInputmode(inputmode?: string): string {
        return inputmode!==undefined?` inputmode="${inputmode}"`:'';
    }

    protected static getPlaceholder(placeholder?: string): string {
        return placeholder?.trim()!='' && placeholder !== undefined?` placeholder="${placeholder}"`:'';
    }

    protected static getValue(value?: string): string {
        return value?.trim()!='' && value !== undefined?` value="${value}"`:'';
    }
    
    protected static getCustom(value?: string): string {
        return value?.trim()!='' && value !== undefined?` ${value}`:'';
    }

}