# X-PORTAL Index 3.0

Plan für Node001 (Bereschnyzja, Ortsteil Hrun, bei Werchowyna) als offener Entscheidungsbaum. Stand 17.11.2026, mit den Entscheidungen vom 13.11.2026 und den Kommentaren bis 17.11.2026. Online: https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F (privat).

Was sich wann und warum geändert hat, steht in `aenderungsprotokoll.md`.

| Datei | Wofür |
|---|---|
| `entscheidungsbaum.md` | Für Agenten zuerst lesen: Zielblatt, alle Äste, Möglichkeiten, Beschlussblätter. |
| `entscheidungsbaum.json` | Dasselbe maschinenlesbar. |
| `index-3.html` / `index-3.body.html` | Die Seite (eigenständig / Artefakt-Inhalt). |
| `werkzeug/baum.py` | Generator: `python3 werkzeug/baum.py quellen/index-2.0.html index-3.body.html .` |
| `werkzeug/ablauf.py` | Ast 1: Grundbestimmungen GB1–GB11, KI-Arbeitsteilung, Ablaufplan A–H mit Arbeitspaketen, Unterlagen und Aufträgen. |
| `werkzeug/netz.py` | Ablauf als Netz (Vorgänger, Dauer, Rolle) für Cockpit und BPMN; Export `ablauf.json`. |
| `werkzeug/cockpit.py` | Cockpit oben im Index: abhaken, jetzt dran, Bestelltermine, Anbietervergleich, BPMN. Speicher: status, angebote, wahl, werte. |
| `../technik/werkzeug/technik.py` | Technik der Company: Werkzeuge IT01–IT09 mit Kosten, Quelle und Nachweis; Erlösquellen. Quelle für Ast 9, Cockpit, Whitepaper. |
| `werkzeug/uebernahme.py` | Aus dem Index 2.0 übernommene Teilergebnisse, Steuerung, Methoden, Prüfaufträge; Liste des Entfallenen. |
| `auftraege/` | Aufträge für die ausführende KI, aus `ablauf.py` erzeugt. |
| `../pruefe_alle.py` | Prüft den Text aller Seiten auf alten Stand; der Generator ruft es auf. |
| `quellen/` | Index 2.0 (eingearbeitet, nicht mehr auf der Seite), Anforderungsmatrix M02, Reference Architecture v0.4, Detailplan Blatt 3 als Bild. |
| `archiv-bis-2026-11-13/` | Seite und Exporte vom 13.11. |
| `verworfen-2026-11-14/` | Die verworfene Neufassung vom 13.11.; gilt nicht. |

Quellen der Inhalte: `../entscheidungen/antworten-2026-11-13/` (Wahl und Kommentar gelten zusammen; wo der Kommentar die Wahl ändert, gilt der Kommentar), `../entscheidungen/quellen/` (Geologiebericht, Detailplan), `../kosten/` (Kostenregister), `../anschaffungen/` (Positionen A001–A120).

## Regeln für Agenten
- Jede Runde beginnt mit den Eingängen: Kommentare auf allen Seiten (Index, Entscheidungsseite, Vor dem Investment, Anschaffungen, SGMM, Whitepaper) und Antworten in der Datenbank. Jeder Eingang kommt mit Umsetzung und Stelle ins Änderungsprotokoll und wird auf allen betroffenen Seiten umgesetzt, nicht nur auf einer. Danach `python3 plan/pruefe_alle.py`: null Treffer.
- Zahlen auf den Seiten werden gezählt oder gerechnet, nicht eingetragen.
- Jede Änderung wird an der geänderten Stelle selbst geprüft, nicht nur über die Prüfskripte: Screenshot des Ausschnitts am Desktop und am Handy. Markierungen auf Bildern werden über ein Raster gesetzt und je Punkt im Ausschnitt kontrolliert.
- Aufbau bleibt: Grundlage (Mission, Ziele, Ort), Äste 1–8. Änderungen gehen in die Knotendaten in `baum.py`, nicht als Text darüber.
- Mission und Globalziele sind der Ausgangspunkt (D42). Kein Immobilienverkauf im klassischen Sinn; Mieter, Selbstkosten, Holding-Struktur.
- Rollen statt Namen; „Fachexperte“; „Objekt“.
- Ein Vorschlag der KI gilt erst, wenn er auf der Entscheidungsseite gewählt ist. Nichts bestellen, versenden oder veröffentlichen ohne Freigabe.
