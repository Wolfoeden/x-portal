# X-PORTAL Index 3.0

Plan für Node001 Stufe 1 (Bereschnyzja, Ortsteil Hrun, bei Werchowyna) als offener Entscheidungsbaum. Stand 12.11.2026.

**Bezugsrahmen ist die Reference Architecture v0.4-WB1** (`quellen/reference-architecture-v0.4.md`). Frühere Inhalte, auch das Entscheidungslog E01–E85, sind Evidenz und Historie; bei Widerspruch gilt die Baseline. Die 20 bekannten Widersprüche stehen im Abschnitt „Abgleich“ (Seite, Markdown und JSON-Feld `abgleich`). Die Arbeitsregeln für KI stehen in Abschnitt 15 der Baseline.
Online als Artefakt: https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F (privat, nur für Freigegebene).

## Dateien

| Datei | Wofür |
|---|---|
| `entscheidungsbaum.md` | **Für Agenten zuerst lesen.** Der ganze Baum als Text: Zielblatt, alle Äste, Möglichkeiten, Beschlussblätter, Quellen. |
| `entscheidungsbaum.json` | Dasselbe maschinenlesbar: `zielblatt`, `anforderungen_m02` (29 Zeilen), `baum` (verschachtelte Knoten). |
| `index-3.html` | Die lesbare Seite (Index 2.0 plus Entscheidungsbaum), im Browser öffnen. Enthält die Bilder eingebettet. |
| `werkzeug/baum.py` | Generator: erzeugt Seite, Markdown und JSON. |
| `quellen/index-2.0.html` | Eingabe des Generators: Index 2.0, erzeugt aus `plan/PLAN.md` mit `plan/werkzeuge/index_seite.py` (im Plan-Repo, nicht hier). |
| `quellen/reference-architecture-v0.4.md` | Eingabe und Bezugsrahmen: Reference Architecture v0.4, Working Baseline vom 12.11.2026. |
| `../sgmm/` | St. Galler Modell, Bauphasen, Change Requests, Funktionsketten bis zum Werkzeug. |
| `../praesentation/` | Überarbeitetes Investor Deck (PPTX). |
| `../whitepaper/x-portal-whitepaper.html` | Investoren-Whitepaper im Diskussionsstand, aus Baseline und Investor Deck 11.2026. Vor Versand den internen Kasten am Ende abarbeiten. |
| `quellen/m02-29.json` | Eingabe: Anforderungsmatrix nach Maslow und Sinnen, 29 Zeilen, Stand 03.11.2026 (Artefakt „Node001 Anforderungen Mensch“). |

## Aufbau des Baums

- **Grundlage: Endprodukt und Ziele**: Leitlinie P01, Endprodukt Stufe 1, Grundmodell, Zielblatt (Z1–Z4 für Node001; X1–X3 Aufteilung X-PORTAL, DT Agentur, Grundstücke), Grenzen, erwarteter Nutzen.
- Danach die Äste in der Reihenfolge, in der gearbeitet wird:
  1. Der Weg ab jetzt: Geologie → Hausart → Zufahrt → Lieferant → Technik (Zugang, Server, Netzwerk) → Kosten, Verkauf, Gates G0–G4
  2. Alltag oben: Anforderungen nach Maslow und Sinnen (M02), Spielregeln, Szenariotests
  3. Versorgung je Ressource mit Ausbaupfad (M06)
  4. Make-or-Buy (M05)
  5. bis 8: Parallel, Entscheidungsseite (D34–D41), Offen im Plan, Entschieden

Knotenarten: Entscheidung, Ereignis, Gate, Schritt, Anforderung, Ende. Zustände: offen, wartet, nicht geprüft, entschieden, Regel steht, später.

## Regeln für Agenten

- Quellenkürzel: E01–E85 Entscheidungen (Log in `plan/entscheidungen.md` im Plan-Repo), O01–O32 offene Punkte, D34–D41 Karten der Entscheidungsseite, 2.x.y Teilergebnisse, H01–D05 Anforderungen, M01–M11 Methoden.
- „Vorschlag KI“ ist keine Entscheidung. Vorschläge gelten erst, wenn Paul oder Roman nicht widersprechen (E80); entschieden wird auf der Entscheidungsseite https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP.
- „Vorgabe vom 05.11.2026“ (Gleitzeit 9–14 Uhr, Jour fixe und Sport Pflicht, Käufer frei, Aufteilung X-PORTAL und DT Agentur, Technik-Frage) steht noch nicht im Entscheidungslog; sie gehört dort als E86 ff. hinein.
- Technische Werte legt eine Fachperson fest (E22); Rechtsfragen sind Prüfaufträge an Anwälte, keine Auskunft.
- Nichts bestellen, versenden, veröffentlichen oder unterschreiben; ein Mensch gibt frei (E13).

## Ändern

Den Generator ändern, nicht die erzeugten Dateien:

```bash
cd plan/index-3
python3 werkzeug/baum.py quellen/index-2.0.html index-3.body.html .
```

Das schreibt `entscheidungsbaum.md` und `entscheidungsbaum.json` neu; `index-3.body.html` ist der Seiteninhalt ohne HTML-Rahmen (so wird er als Artefakt veröffentlicht).

## Bekannte Lücken

- Die M02 im Plan-Repo hat 46 Zeilen; hier liegen nur die 29 vom 03.11.2026.
- Keine Make-or-Buy-Variante ist mit Vollkosten gerechnet; es gibt nur Einzelpreise aus dem Internet.
- Index 3.0 ist noch nicht im Generator des Plan-Repos (`plan/werkzeuge/index_seite.py`). Wird Index 2.0 dort neu erzeugt, fehlen die Änderungen.
