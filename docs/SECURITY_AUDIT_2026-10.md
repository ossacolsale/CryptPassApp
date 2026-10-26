# Electron security remediation (2026-10)

## TLS advisory and network surface

The Electron runtime is pinned to 44.9.3, which includes the certificate mitigation introduced in 44.9.1. The generated Cordova main process uses `net.fetch` only to serve `file://` URLs through the app's local custom protocol. The app code, bundled CryptPass dependency, and generated main/preload contain no outbound HTTPS client call or app-owned update/check mechanism. The Electron bridge delegates HTTPS navigation only for the two allowlisted website hosts to `shell.openExternal`, which uses the system browser. The packaged Electron app manifest has no runtime npm dependencies. Therefore the advisory's applicability to app-owned runtime network traffic is not established by this source review; the packaged Electron runtime is patched regardless.

## `safeStorage` migration

Electron secure storage now awaits the asynchronous API during startup and persistence. Existing ciphertext is passed to `decryptStringAsync`; Electron documents that ciphertext written by the synchronous API remains readable by the asynchronous API. The `shouldReEncrypt` signal triggers a second decrypt as required by Electron, schema validation, then async encryption and atomic replacement before the readiness promise resolves. A rejected initialization leaves dependent IPC calls fail-closed. The renderer checks secure-storage readiness before consulting legacy `localStorage`, so an unavailable main-process store cannot trigger migration of stale renderer values.

Windows and macOS require `isAsyncEncryptionAvailable()` to resolve true. Linux additionally runs an in-memory encryption probe. It accepts only the Chromium async Secret Service (`v11`) or Secret Portal (`v12`) ciphertext tags and rejects `v10`, which Chromium's POSIX fallback uses with a hardcoded key. This checks the provider actually used for encryption instead of inferring it from the legacy backend API; it also permits the stronger Portal provider when the synchronous backend reports `basic_text`. The probe is discarded and never written to disk. Electron does not expose an async provider identifier directly; this policy checks the provider tag of an actual encryption operation. The implementation details are documented in Chromium's [POSIX key provider](https://github.com/chromium/chromium/blob/main/components/os_crypt/async/browser/posix_key_provider.cc), [Secret Service provider](https://github.com/chromium/chromium/blob/main/components/os_crypt/async/browser/freedesktop_secret_key_provider.cc), and [Secret Portal provider](https://github.com/chromium/chromium/blob/main/components/os_crypt/async/browser/secret_portal_key_provider.h).

All secure-store writes retain mode `0600` temporary files and rename-based replacement. The existing JSON schema, sender validation, navigation restrictions, renderer sandbox settings, and named-key IPC surface are unchanged.

## Validation record

Validation completed in this environment with Node.js 22.22.1 and npm 9.2.0:

- `npm ci` completed successfully; `npm ls electron` resolves 44.9.3 at the root and under `cordova-electron`.
- `npm test` passed (all 3 test files); focused async secure-storage tests cover readiness ordering, unavailable/weak stores including simulated `v10` Linux fallback and `v12` Portal, corrupt data, decrypt/encrypt failures, key rotation and stale renderer migration protection.
- `npm run electron-compile` passed.
- `npm run build-electron` passed and packaged Linux `.deb`/`.zip` and Windows NSIS/`.zip` targets with Electron 44.9.3. The builder needed network access to fetch Electron's Linux and Windows runtime archives.
- The generated `platforms/electron/platform_www/cdv-electron-main.js` and `cdv-electron-preload.js` were inspected after Cordova preparation. Sender/main-frame validation, popup and navigation restrictions, async readiness, and narrow preload methods remain present; `src/settings/electron.json` still sets `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, and `webSecurity: true`.

This environment provides a Linux build host, not Windows or macOS runtime testing. Secure-storage provider behavior and reading an actual pre-existing synchronous ciphertext were not interactively tested on any OS; compatibility is based on Electron's API documentation and the regression test preserves the legacy ciphertext input to the async decrypt API. A successful packaging build does not imply an interactive vault-storage test.
