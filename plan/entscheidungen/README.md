# Entscheidungsseite Node001

Seit 13.11.2026 sind **alle früheren Entscheidungen E01–E85 zurückgenommen** (Wunsch Roman). Sie gelten nur noch als Historie. Neu entschieden wird auf der Entscheidungsseite: https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP (privat; für Paul über „Teilen“ freigeben).

Eine Entscheidung gilt erst, wenn sie auf der Seite gewählt ist. „Vorschlag KI“ ist nur ein Vorschlag und nie vorgewählt.

| Datei | Wofür |
|---|---|
| `entscheidungen.md` | Für Agenten zuerst lesen: alle Karten (D34–D38, D42–D68) mit Möglichkeiten und der Historie, welche E-Nummer in welcher Karte neu entschieden wird. |
| `entscheidungen.json` | Dasselbe maschinenlesbar (`abschnitte`, `historie_zu_karte`). |
| `entscheidungsseite.html` | Der Seiteninhalt, wie er als Artefakt veröffentlicht ist. |
| `werkzeug/seite.py` | Generator. Karten stehen oben im Skript; Prüfungen: jede E-Nummer einer Karte zugeordnet, keine doppelten IDs. Aufruf: `python3 werkzeug/seite.py .` |
| `quellen/entscheidungsseite-2026-11-04.html` | Die alte Seite (Stand 04.11.); Kopf, Stil, Bilder und Speicher-Skript werden übernommen. |
| `archiv/log-E01-E84.json` | Die 84 früheren Log-Einträge (E01–E85, E48 fehlte schon im Original). |
| `archiv/wahl-2026-11-04/` | Die 30 früheren Antworten (D01–D33) aus der Datenbank. In der Datenbank liegen sie zusätzlich in der Sammlung `wahl_archiv`; die Sammlung `wahl` ist geleert. |

Antworten lesen (Agenten): Datenbank des Artefakts, Sammlung `wahl`, ein Dokument je Karte mit `wahl` (A/B/C, `unklar`, `keine`), `kommentar`, `von`, `am`.

Offen: Das Entscheidungslog `plan/entscheidungen.md` im Plan-Repo (Wolfoeden/x-portal-dashboard) ist noch nicht markiert. Diese Sitzung durfte das Repo nicht anhängen. Der fertige Text zum Einfügen steht in `log-zuruecknahme.md`.
