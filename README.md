# CryptPass App

CryptPass App is a Cordova password wallet for Android, Linux and Windows. Vault contents are encrypted by the pinned [CryptPass library](https://github.com/ossacolsale/CryptPass); this app does not implement cryptography itself.

## Platform support status

| Platform | Build | Runtime tested in this remediation | File handling | Secure metadata | Notes |
|---|---|---|---|---|---|
| Linux | Yes: `.deb` and `.zip` | No interactive launch test | Electron native open/save dialogs; opaque main-process handles | Electron async `safeStorage` | Initialization fails closed unless async encryption is available and a non-persisted encryption probe reports the Secret Service (`v11`) or portal (`v12`) provider. The weaker POSIX fallback (`v10`) is rejected; the async Portal provider remains supported even if the legacy backend reports `basic_text`. See the [security audit remediation record](docs/SECURITY_AUDIT_2026-10.md). |
| Windows | Yes: NSIS installer and `.zip` | No Windows runtime test | Electron native open/save dialogs; opaque main-process handles | Electron `safeStorage` | Unsigned development builds are supported; configure certificate settings for signed releases. |
| Android | Build could not complete here | No device/provider test | SAF document URIs and persisted URI permissions | Android secure-storage plugin | Cloud `DocumentProvider` behavior depends on the provider; SDK Platform 36 could not be installed because `/lib/android-sdk` is not writable in the build environment, and device/provider behavior still needs testing. |

The Electron build generates the `.deb`, Linux `.zip`, Windows NSIS installer and Windows `.zip` in `platforms/electron/build/`. These build results do not imply an interactive runtime test on Linux or Windows.

## Build and test

Use Node.js 22 for the Electron packaging toolchain. Install dependencies with `npm ci`; the postinstall script applies a compatibility patch for `cordova-electron@4.0.0` and `electron-builder@26.15.3`.

```sh
npm test
npx tsc --noEmit
npm run build-electron
npm run build-android
```

Android builds also need the Android SDK and a compatible JDK installed. `npm run test-electron` launches the desktop app for manual testing; `npm run test-android` launches it on an attached device/emulator.

The current development lockfile still contains deprecated toolchain packages. `q@1.5.1` comes through `cordova-common@5.0.1` from `cordova-android@14.0.1`, `cordova-browser@7.0.0` and `cordova-electron@4.0.0`. `glob@7.2.3` and `inflight@1.0.6` come through `shelljs@0.8.5` from `cordova-browser`, `rimraf@3.0.2` from `electron-devtools-installer@3.2.1` in `cordova-electron`, and `@electron/asar@3.4.1` in `electron-builder`; `rimraf@2.6.3` comes through `temp@0.9.4` in the Windows packaging chain. `boolean@3.2.0` comes through `global-agent@3.0.0` and `roarr@2.15.4` in the Electron builder chain. These are development and packaging dependencies. The current Cordova parents are still in use, and major-version overrides can break their consumers. The migration path is to move Android to a Cordova platform/toolchain release whose supported `cordova-common` tree removes `q`, and replace `cordova-electron@4.0.0` with a maintained Electron packaging path whose builder tree removes the `electron-devtools-installer` and `temp` chains; then run `npm explain`, `npm ls`, Android plugin checks and Linux/Windows packaging before updating the lockfile. Recheck the paths after that migration.

For a signed Windows release, provide a certificate file and password through Electron Builder's `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables, or configure the `electron.windows.signing.release` object in `build.json`. Do not commit certificate files or passwords. The default build is unsigned.

## Vault files and recovery

On Linux and Windows, choose **New vault** to open the native save dialog and create a vault, or choose **Open vault** to select an existing one. The renderer receives vault contents only after selection; it never supplies an arbitrary operating-system path to filesystem IPC. Subsequent writes use a main-process-held opaque handle and an atomic temporary-file replacement.

On Android, choose the folder containing the vault in the system folder picker; CryptPass then lists files in that folder so you can choose the vault inside the app. Android may prevent selecting a storage root; select the subfolder that directly contains the vault. The app keeps a persistable SAF grant to that folder and resolves the current child by filename when reading or writing. This lets it follow a vault that a local sync app replaces in place. Relinking an existing vault requires choosing the folder and then the file once; the recovery sequence remains saved.

The app uses the published CryptPass npm package; `package-lock.json` records the exact package version and integrity hash. Existing legacy vaults remain readable through the library's compatibility reader. After a legacy unlock, the app explains that AES-CBC has no integrity protection and asks before migrating to authenticated AES-256-GCM. The original vault is backed up while the new representation is written and reopened from storage; only then is the migration backup discarded. Existing single-wallet application settings migrate into a local wallet profile at startup after the new profile record is written and verified.

## Security behavior and limits

Electron runs with renderer sandboxing enabled, Node integration disabled and context isolation enabled. The Cordova Electron 4.0.0 template overrides the configured sandbox setting and its preload reads `package.json` with `require()`, which sandboxed preloads do not support. The `after_prepare` adaptation removes that override and embeds the Cordova service map into the preload. Custom IPC validates the sender and main frame, external navigation and popups are blocked, and the renderer receives narrow vault and secure-storage methods. Migration backups for Electron vaults use a sibling file beside the selected vault and are removed after the migrated vault is reopened successfully. The sequence is stored through Electron `safeStorage`, not renderer `localStorage`. Android continues to use its secure-storage plugin.

The inactivity lock defaults to 10 seconds and can be set to 10 seconds, 30 seconds, one minute or five minutes in Preferences. Android requires the device screen-lock credential to unlock a session when one is configured; devices without a secure screen lock use the vault's master password. The Android secure-storage key requires device authentication when a screen lock is configured and remains protected by Android Keystore when it is not. Copied secrets are scheduled for clipboard cleanup after 60 seconds; cleanup compares clipboard contents first where the platform permits. JavaScript cannot guarantee zeroization of strings already copied by the runtime, and some clipboard APIs do not allow safe comparison.

Android vault files use the repository-local `cordova-plugin-cryptpass-storage` SAF bridge; Android configuration secrets use the controlled `cordova-plugin-cryptpass-secure-storage` fork, which preserves the existing secure-storage service and aliases while allowing devices without a screen lock. Android system-bar and display-cutout insets are applied by the local `cordova-plugin-cryptpass-android-ui` plugin; debug builds use a distinct `.debug` application ID through `res/android/build-extras.gradle`.

The application supports multiple local wallet profiles. Each profile stores its own file handle and recovery sequence inside OS-backed secure storage; removing a profile never deletes its vault file. Existing single-wallet settings migrate on first launch, after the new profile record is verified. The interface, alerts, confirmation prompts, placeholders and wallet-management screens are available in English and Italian. The app detects the system/browser language on first launch and remembers a manually selected language. User-provided wallet names, descriptions and entry data remain in the language entered; native operating-system dialogs follow the system language. No antivirus disabling or installation-directory whitelisting is required or recommended.
