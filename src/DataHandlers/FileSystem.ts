const defaultMimeType: string = 'text/plain';

class ElectronFS {


    protected static async fwrite (fileContent: string, fileUri: string): Promise<boolean> {
        try {
            await fs.writeFileSync(fileUri, fileContent);
            return true;
        } catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    protected static async fread (fileUri: string): Promise<string|false> {
        try {
            return fs.readFileSync(fileUri);
        } catch (e) {
            return CommonHelpers.StandardError(e);
        }   
    }

    protected static async selectFile (): Promise<ElectronFile|null> {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = defaultMimeType;
        return new Promise((resolve, reject) => {
            input.onchange = _this => {
                if (input.files !== null) {
                    resolve(input.files[0] as ElectronFile);
                } else {
                    reject(null);
                }
            };
            input.click();
        });
    }

    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        try {
            const file = await this.selectFile();
            if (file !== null) {
                await this.fwrite(fileContent, file.path);
                window.localStorage.setItem(file.path,fileContent);
                return file.path;
            }
            else throw new Error('No file selected');
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async WriteFile (uri: string, fileContent: string): Promise<boolean> {
        try {
            const uri_content = await this.fread(uri);
            const uri_bk_content = window.localStorage.getItem(uri);//backup
            this.fwrite(fileContent, uri);
            if (uri_content !== false && uri_content != uri_bk_content)
                window.localStorage.setItem(uri, uri_content);
            if (uri_content === false && uri_bk_content === null)
                window.localStorage.setItem(uri, fileContent);
            return true;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    public static async ReadFile (uri: string): Promise<string|false> {
        try {
            return this.fread(uri);
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    } 

    public static async SelectAndReadFile (): Promise<Array<FileChooserResult>|false> {
        try {
            const file = await this.selectFile();
            if (file !== null) {
                const content = await this.fread(file.path);
                if (content !== false)
                    return [{
                        uri: file.path,
                        name: file.name,
                        mediaType: file.type,
                        content: content
                    }];
                else throw new Error('Error reading file');
            }
            else throw new Error('No file selected');
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }
}

class AndroidFS {
    
    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        try {
            const blob = new Blob([fileContent], {type: defaultMimeType});
            const uri = await cordova.plugins.saveDialog.getFileUri(blob, fileName);
            await cordova.plugins.saveDialog.saveFileByUri(blob, uri);
            window.localStorage.setItem(uri,fileContent);//backup
            await this.getGrantOnDir(uri);
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
            const uri_bk_content = window.localStorage.getItem(uri);//backup
            await cordova.plugins.saveDialog.saveFileByUri(blob, uri);
            if (uri_content !== false && uri_content != uri_bk_content)
                window.localStorage.setItem(uri, uri_content);
            if (uri_content === false && uri_bk_content === null)
                window.localStorage.setItem(uri, fileContent);
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
                await this.getGrantOnDir(chooserResult[0].uri);
                return chooserResult;
            } else return false;
        }
        catch (e) {
            return CommonHelpers.StandardError(e);
        }
    }

    protected static async getGrantOnDir (startPath: string): Promise<boolean> {
        return true; //temporary disabled
        alert('Please grant permanent access to the selected directory.');
        return await chooser.grantDir(startPath,()=>null,()=>null);
    }
}



class FS {
    
    public static async NewFile (fileName: string, fileContent: string): Promise<string | false> {
        switch(cordova.platformId) {
            case 'android':
                return AndroidFS.NewFile(fileName, fileContent);
            case 'electron':
                alert('You must create an empty txt file and then select it');
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

