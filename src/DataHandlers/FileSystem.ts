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
    private static treeGrantKey(uri: string): string { return 'cryptPassDocumentTree:' + uri; }

    private static saveTreeGrant(uri: string, treeUri: string, name: string): void {
        window.localStorage.setItem(this.treeGrantKey(uri), JSON.stringify({ treeUri: treeUri, name: name }));
    }

    private static async selectVaultFolder(): Promise<{ treeUri: string; files: Array<{ name: string; relativePath: string }> }> {
        return new Promise((resolve, reject) => (cordova.exec as any)(
            (result: string | { treeUri: string; files: Array<{ name: string; relativePath: string }> }) => {
                try { resolve(typeof result === 'string' ? JSON.parse(result) : result); }
                catch (error) { reject(error); }
            },
            reject,
            'Chooser',
            'selectVaultFolder',
            []
        ));
    }

    private static async resolveUri(uri: string): Promise<string | false> {
        const raw = window.localStorage.getItem(this.treeGrantKey(uri));
        if (!raw) return uri;
        try {
            const grant = JSON.parse(raw) as { treeUri: string; name: string };
            return await new Promise((resolve, reject) => (cordova.exec as any)(
                (liveUri: string) => resolve(liveUri), reject, 'Chooser', 'resolveFileInTree', [grant.treeUri, grant.name]
            ));
        } catch (_) { return false; }
    }
    
    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        try {
            const blob = new Blob([fileContent], {type: defaultMimeType});
            const uri = await cordova.plugins.saveDialog.getFileUri(blob, fileName);
            await cordova.plugins.saveDialog.saveFileByUri(blob, uri);
            let stableUri = uri;
            try {
                const selectedFolder = await this.selectVaultFolder();
                const file = selectedFolder.files.find(candidate => candidate.name === fileName);
                if (file) {
                    stableUri = 'cryptpass-tree:' + encodeURIComponent(selectedFolder.treeUri) + '#/' + encodeURIComponent(file.relativePath);
                    this.saveTreeGrant(stableUri, selectedFolder.treeUri, file.relativePath);
                } else {
                    alert(Localization.text('file.folderGrantSkipped'));
                }
            } catch (_) {
                alert(Localization.text('file.folderGrantSkipped'));
            }
            window.localStorage.setItem(stableUri,fileContent);//backup
            return stableUri;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async WriteFile (uri: string, fileContent: string): Promise<boolean> {
        try {
            const blob = new Blob([fileContent], {type: defaultMimeType});
            const liveUri = await this.resolveUri(uri);
            if (liveUri === false) return false;
            const uri_content = await this.ReadFile(uri);
            const uri_bk_content = window.localStorage.getItem(uri);//encrypted-vault recovery copy
            if (uri_content !== false && uri_content !== uri_bk_content)
                window.localStorage.setItem(uri, uri_content);
            if (uri_content === false && uri_bk_content === null)
                window.localStorage.setItem(uri, fileContent);
            await cordova.plugins.saveDialog.saveFileByUri(blob, liveUri);
            return true;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async ReadFile (uri: string): Promise<string|false> {
        try {
            const liveUri = await this.resolveUri(uri);
            if (liveUri === false) return false;
            return await CommonHelpers.withTimeout(chooser.readFile(liveUri), 'Vault file read');
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    } 

    public static async SelectAndReadFile (): Promise<Array<FileChooserResult>|false> {
        try {
            const selectedFolder = await this.selectVaultFolder();
            if (selectedFolder.files.length === 0) {
                alert(Localization.text('file.noVaultFilesInFolder'));
                return false;
            }
            return selectedFolder.files.map(file => {
                const uri = 'cryptpass-tree:' + encodeURIComponent(selectedFolder.treeUri) + '#/' + encodeURIComponent(file.relativePath);
                this.saveTreeGrant(uri, selectedFolder.treeUri, file.relativePath);
                return { uri: uri, name: file.name, mediaType: defaultMimeType, content: '' };
            });
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
