# CryptPassApp — mappa funzionale e strutturale per Codex

> Documento di orientamento, non specifica normativa del comportamento futuro.
> Usarlo per individuare i primi punti da ispezionare; se il codice reale contraddice questo documento, verificare il codice e aggiornare il documento quando la modifica è confermata.

## 1. Scopo del progetto

CryptPassApp è un'app Cordova multipiattaforma per gestire wallet/password vault. La crittografia del vault non è implementata nell'app: viene delegata alla libreria `cryptpass` dichiarata in `dependencies`.

Le piattaforme dichiarate sono:

- Android (`cordova-android`)
- Electron (`cordova-electron`)
- Browser (principalmente build/supporto Cordova, non il backend vault completo)

L'app mantiene:

1. un file vault cifrato;
2. metadata/configurazione e profili wallet in secure storage della piattaforma;
3. stato runtime del wallet e della sessione in memoria.

## 2. Regola mentale principale

Quando un bug riguarda il vault, non partire dal nome dell'errore mostrato dalla UI. Ricostruire questa pipeline:

```text
UI/View
  ↓
AppActions
  ↓
Config
  ├── SecureStorage (metadata/config/sequences)
  └── FS (file vault cifrato)
         ↓
   contenuto JSON cifrato
  ↓
CryptPassCached (libreria cryptpass)
  ↓
GetK(password)
  ↓
GetEntriesManage(K, true)
  ↓
State + AutoLock + ScenarioController
```

Il primo errore della catena è normalmente più utile dell'ultimo messaggio mostrato all'utente.

---

## 3. Mappa directory

### `src/main.ts`

Punto di ingresso applicativo e gestione della sessione.

Responsabilità importanti:

- `deviceready` → inizializzazione localizzazione/scenario iniziale;
- `State` → stato globale runtime (`K`, password, `CryptPass`, `EntriesManage`);
- `AutoLock` → timeout, lock di sessione, clipboard cleanup, unlock tramite credenziale dispositivo;
- `DeviceAuth` → bridge Cordova per autenticazione dispositivo / tastiera Android.

### `src/AppManage/`

Orchestrazione delle azioni applicative.

`AppActions.ts` è il primo punto da guardare per problemi di unlock/login perché coordina:

1. `Config.readData()`;
2. costruzione di `CryptPassCached`;
3. `GetK(password)`;
4. `GetEntriesManage(K, true)`;
5. aggiornamento dello stato globale e avvio AutoLock.

Qui vive anche la diagnostica dell'unlock. Non introdurre nei log materiale segreto.

### `src/Configuration/`

Livello di configurazione persistente dell'app.

- `Config.ts`: schema/config corrente, sequence e riferimento al keypass/vault.
- `WalletProfiles.ts`: profili wallet multipli, wallet attivo e migrazione da vecchia configurazione singola.
- `ConfigActions.ts`: flusso applicativo di inizializzazione/setup della configurazione.
- `StdReadersAndWriters.ts`: writer passati alla libreria `cryptpass`.

Invariante: cambiare profilo non deve cancellare il vault; cambia solo configurazione/associazione persistita.

La configurazione attiva usa la chiave legacy/compatibile `cryptPassCfg` e il profilo store usa `cryptPassWalletProfiles`. Non rinominare o migrare alla cieca senza preservare i dati esistenti.

### `src/DataHandlers/FileSystem.ts`

Astrazione di accesso al file vault.

Backend attuali:

- `ElectronFS`: dialog nativi + handle opaco verso il main process Electron.
- `AndroidFS`: Storage Access Framework (SAF), tree URI e risoluzione del file dentro la directory concessa.
- `FS`: dispatcher per piattaforma.

Concetti Android importanti:

```text
ACTION_OPEN_DOCUMENT_TREE
        ↓
 treeUri persistito
        ↓
 cryptpass-tree:<encoded-tree-uri>#/<encoded-relative-name>
        ↓
 resolveFileInTree(treeUri, name)
        ↓
 document URI corrente
        ↓
 read / write
```

Il riferimento `cryptpass-tree:` è un formato applicativo: trattarlo come compatibilità da preservare finché tutti i dati/config esistenti non sono migrati esplicitamente.

La risoluzione del file avviene per nome relativo all'interno dell'albero, non assumendo che il document URI finale resti invariato per sempre. Questo è rilevante per provider che possono sostituire documenti.

Attualmente i write Android fanno anche read-back/verifica del contenuto. Non rimuovere tale verifica senza una motivazione tecnica e test.

### `src/DataHandlers/SecureStorage.ts`

Astrazione del secure storage di metadata/config.

- Electron → bridge `window.cryptPassDesktop` e `safeStorage` nel main process.
- Android → plugin secure storage.

