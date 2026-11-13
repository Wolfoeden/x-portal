# X-PORTAL Index 3.0

Der Index für Node001 (Bereschnyzja, Ortsteil Hrun, bei Werchowyna), **neu aufgebaut am 13.11.2026: nur der aktuelle Stand.** Online: https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F (privat).

Alles Frühere (Index 2.0, Entscheidungslog E01–E85, alter Entscheidungsbaum, Anforderungsmatrix M02) liegt in `archiv-bis-2026-11-13/` und **gilt nicht mehr**. Agenten lesen das Archiv nur als Historie.

| Datei | Wofür |
|---|---|
| `index-3.md` | Für Agenten zuerst lesen: Stand auf einen Blick, Geologie, Modell, Bedarf nach Maslow und Phase, offene Entscheidungen in Reihenfolge, Entschiedenes, Risiken. |
| `index-3.json` | Dasselbe maschinenlesbar. |
| `index-3.html` / `index-3.body.html` | Die Seite (eigenständig / Artefakt-Inhalt). |
| `werkzeug/index.py` | Generator. `python3 werkzeug/index.py .` Bricht ab, wenn überholte Begriffe (Käufer, Plot, Container …) außerhalb wörtlicher Kommentare auf der Seite stehen. |
| `quellen/reference-architecture-v0.4.md` | Bezugsrahmen. |

Quellen des Index: `../entscheidungen/` (Antworten vom 13.11. mit Kommentaren, Geologie-Zusammenfassung), `../kosten/` (Kostenregister, Paket vor dem Investment), `../anschaffungen/` (120 Positionen).

## Regeln für Agenten
- Wahl und Kommentar einer Entscheidung gelten zusammen; wo der Kommentar die Wahl ändert, gilt der Kommentar.
- Kein Immobilienverkauf im klassischen Sinn: Mieter, Selbstkosten, Holding-Struktur.
- Rollen statt Namen; „Fachexperte“; „Objekt“ statt Container oder Haus.
- Die Geologie-Zusammenfassung ist KI-erstellt und nicht geprüft; Kosten sind Annahmen aus Internet-Richtwerten.
- Ein Vorschlag der KI gilt erst, wenn er auf der Entscheidungsseite gewählt ist. Nichts bestellen, versenden oder veröffentlichen ohne Freigabe.
