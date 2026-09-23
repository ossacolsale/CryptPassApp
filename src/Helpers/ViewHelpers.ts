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
    custom?: Record<string, string | number | boolean>
}

class ViewHelpers {

    public static get Instructions (): string {
        return `<p>${this.escapeHtmlText(Localization.text('instructions.protection'))}</p>
        <p>${this.escapeHtmlText(Localization.text('instructions.local'))}</p>
        <p>${this.escapeHtmlText(Localization.text('instructions.legacy'))}</p>`;
    }

    public static submit (id: string, val: string, _class?: string): string {
        return `<input type="submit"${this.getClass(_class)} id="${id}" value="${this.escapeHtmlAttribute(val)}" />`;
    }

    public static button (id: string, val: string, _class?: string, custom?: Record<string, string | number | boolean>): string {
        return `<button${this.getClass(_class)} type="button" id="${this.escapeHtmlAttribute(id)}"${this.getCustom(custom)}>${this.escapeHtmlText(val)}</button>`;
    }

    public static label (forId: string, val: string, _class?: string): string {
        return `<label${this.getClass(_class)} for="${this.escapeHtmlAttribute(forId)}">${this.escapeHtmlText(val)}</label>`;
    }

    protected static genericInput (attrs: InputAttrs) {
        return `<input${this.getClass(attrs._class)}${this.getChecked(attrs.checked)}${this.getInputmode(attrs.inputmode)}${this.getReadonly(attrs.readonly)}${this.getPlaceholder(attrs.placeholder)}${this.getNoautocaps(attrs.noautocaps)}${this.getValue(attrs.val)}${this.getCustom(attrs.custom)} type="${this.escapeHtmlAttribute(attrs.type)}" id="${this.escapeHtmlAttribute(attrs.id)}" />`;
    }

    public static checkbox (id: string, val?: string, checked: boolean = false, _class?: string, custom?: Record<string, string | number | boolean>): string {
        return this.genericInput({ id: id, val: val, checked: checked, _class: _class, type: 'checkbox', custom: custom });
    }

    public static textinput (id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean, noautocaps?: boolean): string {
        return this.genericInput({ id: id, val: val, placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', noautocaps: noautocaps });
    }

    public static hiddeninput (id: string, val?: string): string {
        return this.genericInput({ id: id, val: val, type: 'hidden' });
    }

    public static numericinput (id: string, val?: string, placeholder?: string, _class?: string, readonly?: boolean): string {
        return this.genericInput({ id: id, val: val, placeholder: placeholder, readonly: readonly, _class: _class, type: 'text', inputmode: 'numeric' });
    }

    public static password (id: string, placeholder?: string, _class?: string, readonly?: boolean): string {
        return this.genericInput({ id: id, placeholder: placeholder, readonly: readonly, _class: _class, type: 'password' });
    }

    public static cleanVal(val?: string): string {
        if (val !== undefined)
            return this.escapeHtmlAttribute(val);
        return '';
    }

    protected static getClass(_class?:string): string {
        return _class!==undefined?` class="${this.escapeHtmlAttribute(_class)}"`:'';
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
        return inputmode!==undefined?` inputmode="${this.escapeHtmlAttribute(inputmode)}"`:'';
    }

    protected static getPlaceholder(placeholder?: string): string {
        return placeholder?.trim()!='' && placeholder !== undefined?` placeholder="${this.escapeHtmlAttribute(placeholder)}"`:'';
    }

    protected static getValue(value?: string): string {
        return value?.trim()!='' && value !== undefined?` value="${this.escapeHtmlAttribute(value)}"`:'';
    }
    
    public static escapeHtmlText(value?: string): string {
        return (value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    public static escapeHtmlAttribute(value?: string): string {
        return this.escapeHtmlText(value);
    }

    protected static getCustom(value?: Record<string, string | number | boolean>): string {
        if (!value) return '';
        return Object.keys(value).map((name) => {
            const item = value[name];
            if (!/^[a-z][a-z0-9-]*$/i.test(name) || item === false) return '';
            return item === true ? ` ${name}` : ` ${name}="${this.escapeHtmlAttribute(String(item))}"`;
        }).join('');
    }

}