Non confondere questo storage con il file vault: la sequence/config e il contenuto JSON del vault seguono percorsi diversi.

### `src/Controllers/`

- `ScenarioController.ts`: scenario/view corrente, attach/detach handler e snapshot temporaneo della UI durante il lock.
- `ViewModel.ts`: primitive comuni delle view, loader, input, focus e gestione form.
- `EventsController.ts`: registro globale degli eventi.

Per bug di UI dopo lock/unlock partire da `ScenarioController` e poi dalle View coinvolte; non modificare direttamente lo stato DOM senza capire il ciclo `changeScenario` → `closeScenario` → `attachHandlers` → `Init`.

### `src/Views/`

UI applicativa. Le View costruiscono markup e registrano handler.

Per un bug UI:

1. individuare la View;
2. verificare gli handler in `Handlers`;
3. verificare `ScenarioController`/`EventsController`;
4. solo dopo toccare CSS/shared helpers.

### `src/Helpers/`

Utility trasversali (error handling, localizzazione, tag, view helpers, ecc.). Evitare di spostare qui logica che appartiene a storage, configurazione o dominio.

---

## 4. Build e file generati

### TypeScript

`tsconfig.json` usa:

```text
module = amd
target = ES6
outFile = www/js/cryptpassapp.js
rootDir = src
```

Quindi `www/js/cryptpassapp.js` è **generato**. Non correggere lì un problema che nasce da `src/`.

Importante: `npx tsc --noEmit` non aggiorna il bundle. Per una build Cordova che deve contenere il JS modificato bisogna eseguire `tsc` senza `--noEmit` oppure lo script equivalente.

### Localizzazioni

`scripts/build-locales.js` genera `www/js/locales.js` da `locales/en.json` e `locales/it.json`.

### Libreria CryptPass

`cryptpass:build` compila/bundla la dipendenza e copia il risultato nel progetto tramite `scripts/copy-cryptpass-bundle.js`.

Non modificare manualmente il bundle se il fix appartiene alla libreria: identificare prima il commit/versione della dipendenza.

---

## 5. Android: architettura nativa

### Stato attuale da conoscere

Il repository ha storicamente usato due plugin custom:

- `cordova-plugin-save-dialog`
- `cordova-plugin-simple-file-chooser`

La revisione in corso sta migrando questa logica verso un plugin proprietario locale basato direttamente sul SAF.

Per qualunque nuova modifica Android, non assumere che i vecchi plugin siano necessari solo perché compaiono nel manifest: cercare le chiamate effettive e verificare il plugin installato.

### Obiettivo architetturale

La soluzione preferita è un plugin Cordova locale, versionato nello stesso repository dell'app, che contenga direttamente il codice Java necessario al dominio CryptPass invece di patchare sorgenti generati durante `cordova prepare`.

Preferire una struttura simile a:

```text
local-plugins/
  cordova-plugin-cryptpass-android/
    plugin.xml
    src/android/...
    www/...
    types/...
```

Il nome effettivo deve seguire quello già adottato dal repository quando la migrazione viene implementata.

### Funzionalità native Android candidate

Nel medesimo plugin possono risiedere, se confermati necessari:

- accesso SAF al tree (`ACTION_OPEN_DOCUMENT_TREE`);
- persistenza/verifica del grant URI;
- enumerazione e risoluzione dei figli;
- creazione e scrittura tramite `DocumentsContract` / `ContentResolver`;
- `CryptPassDeviceAuth` (screen-lock authentication e richiesta tastiera), se si decide di accorparlo.

Separare le responsabilità Java in classi distinte anche se il plugin è unico.

### Regola fondamentale

Non utilizzare `android-after-prepare.js` per iniettare/patchare codice Java nei plugin o in `MainActivity.java` se la stessa cosa può essere dichiarata nel plugin, in `plugin.xml`, in una risorsa nativa o in una configurazione Gradle ufficiale.

---

## 6. `scripts/android-after-prepare.js`

Questo file è stato usato come contenitore di workaround Android.

La versione in evoluzione del repository ha già rimosso la grande patch SAF che modificava `Chooser.java`.

Le responsabilità storicamente rimaste sono:

1. `debug` con `applicationIdSuffix`;
2. generazione/registrazione di `CryptPassDeviceAuth.java`;
3. patch di `secure-storage-echo` (`RSA.java` e `SecureStorage.java`);
4. patch di `MainActivity.java` per gli insets/WebView.

Ordine di migrazione preferito:

