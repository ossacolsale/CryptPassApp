const path = require('path');
const fs = require('fs');

try {


    const path_base = path.join(__dirname,'platforms/electron/platform_www/');
    const path_main = path_base + 'cdv-electron-main.js';
    const path_preload = path_base + 'cdv-electron-preload.js';

    const main_append = `

ipcMain.handle('fsread', (_,uri) => {
    try {
        return fs.readFileSync(uri).toString();
    } catch (e) {
        console.log(e);
        return false;
    }
});
ipcMain.handle('fswrite', (_,uri,data) => {
    try {
        fs.writeFileSync(uri,data);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
});
require('electron').Menu.setApplicationMenu(null);
`;
    const preload_append = `

contextBridge.exposeInMainWorld('fs',{
    readFileSync: (uri) => ipcRenderer.invoke('fsread',uri),
    writeFileSync: (uri, content) => ipcRenderer.invoke('fswrite',uri,content)
});
`;

    const main_content = fs.readFileSync(path_main).toString();
    const preload_content = fs.readFileSync(path_preload.toString());

    if (main_content.indexOf(main_append) == -1) {
        fs.writeFileSync(path_main,main_content + main_append);
    }

    if (preload_content.indexOf(preload_append) == -1) {
        fs.writeFileSync(path_preload,preload_content+preload_append);
    }

    console.log('Everything correctly configured');

} catch (e) {
    console.log('Error: ',e);
}