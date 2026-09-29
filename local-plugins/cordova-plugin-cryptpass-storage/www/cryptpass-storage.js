const exec = require('cordova/exec');

function call(action, args) {
    return new Promise((resolve, reject) => {
        exec(resolve, reject, 'CryptPassStorage', action, args);
    });
}

function callDeviceAuth(action, args) {
    return new Promise((resolve, reject) => {
        exec(resolve, reject, 'CryptPassDeviceAuth', action, args);
    });
}

module.exports = {
    selectVaultFolder() {
        return call('selectVaultFolder', []);
    },
    resolveFileInTree(treeUri, relativePath) {
        return call('resolveFileInTree', [treeUri, relativePath]);
    },
    createFileInTree(treeUri, fileName, contents) {
        return call('createFileInTree', [treeUri, fileName, contents]);
    },
    readFile(uri) {
        return call('readFile', [uri]);
    },
    writeFile(uri, contents) {
        return call('writeFile', [uri, contents]);
    },
    deviceAuth: {
        hasScreenLock() {
            return callDeviceAuth('hasScreenLock', []).then(result => result === 'true');
        },
        confirm(title, description) {
            return callDeviceAuth('confirm', [title, description]).then(result => result === 'true');
        },
        showKeyboard() {
            return callDeviceAuth('showKeyboard', []);
        }
    }
};
