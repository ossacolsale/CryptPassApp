package com.crypho.plugins;

import android.annotation.TargetApi;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.Hashtable;
import java.util.Map;

public class SecureStorage extends CordovaPlugin {
    private static final String TAG = "SecureStorage";

    private static final boolean SUPPORTED = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;
    private static final Integer DEFAULT_AUTHENTICATION_VALIDITY_TIME = 60 * 60 * 24; // Fallback to 24h. Workaround to avoid asking for credentials too "often"

    private static final String MSG_NOT_SUPPORTED = "API 19 (Android 4.4 KitKat) is required. This device is running API " + Build.VERSION.SDK_INT;
    private static final String MSG_DEVICE_NOT_SECURE = "Device is not secure";
    private static final String MSG_KEYS_FAILED = "Generate RSA Encryption Keys failed. ";
    private static final int WRAP_VERSION_OAEP = 1;
    private static final String WRAP_ALG_OAEP = "RSA-OAEP-SHA256-MGF1-SHA1";

    private Hashtable<String, SharedPreferencesHandler> SERVICE_STORAGE = new Hashtable<String, SharedPreferencesHandler>();
    private String INIT_SERVICE;
    private String INIT_PACKAGENAME;
    private volatile CallbackContext secureDeviceContext, generateKeysContext, unlockCredentialsContext;
    private volatile boolean generateKeysContextRunning = false;

    private AbstractRSA rsa = RSAFactory.getRSA();

