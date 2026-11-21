const fs = require('node:fs');
const { version } = require('../package.json');
const lock = require('../package-lock.json');
const xml = fs.readFileSync(require('node:path').join(__dirname, '..', 'config.xml'), 'utf8');
const widgetVersion = xml.match(/<widget\b[^>]*\bversion="([^"]+)"/)?.[1];
if (!/^\d+\.\d+\.\d+$/.test(version) || widgetVersion !== version) {
    throw new Error('package.json and config.xml must have the same stable version');
}
if (lock.version !== version || lock.packages?.['']?.version !== version) {
    throw new Error('Both root versions in package-lock.json must match package.json');
}
if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME !== `v${version}`) {
    throw new Error(`Expected tag v${version}`);
}
console.log(version);