- `applicationIdSuffix` → `build-extras.gradle` o configurazione equivalente stabile;
- `CryptPassDeviceAuth` → vero plugin Cordova / sorgente nativo dichiarato;
- patch secure storage → fork/repository locale del plugin oppure nuovo componente nativo controllato, preservando il comportamento e i dati;
- insets → prima verificare se Cordova/WebView/CSS possono risolvere il problema; non conservare automaticamente un workaround Java solo perché esiste.

Risultato desiderato: eliminazione dell'hook quando non contiene più una responsabilità che Cordova non può esprimere in modo strutturale.

---

## 7. Android Gradle e `build-extras.gradle`

Quando è necessario un comportamento Gradle app-specifico, non modificare direttamente:

```text
platforms/android/app/build.gradle
```

perché è generato/rigenerabile.

Usare invece una risorsa persistente del progetto, tipicamente:

```text
res/android/build-extras.gradle
```

oppure il meccanismo equivalente previsto dal plugin/configurazione Cordova in uso.

Il requisito `debug` side-by-side può essere mantenuto solo se serve davvero al workflow; la sua implementazione non deve dipendere dal parsing di `build.gradle` generato.

---

## 8. Electron

Electron usa un'architettura diversa da Android.

`setup-electron.js` inietta/aggiorna nel main process un bridge ristretto:

```text
renderer
  ↓ contextBridge
window.cryptPassDesktop
  ↓ IPC
Electron main process
  ↓
filesystem + safeStorage
```

Il renderer non deve ricevere path arbitrari dal sistema operativo per operazioni di vault. Il main process mantiene handle opachi e applica i controlli di sender/frame.

`SecureStorage.ts` su Electron usa questo bridge; non introdurre fallback che rendano una failure del secure storage simile a "chiave assente".

`postinstall` applica una patch di compatibilità a `cordova-electron`/`electron-builder`: trattarla come compatibilità di toolchain, non come backend applicativo.

---

## 9. Sicurezza: confini da non rompere

### Dati che NON devono finire nei log/diagnostica

- password;
- master key/K;
- recovery sequence;
- entries decriptate;
- contenuto completo del vault.

### Metadata vs vault

Il secure storage contiene metadata/configurazione; il vault JSON cifrato vive nel file scelto dall'utente.

Non duplicare il plaintext del vault nel secure storage come nuova architettura.

Eventuali recovery copy devono essere valutate molto attentamente perché modificano il profilo di rischio e la semantica di ripristino.

### Compatibilità

Prima di cambiare un formato persistente identificare:

- chiavi storage esistenti;
- `cryptpass-tree:` URI;
- vecchia configurazione `cryptPassCfg`;
- migrazione `WalletProfiles`;
- formato vault legacy/v2 gestito dalla libreria.

---

## 10. Problemi tipici e primo posto da cercare

| Sintomo | Primo punto | Secondo punto | Non assumere subito |
|---|---|---|---|
| Password rifiutata | `AppActions.Unlock` / `GetK` | `Config.readData` | che sia SAF |
| Entries non decrypt | `GetEntriesManage` e diagnostica | contenuto/forma del vault | che il grant sia perso |
| Vault non si apre Android | `FileSystem.ts` | plugin SAF nativo | che basti cambiare URI |
| Salvataggio Android fallisce | `WriteFile` + read-back | provider/document URI | che `saveDialog` sia ancora necessario |
| Lock/unlock rompe la UI | `AutoLock` | `ScenarioController` | che il vault sia corrotto |
| Insets / tastiera | `main.ts`, CSS, `config.xml` | WebView/Cordova version | che serva patchare `MainActivity` |
| Build Android diversa dopo clean | `config.xml`, plugin.xml, build extras | hook/scripts | che `platforms/` sia la source of truth |
| JS aggiornato ma APK vecchio | `tsc` / `www/js/cryptpassapp.js` | pipeline Cordova | che TypeScript abbia emesso il bundle |
| Test passano ma device fallisce | distinguere unit/local vs device/provider | log diagnostico | che il test locale copra SAF |

---

## 11. Test strategy

### Sempre prima

```sh
npm test
npx tsc --noEmit
```

### Dopo modifiche TypeScript che devono entrare nell'APK

```sh
npm run cryptpass:build
npm run locales:build
tsc
cordova build android --debug
```

### Categorie di test

1. **Unit/static**: regressioni del codice TS/JS.
2. **Local library**: round-trip della libreria `cryptpass` fuori da Android.
3. **Android device/provider**: grant SAF, process death, reboot, read/write, provider cloud/local.
4. **Electron runtime**: IPC, filesystem e secureStorage.

Non dichiarare un problema Android risolto perché passano i test Node/TypeScript.

---

## 12. Procedura di lavoro consigliata per Codex

### Fase A — orientamento

