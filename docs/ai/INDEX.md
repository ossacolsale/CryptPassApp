# Indice documentazione per Codex

Consulta solo le fonti pertinenti al task.

| Fonte | Quando consultarla |
|---|---|
| [README](../../README.md) | Piattaforme, comportamento descritto per gli utenti, limiti noti, installazione e comandi di build/test. |
| [Mappa del codice](../CODEX_PROJECT_MAP.md) | Attività trasversali o quando serve individuare entry point, confini tra componenti e sorgenti generate. |
| `local-plugins/cordova-plugin-cryptpass-storage/README.md` | Modifiche o indagini sul bridge Android per i file vault e SAF. |
| `local-plugins/cordova-plugin-cryptpass-secure-storage/README.md` | Modifiche o indagini sul secure storage Android. |
| `local-plugins/cordova-plugin-cryptpass-android-ui/plugin.xml` e sorgenti del plugin | Modifiche o indagini su insets e integrazione UI nativa Android. |
| `tests/` e script in `package.json` | Verifiche mirate; i test documentano i casi implementati, non sostituiscono requisiti approvati. |

Non sono presenti specifiche funzionali, un registro decisioni o un handoff di sessione dedicati: per il comportamento atteso usare le fonti approvate disponibili; per l'implementazione corrente verificare codice e test. Non aggiungere queste strutture finché non servono a un'attività concreta.
