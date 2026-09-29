# CryptPass Storage

This repository-local Cordova plugin provides CryptPass with an Android Storage Access Framework (SAF) bridge for vault files. Keeping its source under `local-plugins/` makes the native implementation versioned and reproducible with the app.

The plugin lets the user grant persistent read/write access to a directory through `ACTION_OPEN_DOCUMENT_TREE`. It lists direct child documents, resolves existing files by name, creates JSON documents, and reads or writes document URIs through `ContentResolver`. It does not use `ACTION_CREATE_DOCUMENT` or expose a generic file chooser.

## API

- `selectVaultFolder()` opens the directory picker and returns its tree URI and direct child files.
- `resolveFileInTree(treeUri, relativePath)` resolves a direct child document URI.
- `createFileInTree(treeUri, fileName, contents)` creates and writes a JSON file.
- `readFile(uri)` reads a document URI as UTF-8.
- `writeFile(uri, contents)` replaces a document's contents as UTF-8.

Directory grants are persisted with Android's persistable URI permission API. The `cryptpass-tree:` stable reference format is managed by CryptPassApp and is not parsed or changed by this plugin.

The plugin targets the Android version supported by CryptPassApp (`minSdkVersion` 24). To build the app, run `npm run build-android` from the repository root.
