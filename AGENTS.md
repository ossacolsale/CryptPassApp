# Istruzioni permanenti per Codex

Queste regole si applicano alle modifiche future a questo repository. Aggiungere o aggiornare qui eventuali istruzioni quando l'utente lo richiede.

## Prima di modificare codice

1. Leggere questo file all'inizio di ogni sessione/task.
2. Se il task riguarda architettura, Android, storage, sicurezza, build o migrazioni, leggere anche `docs/CODEX_PROJECT_MAP.md` prima di modificare il codice.
3. Cercare sempre i riferimenti reali nel repository prima di assumere che una funzione, un ramo o un plugin sia ancora usato. Distinguere tra codice sorgente effettivamente raggiungibile, configurazione residua, test legacy e artefatti generati.
4. Usare la documentazione del progetto come punto di orientamento iniziale, non come sostituto della verifica nel codice: se l'evidenza del repository contraddice la documentazione, seguire il codice e aggiornare la documentazione pertinente.

## Mappa rapida del repository

- UI / viste: `src/Views/`
- Stato, scenari ed eventi: `src/Controllers/`
- Orchestrazione applicativa: `src/AppManage/AppActions.ts`
- Configurazione e profili wallet: `src/Configuration/`
- File vault e storage applicativo: `src/DataHandlers/FileSystem.ts`
- Metadata/configuration OS-backed: `src/DataHandlers/SecureStorage.ts`
- Bridge Android nativo: plugin Cordova locale / `config.xml`
- Bridge Electron: `setup-electron.js`, `scripts/electron-after-prepare.js`, `scripts/patch-cordova-electron.js`
- Bundle JS generato: `www/js/cryptpassapp.js` (non modificare a mano)
- Localizzazioni generate: `www/js/locales.js` (generato da `scripts/build-locales.js`)
- Test: `tests/`
- Codice nativo/plugin locale: cercare nelle directory dichiarate da `config.xml`, `package.json` e `plugin.xml`; preferire sempre la sorgente versionata nel repository alla copia sotto `platforms/`.

## Versioni

- A ogni nuova release, incrementare la versione sia in `package.json` sia in `config.xml`, mantenendo i due valori allineati.
- Per una correzione di bug o un refactor isofunzionale, incrementare la versione fix (patch).
- Per una nuova funzionalità, incrementare la versione minor.
- Una build di test non è una release e non richiede di incrementare la versione.

## Android

- Non preparare né pubblicare una release Android senza una richiesta esplicita dell'utente.
- Quando le modifiche da testare riguardano solo Android, creare un APK completo di test installabile accanto all'app ufficiale, usando un package name distinto (per esempio aggiungendo `.test`).
- Non usare `platforms/android/...` come sede permanente delle modifiche: è output generato da Cordova e può essere rigenerato da zero.
- Non patchare sorgenti Java/Kotlin generati con regex o `string.replace()` in uno script `prepare` come soluzione architetturale permanente.
- Per nuovo comportamento nativo usare un plugin Cordova reale (`plugin.xml` + sorgenti nativi) oppure una configurazione Cordova ufficiale appropriata.
- Per configurazione Gradle persistente preferire `build-extras.gradle`, `config.xml` o le risorse del plugin, secondo il caso, invece di modificare direttamente `platforms/android/app/build.gradle`.
- Prima di introdurre o mantenere un workaround nativo verificare se la stessa esigenza è già coperta da `cordova-android`, Android SDK/WebView o dalla gestione CSS/HTML dell'app.
- Preservare la compatibilità dei vault e dei dati esistenti, salvo esplicita richiesta contraria.
- Non registrare/loggare password, master key, recovery sequence, segreti o entries in diagnostica.

## Build di test

- Dopo aver completato modifiche che richiedono test, creare gli artefatti per le piattaforme interessate:
  - solo Android: APK di test con package name distinto dall'app ufficiale;
  - solo Electron: build Electron in modalità release;
  - modifiche che riguardano entrambe: entrambi gli artefatti.

Baseline utile:

```sh
npm test
npx tsc --noEmit
```

Per impacchettare il JS aggiornato, `tsc --noEmit` verifica solo i tipi e non aggiorna il bundle; quando il task richiede una build applicativa, usare il normale processo di compilazione del progetto in modo che `www/js/cryptpassapp.js` venga rigenerato.

Per Android, la sequenza di riferimento del progetto è:

```sh
npm run cryptpass:build
npm run locales:build
tsc
cordova build android --debug
```

## Regole strutturali

- Trattare `platforms/`, `node_modules/` e gli altri output generati come artefatti, non come sorgente autorevole.
- Quando una modifica è oggi ottenuta tramite hook di build, prima di mantenerla verificare se può essere rappresentata strutturalmente nel posto corretto: sorgente del plugin, `plugin.xml`, `config.xml`, `build-extras.gradle`, codice TypeScript o CSS.
- Non duplicare funzionalità native in più plugin se possono essere accorpate coerentemente in un'unica API specifica dell'app.
- Se un repository di plugin è sotto il controllo del progetto, preferire una modifica/fork versionato o un plugin locale del repository all'iniezione a build-time del suo codice generato.
- Quando si elimina una vecchia API o un plugin, cercare anche usi indiretti: `package.json`, `config.xml`, `plugin.xml`, typings, test, script di build, documentazione e bundle generati. Rimuovere i residui solo dopo aver verificato che non siano più necessari.
- Non trattare la presenza di una dipendenza come prova del suo utilizzo: verificare le chiamate effettive e il percorso di esecuzione.

## Debugging

Non assumere che un errore mostrato come “vault/file/decryption” abbia origine nello storage. Seguire la pipeline reale e identificare il primo punto che fallisce:

`Config.readData()` → `CryptPassCached` → `GetK()` → `GetEntriesManage()` → `AutoLock.start()` / scenario.

Quando il problema sembra appartenere a un sottosistema, verificare anche i confini tra i sottosistemi (UI → controller → app actions → data handlers → bridge nativo) prima di modificare il primo file che presenta l'errore.

Un problema già risolto e da non reintrodurre: con `tsconfig.outFile` e il vecchio codice a static arrow-property, un alias temporaneo TypeScript generato (`_a`) collideva con altre classi e produceva `_a.scheduleLock is not a function`. Preferire metodi statici nominati per callback condivisi quando si usa questo `outFile`.

## Criteri per modifiche e refactoring

- Prima individuare il comportamento attuale e i punti di ingresso reali.
- Separare sempre il comportamento necessario dal workaround contingente che lo implementa.
- Preferire la soluzione più vicina al livello che possiede realmente la responsabilità: UI/CSS per layout UI, TypeScript per logica applicativa, plugin nativo per API Android non esposte da Cordova, Gradle/configurazione per build configuration.
- Dopo una migrazione, verificare esplicitamente che il vecchio percorso non sia più necessario prima di cancellarlo.
- Evitare grandi refactor non richiesti mentre si risolve un bug: modificare solo ciò che serve, ma eliminare i workaround direttamente coinvolti quando esiste una sostituzione strutturale equivalente e verificabile.
