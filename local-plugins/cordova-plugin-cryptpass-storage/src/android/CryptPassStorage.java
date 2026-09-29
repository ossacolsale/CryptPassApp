package com.cryptpass.storage;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.UriPermission;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class CryptPassStorage extends CordovaPlugin {
    private static final int PICK_VAULT_TREE_REQUEST = 0x4350;
    private static final int READ_WRITE_FLAGS = Intent.FLAG_GRANT_READ_URI_PERMISSION
            | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;

    private CallbackContext pendingSelection;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        try {
            if ("selectVaultFolder".equals(action)) {
                selectVaultFolder(callbackContext);
                return true;
            }
            if ("resolveFileInTree".equals(action)) {
                Uri treeUri = parseTreeUri(args.getString(0));
                String relativePath = args.getString(1);
                validateFileName(relativePath);
                requirePersistedReadWriteGrant(treeUri);
                Uri documentUri = findUniqueChild(treeUri, relativePath);
                if (documentUri == null) throw new IOException("Vault file was not found in the selected folder");
                callbackContext.success(documentUri.toString());
                return true;
            }
            if ("createFileInTree".equals(action)) {
                Uri treeUri = parseTreeUri(args.getString(0));
                String fileName = args.getString(1);
                String contents = args.getString(2);
                validateFileName(fileName);
                requirePersistedReadWriteGrant(treeUri);
                Uri created = createFileInTree(treeUri, fileName, contents);
                callbackContext.success(created.toString());
                return true;
            }
            if ("readFile".equals(action)) {
                callbackContext.success(readFile(parseDocumentUri(args.getString(0))));
                return true;
            }
            if ("writeFile".equals(action)) {
                writeFile(parseDocumentUri(args.getString(0)), args.getString(1));
                callbackContext.success();
                return true;
            }
        } catch (Exception error) {
            callbackContext.error(errorMessage(action, error));
            return true;
        }
        return false;
    }

    private void selectVaultFolder(CallbackContext callbackContext) {
        synchronized (this) {
            if (pendingSelection != null) {
                callbackContext.error("A folder selection is already in progress");
                return;
            }
            pendingSelection = callbackContext;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            intent.addFlags(READ_WRITE_FLAGS
                    | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                    | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
            Intent picker = Intent.createChooser(intent, "Choose the folder containing the vault");
            cordova.startActivityForResult(this, picker, PICK_VAULT_TREE_REQUEST);

            PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
            callbackContext.sendPluginResult(result);
        } catch (Exception error) {
            clearPendingSelection();
            callbackContext.error(errorMessage("selectVaultFolder", error));
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != PICK_VAULT_TREE_REQUEST) return;

        CallbackContext callbackContext = takePendingSelection();
        if (callbackContext == null) return;
        if (resultCode != Activity.RESULT_OK || data == null || data.getData() == null) {
            callbackContext.error(resultCode == Activity.RESULT_CANCELED
                    ? "Folder selection was cancelled"
                    : "No folder was returned by the document picker");
            return;
        }

        try {
            Uri treeUri = data.getData();
            if (!DocumentsContract.isTreeUri(treeUri)) throw new IOException("The picker did not return a directory URI");
            int grantedFlags = data.getFlags() & READ_WRITE_FLAGS;
            if ((grantedFlags & READ_WRITE_FLAGS) != READ_WRITE_FLAGS) {
                throw new SecurityException("The selected folder did not grant both read and write access");
            }

            ContentResolver resolver = cordova.getActivity().getContentResolver();
            resolver.takePersistableUriPermission(treeUri, grantedFlags);
            requirePersistedReadWriteGrant(treeUri);

            JSONObject selection = new JSONObject();
            selection.put("treeUri", treeUri.toString());
            selection.put("files", listDirectFiles(treeUri));
            callbackContext.success(selection);
        } catch (Exception error) {
            callbackContext.error(errorMessage("selectVaultFolder", error));
        }
    }

    private Uri createFileInTree(Uri treeUri, String fileName, String contents) throws Exception {
        if (childNameExists(treeUri, fileName)) {
            throw new IOException("A document with that name already exists in the selected folder");
        }

        String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
        Uri parentDocumentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, treeDocumentId);
        ContentResolver resolver = cordova.getActivity().getContentResolver();
        Uri createdUri = DocumentsContract.createDocument(
                resolver, parentDocumentUri, "application/json", fileName);
        if (createdUri == null) throw new IOException("The document provider could not create the vault file");

        try {
            writeContents(createdUri, contents, "wt");
            return createdUri;
        } catch (Exception error) {
            try {
                DocumentsContract.deleteDocument(resolver, createdUri);
            } catch (Exception ignored) {
                // Keep the original write error for the caller.
            }
            throw error;
        }
    }

    private JSONArray listDirectFiles(Uri treeUri) throws Exception {
        JSONArray files = new JSONArray();
        Cursor cursor = null;
        try {
            String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
            Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);
            String[] projection = {
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_MIME_TYPE
            };
            cursor = cordova.getActivity().getContentResolver()
                    .query(childrenUri, projection, null, null, null);
            if (cursor == null) throw new IOException("The document provider did not return folder contents");

            while (cursor.moveToNext()) {
                String mimeType = cursor.getString(2);
                if (DocumentsContract.Document.MIME_TYPE_DIR.equals(mimeType)) continue;
                String name = cursor.getString(1);
                if (name == null || name.isEmpty()) continue;
                JSONObject file = new JSONObject();
                file.put("name", name);
                file.put("relativePath", name);
                files.put(file);
            }
            return files;
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    private boolean childNameExists(Uri treeUri, String fileName) throws Exception {
        Cursor cursor = null;
        try {
            String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
            Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);
            String[] projection = { DocumentsContract.Document.COLUMN_DISPLAY_NAME };
            cursor = cordova.getActivity().getContentResolver()
                    .query(childrenUri, projection, null, null, null);
            if (cursor == null) throw new IOException("The document provider did not return folder contents");
            while (cursor.moveToNext()) {
                if (fileName.equals(cursor.getString(0))) return true;
            }
            return false;
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    private Uri findUniqueChild(Uri treeUri, String fileName) throws Exception {
        Cursor cursor = null;
        try {
            String treeDocumentId = DocumentsContract.getTreeDocumentId(treeUri);
            Uri childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeDocumentId);
            String[] projection = {
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_MIME_TYPE
            };
            cursor = cordova.getActivity().getContentResolver()
                    .query(childrenUri, projection, null, null, null);
            if (cursor == null) throw new IOException("The document provider did not return folder contents");

            String documentId = null;
            while (cursor.moveToNext()) {
                String name = cursor.getString(1);
                String mimeType = cursor.getString(2);
                if (!fileName.equals(name) || DocumentsContract.Document.MIME_TYPE_DIR.equals(mimeType)) continue;
                if (documentId != null) throw new IOException("More than one file has that name in the selected folder");
                documentId = cursor.getString(0);
            }
            return documentId == null
                    ? null
                    : DocumentsContract.buildDocumentUriUsingTree(treeUri, documentId);
        } finally {
            if (cursor != null) cursor.close();
        }
    }

    private String readFile(Uri uri) throws IOException {
        ContentResolver resolver = cordova.getActivity().getContentResolver();
        try (InputStream input = resolver.openInputStream(uri);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            if (input == null) throw new IOException("The document provider could not open the vault file");
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            return new String(output.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    private void writeFile(Uri uri, String contents) throws IOException {
        writeContents(uri, contents, "wt");
    }

    private void writeContents(Uri uri, String contents, String mode) throws IOException {
        ContentResolver resolver = cordova.getActivity().getContentResolver();
        try (OutputStream output = resolver.openOutputStream(uri, mode)) {
            if (output == null) throw new IOException("The document provider could not open the vault for writing");
            output.write(contents.getBytes(StandardCharsets.UTF_8));
            output.flush();
        }
    }

    private void requirePersistedReadWriteGrant(Uri treeUri) throws SecurityException {
        for (UriPermission permission : cordova.getActivity().getContentResolver().getPersistedUriPermissions()) {
            if (treeUri.equals(permission.getUri())
                    && permission.isReadPermission()
                    && permission.isWritePermission()) {
                return;
            }
        }
        throw new SecurityException("The selected folder does not have a persisted read/write grant");
    }

    private Uri parseTreeUri(String value) {
        Uri uri = parseDocumentUri(value);
        if (!DocumentsContract.isTreeUri(uri)) throw new IllegalArgumentException("A directory tree URI is required");
        return uri;
    }

    private Uri parseDocumentUri(String value) {
        if (value == null || value.trim().isEmpty()) throw new IllegalArgumentException("A document URI is required");
        Uri uri = Uri.parse(value);
        if (!"content".equals(uri.getScheme())) throw new IllegalArgumentException("A content URI is required");
        return uri;
    }

    private void validateFileName(String fileName) {
        if (fileName == null || fileName.isEmpty() || fileName.equals(".") || fileName.equals("..")) {
            throw new IllegalArgumentException("A file name is required");
        }
        for (int i = 0; i < fileName.length(); i++) {
            char character = fileName.charAt(i);
            if (character == '/' || character == '\\' || Character.isISOControl(character)) {
                throw new IllegalArgumentException("The file name contains an invalid character");
            }
        }
    }

    private String errorMessage(String action, Exception error) {
        return "CryptPass storage " + action + " failed (" + error.getClass().getSimpleName() + ")";
    }

    private synchronized CallbackContext takePendingSelection() {
        CallbackContext callbackContext = pendingSelection;
        pendingSelection = null;
        return callbackContext;
    }

    private synchronized void clearPendingSelection() {
        pendingSelection = null;
    }
}
