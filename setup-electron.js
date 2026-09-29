const path = require('path');
const fs = require('fs');

const platformDir = path.join(__dirname, 'platforms/electron/platform_www');
const mainPath = path.join(platformDir, 'cdv-electron-main.js');
const preloadPath = path.join(platformDir, 'cdv-electron-preload.js');

const mainAppend = `

// CryptPass narrow desktop API. Renderer supplied paths are never accepted.
const { safeStorage, dialog, shell } = require('electron');
const crypto = require('crypto');
const cryptPassVaults = new Map();
let cryptPassSecureFile;
let cryptPassSecureValues = { values: { cryptPassCfg: null, cryptPassWalletProfiles: null }, vaults: {} };
let cryptPassReady = app.whenReady().then(() => {
    cryptPassSecureFile = path.join(app.getPath('userData'), 'cryptpass-secure.bin');
    if (!fs.existsSync(cryptPassSecureFile)) return;
    if (!cryptPassHasStrongStorage()) throw new Error('Secure storage unavailable');
    const encrypted = fs.readFileSync(cryptPassSecureFile);
    const restored = JSON.parse(safeStorage.decryptString(encrypted));
    if (!restored || typeof restored !== 'object' || !restored.values || typeof restored.values !== 'object' ||
        !restored.vaults || typeof restored.vaults !== 'object' ||
        Object.values(restored.vaults).some(filePath => typeof filePath !== 'string')) {
        throw new Error('Secure storage data is invalid');
    }
    cryptPassSecureValues = restored;
    for (const [id, filePath] of Object.entries(cryptPassSecureValues.vaults)) cryptPassVaults.set(id, filePath);
});

function cryptPassHasStrongStorage() {
    return safeStorage.isEncryptionAvailable() && safeStorage.getSelectedStorageBackend() !== 'basic_text';
}
function cryptPassAssertSender(event) {
    const frame = event.senderFrame;
    if (!mainWindow || event.sender !== mainWindow.webContents || !frame || frame !== mainWindow.webContents.mainFrame || !frame.url.startsWith(basePath)) {
        throw new Error('Request rejected');
    }
}
function cryptPassHandle(channel, handler) {
    ipcMain.handle(channel, async (event, ...args) => {
        cryptPassAssertSender(event);
        try { return await handler(...args); } catch (_) { return false; }
    });
}
async function cryptPassPersist() {
    await cryptPassReady;
    if (!cryptPassHasStrongStorage()) throw new Error('Secure storage unavailable');
    cryptPassSecureValues.vaults = Object.fromEntries(cryptPassVaults);
    const encrypted = safeStorage.encryptString(JSON.stringify(cryptPassSecureValues));
    const temp = cryptPassSecureFile + '.' + crypto.randomBytes(8).toString('hex') + '.tmp';
    await fs.promises.writeFile(temp, encrypted, { mode: 0o600 });
    await fs.promises.rename(temp, cryptPassSecureFile);
}
async function cryptPassWriteAtomically(filePath, content) {
    const temp = filePath + '.' + crypto.randomBytes(8).toString('hex') + '.tmp';
    try {
        await fs.promises.writeFile(temp, content, { encoding: 'utf8', mode: 0o600 });
        await fs.promises.rename(temp, filePath);
        return true;
    } catch (_) {
        try { await fs.promises.unlink(temp); } catch (_) {}
        return false;
    }
}
function cryptPassNewHandle() { return crypto.randomBytes(32).toString('hex'); }

cryptPassHandle('cryptpass:openVault', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'CryptPass vault', extensions: ['txt', 'json', '*'] }] });
    if (result.canceled || !result.filePaths[0]) return false;
    try {
        const filePath = result.filePaths[0];
        const content = await fs.promises.readFile(filePath, 'utf8');
        const handle = cryptPassNewHandle();
        cryptPassVaults.set(handle, filePath);
        await cryptPassPersist();
        return { handle, name: path.basename(filePath), content };
    } catch (_) { return false; }
});
cryptPassHandle('cryptpass:createVault', async (fileName, content) => {
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath: fileName, filters: [{ name: 'CryptPass vault', extensions: ['txt', 'json'] }] });
    if (result.canceled || !result.filePath) return false;
    if (!await cryptPassWriteAtomically(result.filePath, content)) return false;
    const handle = cryptPassNewHandle();
    cryptPassVaults.set(handle, result.filePath);
    await cryptPassPersist();
    return handle;
});
cryptPassHandle('cryptpass:readVault', async (handle) => {
    await cryptPassReady;
    const filePath = typeof handle === 'string' ? cryptPassVaults.get(handle) : null;
    if (!filePath) return false;
    try { return await fs.promises.readFile(filePath, 'utf8'); } catch (_) { return false; }
});
cryptPassHandle('cryptpass:saveVault', async (handle, content) => {
    await cryptPassReady;
    const filePath = typeof handle === 'string' ? cryptPassVaults.get(handle) : null;
    if (!filePath || typeof content !== 'string') return false;
    return cryptPassWriteAtomically(filePath, content);
});
cryptPassHandle('cryptpass:secureStorageStatus', async () => {
    await cryptPassReady;
    return {
        ready: true,
        available: safeStorage.isEncryptionAvailable(),
        backend: process.platform === 'linux' ? safeStorage.getSelectedStorageBackend() : process.platform
    };
});
cryptPassHandle('cryptpass:focusWindow', async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.focus();
    return true;
});
cryptPassHandle('cryptpass:secureGet', async (key) => {
    await cryptPassReady;
    return ['cryptPassCfg', 'cryptPassWalletProfiles'].includes(key) ? (cryptPassSecureValues.values[key] || false) : false;
});
cryptPassHandle('cryptpass:secureSet', async (key, value) => {
    await cryptPassReady;
    if (!['cryptPassCfg', 'cryptPassWalletProfiles'].includes(key) || typeof value !== 'string') return false;
    cryptPassSecureValues.values[key] = value;
    await cryptPassPersist();
    return key;
});
cryptPassHandle('cryptpass:secureDelete', async (key) => {
    await cryptPassReady;
    if (!['cryptPassCfg', 'cryptPassWalletProfiles'].includes(key)) return false;
    cryptPassSecureValues.values[key] = null;
    await cryptPassPersist();
    return key;
});
app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-navigate', (event, url) => {
        try {
            const target = new URL(url);
            const allowed = isFileProtocol
                ? target.protocol === 'file:' && path.resolve(decodeURIComponent(target.pathname)).startsWith(path.resolve(__dirname) + path.sep)
                : target.protocol === scheme + ':' && target.host === hostname;
            if (!allowed) {
                event.preventDefault();
                if (target.protocol === 'https:' && ['giancarlomangiagli.it', 'www.giancarlomangiagli.it'].includes(target.hostname)) {
                    void shell.openExternal(target.href);
                }
            }
        } catch (_) { event.preventDefault(); }
    });
});
app.on('browser-window-created', (_, window) => {
    window.on('minimize', () => window.webContents.send('cryptpass:lock'));
});
require('electron').Menu.setApplicationMenu(null);
`;
const preloadAppend = `

contextBridge.exposeInMainWorld('cryptPassDesktop', {
    openVault: () => ipcRenderer.invoke('cryptpass:openVault'),
    createVault: (name, content) => ipcRenderer.invoke('cryptpass:createVault', name, content),
    readVault: (handle) => ipcRenderer.invoke('cryptpass:readVault', handle),
    saveVault: (handle, content) => ipcRenderer.invoke('cryptpass:saveVault', handle, content),
    secureStorageStatus: () => ipcRenderer.invoke('cryptpass:secureStorageStatus'),
    secureGet: (key) => ipcRenderer.invoke('cryptpass:secureGet', key),
    secureSet: (key, value) => ipcRenderer.invoke('cryptpass:secureSet', key, value),
    secureDelete: (key) => ipcRenderer.invoke('cryptpass:secureDelete', key),
    focusWindow: () => ipcRenderer.invoke('cryptpass:focusWindow'),
    onLockRequested: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('cryptpass:lock', handler);
        return () => ipcRenderer.removeListener('cryptpass:lock', handler);
    }
});
`;

