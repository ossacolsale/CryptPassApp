// Creazione istanza (nome arbitrario, es. 'cryptpass_store')
const secureStorage: SecureStorageInstance = new cordova.plugins.SecureStorage(
    function () { /* Initialization completed. */ },
    function () { /* Secure storage errors are handled at the call site. */ },
    'cryptpass_store' // <--- Nome del namespace delle tue chiavi
);


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
                    return new Promise((resolve, reject) => {
                        secureStorage.get(
                            function (value) { 
                                resolve(value); 
                            },
                            function (error) { 
                                if (error && error.message && error.message.indexOf('not found') !== -1) {
                                    resolve(false); // Nessuna config trovata
                                } else {
                                    reject(error);
                                }
                            },
                            key
                        );
                    });
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
                    return new Promise((resolve, reject) => {
                        secureStorage.set(
                            function (key) { 
                                resolve(key); 
                            },
                            function (error) { 
                                reject(error); 
                            },
                            key,
                            value
                        );
                    });
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
