interface config {
    KeyFilePath: string,
    Sequence: string
}

type Sequence = { Sequence: number[] };

type ConfigStatus = 'OK' | 'FatalError' | 'KO' | 'MissingKeypass' | 'EmptySequence' | 'EmptyKeypass';

class Config {
    
    protected static readonly emptySequence: Sequence = { Sequence: [] };
    protected static readonly configName = 'cryptPassCfg';
    protected static readonly defaultKeyPassFilename = 'keypass.json';
    protected static readonly defaultConfig: config = {    KeyFilePath: '',
                                                    Sequence: '{"Sequence": []}' };
    
    public static async ConfigInit() {
        return this.setConfig(this.defaultConfig);
    }

    public static async readData(): Promise<{kp: {}, se: {}}> {
        const kp = await this.readKeyPass();
        const se = await this.readSequence();
        return {kp: kp, se: se};
    }

    protected static async setConfig (cfg: config): Promise<boolean> {
        return await SecureStorage.setVal(this.configName,JSON.stringify(cfg)) !== false;
    }

    protected static async getConfig (): Promise<config | false> {
        const config = await SecureStorage.getVal(this.configName);
        if (config !== false)
            return JSON.parse(config) as config;
        else {
            return false;
        }
            
    }

    public static async getStatus (): Promise<ConfigStatus> {
        
        const keypass = await this.readKeyPass();        
        const sequence = await this.readSequence();
        const keypassOK = keypass !== false;
        const keypassNotEmpty = keypassOK && JSON.stringify(keypass as {}) !== JSON.stringify({});
        const sequenceOK = sequence !== false && (sequence as Sequence).Sequence.length != 0;

        if (keypassNotEmpty && sequenceOK) return 'OK';
        if (!keypassOK && !sequenceOK) return 'KO';
        if (!keypassOK) return 'MissingKeypass';
        if (!keypassNotEmpty) return 'EmptyKeypass';
        if (!sequenceOK) return 'EmptySequence';
        return 'KO';
    }

    protected static async readSequence (): Promise<{}> {
        const cfg = await this.getConfig();
        if (cfg !== false) {
            return JSON.parse(cfg.Sequence);
        }
        else return this.emptySequence;
    }

    public static async writeSequence (seq: {}): Promise<boolean> {
        const s = JSON.stringify(seq);
        const cfg = await this.getConfig();
        if (cfg !== false) {
            cfg.Sequence = s;
            return this.setConfig(cfg);
        } else {
            const newCfg = this.defaultConfig;
            newCfg.Sequence = s;
            return this.setConfig(newCfg);
        }
    }

    protected static async getKeyPassPath (): Promise<string|false> {
        const cfg = await this.getConfig();
        if (cfg !== false) {
            return cfg.KeyFilePath !== '' ?
                cfg.KeyFilePath : false;
        }
        else return false;
    }

    public static async readKeyPass (): Promise<{}|false> {
        const kpPath = await this.getKeyPassPath();
        if (kpPath !== false) {
            const fileContent = await FS.ReadFile(kpPath);
            return (fileContent !== false && fileContent !== null) ? JSON.parse(fileContent) : false;
        }
        else return false;
    }

    public static async writeKeyPass (kp: {}): Promise<boolean> {
        const kpPath = await this.getKeyPassPath();
        if (kpPath !== false) {
            return FS.WriteFile(kpPath, JSON.stringify(kp));
        }
        else return false;
    }

    public static async newKeyPass (kp: {} = {}): Promise<boolean> {
        const uri = await FS.NewFile(this.defaultKeyPassFilename,JSON.stringify(kp));
        if (uri !== false) {
            return this.setKeyPassUri(uri);
        } else return false;
    }

    /*public static async selectKeyPass (): Promise<{}|false> {
        const file = await AndroidFS.SelectAndReadFile();
        if (file !== false) {
            return await this.setKeyPassUri(file.uri) !== false ? file.content : false;
        } else return false;
    }*/

    public static async selectKeyPassUri (): Promise<string|false> {
        const file = await FS.SelectAndReadFile();
        if (file !== false) {
            return file[0].uri;
        } else return false;
    }

    public static async setKeyPassUri(uri: string): Promise<boolean> {
        const cfg = await this.getConfig();
        if (cfg !== false) {
            cfg.KeyFilePath = uri;
            return this.setConfig(cfg);
        } else {
            const newCfg = this.defaultConfig;
            newCfg.KeyFilePath = uri;
            return this.setConfig(newCfg);
        }
    }

}
