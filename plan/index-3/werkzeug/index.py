#!/usr/bin/env python3
"""X-PORTAL Index 3.0, neu aufgebaut am 13.11.2026: nur der aktuelle Stand.

Quellen (nur diese):
  ../entscheidungen/antworten-2026-11-13/wahl/*.json   Antworten mit Kommentaren (Wahl und Kommentar gelten zusammen)
  ../entscheidungen/werkzeug/seite.py                  FOLGT: was aus jeder Antwort folgt
  ../kosten/kosten.json                                Kostenregister und Paket „Vor dem Investment“
  ../anschaffungen/anschaffungen.json                  120 Positionen A001–A120
  Geologie-Zusammenfassung XPB-N001-GEO-SUM-001 (KI-erstellt, NICHT GEPRÜFT), Werte unten abgeschrieben
  quellen/reference-architecture-v0.4.md               Vision, Statusmodell, OD-001 bis OD-008
Nicht mehr Quelle: Index 2.0, Log E01–E85, alter Baum (alles in archiv-bis-2026-11-13/).

Aufruf (aus plan/index-3):  python3 werkzeug/index.py .
Schreibt index-3.body.html (Artefakt), index-3.html (eigenständig), index-3.md, index-3.json.
Der Generator bricht ab, wenn überholte Begriffe außerhalb wörtlicher Kommentare auf der Seite stehen.
"""
import html, importlib.util, json, re, sys
from pathlib import Path

STAND = '13.11.2026'
U = dict(ent='https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP', ans='https://claude.ai/artifact/Xt8ocuZNXnnwsZNfAfPsoY', vor='https://claude.ai/artifact/2zHiqw7dU8oHFnsZWBsh1P',
         sgmm='https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G', wp='https://claude.ai/artifact/8Tsy5boPuHAm5wkfqMnPeD')
VERBOTEN = ['Käufer', 'Plot', 'als Token', 'Token ', 'Container', 'Tiny House', 'Januar 2027', '30.000', '12 Mio', 'Paul', 'Nazar', 'Fachperson', 'wartet auf die Geologie', 'Siedler']
THEMA = {'D34': 'Feuerstelle, Gastronomie, Kapelle', 'D35': 'Sauna', 'D36': 'Essen und Gemeinschaftsarbeit', 'D37': 'Bezahlung und Beteiligung des Teams', 'D38': 'Pauschale für Leistungen',
         'D42': 'Vision und Mission', 'D43': 'Entscheidungsrechte', 'D44': 'Organisation', 'D45': 'Wer oben wohnt', 'D46': 'Kapital Node001', 'D47': 'Kapital Company', 'D48': 'Produktmodell',
         'D49': 'Preislogik', 'D50': 'Start der Vermarktung', 'D51': 'Erlösstufen', 'D52': 'Einkommen der Geschäftsführung', 'D53': 'Zahlen für Investoren', 'D54': 'Geologie',
         'D55': 'Bauphasen', 'D56': 'Bauart', 'D57': 'Zufahrt und Transport', 'D58': 'Termine', 'D59': 'Strom', 'D60': 'Wärme', 'D61': 'Wasser', 'D62': 'Sanitär und Abwasser',
         'D63': 'Internet', 'D64': 'Kommunalgebäude', 'D65': 'Mobilität', 'D66': 'Betrieb und Abnahme', 'D67': 'Team und Rollen', 'D68': 'Arbeitsweise'}
FOLGT_NEU = {'D43': 'Rollenbasiert: Texte nennen Rollen statt Namen, und es heißt „Fachexperte“. Ein KI-Vorschlag gilt erst mit Wahl auf der Entscheidungsseite.',
             'D46': 'Node001 wird mit Eigenkapital und VC oder Investments finanziert, verbunden mit wiederkehrenden Erlösen. Ein Verkauf an Einzelne ist abgewählt.',
             'D49': 'Statt eines Verkaufspreises wird der Selbstkostenpreis je Objekt ermittelt.'}

