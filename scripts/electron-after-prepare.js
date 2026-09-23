module.exports = function (context) {
    const platforms = context && context.opts && context.opts.platforms;
    if (Array.isArray(platforms) && platforms.includes('electron')) {
        require('../setup-electron.js');
    }
};