try {
    let main = fs.readFileSync(mainPath, 'utf8');
    let preload = fs.readFileSync(preloadPath, 'utf8');
    main = main.replace(/\nipcMain\.handle\('fsread'[\s\S]*?require\('electron'\)\.Menu\.setApplicationMenu\(null\);\s*/, '\n');
    main = main.replace("ipcMain.handle('cdv-plugin-exec', async (_, serviceName, action, ...args) => {", "ipcMain.handle('cdv-plugin-exec', async (event, serviceName, action, ...args) => {\n    cryptPassAssertSender(event);");
    preload = preload.replace(/\ncontextBridge\.exposeInMainWorld\('fs',[\s\S]*?\n\}\);\s*/, '\n');
    const mainAppendStart = main.indexOf('// CryptPass narrow desktop API.');
    if (mainAppendStart === -1) main += mainAppend;
    else main = main.slice(0, mainAppendStart) + mainAppend;
    preload = preload.replace(/\ncontextBridge\.exposeInMainWorld\('cryptPassDesktop',[\s\S]*?\n\}\);\s*/, '\n');
    preload += preloadAppend;
    // Cordova's Electron builder packages platforms/electron/www, while the
    // after_prepare hook runs against platform_www. Keep both generated copies in sync.
    for (const directory of [platformDir, path.join(__dirname, 'platforms/electron/www')]) {
        if (!fs.existsSync(directory)) continue;
        fs.writeFileSync(path.join(directory, 'cdv-electron-main.js'), main);
        fs.writeFileSync(path.join(directory, 'cdv-electron-preload.js'), preload);
    }
    console.log('Electron security boundary configured');
} catch (error) {
    console.error('Electron configuration failed');
    process.exitCode = 1;
}
