const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const packageFile = path.join(root, 'node_modules', 'cordova-electron', 'package.json');
const buildFile = path.join(root, 'node_modules', 'cordova-electron', 'lib', 'build.js');
if (!fs.existsSync(packageFile) || !fs.existsSync(buildFile)) process.exit(0);
const version = require(packageFile).version;
if (version !== '4.0.0') throw new Error(`Expected cordova-electron 4.0.0, found ${version}`);

let source = fs.readFileSync(buildFile, 'utf8');
const start = source.indexOf('    build () {');
const end = source.indexOf('\n    }\n}', start);
if (start < 0 || end < 0) throw new Error('Cannot locate cordova-electron build() implementation');
const method = `    build () {
        const { Platform, Arch } = require('app-builder-lib');
        const config = { ...(this.buildSettings.config || {}) };
        const buildOptions = { projectDir: this.api.locations.www, config };
        const targets = new Map();
        for (const [name, platform] of [['linux', Platform.LINUX], ['mac', Platform.MAC], ['win', Platform.WINDOWS]]) {
            const settings = config[name];
            if (!settings) continue;
            const byArch = new Map();
            for (const target of settings.target || []) {
                for (const archName of target.arch || ['x64']) {
                    const arch = Arch[archName];
                    const names = byArch.get(arch) || [];
                    names.push(target.target);
                    byArch.set(arch, names);
                }
            }
            if (byArch.size) targets.set(platform, byArch);
        }
        buildOptions.targets = targets;
        return require('electron-builder').build(buildOptions);
    }`;
source = source.slice(0, start) + method + source.slice(end + 6);
const signingStart = source.indexOf('    __appendWindowsUserSigning (config, buildConfigs) {');
const signingEnd = source.indexOf('\n    }\n\n    configureBuildSettings', signingStart);
if (signingStart < 0 || signingEnd < 0) throw new Error('Cannot locate Windows signing implementation');
const signing = `    __appendWindowsUserSigning (config, buildConfigs) {
        if (!buildConfigs.signtoolOptions) buildConfigs.signtoolOptions = {};
        const options = buildConfigs.signtoolOptions;
        const certificateFile = config.certificateFile || process.env.CSC_LINK;
        if (certificateFile && fs.existsSync(certificateFile)) options.certificateFile = certificateFile;
        else if (certificateFile) events.emit('warn', 'The configured Windows signing certificate cannot be found.');
        if (config.certificatePassword || process.env.CSC_KEY_PASSWORD) options.certificatePassword = config.certificatePassword || process.env.CSC_KEY_PASSWORD;
        if (config.certificateSubjectName) options.certificateSubjectName = config.certificateSubjectName;
        if (config.certificateSha1) options.certificateSha1 = config.certificateSha1;
        if (config.additionalCertificateFile && fs.existsSync(config.additionalCertificateFile)) options.additionalCertificateFile = config.additionalCertificateFile;
    }`;
source = source.slice(0, signingStart) + signing + source.slice(signingEnd + 6);
source = source.replace("        console.log('BUILDER_OPTIONS', JSON.stringify(buildOptions));\n", '');
fs.writeFileSync(buildFile, source);
