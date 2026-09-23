interface CryptPassLocaleMap { [key: string]: string; }
interface CryptPassLocales { en: CryptPassLocaleMap; it: CryptPassLocaleMap; }
interface Window { CRYPTPASS_LOCALES?: CryptPassLocales; }

class Localization {
    private static readonly preferenceKey = 'cryptPassLanguage';
    private static language: 'en' | 'it' = 'en';
    private static readonly sourceKeys: { [key: string]: string } = {};

    public static initialize(): void {
        const locales = window.CRYPTPASS_LOCALES;
        if (!locales || !locales.en || !locales.it) { this.setLanguage('en', false); return; }
        Object.keys(locales.en).forEach(key => { this.sourceKeys[locales.en[key].trim().replace(/\s+/g, ' ')] = key; });
        const saved = window.localStorage.getItem(this.preferenceKey);
        const preferred = saved === 'en' || saved === 'it' ? saved : (navigator.language.toLowerCase().indexOf('it') === 0 ? 'it' : 'en');
        this.setLanguage(preferred, false);
        const nativeAlert = window.alert.bind(window);
        const nativeConfirm = window.confirm.bind(window);
        const nativePrompt = window.prompt.bind(window);
        window.alert = (message?: any): void => nativeAlert(this.translate(String(message == null ? '' : message)));
        window.confirm = (message?: string): boolean => nativeConfirm(this.translate(String(message == null ? '' : message)));
        window.prompt = (message?: string, defaultValue?: string): string | null => nativePrompt(
            this.translate(String(message == null ? '' : message)),
            defaultValue === undefined ? undefined : this.translate(defaultValue)
        );
    }

    public static current(): 'en' | 'it' { return this.language; }

    public static setLanguage(language: string, persist: boolean = true): void {
        this.language = language === 'it' ? 'it' : 'en';
        if (persist) window.localStorage.setItem(this.preferenceKey, this.language);
        document.documentElement.lang = this.language;
    }

    public static text(key: string): string {
        return window.CRYPTPASS_LOCALES?.[this.language]?.[key] || window.CRYPTPASS_LOCALES?.en?.[key] || key;
    }

    public static translate(value: string): string {
        const normalized = value.trim().replace(/\s+/g, ' ');
        const key = this.sourceKeys[normalized];
        return key ? this.text(key) : value;
    }

    public static apply(root: HTMLElement): void {
        if (this.language === 'en' || !window.CRYPTPASS_LOCALES) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
            if ((node.parentElement?.closest('[translate="no"]'))) continue;
            const value = node.nodeValue || '';
            const trimmed = value.trim();
            if (!trimmed) continue;
            const translated = this.translate(trimmed);
            if (translated !== trimmed) node.nodeValue = value.replace(trimmed, translated);
        }
        root.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label], input[type="button"], input[type="submit"]').forEach(element => {
            ['placeholder', 'title', 'aria-label', ...(element.matches('input[type="button"], input[type="submit"]') ? ['value'] : [])].forEach(attribute => {
                const current = element.getAttribute(attribute);
                if (current) element.setAttribute(attribute, this.translate(current));
            });
        });
    }
}
