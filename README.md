# CryptPass App

CryptPass App is a Cordova password wallet for Android, Linux and Windows. Vault contents are encrypted by the pinned [CryptPass library](https://github.com/ossacolsale/CryptPass); this app does not implement cryptography itself.

## Desktop downloads and installation

Download the latest stable desktop release from [Releases/latest](https://github.com/ossacolsale/CryptPassApp/releases/latest). Until the first stable release is published, or to browse older releases, use [all Releases](https://github.com/ossacolsale/CryptPassApp/releases).

The x64 desktop distributables are:

- **Windows portable `.exe`**: download and run `CryptPass-<version>-windows-x64.exe`; no installer is required.
- **Linux portable `.AppImage`**: download `CryptPass-<version>-linux-x64.AppImage`, run `chmod +x CryptPass-*-linux-x64.AppImage`, then launch it with `./CryptPass-<version>-linux-x64.AppImage`. A working FUSE setup may be required by the AppImage runtime.
- **Linux `.deb`** for Debian, Ubuntu, Mint and derivatives: install with `sudo apt install ./CryptPass-<version>-linux-x64.deb`, then launch CryptPass from the application menu.

Builds are unsigned by default. Windows may show an unknown-publisher/SmartScreen prompt; verify the download source before running. No antivirus exclusions are required.

Linux requires an available OS secure-storage service: Secret Service (for example, an unlocked GNOME Keyring or KeePassXC Secret Service provider) or the desktop portal secret provider. CryptPass checks Electron's asynchronous `safeStorage` encryption and accepts only Secret Service (`v11`) or portal (`v12`) encryption. Initialization fails closed for the weaker POSIX fallback (`v10`); a supported async portal is accepted even if the legacy backend reports `basic_text`. AppImage portability does not remove these storage requirements.

## Platform verification status

The workflow defines native Windows and Linux builds; configuration alone is not proof of a successful build. Run results and downloadable artifacts are recorded in GitHub Actions. Local automated tests do not establish interactive runtime compatibility. Windows, Linux desktop focus/input behavior and Android SAF/device behavior require the manual checks described below.

Browser builds share the UI and submit protection, but the current filesystem adapter has no browser vault writer: browser persistence returns failure and must never be shown as a successful save.

## Build and test

Use Node.js 22 and Cordova CLI 11.1.0 for the Electron packaging toolchain. Install dependencies with `npm ci`; the postinstall script applies a compatibility patch for `cordova-electron@4.0.0` and `electron-builder@26.15.3`.

The committed `.npmrc` uses `install-links=true` so repository-local plugins are installed as packed copies, matching the lockfile on clean machines and CI runners.

```sh
npm install --global cordova@11.1.0
npm ci
npm test
npx tsc --noEmit
cordova platform add electron@4.0.0 --nosave
npm run build-electron
```

Electron outputs are written to `platforms/electron/build/`. Each host builds only its native x64 targets; the compatibility patch disables Electron Builder publishing (`publish: never`). The CryptPass dependency compilation uses a cross-platform Node cleanup instead of its Unix-only `rm` script.

Android builds also need SDK Platform 36, Build Tools 35.0.0 and JDK 17 installed. Use `cordova platform add android --nosave` if needed; `npm run electron-compile && cordova build android --debug` produces a test APK with the distinct `com.cryptpass.app.debug` ID. `npm run build-android` is for explicitly authorized Android releases. `npm run test-electron` launches the desktop app for manual testing; `npm run test-android` launches it on an attached device/emulator.

The current development lockfile still contains deprecated toolchain packages. `q@1.5.1` comes through `cordova-common@5.0.1` from `cordova-android@14.0.1`, `cordova-browser@7.0.0` and `cordova-electron@4.0.0`. `glob@7.2.3` and `inflight@1.0.6` come through `shelljs@0.8.5` from `cordova-browser`, `rimraf@3.0.2` from `electron-devtools-installer@3.2.1` in `cordova-electron`, and `@electron/asar@3.4.1` in `electron-builder`; `rimraf@2.6.3` comes through `temp@0.9.4` in the Windows packaging chain. `boolean@3.2.0` comes through `global-agent@3.0.0` and `roarr@2.15.4` in the Electron builder chain. These are development and packaging dependencies. The current Cordova parents are still in use, and major-version overrides can break their consumers. The migration path is to move Android to a Cordova platform/toolchain release whose supported `cordova-common` tree removes `q`, and replace `cordova-electron@4.0.0` with a maintained Electron packaging path whose builder tree removes the `electron-devtools-installer` and `temp` chains; then run `npm explain`, `npm ls`, Android plugin checks and Linux/Windows packaging before updating the lockfile. Recheck the paths after that migration.

For a signed Windows release, provide a certificate file and password through Electron Builder's `CSC_LINK` and `CSC_KEY_PASSWORD` environment variables, or configure the `electron.windows.signing.release` object in `build.json`. Do not commit certificate files or passwords. The default build is unsigned.

## GitHub Actions and desktop releases

In **Actions → Electron x64 → Run workflow**, select `master` (or the branch to test). The manual run creates downloadable `electron-windows-x64` and `electron-linux-x64` Actions artifacts without creating a release. Actions wraps downloads in transport ZIPs; inside are the actual `.exe`, `.AppImage` and `.deb` distributables. The two native jobs use Node 22, `npm ci`, tests, TypeScript checking and `npm run build-electron`. They verify the expected filenames, nonempty contents and executable/package signatures before uploading. Failed tests or builds prevent artifact upload for that job.

Every push to `master` now starts the native Windows/Linux builds automatically and publishes a desktop release only after both builds and all checks succeed. For each completed, verified significant change, Codex increments the version (patch for fixes/infrastructure/documentation, minor for features), aligns `package.json`, the root lockfile versions and `config.xml`, then commits and pushes. No manual tag or release command is needed. The release job creates `vX.Y.Z` at the exact commit that was built, downloads both Actions artifacts, verifies all three distributables and attaches them to the GitHub Release. Existing version tags are rejected rather than overwritten; use a new version for the next publication. Tag creation does not trigger another build. Manual workflow runs remain available for build-only checks and do not publish releases.

Build jobs have `contents: read`; only the release job has `contents: write`. Electron Builder publishing remains disabled, so the workflow is the sole publisher. No Android deployment or signing secrets are involved. Codex monitors the run and checks the published release assets before declaring publication complete.

For manual regression checks, lock Electron by timeout while another app is active, while minimized, and while CryptPass is active. The session must lock without activating/restoring the window; on a voluntary return the unlock field must accept input. On Android and Electron, test adding and renaming an entry with slow storage, repeated Save/Enter, failed writes and retry, then reopen the vault to confirm persistence. Also test a timeout/minimize during a pending save: the unlock screen must stay visible and the form/result must recover after unlocking.

## Vault files and recovery

On Linux and Windows, choose **New vault** to open the native save dialog and create a vault, or choose **Open vault** to select an existing one. The renderer receives vault contents only after selection; it never supplies an arbitrary operating-system path to filesystem IPC. Subsequent writes use a main-process-held opaque handle and an atomic temporary-file replacement.

On Android, choose the folder containing the vault in the system folder picker; CryptPass then lists files in that folder so you can choose the vault inside the app. Android may prevent selecting a storage root; select the subfolder that directly contains the vault. The app keeps a persistable SAF grant to that folder and resolves the current child by filename when reading or writing. This lets it follow a vault that a local sync app replaces in place. Relinking an existing vault requires choosing the folder and then the file once; the recovery sequence remains saved.

The app uses the published CryptPass npm package; `package-lock.json` records the exact package version and integrity hash. Existing legacy vaults remain readable through the library's compatibility reader. After a legacy unlock, the app explains that AES-CBC has no integrity protection and asks before migrating to authenticated AES-256-GCM. The original vault is backed up while the new representation is written and reopened from storage; only then is the migration backup discarded. Existing single-wallet application settings migrate into a local wallet profile at startup after the new profile record is written and verified.

## Security behavior and limits

Electron runs with renderer sandboxing enabled, Node integration disabled and context isolation enabled. The Cordova Electron 4.0.0 template overrides the configured sandbox setting and its preload reads `package.json` with `require()`, which sandboxed preloads do not support. The `after_prepare` adaptation removes that override and embeds the Cordova service map into the preload. Custom IPC validates the sender and main frame, external navigation and popups are blocked, and the renderer receives narrow vault and secure-storage methods. Migration backups for Electron vaults use a sibling file beside the selected vault and are removed after the migrated vault is reopened successfully. The sequence is stored through Electron `safeStorage`, not renderer `localStorage`. Android continues to use its secure-storage plugin.

The inactivity lock defaults to 10 seconds and can be set to 10 seconds, 30 seconds, one minute or five minutes in Preferences. Android requires the device screen-lock credential to unlock a session when one is configured; devices without a secure screen lock use the vault's master password. The Android secure-storage key requires device authentication when a screen lock is configured and remains protected by Android Keystore when it is not. Copied secrets are scheduled for clipboard cleanup after 60 seconds; cleanup compares clipboard contents first where the platform permits. JavaScript cannot guarantee zeroization of strings already copied by the runtime, and some clipboard APIs do not allow safe comparison.

Android vault files use the repository-local `cordova-plugin-cryptpass-storage` SAF bridge; Android configuration secrets use the controlled `cordova-plugin-cryptpass-secure-storage` fork, which preserves the existing secure-storage service and aliases while allowing devices without a screen lock. Android system-bar and display-cutout insets are applied by the local `cordova-plugin-cryptpass-android-ui` plugin; debug builds use a distinct `.debug` application ID through `res/android/build-extras.gradle`.

The application supports multiple local wallet profiles. Each profile stores its own file handle and recovery sequence inside OS-backed secure storage; removing a profile never deletes its vault file. Existing single-wallet settings migrate on first launch, after the new profile record is verified. The interface, alerts, confirmation prompts, placeholders and wallet-management screens are available in English and Italian. The app detects the system/browser language on first launch and remembers a manually selected language. User-provided wallet names, descriptions and entry data remain in the language entered; native operating-system dialogs follow the system language. No antivirus disabling or installation-directory whitelisting is required or recommended.
