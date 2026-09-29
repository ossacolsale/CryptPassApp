const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const platforms = context && context.opts && context.opts.platforms;
    if (Array.isArray(platforms) && !platforms.includes('android')) return;

    const projectRoot = context && context.opts && context.opts.projectRoot || process.cwd();
    const configPath = path.join(projectRoot, 'platforms/android/app/src/main/res/xml/config.xml');
    if (!fs.existsSync(configPath)) return;

    const config = fs.readFileSync(configPath, 'utf8');
    const idMatch = config.match(/<widget\b[^>]*\bid=["']([^"']+)["']/);
    if (!idMatch) throw new Error('Could not determine the Android package name from Cordova config');
    const packageName = idMatch[1].replace(/-/g, '_');
    const activityPath = path.join(
        projectRoot,
        'platforms/android/app/src/main/java',
        packageName.replace(/\./g, path.sep),
        'MainActivity.java'
    );
    if (!fs.existsSync(activityPath)) return;

    const gradlePath = path.join(projectRoot, 'platforms/android/app/build.gradle');
    if (fs.existsSync(gradlePath)) {
        let gradle = fs.readFileSync(gradlePath, 'utf8');
        gradle = gradle.replace(
            /        buildTypes \{\n            debug \{\n                applicationIdSuffix \"\.debug\"\n            \}\n            release \{/,
            '        buildTypes {\n            release {'
        );
        if (!gradle.includes('// CryptPass side-by-side debug build')) {
            const insertionPoint = '    lintOptions {';
            if (!gradle.includes(insertionPoint)) throw new Error('Could not find Android app configuration insertion point');
            gradle = gradle.replace(
                insertionPoint,
                '    // CryptPass side-by-side debug build\n    buildTypes {\n        debug {\n            applicationIdSuffix \".debug\"\n        }\n    }\n\n' + insertionPoint
            );
            fs.writeFileSync(gradlePath, gradle);
        }
    }

    const nativeSourcePath = path.join(
        projectRoot,
        'platforms/android/app/src/main/java',
        packageName.replace(/\./g, path.sep),
        'CryptPassDeviceAuth.java'
    );
    const authTemplate = fs.readFileSync(path.join(__dirname, 'CryptPassDeviceAuth.java.template'), 'utf8');
    fs.mkdirSync(path.dirname(nativeSourcePath), { recursive: true });
    fs.writeFileSync(nativeSourcePath, authTemplate.replace('__PACKAGE__', packageName));

    const authFeature = '<feature name="CryptPassDeviceAuth"><param name="android-package" value="' + packageName + '.CryptPassDeviceAuth" /></feature>';
    if (!config.includes('name="CryptPassDeviceAuth"')) {
        const updatedConfig = config.replace('</widget>', '    ' + authFeature + '\n</widget>');
        if (updatedConfig === config) throw new Error('Could not register Android device authentication plugin');
        fs.writeFileSync(configPath, updatedConfig);
    }

    const secureStorageDir = path.join(projectRoot, 'platforms/android/app/src/main/java/com/crypho/plugins');
    const rsaPath = path.join(secureStorageDir, 'RSA.java');
    const secureStoragePath = path.join(secureStorageDir, 'SecureStorage.java');
    if (fs.existsSync(rsaPath) && fs.existsSync(secureStoragePath)) {
        let rsa = fs.readFileSync(rsaPath, 'utf8');
        if (rsa.includes('.setUserAuthenticationRequired(true)')) {
            rsa = rsa.replace('import android.content.Context;', 'import android.app.KeyguardManager;\nimport android.content.Context;');
            rsa = rsa.replace(
                '        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {\n            return new KeyGenParameterSpec.Builder',
                '        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {\n            KeyguardManager keyguard = (KeyguardManager) ctx.getSystemService(Context.KEYGUARD_SERVICE);\n            boolean deviceSecure = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? keyguard.isDeviceSecure() : keyguard.isKeyguardSecure();\n            return new KeyGenParameterSpec.Builder'
            );
            rsa = rsa.replace('.setUserAuthenticationRequired(true)', '.setUserAuthenticationRequired(deviceSecure)');
            fs.writeFileSync(rsaPath, rsa);
        }

        let secureStorage = fs.readFileSync(secureStoragePath, 'utf8');
        secureStorage = secureStorage.replace(
            '            if (!isDeviceSecure()) {\n                Log.e(TAG, MSG_DEVICE_NOT_SECURE);\n                callbackContext.error(MSG_DEVICE_NOT_SECURE);\n            } else if (!rsa.encryptionKeysAvailable(alias)) {',
            '            if (!rsa.encryptionKeysAvailable(alias)) {'
        );
        fs.writeFileSync(secureStoragePath, secureStorage);
    }

    let source = fs.readFileSync(activityPath, 'utf8');
    // Replace the previous whole-WebView padding implementation, if this platform
    // directory was prepared by an earlier version of this hook.
    source = source.replace(
        /\n        applySystemBarInsets\(\);\n    }\n\n    \/\*\* Keeps the Cordova WebView inside Android system bars and display cutouts\. \*\/\n    private void applySystemBarInsets\(\) \{[\s\S]*?\n    }(?=\n})/,
        '\n    }'
    );
    source = source
        .replace(/^import android\.view\.View;\n/m, '')
        .replace(/^import androidx\.core\.graphics\.Insets;\n/m, '')
        .replace(/^import androidx\.core\.view\.ViewCompat;\n/m, '')
        .replace(/^import androidx\.core\.view\.WindowCompat;\n/m, '')
        .replace(/^import androidx\.core\.view\.WindowInsetsCompat;\n/m, '');

    source = source.replace(
        /(package [^;]+;\s*)/,
        match => match + '\nimport android.view.View;\nimport android.view.ViewGroup;\nimport androidx.core.view.ViewCompat;\nimport androidx.core.view.WindowCompat;\nimport androidx.core.view.WindowInsetsCompat;\n'
    );

    const loadUrl = '        loadUrl(launchUrl);';
    if (!source.includes(loadUrl)) throw new Error('Could not find Cordova MainActivity loadUrl call');
    if (!source.includes('ensureInsetsReachWebView();'))
        source = source.replace(loadUrl, loadUrl + '\n\n        ensureInsetsReachWebView();');

    const method = [
        '    /** Applies the real Android system-bar insets to the WebView content area. */',
        '    private void ensureInsetsReachWebView() {',
        '        if (appView == null) return;',
        '        View webView = appView.getView();',
        '        View decorView = getWindow().getDecorView();',
        '        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);',
        '        ViewGroup.LayoutParams initialParams = webView.getLayoutParams();',
        '        if (!(initialParams instanceof ViewGroup.MarginLayoutParams)) return;',
        '        ViewGroup.MarginLayoutParams initialMargins = (ViewGroup.MarginLayoutParams) initialParams;',
        '        final int initialLeft = initialMargins.leftMargin;',
        '        final int initialTop = initialMargins.topMargin;',
        '        final int initialRight = initialMargins.rightMargin;',
        '        final int initialBottom = initialMargins.bottomMargin;',
        '        int statusBarResource = getResources().getIdentifier("status_bar_height", "dimen", "android");',
        '        final int statusBarFallback = statusBarResource == 0 ? 0 : getResources().getDimensionPixelSize(statusBarResource);',
        '        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {',
        '            androidx.core.graphics.Insets safeInsets = windowInsets.getInsets(',
        '                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());',
        '            int topInset = Math.max(safeInsets.top, statusBarFallback);',
        '            ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) webView.getLayoutParams();',
        '            margins.setMargins(initialLeft + safeInsets.left, initialTop + topInset,',
        '                initialRight + safeInsets.right, initialBottom + safeInsets.bottom);',
        '            webView.setLayoutParams(margins);',
        '            return windowInsets;',
        '        });',
        '        ViewCompat.requestApplyInsets(webView);',
        '        webView.post(() -> ViewCompat.requestApplyInsets(webView));',
        '        ViewCompat.requestApplyInsets(decorView);',
        '    }'
    ].join('\n');
    source = source.replace(
        /    \/\*\* [^\n]* \*\/\s+private void ensureInsetsReachWebView\(\) \{[\s\S]*?\n    \}/g,
        ''
    );
    const lastBrace = source.lastIndexOf('}');
    if (lastBrace < 0) throw new Error('Could not find the end of Cordova MainActivity');
    source = source.slice(0, lastBrace) + '\n' + method + '\n' + source.slice(lastBrace);
    fs.writeFileSync(activityPath, source);
};
