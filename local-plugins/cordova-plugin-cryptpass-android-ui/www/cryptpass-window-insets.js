const exec = require('cordova/exec');

document.addEventListener('deviceready', () => {
    exec(
        () => undefined,
        error => console.error('Could not apply Android window insets', error),
        'CryptPassWindowInsets',
        'applyInsets',
        []
    );
}, { once: true });
