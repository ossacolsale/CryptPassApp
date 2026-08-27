// Creazione istanza (nome arbitrario, es. 'cryptpass_store')
const secureStorage: SecureStorageInstance = new cordova.plugins.SecureStorage(
    function () { console.log('Secure Storage inizializzato'); },
    function (error) { console.error('Errore inizializzazione Secure Storage:', error); },
    'cryptpass_store' // <--- Nome del namespace delle tue chiavi
);


class SecureStorage {

    public static async getVal(key: string): Promise<string|false> {
        try {
            switch (cordova.platformId) {
                case 'electron':
                    const val = window.localStorage.getItem(key);
                    return val === null ? false : val;
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
                    window.localStorage.setItem(key, value);
                    return key;
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
                                console.error('Errore salvataggio sicuro:', error);
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
                    const val = window.localStorage.removeItem(key);
                    return key;
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
