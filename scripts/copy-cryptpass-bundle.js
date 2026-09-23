const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, '..', 'node_modules', 'cryptpass', 'dist', 'LibCryptPass.js');
const target = path.join(__dirname, '..', 'www', 'js', 'LibCryptPass.js');
fs.copyFileSync(source, target);
console.log('Copied pinned CryptPass browser bundle');