BLICK = [
 ('Ziel', 'Zwei bis drei Leute vom Team wohnen und arbeiten ganzjährig oben und verdienen dort Geld; dazu kommen Mieter.', 'D45'),
 ('Modell', 'Vermietet wird, verkauft wird im klassischen Sinn nichts. Miete und Pauschalen folgen aus den Selbstkosten; Projekt- und Gemeinschaftsleistung wird angerechnet.', 'D45, D48, D49, D38'),
 ('Struktur', 'X-PORTAL hält als Holding Lizenzen und Marken. Eine Agentur liefert Projekte im DACH-Raum. Node001 hält eine ukrainische Gesellschaft. Die Rechtsprüfung steht aus.', 'D44'),
 ('Kapital', 'Eigenkapital bis zur fertigen Bauplanung. Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen.', 'D46, D47'),
 ('Phase 0', 'Ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit Wasser, Strom und Internet, die mitwachsen. Sanitär und Warmwasser fest eingebaut.', 'D55, D62'),
 ('Phase 1', 'Zuerst das Kommunalgebäude, dann Wohn- und Arbeitsobjekte. Material und Bauart plant eine Bau-KI nach den lokalen Gegebenheiten.', 'D55, D56, D64'),
 ('Standort', 'Nordosthang, 1.016–1.077 m. Der Geologiebericht liegt vor; die deutsche Zusammenfassung ist von einer KI erstellt und fachlich nicht geprüft.', 'Geologie'),
 ('Kosten', 'Es gibt eine Teilrechnung aus Internet-Richtwerten, keine Angebote. 69 von 137 Positionen haben keinen Betrag; Phase 1 ist nicht gerechnet.', 'Kostenregister'),
 ('Vor dem Investment', 'Mit rund 10.000 € Eigenmitteln und eigener Arbeit werden Boden, Wasser, Strom, Recht, Kosten und Nachfrage geklärt. Welches Paket, ist offen.', 'D69'),
 ('Arbeitsweise', 'Rollen statt Namen. Ein Vorschlag der KI gilt erst, wenn er auf der Entscheidungsseite gewählt ist. Technische Werte legt ein Fachexperte fest.', 'D43'),
]
GEO_FAKT = [
 ('Lage', 'Nordöstlich exponierter Hang des Berges Bila Kobyla; Geländehöhen 1.016–1.077 m.'),
 ('Untersuchung', 'September bis November 2026: 3 Schürfgruben mit zusammen 7,5 m und 12 Handbohrungen bis je 2 m. Ingenieurgeologische Komplexität Kategorie III.'),
 ('Grundwasser', 'Austritte an der Oberfläche bei den Bohrpunkten 6, 7 und 11; zusätzliche Wasserbewegung bei Starkregen und Schneeschmelze. Gegen Beton normaler Dichte nicht aggressiv.'),
 ('Hang', 'Verbreitete Rutsch- und Fließprozesse; bewegte Schichten 0,8–1,2 m mächtig (an anderer Stelle 0,9–1,2 m genannt), Flächen meist 3–4 m², teils bis 15 m².'),
 ('Boden', 'Nicht kollapsgefährdet; seismische Bodenkategorie II.'),
]
GEO_SCHICHT = [('IGE-1', 'Lehmiger Oberboden mit Sandsteinstücken, von Rutschprozessen betroffen', '0,6–1,1 m', '19 MPa', '23°', '27 kPa', '240 kPa'),
               ('IGE-2', 'Weichplastischer Lehm; an den Punkten 6, 7, 11 mit Grundwasseraustritt', '0,8–1,1 m', '6 MPa', '14°', '13 kPa', '130 kPa'),
               ('IGE-3', 'Schuttmaterial mit Sandstein, lehmiger Feinanteil bis 30 %; bei 6, 7, 11 wassergesättigt', '1,0–1,4 m', '45 MPa', '33°', '8 kPa', '500 kPa'),
               ('IGE-4', 'Flysch: geklüftete Sandsteine, Argillite; Schichten etwa 70° geneigt', 'nicht durchgehend nachgewiesen', '–', '–', '–', '–')]
GEO_EMPF = ['Kombinierte Streifen- und Stützfundamentierung; Gründung auf IGE-3 oder IGE-4.', 'IGE-3 für leichte eingeschossige Gebäude; IGE-4 für massive, dauerhafte Gebäude.',
            'Hangseitigen Fundamentbereich als Stützkonstruktion bemessen.', 'Hangseitiger Entwässerungsgraben; Wasser über Rinnen ableiten oder in einem Behälter sammeln.',
            'Oberflächen- und Grundwasser vor Abfällen und Abwasser schützen.', 'Zusätzliche Erkundung für Zufahrt, Stützkonstruktionen und Hauptgebäude; ebenso bei geänderten Gebäuden oder Fundamenten.',
            'Für den Standort sind die Kennwerte von IGE-3 mit 70 % der Tabellenwerte anzusetzen (Anmerkung des Gutachters).']
MODELL = [('Produkt', 'Miete und Services', 'Wohnen und Arbeiten zur Miete, Leistungen vor Ort. Zuerst Mieter gewinnen, schon vor dem Bau. Tokenisierung und Beteiligung auf mehreren Ebenen erst nach rechtlicher Klärung.', 'D45, D48, D50'),
          ('Preis', 'Selbstkosten', 'Miete und monatliche Pauschale werden aus den Selbstkosten je Objekt abgeleitet. Erbrachte Projekt- und Gemeinschaftsleistungen werden abgezogen. Essen gegen Mitarbeit.', 'D49, D38, D36'),
          ('Struktur', 'Holding, Agentur, Node', 'X-PORTAL: Unternehmensarchitektur, Lizenzen, Markenrechte. Agentur: Projekte in Deutschland, Österreich, Schweiz. Node001: ukrainische Gesellschaft. Wer mitwirkt, wird am jeweiligen Node beteiligt, nicht an der Holding.', 'D44, D37'),
          ('Kapital', 'Eigenkapital, dann Investoren', 'Eigenkapital bis zur vollendeten Bauplanung; Infrastruktur und Objekte mit Investoren. Förderung wird nicht öffentlich gezeigt.', 'D46, D47'),
          ('Erlöse', 'Vier Stufen', 'Kundenprojekte heute; Technologielösungen in Entwicklung (KI, später Robotik, Drohnen, Mechanik); Miete und Services am Node; Skalierung und Standardisierung von Anfang an mitgedacht.', 'D51'),
          ('Alltag', 'Gemeinschaft mit Anreiz', 'Gemeinschaftsarbeit (Schnee, Pflanzen, Kapelle, Kehrwoche) wird gefördert und mit wenig Aufwand erfasst, voraussichtlich über Zugangstechnik auf Cardano. Team: Wohnen und Essen frei plus Anteil am Node.', 'D36, D37')]