- Leggere `AGENTS.md`.
- Leggere questo file solo se pertinente al task.
- Cercare tutti gli usi della funzione/plugin/classe coinvolta.
- Distinguere codice sorgente da output generato.

### Fase B — formulare l'ipotesi minima

Scrivere mentalmente la catena causa → effetto con il minor numero di assunzioni.

Se ci sono più ipotesi, testare prima quella che discrimina meglio tra loro.

### Fase C — correzione strutturale

Preferenza:

```text
API/framework ufficiale
    > configurazione dichiarativa
    > plugin locale/versionato
    > wrapper applicativo
    > script di patch
    > modifica manuale di generated output
```

L'ultimo livello deve essere usato solo per diagnosi temporanea, mai come architettura permanente senza forte motivazione.

### Fase D — verifica

- test statici/unit;
- build pulita;
- controllo dei file generati;
- test su piattaforma interessata;
- verifica di compatibilità dati esistenti.

### Fase E — documentazione

Quando cambia un'invariante architetturale, aggiornare questo documento e/o `AGENTS.md`.
Non trasformare questo file in un diario di debug: il dettaglio incidentale va in documenti di indagine separati.

---

## 13. Risultati già acquisiti da indagini precedenti

### Unlock Android: `_a.scheduleLock is not a function`

Indagine precedente: il fallimento apparente nella lettura/decryption degli entries era in realtà un bug runtime successivo alla decrittazione.

Causa: callback statici definiti come arrow-property con `tsconfig.outFile` producevano alias temporanei che potevano collidere fra classi nel bundle AMD generato.

Correzione: callback importanti trasformati in metodi statici nominati che referenziano direttamente la classe (`AutoLock.reset`, `AutoLock.scheduleLock`, ecc.).

Regola da preservare: con il bundle unico `outFile`, evitare pattern che dipendano da alias IIFE temporanei per callback cross-event/class.

### SAF grant

Indagini precedenti hanno mostrato che:

- il flusso Android corrente usa un grant di directory;
- viene richiesto/preservato read+write;
- il file vault viene risolto dentro il tree;
- il problema di unlock citato sopra non era causato dalla perdita del grant.

Questo non dimostra però che ogni provider SAF sia equivalente: per regressioni provider-specifiche servono test sul device/DocumentProvider interessato.

### Diagnostica

È presente una diagnostica unlock secret-free. Deve rimanere tale.

Non reintrodurre probe che modificano il vault per diagnosticare un problema di lettura/decrittazione se esiste un percorso read-only equivalente.

---

## 14. Cose da NON fare senza prima verificare

- Non eliminare `cordova-plugin-simple-file-chooser` solo perché non esiste più un picker di file singolo: il backend può usare lo stesso plugin per il tree SAF finché la migrazione non è completata.
- Non eliminare `cordova-plugin-save-dialog` solo perché il nome non descrive il nuovo flusso: verificare le chiamate effettive e sostituirle con `ContentResolver` prima della rimozione.
- Non assumere che una patch al secure storage sia ridondante: la policy `deviceSecure` può essere un requisito funzionale reale.
- Non assumere che la patch insets sia necessaria: testare prima il comportamento nativo/CSS attuale.
- Non modificare `platforms/android` come soluzione definitiva.
- Non riscrivere il plugin SAF da zero se il comportamento attuale è già testato: prima estrarre le funzionalità esistenti e preservare la compatibilità.

---

## 15. Definition of Done per refactoring Android/storage

Un refactoring Android/storage è completo solo quando:

- non esistono patch build-time del sorgente Java generate per ottenere il comportamento definitivo;
- il codice Android permanente è dichiarato tramite plugin/configurazione versionata;
- i vecchi plugin non compaiono più né come dipendenze né come riferimenti reali, salvo motivazione documentata;
- `platforms/` può essere cancellato e rigenerato senza perdere la funzionalità;
- le build pulite producono lo stesso comportamento;
- i vault già esistenti restano apribili;
- il grant SAF viene mantenuto secondo la semantica prevista;
- read/write vengono verificati su device almeno per storage locale e, quando supportato dal caso d'uso, provider esterno;
- test TypeScript/unit passano;
- i file generati non contengono modifiche manuali non riproducibili;
- la documentazione descrive la nuova source of truth.

---

## 16. Source of truth

In caso di conflitto, usare questo ordine:

1. codice sorgente versionato (`src/`, plugin locali, `config.xml`, configurazione build);
2. test;
3. documentazione di progetto/investigazione;
4. output generati (`www/`, `platforms/`);
5. supposizioni basate sul comportamento storico.

La documentazione aiuta Codex a partire dal posto giusto; non sostituisce la verifica dei riferimenti reali nel codice.
