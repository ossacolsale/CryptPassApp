# Mappa del codice

Questa pagina individua struttura e punti d'ingresso. Non è una specifica funzionale: verificare sempre il codice e i test prima di assumere che un percorso sia ancora usato.

## Applicazione

- `src/main.ts`: avvio Cordova, stato runtime e gestione della sessione.
- `src/Views/`: interfaccia e handler delle schermate.
- `src/Controllers/`: scenari, eventi e primitive condivise delle viste.
- `src/AppManage/AppActions.ts`: orchestrazione delle azioni applicative, incluso l'unlock.
- `src/Configuration/`: configurazione, profili wallet e reader/writer per `cryptpass`.
- `src/DataHandlers/FileSystem.ts`: accesso al file vault per piattaforma.
- `src/DataHandlers/SecureStorage.ts`: metadata e segreti salvati tramite storage della piattaforma.
- `src/Helpers/`: utility condivise.

Per indagare un problema di vault, seguire il percorso effettivo tra View/controller, `AppActions`, configurazione, filesystem o secure storage e libreria `cryptpass`; non dedurre il sottosistema dal solo messaggio finale mostrato dalla UI.

## Codice nativo e piattaforme

- Android: le sorgenti native applicative sono nei plugin versionati sotto `local-plugins/`; `config.xml` dichiara plugin e risorse, inclusa la configurazione persistente `res/android/build-extras.gradle`. Le istruzioni specifiche sono nei README dei plugin. `platforms/android/` è output Cordova rigenerabile.
- Electron: `setup-electron.js` e `scripts/` preparano il bridge del main process e le compatibilità della toolchain; il renderer usa le API esposte dal bridge. `src/DataHandlers/` contiene i chiamanti applicativi.
- `config.xml` e `package.json` dichiarano piattaforme, plugin e dipendenze. Verificare configurazione e chiamate effettive prima di concludere che una dipendenza sia usata.

## Output generati e verifiche

- `tsconfig.json` emette il bundle TypeScript in `www/js/cryptpassapp.js`; modificare `src/`, non il bundle.
- `scripts/build-locales.js` genera `www/js/locales.js` dai file in `locales/`.
- `scripts/copy-cryptpass-bundle.js` copia il bundle della dipendenza dopo la build di `cryptpass`.
- `tests/` contiene verifiche Node, incluse asserzioni su confini di sicurezza e compatibilità. Consultare gli script in `package.json` e il README per i comandi pertinenti.
