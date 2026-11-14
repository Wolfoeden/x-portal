# X-PORTAL Index 3.0

Plan für Node001 (Bereschnyzja, Ortsteil Hrun, bei Werchowyna) als offener Entscheidungsbaum. Stand 14.11.2026, mit den Entscheidungen vom 13.11.2026. Online: https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F (privat).

Was sich am 14.11. geändert hat, steht in `aenderungsprotokoll.md`.

| Datei | Wofür |
|---|---|
| `entscheidungsbaum.md` | Für Agenten zuerst lesen: Zielblatt, alle Äste, Möglichkeiten, Beschlussblätter. |
| `entscheidungsbaum.json` | Dasselbe maschinenlesbar. |
| `index-3.html` / `index-3.body.html` | Die Seite (eigenständig / Artefakt-Inhalt). |
| `werkzeug/baum.py` | Generator: `python3 werkzeug/baum.py quellen/index-2.0.html index-3.body.html .` |
| `quellen/` | Index 2.0 (Historie, unten eingeklappt), Anforderungsmatrix M02, Reference Architecture v0.4, Detailplan Blatt 3 als Bild. |
| `archiv-bis-2026-11-13/` | Seite und Exporte vom 13.11. |
| `verworfen-2026-11-14/` | Die verworfene Neufassung vom 13.11.; gilt nicht. |

Quellen der Inhalte: `../entscheidungen/antworten-2026-11-13/` (Wahl und Kommentar gelten zusammen; wo der Kommentar die Wahl ändert, gilt der Kommentar), `../entscheidungen/quellen/` (Geologiebericht, Detailplan), `../kosten/` (Kostenregister), `../anschaffungen/` (Positionen A001–A120).

## Regeln für Agenten
- Aufbau bleibt: Grundlage (Mission, Ziele, Ort), Äste 1–8. Änderungen gehen in die Knotendaten in `baum.py`, nicht als Text darüber.
- Mission und Globalziele sind der Ausgangspunkt (D42). Kein Immobilienverkauf im klassischen Sinn; Mieter, Selbstkosten, Holding-Struktur.
- Rollen statt Namen; „Fachexperte“; „Objekt“.
- Ein Vorschlag der KI gilt erst, wenn er auf der Entscheidungsseite gewählt ist. Nichts bestellen, versenden oder veröffentlichen ohne Freigabe.
