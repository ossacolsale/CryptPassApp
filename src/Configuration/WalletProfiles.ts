interface WalletProfile {
    id: string;
    name: string;
    config: string;
}
interface WalletProfileStore {
    version: 1;
    activeId: string;
    profiles: WalletProfile[];
}

/** Keeps each wallet's configuration (including its own sequence) in OS-backed secure storage. */
class WalletProfiles {
    private static readonly storeKey = 'cryptPassWalletProfiles';
    private static readonly activeConfigKey = 'cryptPassCfg';
    private static readonly emptyConfig = JSON.stringify({
        KeyFilePath: '',
        Sequence: JSON.stringify({ Sequence: [] }),
        Preferences: { ChPwdReminder: true }
    });

    private static createId(): string {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes).map(value => ('0' + value.toString(16)).slice(-2)).join('');
    }

    private static async readStore(): Promise<WalletProfileStore | false> {
        const raw = await SecureStorage.getVal(this.storeKey);
        if (raw === false) return false;
        const value = JSON.parse(raw) as WalletProfileStore;
        if (value.version !== 1 || !Array.isArray(value.profiles) ||
            !value.profiles.every(profile => typeof profile.id === 'string' && typeof profile.name === 'string' && typeof profile.config === 'string') ||
            !value.profiles.some(profile => profile.id === value.activeId)) throw new Error('Wallet profile data is invalid');
        return value;
    }

    private static async writeStore(store: WalletProfileStore): Promise<boolean> {
        const serialized = JSON.stringify(store);
        if (await SecureStorage.setVal(this.storeKey, serialized) === false) return false;
        return await SecureStorage.getVal(this.storeKey) === serialized;
    }

    /** Transactional first-run migration: write and verify profiles before replacing legacy configuration. */
    public static async initialize(): Promise<void> {
        const existing = await this.readStore();
        if (existing !== false) {
            const active = existing.profiles.find(profile => profile.id === existing.activeId);
            const current = await SecureStorage.getVal(this.activeConfigKey);
            if (active && current !== active.config && await SecureStorage.setVal(this.activeConfigKey, active.config) === false)
                throw new Error('Could not restore active wallet configuration');
            return;
        }
        const legacyConfig = await SecureStorage.getVal(this.activeConfigKey);
        const profile: WalletProfile = {
            id: this.createId(),
            name: 'My wallet',
            config: legacyConfig === false ? this.emptyConfig : legacyConfig
        };
        const migrated: WalletProfileStore = { version: 1, activeId: profile.id, profiles: [profile] };
        if (!await this.writeStore(migrated)) throw new Error('Could not verify wallet profile migration');
        if (legacyConfig === false && await SecureStorage.setVal(this.activeConfigKey, profile.config) === false) {
            await SecureStorage.delVal(this.storeKey);
            throw new Error('Could not initialize wallet configuration');
        }
    }

    public static async list(): Promise<Array<{ id: string; name: string; active: boolean }>> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return [];
        return store.profiles.map(profile => ({ id: profile.id, name: profile.name, active: profile.id === store.activeId }));
    }

    public static async activeName(): Promise<string> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return 'My wallet';
        const active = store.profiles.find(profile => profile.id === store.activeId);
        return active ? active.name : 'My wallet';
    }

    public static async commitActiveConfig(config: string): Promise<boolean> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return false;
        const active = store.profiles.find(profile => profile.id === store.activeId);
        if (!active) return false;
        active.config = config;
        if (!await this.writeStore(store)) return false;
        const result = await SecureStorage.setVal(this.activeConfigKey, config);
        return result !== false && await SecureStorage.getVal(this.activeConfigKey) === config;
    }

    public static async syncActiveConfig(): Promise<boolean> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return false;
        const active = store.profiles.find(profile => profile.id === store.activeId);
        const config = await SecureStorage.getVal(this.activeConfigKey);
        if (!active || config === false) return false;
        active.config = config;
        return this.writeStore(store);
    }

    public static async rename(id: string, name: string): Promise<boolean> {
        const normalized = name.trim();
        if (!normalized || normalized.length > 80) return false;
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return false;
        const profile = store.profiles.find(item => item.id === id);
        if (!profile) return false;
        profile.name = normalized;
        return this.writeStore(store);
    }

    public static async remove(id: string): Promise<boolean> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false || store.activeId === id || store.profiles.length < 2) return false;
        store.profiles = store.profiles.filter(profile => profile.id !== id);
        return this.writeStore(store);
    }

    public static async switchTo(id: string): Promise<boolean> {
        await this.initialize();
        const store = await this.readStore();
        if (store === false || store.activeId === id) return store !== false;
        const target = store.profiles.find(profile => profile.id === id);
        const previous = store.profiles.find(profile => profile.id === store.activeId);
        const currentConfig = await SecureStorage.getVal(this.activeConfigKey);
        if (!target || !previous || currentConfig === false) return false;
        previous.config = currentConfig;
        const oldActiveId = store.activeId;
        store.activeId = id;
        if (!await this.writeStore(store)) return false;
        if (await SecureStorage.setVal(this.activeConfigKey, target.config) !== false) return true;
        store.activeId = oldActiveId;
        await this.writeStore(store);
        await SecureStorage.setVal(this.activeConfigKey, currentConfig);
        return false;
    }

    public static async add(name: string): Promise<string | false> {
        const normalized = name.trim();
        if (!normalized || normalized.length > 80) return false;
        await this.initialize();
        const store = await this.readStore();
        if (store === false) return false;
        const currentConfig = await SecureStorage.getVal(this.activeConfigKey);
        const current = store.profiles.find(profile => profile.id === store.activeId);
        if (currentConfig === false || !current) return false;
        current.config = currentConfig;
        const profile: WalletProfile = { id: this.createId(), name: normalized, config: this.emptyConfig };
        store.profiles.push(profile);
        store.activeId = profile.id;
        if (!await this.writeStore(store)) return false;
        if (await SecureStorage.setVal(this.activeConfigKey, profile.config) !== false) return profile.id;
        store.profiles = store.profiles.filter(item => item.id !== profile.id);
        store.activeId = current.id;
        await this.writeStore(store);
        await SecureStorage.setVal(this.activeConfigKey, currentConfig);
        return false;
    }
}
