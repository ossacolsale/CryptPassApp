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

    const chooserPath = path.join(projectRoot, 'platforms/android/app/src/main/java/in/foobars/cordova/Chooser.java');
    if (fs.existsSync(chooserPath)) {
        let chooser = fs.readFileSync(chooserPath, 'utf8');
        if (!chooser.includes('resolveFileInTree')) {
            chooser = chooser.replace(
                '    private CallbackContext callback;',
                '    private CallbackContext callback;\n    private String targetFileName;'
            );
            chooser = chooser.replace(
                /        Uri fileUri = Uri\.parse\(startFileUri\);[\s\S]*?intent\.putExtra\(DocumentsContract\.EXTRA_INITIAL_URI, Uri\.parse\(startUri\)\);/,
                '        Uri fileUri = Uri.parse(startFileUri);\n        this.targetFileName = getDisplayName(this.cordova.getActivity().getContentResolver(), fileUri);\n        intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, fileUri);'
            );
            chooser = chooser.replace(
                'Intent chooser = Intent.createChooser(intent, "Select File");\n        cordova.startActivityForResult(this, chooser, Chooser.GRANT_DIR_REQUEST);',
                'Intent chooser = Intent.createChooser(intent, "Select the folder containing the vault");\n        cordova.startActivityForResult(this, chooser, Chooser.GRANT_DIR_REQUEST);'
            );
            chooser = chooser.replace(
                '            } else if (action.equals("readFile")) {',
                '            } else if (action.equals("resolveFileInTree")) {\n                Uri liveUri = findFileInTree(Uri.parse(args.getString(0)), args.getString(1));\n                if (liveUri == null) callbackContext.error("Vault file was not found in the granted folder");\n                else callbackContext.success(liveUri.toString());\n                return true;\n            } else if (action.equals("readFile")) {'
            );
            const oldTreeResult = `            if (requestCode == Chooser.GRANT_DIR_REQUEST && this.callback != null) {
                if (resultCode == Activity.RESULT_OK) {
                    final int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
                    if (data.getClipData() != null) {
                        for (int i = 0; i < data.getClipData().getItemCount(); i++) {
                            Uri uri = data.getClipData().getItemAt(i).getUri();
                            this.cordova.getActivity().getContentResolver().takePersistableUriPermission(uri, takeFlags);
                        }
                        this.callback.success("ok");
                    } else if (data.getData() != null) {
                        Uri uri = data.getData();
                        this.cordova.getActivity().getContentResolver().takePersistableUriPermission(uri, takeFlags);
                        this.callback.success("ok");
                    } else {
                        this.callback.error("Directory URI was null.");
                    }
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    this.callback.error("RESULT_CANCELED");
                } else {
                    this.callback.error(resultCode);
                }
            }`;
            const newTreeResult = `            if (requestCode == Chooser.GRANT_DIR_REQUEST && this.callback != null) {
                if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {
                    Uri treeUri = data.getData();
                    int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    this.cordova.getActivity().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);
                    Uri liveUri = findFileInTree(treeUri, this.targetFileName);
                    if (liveUri == null) this.callback.error("Selected folder does not contain the vault file");
                    else {
                        JSONObject grant = new JSONObject();
                        grant.put("treeUri", treeUri.toString());
                        grant.put("name", this.targetFileName);
                        this.callback.success(grant);
                    }
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    this.callback.error("RESULT_CANCELED");
                } else {
                    this.callback.error("Directory URI was null.");
                }
            }`;
            if (!chooser.includes(oldTreeResult)) throw new Error('Could not find the folder-permission result handler in Chooser.java');
            chooser = chooser.replace(oldTreeResult, newTreeResult);
            chooser = chooser.replace(
                '    private void readFileAction (CallbackContext callbackContext, Uri uri) {',
                `    private Uri findFileInTree(Uri treeUri, String fileName) {
        if (fileName == null || fileName.isEmpty()) return null;
        Cursor cursor = null;
        try {
            String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
            Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);
            String[] projection = { DocumentsContract.Document.COLUMN_DOCUMENT_ID, DocumentsContract.Document.COLUMN_DISPLAY_NAME };
            cursor = this.cordova.getActivity().getContentResolver().query(childrenUri, projection, null, null, null);
            if (cursor == null) return null;
            String documentId = null;
            while (cursor.moveToNext()) {
                String childName = cursor.getString(1);
                if (fileName.equals(childName)) {
                    if (documentId != null) return null;
                    documentId = cursor.getString(0);
                }
            }
            return documentId == null ? null : DocumentsContract.buildDocumentUriUsingTree(treeUri, documentId);
        } catch (Exception e) {
            return null;
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    private void readFileAction (CallbackContext callbackContext, Uri uri) {`
            );
        }
        chooser = chooser.replace(/^\s*intent\.putExtra\(Intent\.EXTRA_LOCAL_ONLY, true\);\s*$/m, '');
        chooser = chooser.replace(
            'final int takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;',
            'final int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);'
        );
        fs.writeFileSync(chooserPath, chooser);
    }

    if (fs.existsSync(chooserPath)) {
        let chooser = fs.readFileSync(chooserPath, 'utf8');
        chooser = chooser.replace('this.grantDirectory(callbackContext, args.getString(0));', 'this.chooseVaultFolder(callbackContext);');
        {
            if (!chooser.includes('action.equals("selectVaultFolder")')) chooser = chooser.replace(
                '            } else if (action.equals("resolveFileInTree")) {',
                '            } else if (action.equals("selectVaultFolder")) {\n                this.chooseVaultFolder(callbackContext);\n                return true;\n            } else if (action.equals("resolveFileInTree")) {'
            );
            const oldGrantMethod = /    public void grantDirectory\(CallbackContext callbackContext, String startFileUri\) \{[\s\S]*?(?=    public void chooseFile\()/;
            const newGrantMethod = [
                '    public void chooseVaultFolder(CallbackContext callbackContext) {',
                '        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);',
                '        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION',
                '                | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);',
                '        Intent picker = Intent.createChooser(intent, "Choose the folder containing the vault");',
                '        cordova.startActivityForResult(this, picker, Chooser.GRANT_DIR_REQUEST);',
                '',
                '        PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);',
                '        result.setKeepCallback(true);',
                '        this.callback = callbackContext;',
                '        callbackContext.sendPluginResult(result);',
                '    }',
                ''
            ].join('\n');
            if (oldGrantMethod.test(chooser)) chooser = chooser.replace(oldGrantMethod, newGrantMethod);
            const resultStart = chooser.indexOf('    @Override\n    public void onActivityResult(');
            const resultEnd = chooser.indexOf('    public JSONObject processFileUri', resultStart);
            if (resultStart < 0 || resultEnd < 0) throw new Error('Could not locate Chooser activity-result handler');
            const resultHandler = [
                '    @Override',
                '    public void onActivityResult(int requestCode, int resultCode, Intent data) {',
                '        try {',
                '            if (requestCode == Chooser.PICK_FILE_REQUEST && this.callback != null) {',
                '                if (resultCode == Activity.RESULT_OK && data != null) {',
                '                    int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);',
                '                    JSONArray files = new JSONArray();',
                '                    if (data.getClipData() != null) {',
                '                        for (int i = 0; i < data.getClipData().getItemCount(); i++) {',
                '                            Uri uri = data.getClipData().getItemAt(i).getUri();',
                '                            this.cordova.getActivity().getContentResolver().takePersistableUriPermission(uri, takeFlags);',
                '                            files.put(processFileUri(uri));',
                '                        }',
                '                    } else if (data.getData() != null) {',
                '                        Uri uri = data.getData();',
                '                        this.cordova.getActivity().getContentResolver().takePersistableUriPermission(uri, takeFlags);',
                '                        files.put(processFileUri(uri));',
                '                    }',
                '                    this.callback.success(files.toString());',
                '                } else {',
                '                    this.callback.error(resultCode);',
                '                }',
                '            } else if (requestCode == Chooser.GRANT_DIR_REQUEST && this.callback != null) {',
                '                if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {',
                '                    Uri treeUri = data.getData();',
                '                    int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);',
                '                    int requiredFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;',
                '                    if ((takeFlags & requiredFlags) != requiredFlags) {',
                '                        this.callback.error("The selected folder did not grant both read and write access");',
                '                        return;',
                '                    }',
                '                    this.cordova.getActivity().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);',
                '                    boolean persistedRead = false;',
                '                    boolean persistedWrite = false;',
                '                    for (android.content.UriPermission permission : this.cordova.getActivity().getContentResolver().getPersistedUriPermissions()) {',
                '                        if (treeUri.equals(permission.getUri())) {',
                '                            persistedRead = permission.isReadPermission();',
                '                            persistedWrite = permission.isWritePermission();',
                '                            break;',
                '                        }',
                '                    }',
                '                    if (!persistedRead || !persistedWrite) {',
                '                        this.callback.error("Android did not persist both read and write access to the selected folder");',
                '                        return;',
                '                    }',
                '                    JSONObject selection = new JSONObject();',
                '                    selection.put("treeUri", treeUri.toString());',
                '                    selection.put("files", listVaultFilesInTree(treeUri));',
                '                    this.callback.success(selection.toString());',
                '                } else {',
                '                    this.callback.error(resultCode);',
                '                }',
                '            }',
                '        } catch (Exception err) {',
                '            if (this.callback != null) this.callback.error("Failed to choose vault folder: " + err.toString());',
                '        }',
                '    }',
                '',
                ''
            ].join('\n');
            chooser = chooser.slice(0, resultStart) + resultHandler + chooser.slice(resultEnd);
            if (!chooser.includes('private JSONArray listVaultFilesInTree')) {
                const helperAnchor = '    private Uri findFileInTree(Uri treeUri, String fileName) {';
                const helper = [
                    '    private JSONArray listVaultFilesInTree(Uri treeUri) throws JSONException {',
                    '        JSONArray files = new JSONArray();',
                    '        Cursor cursor = null;',
                    '        try {',
                    '            String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);',
                    '            Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);',
                    '            String[] projection = {',
                    '                DocumentsContract.Document.COLUMN_DOCUMENT_ID,',
                    '                DocumentsContract.Document.COLUMN_DISPLAY_NAME,',
                    '                DocumentsContract.Document.COLUMN_MIME_TYPE',
                    '            };',
                    '            cursor = this.cordova.getActivity().getContentResolver().query(childrenUri, projection, null, null, null);',
                    '            if (cursor == null) return files;',
                    '            while (cursor.moveToNext()) {',
                    '                String mimeType = cursor.getString(2);',
                    '                if (DocumentsContract.Document.MIME_TYPE_DIR.equals(mimeType)) continue;',
                    '                String name = cursor.getString(1);',
                    '                JSONObject file = new JSONObject();',
                    '                file.put("name", name);',
                    '                file.put("relativePath", name);',
                    '                files.put(file);',
                    '            }',
                    '            return files;',
                    '        } finally {',
                    '            if (cursor != null) cursor.close();',
                    '        }',
                    '    }',
                    ''
                ].join('\n');
                if (!chooser.includes(helperAnchor)) throw new Error('Could not locate the tree resolver helper');
                chooser = chooser.replace(helperAnchor, helper + helperAnchor);
            }
        }
        if (!chooser.includes('action.equals("createFileInTree")')) {
            const actionAnchor = '            } else if (action.equals("readFile")) {';
            const createAction = [
                '            } else if (action.equals("createFileInTree")) {',
                '                try {',
                '                    Uri created = createVaultFileInTree(Uri.parse(args.getString(0)), args.getString(1), args.getString(2));',
                '                    callbackContext.success(created.toString());',
                '                } catch (Exception error) {',
                '                    callbackContext.error("Unable to create vault in the selected folder: " + error.toString());',
                '                }',
                '                return true;',
                actionAnchor
            ].join('\n');
            if (!chooser.includes(actionAnchor)) throw new Error('Could not locate Chooser read action for create action');
            chooser = chooser.replace(actionAnchor, createAction);
        }
        {
            const helperAnchor = '    private Uri findFileInTree(Uri treeUri, String fileName) {';
            const helper = [
                '    private Uri createVaultFileInTree(Uri treeUri, String fileName, String contents) throws Exception {',
                '        if (fileName == null || fileName.isEmpty()) throw new IllegalArgumentException("Vault file name is empty");',
                '        ContentResolver resolver = this.cordova.getActivity().getContentResolver();',
                '        boolean canRead = false;',
                '        boolean canWrite = false;',
                '        for (android.content.UriPermission permission : resolver.getPersistedUriPermissions()) {',
                '            if (treeUri.equals(permission.getUri())) {',
                '                canRead = permission.isReadPermission();',
                '                canWrite = permission.isWritePermission();',
                '                break;',
                '            }',
                '        }',
                '        if (!canRead || !canWrite) throw new SecurityException("The selected folder does not have a persistent read and write grant");',
                '        String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);',
                '        Uri parentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, treeDocumentId);',
                '        Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);',
                '        Cursor cursor = resolver.query(childrenUri, new String[] { DocumentsContract.Document.COLUMN_DISPLAY_NAME }, null, null, null);',
                '        if (cursor != null) {',
                '            try {',
                '                while (cursor.moveToNext()) {',
                '                    if (fileName.equals(cursor.getString(0))) throw new IllegalStateException("A file with this name already exists in the selected folder");',
                '                }',
                '            } finally {',
                '                cursor.close();',
                '            }',
                '        }',
                '        Uri created = DocumentsContract.createDocument(resolver, parentUri, "application/json", fileName);',
                '        if (created == null) throw new IllegalStateException("The document provider did not create the vault file");',
                '        Uri treeDocumentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, DocumentsContract.getDocumentId(created));',
                '        try (java.io.OutputStream output = resolver.openOutputStream(treeDocumentUri, "wt")) {',
                '            if (output == null) throw new IllegalStateException("The document provider did not open the vault for writing");',
                '            output.write(contents.getBytes(java.nio.charset.StandardCharsets.UTF_8));',
                '            output.flush();',
                '        } catch (Exception error) {',
                '            try { DocumentsContract.deleteDocument(resolver, treeDocumentUri); } catch (Exception ignored) { }',
                '            throw error;',
                '        }',
                '        return treeDocumentUri;',
                '    }',
                ''
            ].join('\n');
            const createHelperPattern = /    private Uri createVaultFileInTree\(Uri treeUri, String fileName(?:, String contents)?\) throws Exception \{[\s\S]*?\n    \}\n/;
            if (createHelperPattern.test(chooser)) chooser = chooser.replace(createHelperPattern, helper);
            else {
                if (!chooser.includes(helperAnchor)) throw new Error('Could not locate Chooser tree helper for file creation');
                chooser = chooser.replace(helperAnchor, helper + helperAnchor);
            }
        }
        chooser = chooser.replace(
            'createVaultFileInTree(Uri.parse(args.getString(0)), args.getString(1))',
            'createVaultFileInTree(Uri.parse(args.getString(0)), args.getString(1), args.getString(2))'
        );
        fs.writeFileSync(chooserPath, chooser);
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