MASLOW = [(1, 'Grundbedürfnisse', ['Objekt Phase 0', 'Wärme und Holz', 'Wasser', 'Sanitär und Abwasser', 'Küche und Essen'],
           'Geprüfte Wärme- und Wasserplanung, Wasseranalyse, eigenes Holz schlagen und einlagern', 'Objekt mit Schlafplatz; Ofen und zweite Wärmequelle; Brunnen mit Aufbereitung zu Trinkwasser; Spültoilette, Dusche, Warmwasser, Kläranlage; Küche', 'Wohnobjekte für Mieter und Team'),
          (2, 'Sicherheit', ['Grundstück und Gründung', 'Strom', 'Werkzeug und Wartung', 'Sicherheit und Notfall'],
           'Fachprüfung der Geologie, Zusatzerkundung, Rechtsprüfung der Struktur, Entwässerungsgraben, Schutzausrüstung und Erste Hilfe', 'Fundament und Stützkonstruktion; Netzanschluss mit Generator; Melder, Löscher, Notfallkommunikation; Versicherung', 'Solar mit Speicher; Gesamtplanung der Zufahrt'),
          (3, 'Arbeit und Verbindung', ['Internet und IT', 'Zufahrt, Schnee und Transport', 'Mobilität'],
           'Angebot Internet, Antrag Netzanschluss, erster bezahlter Auftrag', 'Internet mit Reserve; Arbeitsplätze; kleines Fahrzeug für den Transport; gemeinsames Fahrzeug; Räumvertrag', 'Arbeitsobjekte; Arbeitsplätze im Kommunalgebäude'),
          (4, 'Gemeinschaft', ['Gemeinschaft in Phase 1'], 'Mietinteressenten sammeln', 'Gemeinsame Arbeit nach Plan: Holz, Schnee, Küche', 'Kommunalgebäude zuerst; Garten, Feuerstelle, Sauna; Bergkapelle als Gruppenprojekt'),
          (5, 'Entwicklung', ['Erfassung und Zugang'], 'Stundenbuch der Eigenleistung, Messreihen, Selbstkostenrechnung', 'Zugang per Chip; Erfassung der Gemeinschaftsarbeit', 'Zähler je Einheit; Regeln aus dem ersten Winter für den nächsten Node')]
# Offene Entscheidungen in Reihenfolge der Abhängigkeit: (ID, Frage, Möglichkeiten, hängt ab von, blockiert, Rolle, Status)
OFFEN = [
 ('Schritt 1 · Boden und Lage', [
  ('GEO', 'Wer prüft den Geologiebericht fachlich und gibt ihn frei?', ['Geotechniker aus der Region', 'Prüfingenieur über den beratenden Architekten', 'Zweitgutachten'], 'Originalbericht liegt vor', 'Fundament, Stützkonstruktion, Bauplanung, jedes Angebot', 'Geschäftsführung', 'DECISION REQUIRED'),
  ('BILD', 'Welches Lagebild ersetzt den Generalplan Variante 2?', ['Neues Bild der Projektleitung (angekündigt)', 'Hochgeladener Detailplan, Blatt 3'], '–', 'Darstellung von Phase 0 im Gelände', 'Projektleitung', 'OPEN'),
 ]),
 ('Schritt 2 · Paket und Struktur', [
  ('D69', 'Welches Paket vor dem Investment: Kern, Optimum oder Erweitert?', None, 'Eigenmittel; nicht erfasste Posten (Reisen, Honorare, Gebühren)', 'Start der Vor-Phase', 'Geschäftsführung', 'DECISION REQUIRED'),
  ('D70', 'Wie wird Eigenleistung bewertet und belegt?', ['Stundenbuch plus Steuerberater', 'Nur dokumentieren', 'Mit deutschem Stundensatz ansetzen'], 'D69', 'Eigenanteil in der Verhandlung', 'Geschäftsführung', 'DECISION REQUIRED'),
  ('D44', 'Welche Rechtsform bekommt die Gesellschaft für Node001, und wo werden Services abgewickelt?', ['Lokale Gesellschaft als Teil der Holding', 'Getrennte Betriebsgesellschaft'], 'Rechtsprüfung', 'Mietverträge, Beteiligung am Node, Einstieg von Investoren', 'Geschäftsführung mit Anwälten', 'DECISION REQUIRED'),
  ('D42', 'Wie werden Mission und Globalziele mit der Vision v0.4 in eine Logik gebracht?', ['Mission und Globalziele als Ausgangspunkt, Vision v0.4 darunter', 'Neue Fassung aus einem Guss'], '–', 'Außendarstellung in Whitepaper und Deck', 'Geschäftsführung und Projektleitung', 'DECISION REQUIRED'),
 ]),
 ('Schritt 3 · Planung und Angebote', [
  ('D56', 'Welche Bauart für Objekt Phase 0 und für Phase 1?', ['Holz', 'Beton', 'Glas und Metall', 'Mischbauweise'], 'Geprüfte Geologie, Vermessung, Zufahrt; Bewertung durch die Bau-KI', 'Angebote, Selbstkosten, Transport', 'Geschäftsführung nach Vorschlag Fachexperte Bau', 'OPEN'),
  ('D72', 'Welche offenen Kosten werden zuerst mit Angeboten belegt?', ['Die fünf größten Posten', 'Alles nach Maslow', 'Phase 1 gleich mit'], 'D56', 'Kostenband, Kapitalbedarf', 'Projektleitung', 'DECISION REQUIRED'),
  ('OD-002', 'Welche Zielwerte gelten je kritischer Funktion (Ausfallzeit, Notbetrieb, Reserve)?', None, 'Lastliste, Personenzahl', 'Größe von Generator, Tank, Speicher; Abnahmetabelle', 'Projektleitung prüft und gibt frei', 'OPEN'),
 ]),
 ('Schritt 4 · Wirtschaftlichkeit und Ansprache', [
  ('D38', 'Wie hoch ist die monatliche Pauschale, und wie werden Leistungen abgezogen?', None, 'Selbstkosten je Objekt', 'Mietangebot an Interessenten', 'Geschäftsführung', 'OPEN'),
  ('D52', 'Wie steht das Einkommen der Geschäftsführung im Plan?', ['Als Kostenzeile der Company', 'Zuerst vor allen Kosten', 'Erst mit Umsatz'], '–', 'Business Case der Company', 'Geschäftsführung', 'DECISION REQUIRED'),
  ('OD-005', 'Welche Messgrößen und Go/Revise/Stop-Grenzen gelten für die acht Hypothesen?', None, 'Kostenband, Mietmodell', 'Investitionsfreigabe', 'Geschäftsführung und Projektleitung', 'OPEN'),
  ('D71', 'Ab wann werden Investoren angesprochen?', ['Nach Stufe A des Pakets', 'Sofort mit dem heutigen Stand', 'Erst nach dem ersten Winter'], 'Geprüfte Geologie, Struktur, Angebote', 'Investorengespräch', 'Geschäftsführung', 'DECISION REQUIRED'),
 ]),
]
RISIKEN = [('Geologie nicht geprüft', 'Die deutsche Zusammenfassung ist KI-erstellt und nicht freigegeben. Maßgeblich ist der ukrainische Originalbericht. Zwei Angaben zur Mächtigkeit der bewegten Schichten weichen voneinander ab.', 'Fachprüfung beauftragen (GEO)'),
           ('Hang und Wasser', 'Rutschprozesse und Grundwasseraustritte an drei Punkten betreffen Fundament, Abwasser und Zufahrt.', 'Entwässerung und Stützkonstruktion durch Fachexperten planen'),
           ('Kosten unvollständig', '69 von 137 Positionen ohne Betrag; viele Preise aus dem Raum Kyjiw; Phase 1 nicht gerechnet; Netzanschluss, Gelände, Abgaben und Reserven offen.', 'Drei Angebote je großem Posten'),
           ('Recht', 'Gesellschaft in der Ukraine, Mietmodell, Beteiligung am Node, Abwasser, Fällgenehmigung, Versicherung der Eigenleistung sind ungeklärt.', 'Rechtsprüfung im Paket vor dem Investment'),
           ('Trinkwasser', 'Grundwasser ist vorhanden, aber nicht trinkbar; die Aufbereitung hängt an der Laboranalyse.', 'Analyse vor der Planung'),
           ('Außendarstellung', 'Die Geschäftsführung fehlt in der Teamdarstellung von Whitepaper und Deck; das Lagebild fehlt.', 'Vor Versand klären'),
           ('Altbestand', 'Das Entscheidungslog im Plan-Repo ist noch nicht als zurückgenommen markiert. Der alte Index liegt im Archiv und gilt nicht mehr.', 'Log im Plan-Repo markieren')]

