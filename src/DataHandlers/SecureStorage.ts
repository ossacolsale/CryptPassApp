// The Cordova plugin is available on Android; Electron uses the desktop preload bridge.
// Instantiate lazily so Electron never asks Cordova for a missing plugin proxy.
let androidSecureStorage: SecureStorageInstance | undefined;
let androidSecureStorageReady: Promise<SecureStorageInstance> | undefined;

function getAndroidSecureStorage(): Promise<SecureStorageInstance> {
    if (!androidSecureStorageReady) {
        androidSecureStorageReady = new Promise<SecureStorageInstance>((resolve, reject) => {
            androidSecureStorage = new cordova.plugins.SecureStorage(
                () => resolve(androidSecureStorage!),
                reject,
                'cryptpass_store'
            );
        }).catch(error => {
            androidSecureStorage = undefined;
            androidSecureStorageReady = undefined;
            throw error;
        });
    }
    return androidSecureStorageReady!;
}


class SecureStorage {

    public static async getVal(key: string): Promise<string|false> {
        try {
            switch (cordova.platformId) {
                case 'electron': {
                    const val = await window.cryptPassDesktop?.secureGet(key);
                    if (val !== false && val !== undefined) return val;
                    // One-time migration from the former renderer localStorage implementation.
                    const legacy = window.localStorage.getItem(key);
                    if (legacy === null) return false;
                    const saved = await window.cryptPassDesktop?.secureSet(key, legacy);
                    if (saved === false || saved === undefined) return false;
                    window.localStorage.removeItem(key);
                    return legacy;
                }
                case 'android':
                    /*return new Promise((resolve, reject)=> {
                        cordova.plugins.SecureKeyStore.get(resolve, reject, key);
                    });*/
                    const storage = await CommonHelpers.withTimeout(getAndroidSecureStorage(), 'Android secure storage initialization');
                    return CommonHelpers.withTimeout(new Promise((resolve, reject) => {
                        storage.get(
                            function (value) { resolve(value); },
                            function (error) {
                                if (error && error.message && error.message.toLowerCase().indexOf('not found') !== -1) {
                                    resolve(false);
                                } else {
                                    reject(error);
                                }
                            },
                            key
                        );
                    }), 'Android secure storage');
                default:
                    return false;
            }
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }
    
    public static async setVal(key: string, value: string): Promise<string|false> {
        try {
            switch (cordova.platformId) {
                case 'electron':
                    return await window.cryptPassDesktop?.secureSet(key, value) ?? false;
                case 'android':
                    /*
                    return new Promise((resolve, reject)=> {
                        cordova.plugins.SecureKeyStore.set(resolve, reject, key, value);
                    });*/
                    const storage = await CommonHelpers.withTimeout(getAndroidSecureStorage(), 'Android secure storage initialization');
                    return CommonHelpers.withTimeout(new Promise((resolve, reject) => {
                        storage.set(
                            function (storedKey) { resolve(storedKey); },
                            reject,
                            key,
                            value
                        );
                    }), 'Android secure storage');
                default:
                    return false;
            }
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
        
    }

    public static async delVal(key: string): Promise<string|false> {
        try {

            switch (cordova.platformId) {
                case 'electron':
                    window.localStorage.removeItem(key);
                    return await window.cryptPassDesktop?.secureDelete(key) ?? false;
                case 'android':
                    return new Promise((resolve, reject)=> {
                        cordova.plugins.SecureKeyStore.remove(resolve, reject, key);
                    });
                default:
                    return false;
            }
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

}
