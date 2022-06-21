
class SecureStorage {

    public static async getVal(key: string): Promise<string|false> {
        try {
            switch (cordova.platformId) {
                case 'electron':
                    const val = window.localStorage.getItem(key);
                    return val === null ? false : val;
                case 'android':
                    return new Promise((resolve, reject)=> {
                        cordova.plugins.SecureKeyStore.get(resolve, reject, key);
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
                    return new Promise((resolve, reject)=> {
                        cordova.plugins.SecureKeyStore.set(resolve, reject, key, value);
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
