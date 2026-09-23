# CryptPass App

CryptPass App is a Cordova password wallet for Android, Linux and Windows. Vault contents are encrypted by the pinned [CryptPass library](https://github.com/ossacolsale/CryptPass); this app does not implement cryptography itself.

## Platform support status

| Platform | Build | Runtime tested in this remediation | File handling | Secure metadata | Notes |
|---|---|---|---|---|---|
| Linux | Yes: `.deb` and `.zip` | No interactive launch test | Electron native open/save dialogs; opaque main-process handles | Electron `safeStorage` | `safeStorage` requires an available OS-backed encryption provider; initialization fails closed otherwise. |
| Windows | Yes: NSIS installer and `.zip` | No Windows runtime test | Electron native open/save dialogs; opaque main-process handles | Electron `safeStorage` | Unsigned development builds are supported; configure certificate settings for signed releases. |
| Android | Build not verified here | No device/provider test | SAF document URIs and persisted URI permissions | Android secure-storage plugin | Cloud `DocumentProvider` behavior depends on the provider; revoked permissions require the user to reselect/relink the vault. |

The Linux build produced `com.cryptpass.app_1.1.4_amd64.deb` and `com.cryptpass.app-1.1.4.zip`. The Windows build produced `CryptPassApp Setup 1.1.4.exe` and `CryptPassApp-1.1.4-win.zip`. These are build results, not a claim of interactive runtime verification on those platforms.

## Build and test

Use Node.js 22 for the Electron packaging toolchain. Install dependencies with `npm ci`; the postinstall script applies a compatibility patch for `cordova-electron@4.0.0` and `electron-builder@26.15.3`.

```sh
npm test
npx tsc --noEmit
npm run build-electron
npm run build-android
```

Android builds also need the Android SDK and a compatible JDK installed. `npm run test-electron` launches the desktop app for manual testing; `npm run test-android` launches it on an attached device/emulator.

For a signed Windows release, provide a certificate file and password through Electron Builder's `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables, or configure the `electron.windows.signing.release` object in `build.json`. Do not commit certificate files or passwords. The default build is unsigned.

## Vault files and recovery

On Linux and Windows, choose **New vault** to open the native save dialog and create a vault, or choose **Open vault** to select an existing one. The renderer receives vault contents only after selection; it never supplies an arbitrary operating-system path to filesystem IPC. Subsequent writes use a main-process-held opaque handle and an atomic temporary-file replacement.

On Android, choose a vault using the system document picker. The app retains the document URI and persistable access grant where the provider supports them. If a provider revokes access or replaces the document, reselect the intended vault through the restore/relink flow. SAF providers do not guarantee atomic replacement, and cloud-provider behavior needs device testing.

The app pins CryptPass `0.1.0` at commit `aa2d9e5800d1c797403f2d0428a1e4217abd32bf`. Existing legacy vaults can be opened through the library's compatibility reader. A successful save through the password-based API rewrites the vault in the authenticated format. This application change does not migrate vaults until the user successfully saves them.

## Security behavior and limits

Electron disables renderer Node integration, isolates the context, validates custom IPC senders, blocks external navigation/popups, and exposes narrow vault and secure-storage methods. The sequence is stored through Electron `safeStorage`, not renderer `localStorage`. Android continues to use its secure-storage plugin.

The inactivity lock defaults to five minutes and also responds to background/pause events. Copied secrets are scheduled for clipboard cleanup after 60 seconds; cleanup compares clipboard contents first where the platform permits. JavaScript cannot guarantee zeroization of strings already copied by the runtime, and some clipboard APIs do not allow safe comparison.

This release still supports one wallet profile at a time. Multi-wallet management and localized English/Italian resources have not been implemented; the current interface remains English. Electron's `sandbox` is disabled because the Cordova preload integration requires its local plugin bridge; Node integration remains disabled and context isolation remains enabled. No antivirus disabling or installation-directory whitelisting is required or recommended.
