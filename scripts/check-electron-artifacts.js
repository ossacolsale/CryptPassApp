const fs = require('node:fs');
const path = require('node:path');
const { version } = require('../package.json');
const [platform, directory = 'platforms/electron/build'] = process.argv.slice(2);
const formats = {
    windows: [['exe', Buffer.from('MZ')]],
    linux: [['AppImage', Buffer.from([0x7f, 0x45, 0x4c, 0x46])], ['deb', Buffer.from('!<arch>\n')]]
};
if (![...Object.keys(formats), 'all'].includes(platform)) throw new Error('Expected windows, linux or all');
for (const name of platform === 'all' ? Object.keys(formats) : [platform]) {
    for (const [extension, magic] of formats[name]) {
        const file = path.join(directory, `CryptPass-${version}-${name}-x64.${extension}`);
        const contents = fs.readFileSync(file);
        if (contents.length <= magic.length || !contents.subarray(0, magic.length).equals(magic)) {
            throw new Error(`Missing or invalid distributable: ${file}`);
        }
        console.log(`${file} (${contents.length} bytes)`);
    }
}