    @Override
    public void onResume(boolean multitasking) {
        if (secureDeviceContext != null) {

            if (isDeviceSecure()) {
                secureDeviceContext.success();
            } else {
                secureDeviceContext.error(MSG_DEVICE_NOT_SECURE);
            }
            secureDeviceContext = null;
        }

        if (unlockCredentialsContext != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        if (unlockCredentialsContext != null) {
                            String alias = service2alias(INIT_SERVICE);
                            String oaepAlias = service2oaepAlias(INIT_SERVICE);
                            if (rsa.userAuthenticationRequired(alias) || rsa.userAuthenticationRequiredOaep(oaepAlias)) {
                                unlockCredentialsContext.error("User not authenticated");
                            } else {
                                unlockCredentialsContext.success();
                            }
                            unlockCredentialsContext = null;
                        }
                    }
                });
            }
        }
    }

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        if (!SUPPORTED) {
            Log.w(TAG, MSG_NOT_SUPPORTED);
            callbackContext.error(MSG_NOT_SUPPORTED);
            return false;
        }
        if ("init".equals(action)) {
            String service = args.getString(0);
            JSONObject options = args.getJSONObject(1);

            String packageName = options.optString("packageName", getContext().getPackageName());

            Context ctx = null;

            // Solves #151. By default, we use our own ApplicationContext
            // If packageName is provided, we try to get the Context of another Application with that packageName
            try {
                ctx = getPackageContext(packageName);
            } catch (Exception e) {
                // This will fail if the application with given packageName is not installed
                // OR if we do not have required permissions and cause a security violation
                Log.e(TAG, "Init failed :", e);
                callbackContext.error(e.getMessage());
            }

            INIT_PACKAGENAME = ctx.getPackageName();
            String alias = service2alias(service);
            String oaepAlias = service2oaepAlias(service);
            INIT_SERVICE = service;

            SharedPreferencesHandler PREFS = new SharedPreferencesHandler(alias, ctx);
            SERVICE_STORAGE.put(service, PREFS);
            if ((!rsa.encryptionKeysAvailable(alias) && PREFS.isEmpty()) || !rsa.encryptionKeysAvailable(oaepAlias)) {
                Integer userAuthenticationValidityDuration = options.optInt("userAuthenticationValidityDuration", DEFAULT_AUTHENTICATION_VALIDITY_TIME);
                generateKeysContext = callbackContext;
                generateEncryptionKeys(userAuthenticationValidityDuration);
                if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
                    unlockCredentialsLegacy();
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP &&
                (rsa.userAuthenticationRequired(alias) || rsa.userAuthenticationRequiredOaep(oaepAlias))) {
                // User has to confirm authentication via device credentials.
                String title = options.optString("unlockCredentialsTitle", null);
                String description = options.optString("unlockCredentialsDescription", null);

                unlockCredentialsContext = callbackContext;
                unlockCredentials(title, description);
            } else {
                initSuccess(callbackContext);
            }

            return true;
        }
        if ("set".equals(action)) {
            final String service = args.getString(0);
            final String key = args.getString(1);
            final String value = args.getString(2);
            final String adata = service;
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        JSONObject result = AES.encrypt(value.getBytes(), adata.getBytes());
                        byte[] aes_key = Base64.decode(result.getString("key"), Base64.DEFAULT);
                        byte[] aes_key_enc = rsa.encryptOaep(aes_key, service2oaepAlias(service));
                        result.put("key", Base64.encodeToString(aes_key_enc, Base64.DEFAULT));
                        result.put("wrapVersion", WRAP_VERSION_OAEP);
                        result.put("wrapAlg", WRAP_ALG_OAEP);
                        if (!getStorage(service).store(key, result.toString())) throw new Exception("Storage write failed");
                        callbackContext.success(key);
                    } catch (Exception e) {
                        Log.e(TAG, "Secure storage operation failed");
                        callbackContext.error("Secure storage operation failed");
                    }
                }
            });
            return true;
        }
        if ("get".equals(action)) {
            final String service = args.getString(0);
            final String key = args.getString(1);
            String value = getStorage(service).fetch(key);
            if (value != null) {
                final JSONObject json = new JSONObject(value);
                final byte[] encKey = Base64.decode(json.getString("key"), Base64.DEFAULT);
                JSONObject data = json.getJSONObject("value");
                final byte[] ct = Base64.decode(data.getString("ct"), Base64.DEFAULT);
                final byte[] iv = Base64.decode(data.getString("iv"), Base64.DEFAULT);
                final byte[] adata = Base64.decode(data.getString("adata"), Base64.DEFAULT);
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {
                        try {
                            String decrypted = readAndMigrate(service, key, json, encKey, ct, iv, adata, data.getString("mode"));
                            callbackContext.success(decrypted);
                        } catch (Exception e) {
                            Log.e(TAG, "Secure storage operation failed");
                            callbackContext.error("Secure storage operation failed");
                        }
                    }
                });
            } else {
                callbackContext.error("Key [" + key + "] not found.");
            }
            return true;
        }
        if ("secureDevice".equals(action)) {
            // Open the Security Settings screen. The app developer should inform the user about
            // the security requirements of the app and initialize again after the user has changed the screen-lock settings
            secureDeviceContext = callbackContext;
            secureDevice();
            return true;
        }
        if ("remove".equals(action)) {
            String service = args.getString(0);
            String key = args.getString(1);
            if (getStorage(service).remove(key)) callbackContext.success(key);
            else callbackContext.error("Secure storage operation failed");
            return true;
        }
        if ("keys".equals(action)) {
            String service = args.getString(0);
            callbackContext.success(new JSONArray(getStorage(service).keys()));
            return true;
        }
        if ("clear".equals(action)) {
            String service = args.getString(0);
            getStorage(service).clear();
            callbackContext.success();
            return true;
        }
        return false;
    }

    private boolean isDeviceSecure() {
        KeyguardManager keyguardManager = (KeyguardManager) (getContext().getSystemService(Context.KEYGUARD_SERVICE));
        try {
            Method isSecure = null;
            isSecure = keyguardManager.getClass().getMethod("isDeviceSecure");
            return ((Boolean) isSecure.invoke(keyguardManager)).booleanValue();
        } catch (Exception e) {
            return keyguardManager.isKeyguardSecure();
        }
    }

    private String service2alias(String service) {
        String res = INIT_PACKAGENAME + "." + service;
        return res;
    }

    private String service2oaepAlias(String service) {
        return service2alias(service) + ".oaep.v1";
    }

    private String readAndMigrate(String service, String key, JSONObject record, byte[] wrappedKey,
            byte[] ct, byte[] iv, byte[] adata, String mode) throws Exception {
        SharedPreferencesHandler storage = getStorage(service);
        String staged = storage.fetchMigration(key);
        if (staged != null) {
            try {
                JSONObject stagedRecord = new JSONObject(staged);
                String stagedValue = decryptRecord(service, stagedRecord, true);
                if (storage.store(key, staged) && stagedValue.equals(decryptRecord(service, new JSONObject(storage.fetch(key)), true))) {
                    storage.removeMigration(key);
                    return stagedValue;
                }
            } catch (Exception ignored) {
                // Keep the original record authoritative if an interrupted stage is invalid.
            }
        }

        if (record.has("wrapVersion") &&
            (record.optInt("wrapVersion", -1) != WRAP_VERSION_OAEP || !WRAP_ALG_OAEP.equals(record.optString("wrapAlg"))))
            throw new Exception("Unsupported secure storage wrapping format");
        boolean versioned = record.optInt("wrapVersion", 0) == WRAP_VERSION_OAEP;
        if (versioned) return decryptRecord(service, record, true);

        byte[] legacyKey = rsa.decrypt(wrappedKey, service2alias(service));
        String plaintext = new String(AES.decrypt(ct, legacyKey, iv, adata, mode), "UTF-8");
        JSONObject migrated = AES.encrypt(plaintext.getBytes("UTF-8"), adata);
        byte[] newAesKey = Base64.decode(migrated.getString("key"), Base64.DEFAULT);
        migrated.put("key", Base64.encodeToString(rsa.encryptOaep(newAesKey, service2oaepAlias(service)), Base64.DEFAULT));
        migrated.put("wrapVersion", WRAP_VERSION_OAEP);
        migrated.put("wrapAlg", WRAP_ALG_OAEP);

        String stagedJson = migrated.toString();
        if (!storage.storeMigration(key, stagedJson)) throw new Exception("Storage migration failed");
        if (!plaintext.equals(decryptRecord(service, new JSONObject(storage.fetchMigration(key)), true)))
            throw new Exception("Storage migration verification failed");
        if (!storage.store(key, stagedJson)) throw new Exception("Storage migration commit failed");
        String committed = storage.fetch(key);
        if (committed == null || !plaintext.equals(decryptRecord(service, new JSONObject(committed), true)))
            throw new Exception("Storage migration verification failed");
        if (!storage.removeMigration(key)) throw new Exception("Storage migration cleanup failed");
        return plaintext;
    }

    private String decryptRecord(String service, JSONObject record, boolean oaep) throws Exception {
        JSONObject data = record.getJSONObject("value");
        byte[] wrapped = Base64.decode(record.getString("key"), Base64.DEFAULT);
        byte[] aesKey = oaep
            ? rsa.decryptOaep(wrapped, service2oaepAlias(service))
            : rsa.decrypt(wrapped, service2alias(service));
        return new String(AES.decrypt(
            Base64.decode(data.getString("ct"), Base64.DEFAULT), aesKey,
            Base64.decode(data.getString("iv"), Base64.DEFAULT),
            Base64.decode(data.getString("adata"), Base64.DEFAULT), data.getString("mode")), "UTF-8");
    }

    private SharedPreferencesHandler getStorage(String service) {
        return SERVICE_STORAGE.get(service);
    }

    private void initSuccess(CallbackContext context) {
        context.success();
    }

    /**
     * Create the Confirm Credentials screen.
     * You can customize the title and description or Android will provide a generic one for you if you leave it null
     *
     * @param title
     * @param description
     * @// TODO: 2019-07-08 Use  BiometricPrompt#setDeviceCredentialAllowed for API 29+
     */
    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void unlockCredentials(final String title, final String description) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                KeyguardManager keyguardManager = (KeyguardManager) (getContext().getSystemService(Context.KEYGUARD_SERVICE));
                Intent intent = keyguardManager.createConfirmDeviceCredentialIntent(title, description);
                if (intent != null) {
                    startActivity(intent);
                } else {
                    Log.e(TAG, "Error creating Confirm Credentials Intent");
                    unlockCredentialsContext.error("Cant't unlock credentials, error creating Confirm Credentials Intent");
                }
            }
        });
    }

    @TargetApi(Build.VERSION_CODES.KITKAT)
    private void unlockCredentialsLegacy() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent("com.android.credentials.UNLOCK");
                startActivity(intent);
            }
        });
    }

    /**
     * Generate Encryption Keys in the background.
     *
     * @param userAuthenticationValidityDuration User authentication validity duration in seconds
     */
    private void generateEncryptionKeys(Integer userAuthenticationValidityDuration) {
        if (generateKeysContext != null && !generateKeysContextRunning) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    generateKeysContextRunning = true;
                    try {
                        String alias = service2alias(INIT_SERVICE);
                        String oaepAlias = service2oaepAlias(INIT_SERVICE);
                        SharedPreferencesHandler storage = getStorage(INIT_SERVICE);
                        if (!rsa.encryptionKeysAvailable(alias) && storage.isEmpty()) {
                            rsa.createKeyPair(getContext(), alias, userAuthenticationValidityDuration);
                        }
                        if (!rsa.encryptionKeysAvailable(oaepAlias))
                            rsa.createOaepKeyPair(getContext(), oaepAlias, userAuthenticationValidityDuration);
                        generateKeysContext.success();
                    } catch (Exception e) {
                        Log.e(TAG, MSG_KEYS_FAILED, e);
                        generateKeysContext.error(MSG_KEYS_FAILED + e.getMessage());
                    } finally {
                        generateKeysContext = null;
                        generateKeysContextRunning = false;
                    }
                }
            });
        }
    }

    /**
     * Open Security settings screen.
     */
    private void secureDevice() {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                try {
                    Intent intent = new Intent(Settings.ACTION_SECURITY_SETTINGS);
                    startActivity(intent);
                } catch (Exception e) {
                    Log.e(TAG, "Error opening Security settings to secure device : ", e);
                    secureDeviceContext.error(e.getMessage());
                }
            }
        });
    }

    private Context getContext() {
        return cordova.getActivity().getApplicationContext();
    }

    private Context getPackageContext(String packageName) throws Exception {
        Context pkgContext = null;

        Context context = getContext();
        if (context.getPackageName().equals(packageName)) {
            pkgContext = context;
        } else {
            pkgContext = context.createPackageContext(packageName, 0);
        }

        return pkgContext;
    }

    private void startActivity(Intent intent) {
        cordova.getActivity().startActivity(intent);
    }

}
