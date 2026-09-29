interface CryptPassStoragePlugin {
    selectVaultFolder(): Promise<{
        treeUri: string;
        files: Array<{
            name: string;
            relativePath: string;
        }>;
    }>;
    resolveFileInTree(treeUri: string, relativePath: string): Promise<string>;
    createFileInTree(treeUri: string, fileName: string, contents: string): Promise<string>;
    readFile(uri: string): Promise<string>;
    writeFile(uri: string, contents: string): Promise<void>;
}

interface CordovaPlugins {
    cryptPassStorage: CryptPassStoragePlugin;
}
