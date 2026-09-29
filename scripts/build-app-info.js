const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '..', 'package.json'));
const output = `window.CRYPTPASS_APP_INFO = ${JSON.stringify({ version: packageJson.version })};\n`;
fs.writeFileSync(path.join(__dirname, '..', 'www', 'js', 'app-info.js'), output);
console.log(`Application version ${packageJson.version} written to www/js/app-info.js`);
