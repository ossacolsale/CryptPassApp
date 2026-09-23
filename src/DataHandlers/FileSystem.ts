const defaultMimeType: string = 'text/plain';

class ElectronFS {
    protected static get desktop(): CryptPassDesktopAPI {
        if (!window.cryptPassDesktop) throw new Error('Desktop file service unavailable');
        return window.cryptPassDesktop;
    }

    public static async NewFile(fileName: string, fileContent: string): Promise<string | false> {
        try { return await this.desktop.createVault(fileName, fileContent); }
        catch (e) { return CommonHelpers.StandardError(e); }
    }

    public static async WriteFile(handle: string, fileContent: string): Promise<boolean> {
        try { return await this.desktop.saveVault(handle, fileContent); }
        catch (e) { return CommonHelpers.StandardError(e); }
    }

    public static async ReadFile(handle: string): Promise<string | false> {
        try { return await this.desktop.readVault(handle); }
        catch (e) { return CommonHelpers.StandardError(e); }
    }

    public static async SelectAndReadFile(): Promise<Array<FileChooserResult> | false> {
        try {
            const selected = await this.desktop.openVault();
            if (!selected) return false;
            return [{ uri: selected.handle, name: selected.name, mediaType: defaultMimeType, content: selected.content }];
        } catch (e) { return CommonHelpers.StandardError(e); }
    }
}

class AndroidFS {
    
    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        try {
            const blob = new Blob([fileContent], {type: defaultMimeType});
            const uri = await cordova.plugins.saveDialog.getFileUri(blob, fileName);
            await cordova.plugins.saveDialog.saveFileByUri(blob, uri);
            window.localStorage.setItem(uri,fileContent);//backup
            return uri;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async WriteFile (uri: string, fileContent: string): Promise<boolean> {
        try {
            const blob = new Blob([fileContent], {type: defaultMimeType});
            const uri_content = await this.ReadFile(uri);
            const uri_bk_content = window.localStorage.getItem(uri);//encrypted-vault recovery copy
            if (uri_content !== false && uri_content !== uri_bk_content)
                window.localStorage.setItem(uri, uri_content);
            if (uri_content === false && uri_bk_content === null)
                window.localStorage.setItem(uri, fileContent);
            await cordova.plugins.saveDialog.saveFileByUri(blob, uri);
            return true;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async ReadFile (uri: string): Promise<string|false> {
        try {
            return await chooser.readFile(uri);
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    } 

    public static async SelectAndReadFile (): Promise<Array<FileChooserResult>|false> {
        try {
            const chooserResult = await chooser.getFiles(defaultMimeType,() => null, ()=>null);
            if (chooserResult.length > 0) {
                return chooserResult;
            } else return false;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

}



class FS {
    
    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        switch(cordova.platformId) {
            case 'android':
                return AndroidFS.NewFile(fileName, fileContent);
            case 'electron':
                return ElectronFS.NewFile(fileName, fileContent);
            default:
                return false;
        }
    }

    public static async WriteFile (uri: string, fileContent: string): Promise<boolean> {
        switch(cordova.platformId) {
            case 'android':
                return AndroidFS.WriteFile(uri, fileContent);
            case 'electron':
                return ElectronFS.WriteFile(uri, fileContent);
            default:
                return false;
        }
    }

    public static ReadFileBackup (uri: string): string|null {
        return window.localStorage.getItem(uri);
    }

    public static async ReadFile (uri: string): Promise<string|false> {
        switch(cordova.platformId) {
            case 'android':
                return AndroidFS.ReadFile(uri);
            case 'electron':
                return ElectronFS.ReadFile(uri);
            default:
                return false;
        }
    } 

    public static async SelectAndReadFile (): Promise<Array<FileChooserResult>|false> {
        switch(cordova.platformId) {
            case 'android':
                return AndroidFS.SelectAndReadFile();
            case 'electron':
                return ElectronFS.SelectAndReadFile();
            default:
                return false;
        }
    } 
}