e = html.escape
def n(x): return f'{round(x):,}'.replace(',', '.')
SC = {'VERIFIED': 'ok', 'DOCUMENTED': 'doc', 'IN WORK': 'doc', 'ASSUMPTION': 'ass', 'OPEN': 'ass', 'DECISION REQUIRED': 'dec'}
def st(s): return f'<span class="st st-{SC[s]}">{s}</span>'

def load(base):
    spec = importlib.util.spec_from_file_location('seite', base / '../entscheidungen/werkzeug/seite.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    folgt = dict(m.FOLGT); folgt.update(FOLGT_NEU)
    ans = {}
    for f in sorted((base / '../entscheidungen/antworten-2026-11-13/wahl').glob('D*.json')):
        d = json.loads(f.read_text()); ans[f.stem] = d.get('data', d)
    K = json.loads((base / '../kosten/kosten.json').read_text())
    A = json.loads((base / '../anschaffungen/anschaffungen.json').read_text())['positionen']
    rng = {}
    for r in A: rng.setdefault(r['bereich'], []).append(r['nr'])
    return folgt, ans, K, {k: (v[0], v[-1], len(v)) for k, v in rng.items()}

CSS = '''/* Lagebild auf einer Seite: oben zehn Aussagen, dann Standort, Modell, Bedarf, offene Entscheidungen in Reihenfolge. Farben und Schrift wie die übrigen Plan-Seiten. */
:root { --bg:#f3f5f1; --paper:#fff; --ink:#10201a; --body:#33423b; --muted:#66756d; --line:#d9dfd8; --forest:#1d5a3c; --forest-bg:#e2efe6; --amber:#8a5a00; --amber-bg:#f6ecd4; --slate:#2c5378; --slate-bg:#e2ebf4; --red:#9b2c2c; --red-bg:#f8e3e1;
  --display:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif; --text:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; --red:#f2a49c; --red-bg:#3a1c1a; color-scheme:dark } }
:root[data-theme="dark"] { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; --red:#f2a49c; --red-bg:#3a1c1a; color-scheme:dark }
* { box-sizing:border-box }
body { background:var(--bg); color:var(--body); font-family:var(--text); font-size:16px; line-height:1.55; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:28px 72px }
.w { max-width:1060px; margin:0 auto; display:flex; flex-direction:column; gap:44px }
header, section { display:flex; flex-direction:column; gap:14px }
h1 { font-family:var(--display); font-size:clamp(30px,5vw,46px); line-height:1.06; letter-spacing:-.02em; color:var(--ink); margin:0; text-wrap:balance }
h2 { font-family:var(--display); font-size:clamp(22px,3vw,27px); color:var(--ink); margin:0; text-wrap:balance } h3 { font-family:var(--display); font-size:17px; color:var(--ink); margin:0 }
p { margin:0; max-width:76ch } a { color:var(--forest) } ul { margin:0; padding-left:20px; max-width:76ch } li { margin:3px 0 }
.eyebrow, .num { font-family:var(--mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--forest); margin:0 }
.lead { font-size:18px; color:var(--ink) } .note { font-size:13.5px; color:var(--muted) }
nav { display:flex; flex-wrap:wrap; gap:6px } nav a { font-size:14px; border:1px solid var(--line); background:var(--paper); border-radius:999px; padding:4px 12px; text-decoration:none; color:var(--ink) }
.blick { display:grid; gap:1px; background:var(--line); border:1px solid var(--line); border-radius:6px; overflow:hidden }
.blick > div { background:var(--paper); display:grid; grid-template-columns:150px minmax(0,1fr) auto; gap:4px 14px; padding:10px 14px; align-items:baseline }
.blick b { font-family:var(--display); color:var(--ink) } .blick small, .src { font-family:var(--mono); font-size:11.5px; color:var(--muted); white-space:nowrap }
@media (max-width:640px) { .blick > div { grid-template-columns:1fr } }
.kz { display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr)) } .kz div { background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:12px 16px }
.kz b { font-family:var(--display); font-size:30px; color:var(--ink); display:block; line-height:1.1; font-variant-numeric:tabular-nums } .kz span { font-size:14px }
.grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)) }
.card { background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:14px 16px; display:flex; flex-direction:column; gap:6px; min-width:0 } .card p { font-size:15px }
.tag { font-family:var(--mono); font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--forest) }
.warn { border-left:4px solid var(--amber); background:var(--amber-bg); color:var(--ink); padding:12px 16px; border-radius:0 6px 6px 0; max-width:none }
.tw { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--paper) }
table { border-collapse:collapse; width:100%; font-size:14.5px; font-variant-numeric:tabular-nums } th, td { text-align:left; vertical-align:top; padding:8px 11px; border-top:1px solid var(--line) }
thead th { border-top:0; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); font-weight:500 } td.id { font-family:var(--mono); font-size:12.5px; color:var(--forest); white-space:nowrap } td small { color:var(--muted); display:block }
.st { font-family:var(--mono); font-size:11px; padding:2px 8px; border-radius:999px; white-space:nowrap; display:inline-block }
.st-ok { background:var(--forest-bg); color:var(--forest) } .st-doc { background:var(--slate-bg); color:var(--slate) } .st-ass { background:var(--amber-bg); color:var(--amber) } .st-dec { background:var(--red-bg); color:var(--red) }
ol.tree { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0 }
ol.tree > li { border-left:2px solid var(--forest); padding:0 0 18px 18px; margin-left:8px; position:relative; display:flex; flex-direction:column; gap:8px }
ol.tree > li::before { content:""; position:absolute; left:-7px; top:4px; width:12px; height:12px; border-radius:50%; background:var(--forest) }
ol.tree > li:last-child { border-left-color:transparent }
.kn { background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:12px 14px; display:flex; flex-direction:column; gap:6px }
.kn header { flex-direction:row; flex-wrap:wrap; gap:8px; align-items:baseline } .kn .id { font-family:var(--mono); font-size:12.5px; color:var(--forest) } .kn b { color:var(--ink) }
.kn ul { font-size:14.5px } .kn dl { margin:0; display:grid; grid-template-columns:110px minmax(0,1fr); gap:2px 10px; font-size:13.5px } .kn dt { font-family:var(--mono); font-size:11px; text-transform:uppercase; color:var(--muted); padding-top:2px } .kn dd { margin:0 }
@media (max-width:560px) { .kn dl { grid-template-columns:1fr } }
blockquote.zit { margin:4px 0 0; padding:4px 10px; border-left:3px solid var(--line); font-size:13px; color:var(--muted); white-space:pre-line }
details > summary { cursor:pointer; color:var(--forest); font-size:13.5px }
ol.steps { margin:0; padding-left:22px; max-width:76ch } ol.steps li { margin:6px 0 }
footer { font-size:13px; color:var(--muted); border-top:1px solid var(--line); padding-top:12px }
'''

def build(base):
    folgt, ans, K, rng = load(base)
    V = K['varianten']; kurs = K['kurs']
    def eu(x): return n(x / kurs)
    offen_n = sum(len(k) for _, k in OFFEN)
    o = [f'''<title>X-PORTAL Index 3.0</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="w">
<header><p class="eyebrow">X-PORTAL Index 3.0 · Node001 Beregniza · Stand {STAND}</p>
<h1>Was gilt, was offen ist, was als Nächstes kommt</h1>
<p class="lead">Dieser Index enthält nur den aktuellen Stand: die Entscheidungen vom 13.11.2026 mit ihren Kommentaren, den Geologiebericht, das Kostenregister und die Anschaffungsliste.</p>
<p class="note">Alles Frühere (Index 2.0, das alte Entscheidungslog, der alte Baum) ist zurückgenommen und liegt im Archiv des Repos. Status nach Reference Architecture v0.4: {" ".join(st(s) for s in ["VERIFIED", "DOCUMENTED", "IN WORK", "ASSUMPTION", "OPEN", "DECISION REQUIRED"])}</p>
<nav><a href="#blick">Auf einen Blick</a><a href="#standort">Standort und Geologie</a><a href="#modell">Modell</a><a href="#bedarf">Was nötig ist</a><a href="#offen">Offene Entscheidungen</a><a href="#entschieden">Entschieden</a><a href="#schritte">Nächste Schritte</a><a href="#risiken">Risiken</a><a href="#unterlagen">Unterlagen</a></nav></header>

<section id="blick"><p class="num">1 · Auf einen Blick</p><h2>Zehn Aussagen zum Stand</h2>
<div class="blick">{"".join(f"<div><b>{e(a)}</b><span>{e(b)}</span><small>{e(c)}</small></div>" for a, b, c in BLICK)}</div>
<div class="kz"><div><b>{offen_n}</b><span>offene Entscheidungen, in Reihenfolge unten</span></div><div><b>{K["register"]["offen"]} von {K["register"]["positionen"]}</b><span>Kostenpositionen ohne Betrag</span></div><div><b>1</b><span>Bericht wartet auf Fachprüfung: die Geologie</span></div></div></section>

<section id="standort"><p class="num">2 · Standort und Geologie</p><h2>Ein Nordosthang mit Hangwasser</h2>
<p class="warn"><b>Nicht geprüft.</b> Die Angaben stammen aus der KI-Zusammenfassung XPB-N001-GEO-SUM-001 vom 13.11.2026 des technischen Berichts (Vertrag 34.11/26, Iwano-Frankiwsk 2026). Eine Fachprüfung und Freigabe gibt es nicht. Maßgeblich ist der ukrainische Originalbericht; für Bau- oder Investitionsentscheidungen reicht die Zusammenfassung nicht.</p>
<div class="tw"><table><tbody>{"".join(f"<tr><td class=id>{e(a)}</td><td>{e(b)}</td></tr>" for a, b in GEO_FAKT)}</tbody></table></div>
<h3>Bodenschichten und Kennwerte</h3>
<div class="tw"><table><thead><tr><th>Schicht</th><th>Beschreibung</th><th>Mächtigkeit</th><th>E-Modul</th><th>Reibungswinkel</th><th>Kohäsion</th><th>R₀</th></tr></thead><tbody>{"".join("<tr><td class=id>"+r[0]+"</td>"+"".join(f"<td>{e(x)}</td>" for x in r[1:])+"</tr>" for r in GEO_SCHICHT)}</tbody></table></div>
<p class="note">Die Kennwerte gelten laut Gutachter für horizontales oder bis 15° geneigtes Gelände.</p>
<h3>Empfehlungen des Gutachters</h3><ul>{"".join(f"<li>{e(x)}</li>" for x in GEO_EMPF)}</ul>
<p><b>Grundstück:</b> Bereschnyzja (Beregniza), Ortsteil Hrun, bei Werchowyna; Kataster 2620885502:02:001:0013; Detailplan über 2,0 ha. <b>Lagebild:</b> folgt; das frühere Bild „Generalplan Variante 2“ war falsch und ist entfernt.</p></section>

<section id="modell"><p class="num">3 · Modell</p><h2>Miete statt Verkauf, Selbstkosten als Basis</h2>
<div class="grid">{"".join(f'<div class="card"><p class="tag">{e(a)}</p><h3>{e(b)}</h3><p>{e(c)}</p><span class="src">{e(d)}</span></div>' for a, b, c, d in MODELL)}</div></section>
''']
    phs = ['Vor-Phase', 'Phase 0', 'Phase 1', 'Betrieb 12 Monate']
    def cell(m, ph):
        c = K['matrix'].get(f'{m}|{ph}')
        return f'{eu(c[0])}–{eu(c[1])} €' if c and round(c[0]) != round(c[1]) else (f'{eu(c[0])} €' if c else 'nicht gerechnet')
    o.append('<section id="bedarf"><p class="num">4 · Was nötig ist</p><h2>Vor dem Investment, Phase 0, Phase 1: von unten nach oben</h2><p>Gegliedert nach Maslow: zuerst muss das Untere stehen. Die Beträge sind Teilsummen der gerechneten Zeilen im Kostenregister, also Annahmen aus Internet-Richtwerten. „Nicht gerechnet“ heißt nicht „kostet nichts“.</p><div class="tw"><table><thead><tr><th>Stufe</th><th>Vor dem Investment</th><th>Phase 0</th><th>Phase 1</th><th>Positionen</th></tr></thead><tbody>')
    for m, name, ber, a, b, c in MASLOW:
        pos = '<br>'.join(f'{e(x)}: {rng[x][0]}–{rng[x][1]}' for x in ber)
        o.append(f'<tr><td><b>{m} · {e(name)}</b></td><td>{e(a)}<small>{cell(m, "Vor-Phase")}</small></td><td>{e(b)}<small>{cell(m, "Phase 0")}; Betrieb 12 Monate: {cell(m, "Betrieb 12 Monate")}</small></td><td>{e(c)}<small>{cell(m, "Phase 1")}</small></td><td class="src" style="white-space:normal">{pos}</td></tr>')
    ia = K['investor_ask']
    o.append(f'''</tbody></table></div>
<div class="grid"><div class="card"><p class="tag">Vor dem Investment · ASSUMPTION</p><h3>{eu(V["Optimum"]["niedrig"])}–{eu(V["Optimum"]["hoch"])} € im Optimum</h3><p>Kern {eu(V["Kern"]["niedrig"])}–{eu(V["Kern"]["hoch"])} €, Erweitert mit Brunnen {eu(V["Erweitert"]["niedrig"])}–{eu(V["Erweitert"]["hoch"])} €. Dazu rund {V["Optimum"]["stunden"]} Stunden Eigenleistung. Reisen, Honorare, Gebühren und Gründung sind nicht enthalten.</p><a href="{U["vor"]}">Vor dem Investment →</a></div>
<div class="card"><p class="tag">Danach mit Investoren · ASSUMPTION</p><h3>Teilsumme kleine Phase 0</h3><p>Einmalig {eu(ia["einmalig"][0])}–{eu(ia["einmalig"][1])} €, zwölf Monate Betrieb {eu(ia["betrieb"][0])}–{eu(ia["betrieb"][1])} €, für ein Modul mit 18 m² und zwei Personen. Kein Kapitalbedarf: {K["register"]["offen"]} Positionen fehlen, Phase 1 ist nicht gerechnet.</p></div>
<div class="card"><p class="tag">Einzelposten</p><h3>120 Anschaffungen</h3><p>Jede Position mit Phase, Art, Recherchefrage und Rolle. Anbieter, Preis und Link trägt die Projektleitung dort ein.</p><a href="{U["ans"]}">Anschaffungsliste →</a></div></div></section>''')
    o.append(f'<section id="offen"><p class="num">5 · Offene Entscheidungen</p><h2>{offen_n} Fragen, in der Reihenfolge, in der sie einander brauchen</h2><p>Jeder Schritt setzt den davor voraus. Entschieden wird auf der <a href="{U["ent"]}">Entscheidungsseite</a>; Karten mit D-Nummer stehen dort, die übrigen brauchen noch eine Karte.</p><ol class="tree">')
    for titel, ks in OFFEN:
        o.append(f'<li><h3>{e(titel)}</h3>')
        for i, frage, opts, dep, blk, rolle, s in ks:
            if i == 'D69': opts = [f'Kern: {eu(V["Kern"]["niedrig"])}–{eu(V["Kern"]["hoch"])} €', f'Optimum: {eu(V["Optimum"]["niedrig"])}–{eu(V["Optimum"]["hoch"])} € (Vorschlag KI)', f'Erweitert mit Brunnen: {eu(V["Erweitert"]["niedrig"])}–{eu(V["Erweitert"]["hoch"])} €']
            kom = f'<details><summary>Kommentar vom 13.11.</summary><blockquote class="zit">{e(ans[i]["kommentar"])}</blockquote></details>' if i in ans and ans[i].get('kommentar') else ''
            o.append(f'<div class="kn" id="k-{i}"><header><span class="id">{i}</span><b>{e(frage)}</b>{st(s)}</header>'
                     + (f'<ul>{"".join(f"<li>{e(x)}</li>" for x in opts)}</ul>' if opts else '')
                     + f'<dl><dt>Hängt ab von</dt><dd>{e(dep)}</dd><dt>Blockiert</dt><dd>{e(blk)}</dd><dt>Entscheidet</dt><dd>{e(rolle)}</dd></dl>{kom}</div>')
        o.append('</li>')
    o.append('</ol></section>')
    o.append(f'<section id="entschieden"><p class="num">6 · Entschieden am 13.11.2026</p><h2>{len(ans)} Karten: was gilt</h2><p>Wahl und Kommentar gelten zusammen; wo der Kommentar die Wahl ändert, gilt der Kommentar. Karten, die oben als offen stehen, sind nur teilweise beantwortet.</p><div class="tw"><table><thead><tr><th>Karte</th><th>Thema</th><th>Was gilt</th></tr></thead><tbody>')
    for i in sorted(ans):
        if i not in folgt: continue
        kom = f'<details><summary>Kommentar im Wortlaut</summary><blockquote class="zit">{e(ans[i]["kommentar"])}</blockquote></details>' if ans[i].get('kommentar') else ''
        o.append(f'<tr><td class="id">{i}</td><td><b>{e(THEMA[i])}</b></td><td>{e(folgt[i])}{kom}</td></tr>')
    o.append('</tbody></table></div></section>')
    pk = [p for p in K['paket'] if p['variante'] in 'KO']
    def names(stufe): return ', '.join(p['titel'] for p in pk if p['stufe'].startswith(stufe))
    o.append(f'''<section id="schritte"><p class="num">7 · Nächste Schritte</p><h2>Die Reihenfolge vor dem Investment</h2>
<ol class="steps"><li><b>Paket festlegen (D69) und Geologie prüfen lassen.</b> Ohne Freigabe des Berichts ist jede Planung angreifbar. Rolle: Geschäftsführung.</li>
<li><b>Nachweise auf Papier.</b> {e(names("A"))}. Rolle: Projektleitung mit Fachexperten.</li>
<li><b>Eigenanteil am Grundstück.</b> {e(names("B"))}. Jede Stunde wird festgehalten. Rolle: Team.</li>
<li><b>Nachfrage und Umsatz.</b> {e(names("C"))}. Rolle: Projektleitung.</li>
<li><b>Kostenband und Selbstkosten.</b> Aus den Angeboten entstehen Kapitalbedarf und Mietpreis. Rolle: Projektleitung, Freigabe Geschäftsführung.</li>
<li><b>Investoren ansprechen (D71).</b> Mit geprüften Nachweisen statt offenen Grundsatzfragen.</li></ol>
<p class="note">Termine stehen hier bewusst keine: Bisher hat niemand welche gesetzt. Baubeginn 2027 bleibt ein Ziel, nur nach den Gates (D58).</p></section>

<section id="risiken"><p class="num">8 · Risiken und Lücken</p><h2>Was den Plan heute angreifbar macht</h2>
<div class="tw"><table><thead><tr><th>Thema</th><th>Lage</th><th>Nächster Schritt</th></tr></thead><tbody>{"".join(f"<tr><td><b>{e(a)}</b></td><td>{e(b)}</td><td>{e(c)}</td></tr>" for a, b, c in RISIKEN)}</tbody></table></div></section>

<section id="unterlagen"><p class="num">9 · Unterlagen</p><h2>Wo was steht</h2>
<div class="grid">
<div class="card"><h3><a href="{U["ent"]}">Entscheidungsseite</a></h3><p>36 Karten; 32 beantwortet am 13.11., offen D69–D72.</p></div>
<div class="card"><h3><a href="{U["vor"]}">Vor dem Investment</a></h3><p>Drei Varianten des Eigenmittel-Pakets mit allen Posten.</p></div>
<div class="card"><h3><a href="{U["ans"]}">Anschaffungsliste</a></h3><p>120 Positionen mit Feldern für die Recherche.</p></div>
<div class="card"><h3><a href="{U["sgmm"]}">SGMM-Seite</a></h3><p>Führung nach St. Galler Modell und zwölf Funktionsketten.</p></div>
<div class="card"><h3><a href="{U["wp"]}">Whitepaper</a></h3><p>Für Investoren, ohne Beträge. Das Deck v3 liegt im Repo unter plan/praesentation.</p></div>
<div class="card"><h3>Repo</h3><p>Wolfoeden/x-portal, Ordner plan: index-3, entscheidungen, anschaffungen, kosten, sgmm, whitepaper, praesentation. Der alte Index liegt in plan/index-3/archiv-bis-2026-11-13 und gilt nicht mehr.</p></div></div></section>
<footer>Erzeugt aus plan/index-3/werkzeug/index.py, Stand {STAND}. Bezugsrahmen: X-PORTAL Reference Architecture v0.4-WB1. Rechts- und Fachfragen sind Prüfaufträge, keine Auskunft. Nichts wird bestellt oder versendet, bevor ein Mensch freigibt.</footer></div>''')
    page = '\n'.join(o)
    chk = html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'<blockquote class="zit">.*?</blockquote>', '', page, flags=re.S)))
    bad = {w: chk.count(w) for w in VERBOTEN if w in chk}
    assert not bad, f'überholte Begriffe auf der Seite: {bad}'
    ids = re.findall(r' id="([^"]+)"', page); assert len(ids) == len(set(ids))
    data = dict(stand=STAND, auf_einen_blick=[dict(thema=a, aussage=b, quelle=c) for a, b, c in BLICK],
                geologie=dict(status='NICHT GEPRÜFT, KI-Zusammenfassung XPB-N001-GEO-SUM-001', fakten=dict(GEO_FAKT), schichten=GEO_SCHICHT, empfehlungen=GEO_EMPF),
                modell=[dict(bereich=a, titel=b, text=c, quelle=d) for a, b, c, d in MODELL],
                bedarf=[dict(stufe=m, name=nm, bereiche=ber, vor_phase=a, phase0=b, phase1=c, positionen={x: rng[x] for x in ber}) for m, nm, ber, a, b, c in MASLOW],
                offen=[dict(schritt=t, knoten=[dict(id=i, frage=f, moeglichkeiten=op, haengt_ab_von=d, blockiert=b, entscheidet=r, status=s) for i, f, op, d, b, r, s in ks]) for t, ks in OFFEN],
                entschieden={i: dict(thema=THEMA[i], gilt=folgt[i], wahl=ans[i].get('wahl'), kommentar=ans[i].get('kommentar')) for i in sorted(ans) if i in folgt},
                risiken=[dict(thema=a, lage=b, schritt=c) for a, b, c in RISIKEN], links=U)
    return page, data

