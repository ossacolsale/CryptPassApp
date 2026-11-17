# Istruzioni per Codex

## Regole operative

- Seguire la richiesta dell'utente e le istruzioni applicabili. Prima di modificare, controllare lo stato Git e i file interessati; preservare le modifiche preesistenti.
- Usare divulgazione progressiva: per modifiche circoscritte leggere solo i file coinvolti e le istruzioni locali; per attività trasversali, architetturali, ambigue o rischiose consultare [`docs/ai/INDEX.md`](docs/ai/INDEX.md) e approfondire solo le fonti pertinenti.
- Consultare uno stato di sessione solo se il lavoro può riprendere un'attività incompleta; verificarne le affermazioni con Git, codice e prove disponibili. Non creare un diario. Registrare un handoff breve solo per lavoro significativo ancora aperto.
- Cercare usi e punti d'ingresso reali prima di rimuovere o cambiare API, dipendenze, plugin o formati persistenti. Il codice versionato e i test descrivono l'implementazione; la documentazione approvata descrive il comportamento previsto. Indagare e segnalare le divergenze.
- Non registrare password, chiavi, sequenze di recupero, contenuto del vault o entries decriptate. Preservare la compatibilità dei vault e dei dati esistenti.
- Per ogni modifica significativa, completata e verificata, aggiornare la versione ed eseguire autonomamente commit e push su `master`, includendo solo le modifiche pertinenti al compito e preservando quelle preesistenti non correlate. Il push avvia automaticamente test, build native Windows/Linux e pubblicazione della release desktop su GitHub, con creazione del tag versione solo dopo il successo di entrambe le build. Commit, push, tag e release desktop di questo flusso sono già autorizzati: non chiedere ulteriori conferme. Non usare force push.
- Dopo il push, controllare il workflow fino alla conclusione e verificare che la release contenga `.exe` portable Windows, `.AppImage` e `.deb` Linux x64. Correggere gli eventuali errori pertinenti prima di dichiarare completata la pubblicazione; se esistono impedimenti esterni, riportarli esplicitamente.
- Salvo il flusso Git e di release desktop autorizzato sopra, operazioni distruttive, pubblicazioni, deployment e modifiche a servizi esterni richiedono autorizzazione esplicita. Non preparare né pubblicare release Android senza richiesta esplicita.
- Verificare in proporzione al rischio e alla portata della modifica; controllare il diff finale e dichiarare solo verifiche realmente eseguite. Consultare README e configurazioni/scripts per i comandi di build e test.
- Quando una modifica richiede prove di piattaforma, creare gli artefatti di test interessati: APK Android debug con ID distinto, build Electron release, o entrambi se coinvolte entrambe le piattaforme. Una verifica dei tipi non aggiorna il bundle applicativo.

## Vincoli di piattaforma e release

- `platforms/`, `node_modules/` e bundle/localizzazioni generati non sono sorgenti autorevoli. Per Android modificare plugin locali, `plugin.xml`, `config.xml`, risorse Gradle versionate o codice applicativo; non mantenere patch ai sorgenti Java/Kotlin generati tramite hook o modifiche in `platforms/android`.
- Per comportamento nativo Android verificare prima le API Cordova/Android e le soluzioni CSS/HTML; usare un plugin Cordova versionato o configurazione ufficiale quando serve. Quando una modifica Android richiede un artefatto di test, produrre un APK debug installabile con application ID distinto dall'app ufficiale.
- Per ogni release mantenere allineate le versioni in `package.json`, nelle voci radice di `package-lock.json` e in `config.xml`: patch per correzioni/refactor isofunzionali e modifiche significative documentali o di infrastruttura, minor per nuove funzionalità. Prima del push su `master` usare una versione non ancora pubblicata; non sovrascrivere tag o release esistenti. Le sole build di test non richiedono incrementi.
- Se si usa `tsconfig.outFile`, verificare il JavaScript emesso oltre al controllo dei tipi quando la modifica deve entrare nel bundle. I dettagli e i punti d'ingresso sono nella [mappa del codice](docs/CODEX_PROJECT_MAP.md).
