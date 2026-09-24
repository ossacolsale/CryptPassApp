const fs = require('fs');
const path = require('path');

module.exports = function (context) {
    const platforms = context && context.opts && context.opts.platforms;
    if (Array.isArray(platforms) && !platforms.includes('android')) return;

    const projectRoot = context && context.opts && context.opts.projectRoot || process.cwd();
    const activityPath = path.join(projectRoot, 'platforms/android/app/src/main/java/com/cryptpass/app/MainActivity.java');
    if (!fs.existsSync(activityPath)) return;

    let source = fs.readFileSync(activityPath, 'utf8');
    if (source.includes('applySystemBarInsets();')) return;

    source = source.replace(/(package [^;]+;\s*)/, match => match + '\nimport android.view.View;\nimport androidx.core.graphics.Insets;\nimport androidx.core.view.ViewCompat;\nimport androidx.core.view.WindowInsetsCompat;\n');
    const loadUrl = '        loadUrl(launchUrl);';
    if (!source.includes(loadUrl)) throw new Error('Could not find Cordova MainActivity loadUrl call');
    source = source.replace(loadUrl, loadUrl + '\n\n        applySystemBarInsets();');

    const method = [
        '',
        '    /** Keeps the Cordova WebView inside Android system bars and display cutouts. */',
        '    private void applySystemBarInsets() {',
        '        if (appView == null) return;',
        '        View webView = appView.getView();',
        '        final int initialLeft = webView.getPaddingLeft();',
        '        final int initialTop = webView.getPaddingTop();',
        '        final int initialRight = webView.getPaddingRight();',
        '        final int initialBottom = webView.getPaddingBottom();',
        '',
        '        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {',
        '            Insets safeInsets = windowInsets.getInsets(',
        '                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()',
        '            );',
        '            view.setPadding(',
        '                initialLeft + safeInsets.left,',
        '                initialTop + safeInsets.top,',
        '                initialRight + safeInsets.right,',
        '                initialBottom + safeInsets.bottom',
        '            );',
        '            return windowInsets;',
        '        });',
        '        ViewCompat.requestApplyInsets(webView);',
        '    }',
        ''
    ].join('\n');
    const lastBrace = source.lastIndexOf('}');
    if (lastBrace < 0) throw new Error('Could not find the end of Cordova MainActivity');
    source = source.slice(0, lastBrace) + method + source.slice(lastBrace);
    fs.writeFileSync(activityPath, source);
};