def md(D):
    L = [f'# X-PORTAL Index 3.0, Stand {D["stand"]}', '', 'Nur aktueller Stand. Alles Frühere liegt in `archiv-bis-2026-11-13/` und gilt nicht mehr.', '', '## 1 Auf einen Blick', '']
    L += [f'- **{x["thema"]}:** {x["aussage"]} ({x["quelle"]})' for x in D['auf_einen_blick']]
    g = D['geologie']; L += ['', '## 2 Standort und Geologie', '', f'Status: {g["status"]}.', ''] + [f'- {k}: {v}' for k, v in g['fakten'].items()] + ['', 'Empfehlungen des Gutachters:'] + [f'- {x}' for x in g['empfehlungen']]
    L += ['', '## 3 Modell', ''] + [f'- **{x["bereich"]} · {x["titel"]}:** {x["text"]} ({x["quelle"]})' for x in D['modell']]
    L += ['', '## 4 Was nötig ist', '', '| Stufe | Vor dem Investment | Phase 0 | Phase 1 |', '|---|---|---|---|'] + [f'| {x["stufe"]} {x["name"]} | {x["vor_phase"]} | {x["phase0"]} | {x["phase1"]} |' for x in D['bedarf']]
    L += ['', '## 5 Offene Entscheidungen', '']
    for s in D['offen']:
        L += [f'### {s["schritt"]}', '']
        for k in s['knoten']:
            L += [f'- **{k["id"]}** [{k["status"]}] {k["frage"]}' + (f' Möglichkeiten: {"; ".join(k["moeglichkeiten"])}.' if k['moeglichkeiten'] else ''), f'  - Hängt ab von: {k["haengt_ab_von"]}. Blockiert: {k["blockiert"]}. Entscheidet: {k["entscheidet"]}.']
        L.append('')
    L += ['## 6 Entschieden am 13.11.2026', '', '| Karte | Thema | Was gilt |', '|---|---|---|'] + [f'| {i} | {v["thema"]} | {v["gilt"]} |' for i, v in D['entschieden'].items()]
    L += ['', '## 8 Risiken und Lücken', ''] + [f'- **{x["thema"]}:** {x["lage"]} Nächster Schritt: {x["schritt"]}.' for x in D['risiken']]
    return '\n'.join(L) + '\n'

if __name__ == '__main__':
    base = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    page, D = build(base)
    (base / 'index-3.body.html').write_text(page)
    (base / 'index-3.html').write_text('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}</style></head><body>\n' + page + '\n</body></html>\n')
    (base / 'index-3.md').write_text(md(D))
    (base / 'index-3.json').write_text(json.dumps(D, ensure_ascii=False, indent=1))
    print('ok', len(page), 'Bytes;', sum(len(s['knoten']) for s in D['offen']), 'offen;', len(D['entschieden']), 'entschieden')
