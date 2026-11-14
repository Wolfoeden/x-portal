"""Baut X-PORTAL Index 3.0: Index 2.0 plus offener Entscheidungsbaum ganz oben."""
import html
import re
import sys
from pathlib import Path

SRC = Path(sys.argv[1])  # gespeichertes Index-2.0-HTML (mit Bildern)
OUT = Path(sys.argv[2])
ENTSCHEIDUNGSSEITE = 'https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP'
INDEX2 = 'https://claude.ai/artifact/D7nrN4Mf9Et9cXCQp2PKsG'

page = SRC.read_text()
E_IDS = set(re.findall(r'<li id="(E\d\d)"', page))

# ---------- Baum ----------

def N(kind, nid, title, state=None, meta=None, text=None, kids=None, opts=None, needs=None, feeds=None, page=False, label=None, opened=None, hint=None, container=False, ziel=None, facts=None, raw=None, tags=None, ber=None, dom=None, see=None):
    return dict(kind=kind, id=nid, title=title, state=state, meta=meta, text=text, kids=kids or [], opts=opts or [],
                needs=needs or [], feeds=feeds or [], page=page, label=label, opened=opened, hint=hint, container=container,
                ziel=ziel or [], facts=facts or [], raw=raw, tags=tags or [], ber=ber, dom=dom, see=see or [])

def O(letter, title, text=None, facts=None, state=None):
    return dict(kind='option', letter=letter, title=title, text=text, facts=facts or [], state=state)

def X(label, title, text=None, state='rule', kids=None):
    return N('outcome', None, title, state=state, text=text, kids=kids, label=label)

VORGABE = 'Vorgabe vom 05.11.2026 im Chat, noch nicht im Entscheidungslog'
KI = 'Möglichkeiten: Vorschlag KI, noch keine Entscheidung; sie gilt erst, wenn ihr eine wählt (D43).'

hauptweg = [
    N('chance', 'O01', 'Geologie: Bericht liegt vor. Was sagt er für Phase 0 und Phase 1?', 'done',
      meta='Technischer Bericht 34.11/26, Ingenieurgeologe, Iwano-Frankiwsk 2026 · deutsche Zusammenfassung XPB-N001-GEO-SUM-001 (KI-erstellt, mit dem Original abzugleichen)',
      text='Feldarbeiten September bis November 2026: 3 Schürfgruben mit zusammen 7,5 m, 12 Handbohrungen bis je 2 m. Nordöstlich exponierter Hang des Bila Kobyla, Geländehöhen 1.016–1.077 m. Ingenieurgeologische Komplexität Kategorie III.',
      facts=[('Schichten', 'IGE-1 lehmiger Oberboden, 0,6–1,1 m, von Rutschprozessen betroffen; IGE-2 weichplastischer Lehm, 0,8–1,1 m; IGE-3 Schuttmaterial mit Sandstein, 1,0–1,4 m, bei den Punkten 6, 7, 11 wassergesättigt; IGE-4 Flysch, Schichten etwa 70° geneigt.'),
             ('Kennwerte', 'IGE-1: E 19 MPa, φ 23°, c 27 kPa, R₀ 240 kPa. IGE-2: 6 MPa, 14°, 13 kPa, 130 kPa. IGE-3: 45 MPa, 33°, 8 kPa, 500 kPa; am Standort mit 70 % anzusetzen.'),
             ('Grundwasser', 'Austritte an den Bohrpunkten 6, 7 und 11; mehr Wasser bei Starkregen und Schneeschmelze. Gegen Beton normaler Dichte nicht aggressiv.'),
             ('Hang', 'Verbreitete Rutsch- und Fließprozesse; bewegte Schichten 0,8–1,2 m (im erläuternden Text 0,9–1,2 m), Flächen meist 3–4 m², teils bis 15 m².'),
             ('Empfehlung', 'Kombinierte Streifen- und Stützfundamentierung auf IGE-3 oder IGE-4; hangseitiger Fundamentbereich als Stützkonstruktion; hangseitiger Entwässerungsgraben; Wasser vor Abfällen und Abwasser schützen.'),
             ('Zusatzerkundung', 'Verlangt für Zufahrt, Stützkonstruktionen und Hauptgebäude, wenn bis IGE-4 gegründet wird, und bei geänderten Gebäuden oder Fundamenten.')],
      kids=[
          X('Fall A', 'Leichte eingeschossige Objekte: Gründung auf IGE-3.', 'Laut Gutachter geeignet für leichte eingeschossige Gebäude. Gilt für das Objekt Phase 0, wenn es leicht und eingeschossig ist (Zuordnung Vorschlag KI).', state='open',
            kids=[N('decision', None, 'Fundament für das Objekt Phase 0: Streifen- und Stützfundament nach Empfehlung, bemessen durch einen Fachexperten', 'open', meta='Fachexperte Bau · Freigabe Geschäftsführung')]),
          X('Fall B', 'Massive, dauerhafte Gebäude: Gründung auf IGE-4, mit Zusatzerkundung.', 'Laut Gutachter für massive Gebäude. Betrifft Kommunalgebäude und Objekte in Phase 1 (Zuordnung Vorschlag KI).', state='open',
            kids=[N('decision', None, 'Zusatzerkundung für Phase 1 beauftragen, sobald Lage und Bauart der Gebäude feststehen (D56)', 'open', meta='Geschäftsführung · vor Phase 1')]),
          X('Fall C', 'Flächen mit Grundwasseraustritt und Rutschprozessen.', 'Bohrpunkte 6, 7 und 11. Entwässerungsgraben und Stützkonstruktion nach Empfehlung; die Lage von Phase 0 berücksichtigt diese Punkte.', state='open'),
          N('decision', 'lage', 'Wo im Detailplan steht das Objekt Phase 0 (unterhalb der Herrenhaus-Fläche, D55)?', 'open',
            meta='Geschäftsführung mit dem Architekten (Beratung) · vor der Planung von Phase 0',
            text='Grundlage ist der Detailplan Blatt 3 (2,0 ha, 24 Parzellen, Höhenlinien, Brunnen, lokale Kläranlage; Bild unter „Der Ort“ in der Grundlage). Zu klären: welche Parzelle die Herrenhaus-Fläche ist, wo darunter das Objekt Phase 0 steht und wie Wasser, Strom, Abwasser und Weg dorthin kommen.'),
      ]),
    N('decision', 'hausart', 'Bauart der Objekte: Holz, Beton, Glas, Metall?', 'open',
      meta='Geschäftsführung nach Vorschlag Fachexperte Bau · nach Lage (O01)',
      text='Antwort vom 13.11. (D56): Der Plan für die Objekte steht aus; eine Bau-KI bewertet und plant in Abhängigkeit von den lokalen Gegebenheiten (Geologie, Gelände, Zufahrt).',
      see=[('#b-mb-haus', 'Varianten im Make-or-Buy')], ziel=['Z1', 'Z2']),
    N('chance', 'zufahrt', 'Kommt das Objekt Phase 0 die Zufahrt hoch, im Sommer und im Winter (2.2.4)?', 'done',
      meta='Antwort vom 13.11. (D57)',
      text='Phase 0: voraussichtlich kleines Fahrzeug, keine Befestigung am Anfang; alles kommt auf kleinem Fahrzeug hoch. Die Gesamtplanung der Zufahrt entscheidet sich in Phase 1 mit 3D-Modellen der Bau-KI. Die letzten etwa 200 m haben über 15 % Steigung; bis 2,6 m Breite geht ein Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug.',
      ziel=['Z1'], kids=[X('ja', 'Die Lieferform steht fest.', 'Damit ist klar, welche Anbieter in Frage kommen.', state='open'),
                         X('nein', 'Kleinere Teile oder eine andere Lieferform.', 'Bauart und Anbieter werden neu bewertet (2.2.3).', state='open')]),
    N('decision', 'lieferant', 'Wer liefert und baut das Objekt Phase 0, mit oder ohne Montage?', 'open',
      meta='Projektleitung holt Angebote ein, die Geschäftsführung entscheidet die Bestellung · nach Bauart',
      text='Drei schriftliche Angebote mit Preis, Lieferform, schwerstem Teil, Montageaufwand und Winterwerten (O31). Die Anfrage enthält die Raumliste aus M02, die Anforderungen an Sanitär ab Phase 0 (D62) und die Maße der Zufahrt. Wer was selbst macht, steht in 2.4.8.',
      see=[('#b-mb-eigen', 'Selbst, mit Hilfe oder extern')], ziel=['Z1', 'Z2']),
    N('decision', 'technik', 'Technik im Objekt: Zugang, Server, Netzwerk. Liefert der Anbieter sie mit, oder beschaffen wir sie selbst?', 'open',
      meta='Geschäftsführung und Projektleitung',
      text='Zugang per Chip an den Türen, auch zur Erfassung der Gemeinschaftsarbeit, voraussichtlich mit Cardano-Technik (D36). Internet: Bandbreite, Router und Anbieter werden verglichen (D63). Maßstab: alles läuft immer; vor dem ersten Übernachten ist jede Funktion abgenommen, nach einer Tabelle, die die Projektleitung prüft und freigibt (D66). Server oben werden nur bei VC-Funding für personenbezogene Daten mit Deutschland verbunden (D47).',
      hint=KI, ziel=['Z1', 'Z3'],
      opts=[O('A', 'Der Anbieter liefert und baut ein', 'Ein Ansprechpartner; die Anforderungen gehen in die Anfrage O31.'),
            O('B', 'Wir beschaffen selbst', 'Eigene Auswahl und eigener Einbau; die Stunden gehören in 2.4.8.'),
            O('C', 'Gemischt', 'Zugang und Leitungen vom Anbieter, Server und IT selbst.')]),
    N('step', 'O03', 'Selbstkosten je Objekt, daraus Miete und monatliche Pauschale', 'open',
      meta='KI rechnet, Geschäftsführung und Projektleitung entscheiden · nach Angeboten (O31)',
      text='Statt eines Verkaufspreises wird der Selbstkostenpreis je Objekt ermittelt (D49): Objekt, Transport, Montage, Fundament, Anschlüsse, Anteil an Kommunalgebäude und Infrastruktur, Betrieb. Daraus Miete und Pauschale; erbrachte Projekt- und Gemeinschaftsleistungen werden abgezogen (D38). Grundlage ist das Kostenregister vom 13.11.2026 (Teilrechnung, 69 von 137 Positionen ohne Betrag).',
      needs=['O31', 'D36', 'D37', 'D38']),
    N('step', 'mieter', 'Mietinteressenten gewinnen, ab sofort und vor dem Bau', 'open',
      meta='Projektleitung · laufend (D50)',
      text='Zuerst Mieter gewinnen; Ziel ist, Interessenten jetzt zu bekommen (D50). Verkauft wird im klassischen Sinn nichts (D45, D48). Tokenisierung und Beteiligung auf mehreren Ebenen erst nach rechtlicher Klärung (O05).'),
    N('gate', 'G0', 'Können wir vermieten?', 'wait',
      meta='vor dem Investorengespräch · Geschäftsführung und Projektleitung geben frei oder lassen nacharbeiten',
      text='Muss fertig sein: Selbstkosten und Pauschale (O03), Mietvertrag und Struktur rechtlich geprüft (O05), Leistungen oben (2.1.8), Lage und Bauart von Phase 0, Abnahmetabelle (D66).',
      needs=['O05', 'O12', 'D36', 'D37', 'D38']),
    N('chance', 'O23', 'Kapital: Steigen Investoren für Infrastruktur und Objekte ein?', 'open',
      meta='Geschäftsführung · nach dem Paket vor dem Investment (D69, D71)',
      text='Eigenkapital bis zur vollendeten Bauplanung; Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen (D46, D47). Ein Verkauf an Einzelne ist abgewählt.',
      kids=[
          X('ja', 'Bestellen.', 'Die Geschäftsführung entscheidet über Bestellung und Betrag; bestellt wird nur mit Geld auf dem Konto.'),
          X('noch nicht', 'Was dann?', state='open', kids=[
              N('decision', None, 'Wenn das Investment zum geplanten Bautermin nicht steht', 'open', hint=KI, opts=[
                  O('A', 'Phase 0 verschieben', 'Gebaut wird, sobald das Kapital steht; die Termine rücken nach hinten (D58: Termine sind Ziele).'),
                  O('B', 'Kleiner anfangen', 'Mit einem kleineren Objekt Phase 0; die Selbstkosten werden neu gerechnet (O03).'),
                  O('C', 'Eigenmittel erhöhen', 'Mehr Eigenkapital oder Eigenleistung, um den Anteil zu halten (D69, D70).')])]),
      ]),
    N('gate', 'G1', 'Ist genug Geld da, ist bestellt?', 'wait', meta='nach G0 und O23',
      text='Investment oder Eigenkapital für Phase 0 auf dem Konto; Objekt Phase 0 bestellt; Leitungen für Wasser, Abwasser, Strom und Internet geplant (2.2.7); kritische Fehlerarten bewertet (2.3.7); Prüfsituation T00 vor der Bestellung (2.4.9).',
      needs=['O17', 'O23']),
    N('chance', 'frost', 'Ist der Boden frostfrei?', 'wait', meta='Baubeginn 2027 ist Ziel, nur nach den Gates (D58)', kids=[
        X('ja', 'Objekt Phase 0 hoch und oben montieren.', 'Auf kleinem Fahrzeug (D57), auf dem Fundament nach Empfehlung des Gutachters, bemessen durch einen Fachexperten (2.2.8).'),
        X('nein', 'Warten, bis der Boden frei ist.', 'Baubeginn erst ohne Frost.'),
        X('Wetter, Straße', 'Anderes Einsatzfenster nötig.', 'Einsatzplan aktualisieren, G2 neu vorlegen.'),
        X('neue Information', 'Objekt, Kapital oder Budget ändern sich.', 'Auswirkung rechnen, dann G1 und G2 neu; Projektleitung koordiniert, Geschäftsführung prüft.'),
    ]),
    N('gate', 'G2', 'Darf eingezogen werden?', 'wait', meta='nach Montage und Abnahme',
      text='Ein Fachexperte bestätigt Heizung, Wasser mit Aufbereitung zu Trinkwasser, Strom, Sanitär (Spültoilette, Dusche, Warmwasser, Abwasser, D62) und Brandschutz schriftlich. Die Abnahmetabelle prüft die Projektleitung und gibt frei (D66). Muss fertig sein: 2.2.8, 2.3.2, 2.3.3, 2.4.6, 2.4.9 mit T00, T01, T05, T06.',
      kids=[X('abgenommen', 'Einzug.', 'Termine sind Ziele, keine Zusagen (D58).'),
            X('nicht abgenommen', 'Nacharbeiten und neu vorlegen.', 'Abnahmetabelle nach D66.')]),
    N('gate', 'G3', 'Hält es im Winter?', 'wait', meta='vor dem ersten Frost',
      text='Ofen nach Heizlast mit Plan zum Überwintern; trockenes Holz eingelagert, eigenes Holz trocknet (D60); frostfreie Wasserleitung; Toilette und Batterie im Warmen; Generator draußen (D59). Dazu Betrieb oben (2.4.5) und Absprachen mit Notfallplan (2.4.7).'),
    N('gate', 'G4', 'Haben die Leute oben Geld verdient?', 'wait', meta='erster Winter',
      text='Messung bei Frost im ersten Winter (2.3.5); Ziele Z1 bis Z3 gemessen; die nächste Phase wird entschieden.',
      kids=[N('end', 'ende', '2–3 Leute wohnen und arbeiten ganzjährig oben und verdienen dort Geld.', None,
              text='Danach Phase 1: Kommunalgebäude zuerst (D64), dann Wohn- und Arbeitsobjekte für Mieter und Team. Skalierung und Standardisierung werden von Anfang an mitgedacht; Node001 ist der Proof of Concept (D51).')]),
]

parallel = [
    N('step', 'O05', 'Anwälte in Deutschland und der Ukraine finden und die Prüfaufträge stellen', 'open', meta='Geschäftsführung und Projektleitung · vor G0',
      text='Prüfaufträge: Struktur mit Holding, Agentur und ukrainischer Gesellschaft für Node001; wo Services auf dem Node abgewickelt werden (D44). Mietmodell und Beteiligung von Mitwirkenden am jeweiligen Node statt an der Holding (D37, D48). Tokenisierung erst nach Klärung (D48). Datenverbindung der Server oben mit Deutschland nur bei VC-Funding (D47). Fällgenehmigung für die Bäume (D60), Abwasser und Kläranlage (D62), Versicherung der Eigenleistung.',
      kids=[N('decision', 'O22', 'Beteiligung am Node: in welcher Form, auf welchen Ebenen (D37, D48)?', 'wait', meta='Anwalt, dann Geschäftsführung · nach O05'),
            N('step', None, 'Verhältnis von Holding, Agentur und Node-Gesellschaft (D44)', 'wait', meta='Anwälte Deutschland und Ukraine · nach O05')]),
    N('step', 'O12', 'Paket vor dem Investment: was aus Eigenmitteln und Eigenleistung geht (D69)', 'open', meta='Geschäftsführung entscheidet · vor dem Investorengespräch',
      text='Richtwert etwa 10.000 € Eigenkapital; möglichst viel Eigenleistung, um einen höheren Eigenanteil zu halten (D69, D70). Mit dem Geld: Wasseranalyse, Rechtsprüfung der Struktur, Netzanschluss beantragen, Planung des Objekts Phase 0 auf Grundlage von Detailplan und Geologiebericht, Angebote. In Eigenleistung: Abgleich der deutschen Geologie-Zusammenfassung mit dem Original, Bäume fällen und Holz einlagern (D60), Mietinteressenten (D50). Die Beträge der Varianten werden ohne die Posten neu gerechnet, die schon vorliegen (Geologie, Vermessung).'),
    N('step', 'texte', 'Texte für Mietinteressenten und Website prüfen lassen (2.5.4)', 'open', meta='Projektleitung',
      text='Ein Jurist sieht die Texte, bevor etwas veröffentlicht wird. Förderung wird nicht öffentlich gezeigt, nur was Kapitalgeber verlangen (D47).'),
    N('step', 'O31', 'Angebote für das Objekt Phase 0 und die Infrastruktur einholen', 'open', meta='KI bereitet vor, Projektleitung schickt nach Freigabe',
      text='Je großem Posten drei schriftliche Angebote: Objekt Phase 0, Fundament mit Stützkonstruktion, Brunnen mit Aufbereitung, Kläranlage mit Einbau, Netzanschluss mit Leitung. Grundlage: Detailplan, Geologiebericht, Anschaffungsliste A001–A120.',
      kids=[N('decision', 'haus', 'Welches Objekt für Phase 0 (2.2.3)?', 'wait', meta='Projektleitung, Geschäftsführung · nach O31',
              text='Angebot mit Preis, Lieferform, schwerstem Teil und Montageaufwand; Kriterium Transport auf kleinem Fahrzeug (D57). Bauart nach D56.')]),
    N('step', 'O04', 'Bezahlte Kundenprojekte, laufend', 'open', meta='Projektleitung und Geschäftsführung · laufend (D51)',
      text='Kundenprojekte sind die erste Erlösstufe und brauchen keinen Berg. Testkarte nach M09: Problem, Annahme, Zielgruppe, Test, Erfolgsschwelle, Zeit- und Euro-Rahmen. Projekte in Deutschland, Österreich und der Schweiz laufen über die Agentur (D44).',
      kids=[N('decision', 'preis', 'Preismodell für Technologielösungen (2.6.2)', 'open', meta='KI rechnet die Kosten, Geschäftsführung und Projektleitung entscheiden',
              text='Projekte werden verkauft, ihr Preis ist offen.', opts=[
                  O('A', 'Abo'), O('B', 'Einmalzahlung mit Betreuung und Instandhaltung'),
                  O('C', 'Nach Nutzung', 'Passt zum Verkauf je Aufruf, zum Beispiel über Masumi.')])]),
    N('decision', 'O11', 'Rechtsform der Gesellschaft für Node001 und wo die Services abgewickelt werden (D44)', 'open', meta='Geschäftsführung mit Anwälten · nach O05',
      text='Node001 wird von einer ukrainischen Gesellschaft gehalten; Services voraussichtlich in einer lokalen Gesellschaft als Teil der Holding. Die Rechtsprechung ist noch zu klären.', hint=KI,
      opts=[O('A', 'Lokale Gesellschaft als Teil der Holding', 'Wie im Kommentar zu D44 vorgesehen.'),
            O('B', 'Getrennte Betriebsgesellschaft', 'Betrieb und Grundstück getrennt.')]),
]

def D(did, title, ctx, opts, feeds):
    return N('decision', did, title, 'open', text=ctx, opts=[O(*o) for o in opts], feeds=feeds, page=True)

import importlib.util as _ilu, json as _js
_HERE = Path(__file__).resolve().parent.parent
_spec = _ilu.spec_from_file_location('seite', _HERE.parent / 'entscheidungen' / 'werkzeug' / 'seite.py')
SEITE = _ilu.module_from_spec(_spec); _spec.loader.exec_module(SEITE)
FOLGT = dict(SEITE.FOLGT)
FOLGT.update({'D43': 'Rollenbasiert: Texte nennen Rollen statt Namen, und es heißt „Fachexperte“. Ein KI-Vorschlag gilt erst mit Wahl auf der Entscheidungsseite.',
              'D46': 'Node001 wird mit Eigenkapital und VC oder Investments finanziert, verbunden mit wiederkehrenden Erlösen. Ein Verkauf an Einzelne ist abgewählt.',
              'D49': 'Statt eines Verkaufspreises wird der Selbstkostenpreis je Objekt ermittelt.'})
ANT = {}
for _f in sorted((_HERE.parent / 'entscheidungen' / 'antworten-2026-11-13' / 'wahl').glob('D*.json')):
    _d = _js.loads(_f.read_text()); ANT[_f.stem] = _d.get('data', _d)
OFFEN_KARTEN = {'D52', 'D56'}
LABEL = {'unklar': 'weiß ich noch nicht', 'keine': 'keine davon', '': 'ohne Wahl, Kommentar gilt'}
THEMA = {'D34': 'Feuerstelle, Gastronomie, Kapelle', 'D35': 'Sauna', 'D36': 'Essen und Gemeinschaftsarbeit', 'D37': 'Bezahlung und Beteiligung des Teams', 'D38': 'Pauschale für Leistungen',
         'D42': 'Vision und Mission', 'D43': 'Entscheidungsrechte', 'D44': 'Organisation', 'D45': 'Wer oben wohnt', 'D46': 'Kapital Node001', 'D47': 'Kapital Company', 'D48': 'Produktmodell',
         'D49': 'Preislogik', 'D50': 'Start der Vermarktung', 'D51': 'Erlösstufen', 'D52': 'Einkommen der Geschäftsführung', 'D53': 'Zahlen für Investoren', 'D54': 'Geologie',
         'D55': 'Bauphasen', 'D56': 'Bauart', 'D57': 'Zufahrt und Transport', 'D58': 'Termine', 'D59': 'Strom', 'D60': 'Wärme', 'D61': 'Wasser', 'D62': 'Sanitär und Abwasser',
         'D63': 'Internet', 'D64': 'Kommunalgebäude', 'D65': 'Mobilität', 'D66': 'Betrieb und Abnahme', 'D67': 'Team und Rollen', 'D68': 'Arbeitsweise'}

OPT_TEXT_NEU = {('D45', 'C'): 'Zuerst Team und einige Mieter (Remote-Freelancer, Buchung etwa ein Jahr).', ('D64', 'A'): 'Das Kommunalgebäude ist der erste Bau in Phase 1, vor den übrigen Objekten; Garten daneben.'}
TITEL_NEU = {'D50': 'Start der Vermarktung und Schwelle zum Bauen', 'D55': 'Bauphasen: ein Objekt nur für den Anfang?'}

def karte(k):
    i = k['id']; a = ANT.get(i); w = (a or {}).get('wahl') or ''
    offen = a is None or i in OFFEN_KARTEN or w == 'unklar'
    opts = [O(o['v'], o['titel'], OPT_TEXT_NEU.get((i, o['v']), o['text']), state=('done' if o['v'] == w else None)) for o in k['opts'] if offen or o['v'] == w]
    facts = []
    if a is not None:
        facts.append(('Antwort 13.11.', LABEL.get(w, w)))
        if a.get('kommentar'):
            facts.append(('Kommentar 13.11.', a['kommentar']))
    text = ('Gilt: ' + FOLGT[i]) if (not offen and i in FOLGT) else k['warum']
    return N('decision', i, TITEL_NEU.get(i, k['frage']), 'open' if offen else 'done', text=text, opts=opts, facts=facts, page=True)

seite = [N('group', 'g-s-' + key, title, kids=[karte(k) for k in ks]) for key, title, ks in SEITE.ABSCHNITTE]

def pair(title):
    return N('decision', None, title, 'open', opts=[O('A', 'Die jüngere gilt'), O('B', 'Die ältere gilt')])

imPlan = [
    N('chance', 'O17', 'Krise: der Krieg verschärft sich, die Auffahrt ist gesperrt oder etwas fällt länger aus', 'open', meta='Paul und Roman · vor G1', kids=[
        X('sofort', 'Notfallplan zuerst.', 'Schutzmaßnahmen folgen sofort dem Notfallplan (2.4.7); er geht jeder anderen Regel vor (A6). Im Notfall ist man in unter 2 Stunden unten (E26).'),
        N('decision', None, 'Ab wann wird abgebrochen?', 'open', text='Noch ohne Entwürfe.'),
    ]),
    N('decision', 'O18', 'Methodenpilot nach Methodenbewertung 06: macht ihr ihn, und in welchem Umfang?', 'open', meta='Paul und Roman',
      text='Vier Wochen mit dem Pilotfall Geologie-Eingang. Vor Beginn ein Aufwandrahmen in Stunden und Euro; gemessen werden Durchlaufzeit, Nachweise, Rückfragen und Nacharbeit.', hint=KI,
      opts=[O('A', 'Ja, vier Wochen mit dem Pilotfall Geologie-Eingang'), O('B', 'Nein, nicht in Stufe 1')]),
    N('decision', 'versorgung', 'Wasser, Heizung, Abwasser, Toilette und Küche: Auslegung im Detail (2.3.2)', 'open',
      meta='Fachexperte legt Werte fest, die Projektleitung prüft (D66) · nach Lage und Bauart',
      text='Entschieden am 13.11.: Netzanschluss mit Generator als Reserve, Solar ab Phase 1 (D59); Ofen mit eigenem und gekauftem Holz, Holzlager (D60); Grundwasser mit Aufbereitung (D61); Spültoilette, Dusche, Warmwasser und Abwasser ab Phase 0 (D62); eigener Internetanschluss mit Starlink als Reserve (D63). Offen sind Größen und Werte (OD-002).'),
    N('group', 'g-rollen', 'Rollen und Betrieb oben', kids=[
        N('decision', None, 'Team oben: wer, wie viele, welcher Platz, wer zahlt (2.4.1)', 'open', meta='Paul und Roman · Vorschlag KI bis 15.12.2026'),
        N('decision', None, 'Betrieb oben: wer Holz, Wasser, Schnee und Wartung übernimmt (2.4.5)', 'open', meta='Paul und Roman · nach 2.4.1'),
        N('decision', None, 'Wer macht was selbst: Planung, Transport, Fundament, Aufstellen, Anschlüsse, Innenausbau (2.4.8)', 'open', meta='Paul und Roman, KI bereitet vor'),
        N('decision', 'O13', 'Einkommen und Vollzeit der Geschäftsführung (D52, 2.1.4)', 'open', meta='Geschäftsführung',
          text='Am 13.11. offen geblieben (D52: weiß ich noch nicht).'),
    ]),
]

entschieden_rows = re.findall(r'<tr><td>([^<]+)</td><td>(.*?)</td><td>(.*?)</td></tr>', page[page.find('id="k5-entscheidungen-kurz"'):page.find('id="k8-anhang')], re.S)
entschieden = []
for thema, was, quelle in entschieden_rows:
    plain = lambda s: html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
    entschieden.append(N('decision', None, plain(thema), 'later', text=f'{plain(was)} ({plain(quelle)})'))


import json as _json
M02 = _json.loads((Path(__file__).resolve().parent.parent / 'quellen' / 'm02-29.json').read_text())

# Pakete aus Plan 5.x, wie die Matrix sie nennt, und ihr heutiges Teilergebnis (Zuordnung KI nach Inhalt).
PAKET = {'N02': '2.1.2', 'N03': '2.4.1', 'N04': '2.2.1', 'N05': '2.2.6', 'N06': '2.3.2', 'N07': '2.3.2', 'N08': '2.3.2', 'N09': '2.3.2',
         'N10': '2.4.4', 'N11': '2.3.2', 'N12': '2.2.3', 'N13': '2.2.4', 'N14': '2.5.7', 'N21': '2.4.9', 'N22': '2.4.7', 'N23': '3.3',
         'N25': '2.6.6', 'N26': '2.6.1', 'N27': '2.4.6', 'N28': '2.4.6', 'N29': '2.4.5'}
# Welche Zeile in der heutigen M02 (46 Zeilen) steckt, soweit der Index es sagt.
IN_M02 = {'H02': 'M02-06', 'H04': 'M02-04', 'H07': 'M02-08', 'S03': 'M02-30', 'A03': 'M02-39', 'S07': 'M02-43'}

def fix(t):
    return re.sub(r'(?<=[^.\s;:])\s+Planwert ist eine Annahme', '. Planwert ist eine Annahme', t)

def req_node(r):
    pakete = [x.strip() for x in r['paket'].split(',') if x.strip()]
    heute = ', '.join(f'{PAKET.get(x, x)} (früher {x})' if x in PAKET else x for x in pakete)
    facts = [('Anforderung', r['anf']), ('Prüfverfahren', r['pruef']), ('Grenzwert', r['grenz'])]
    if r['plan']:
        facts.append(('Planwert', fix(r['plan'])))
    facts += [('Nachweis', r['nachweis']), ('Abnahme', r['abnahme']), ('Teilergebnis', heute)]
    meta = f'{r["stufe"]}' + (f' · heute in M02 als {IN_M02[r["id"]]} (laut Index)' if r['id'] in IN_M02 else '')
    tags = [t for t in [r['bereich']] if t] + ([f'Sinn: {r["sinn"]}'] if r['sinn'] and r['sinn'] != '—' else [])
    state = 'untested' if r['stufe'] == 'von Anfang an' else 'later'
    return N('req', r['id'], r['bedarf'], state, meta=meta, facts=facts, tags=tags, ber=r['bereich'], dom=f'b-r-{r["id"]}')

stufen = []
for g in dict.fromkeys(r['group'] for r in M02):
    stufen.append(N('group', 'g-m-' + re.sub(r'\W+', '-', g.lower()), g, kids=[req_node(r) for r in M02 if r['group'] == g]))

neuer = N('group', 'g-m-neu', 'In M02 dazugekommen, im Index nur als Nummer', text='Der Text dieser Zeilen steht in plan/daten/m02.json. Hier steht, was der Index über sie sagt.', kids=[
    N('req', None, 'Jour fixe am Morgen im Kommunalgebäude', 'untested', meta='M02-44 · aus E81 (Vorschlag KI, E80)', tags=['Service'], ber='Service', dom='b-M02-44'),
    N('req', None, 'Laufen, Wandern und Yoga', 'untested', meta='M02-45 · aus E81', tags=['Service'], ber='Service', dom='b-M02-45'),
    N('req', None, 'Sauna und Wellness', 'untested', meta='M02-46 · eigene Sauna in Phase 1 (D35)', tags=['Raum', 'Versorgung'], ber='Raum, Versorgung', dom='b-M02-46'),
    N('req', None, 'Feuerstelle: Brandschutz und ein Platz mit wenig Wind', 'untested', meta='M02-21, M02-22 · Feuerstelle in Phase 1 (D34)', tags=['Raum'], ber='Raum', dom='b-M02-21'),
    N('req', None, 'Gastronomie: Gäste, Personal, Hygiene, eigene Nachweise', 'later', meta='M02-25 bis M02-27 · nach Phase 1 (D34)', tags=['Service', 'Versorgung'], ber='Service, Versorgung', dom='b-M02-25'),
    N('req', None, 'Gemeinsamer Weg, private Abzweige', 'untested', meta='M02-14 · Zielbild Bereich 7, 2.2.4', tags=['Raum'], ber='Raum', dom='b-M02-14'),
    N('req', None, 'Gemüsegarten am Kommunalgebäude, freiwillig mitarbeiten', 'untested', meta='M02-20, M02-23 · E74, Alltag oben', tags=['Versorgung', 'Service'], ber='Versorgung, Service', dom='b-M02-23'),
    N('req', None, 'Technik: Strom, Solar, Wasser', 'untested', meta='M02-28 · Zielbild Bereich 6, 2.3.1, 2.3.7', tags=['Versorgung'], ber='Versorgung', dom='b-M02-28'),
])

def day(nid, title, sub, steps, state='untested'):
    return N('chance', None, title, state, meta=sub, dom=nid, kids=[X(t, a, f'prüft {ids}' if ids else None, state='untested') for t, a, ids in steps])

szenarien = N('group', 'g-szen', 'Szenariotests: drei Tage, gegen die jede Variante geprüft wird', text='Aus der Matrix vom 03.11.2026. Jeder Schritt nennt die Anforderungen, die er prüft. Die Prüfsituationen T00 bis T06 im Nutzungstest (2.4.9) setzen sie um; Ausfalltests nur mit einem von einer Fachperson freigegebenen Ablauf (E22).', kids=[
    day('b-szen-sommer', 'Sommer-Arbeitstag', 'Juli, trocken, 15–16 Stunden Tageslicht', [
        ('07:00', 'Aufstehen, Toilette, Waschen, Kaffee', 'H06, H05, H07'), ('08:00', 'B und C arbeiten konzentriert; A holt die Lieferung unten an der Auffahrt', 'D01, D05, S02'),
        ('14:00', 'B und C gleichzeitig in Videocalls', 'D01, D02'), ('18:00', 'A macht Holz für den Winter; Abendessen; Kontakt mit Familie', 'Z02, H04'),
        ('22:00', 'Schlafen bei offenem Fenster ohne Insekten und Lärm', 'H01, H08')]),
    day('b-szen-winter', 'Winter-Arbeitstag', 'Dezember, −15 °C, Schnee, etwa 8–9 Stunden Tageslicht', [
        ('06:30', 'Der Ofen ist über Nacht ausgegangen: Wie warm ist es beim Aufstehen?', 'H02'), ('07:00', 'Leitung und Tank sind nicht eingefroren', 'H06, H04'),
        ('08:00', 'Arbeit bei Kunstlicht; Fenster zu, die Luft wird schlecht', 'D03, H08'), ('11:00', 'Schnee liegt auf der Starlink-Antenne', 'D01'),
        ('15:00', 'Es wird dunkel; Solar liefert kaum Strom', 'D04, S03'), ('22:00', 'Ofen brennt herunter; Rauch- und CO-Melder aktiv', 'S01, H02')]),
    day('b-szen-stoerung', 'Störungstag', 'Februar: Strom 6 Stunden weg, Auffahrt 3 Tage zugeschneit', [
        ('09:00', 'Netzstrom fällt aus: Was läuft weiter, und wie lange?', 'S03, D04'), ('09:05', 'Laufende Kundencalls über die Reserve halten oder absagen', 'D01, A01'),
        ('12:00', 'Pumpe steht: Wasser aus Tank und Notvorrat', 'H04'), ('ganztägig', 'Keine Lieferung, kein Arzt erreichbar: Vorräte, Erste Hilfe, wer entscheidet', 'S02, H07'),
        ('Tag 3', 'Jemand verletzt sich: Wie kommt Hilfe hoch?', 'S02')]),
    N('step', None, 'Nutzungstest „konzentriert digital arbeiten“', 'untested', text='Zwei Personen je eine Stunde gleichzeitig im Videocall, die dritte arbeitet konzentriert. Gemessen werden Upload und Abbrüche (D01), Schall am ruhigen Platz (D02), Licht (D03), Überbrückung bei Netzausfall (D04), Temperatur und CO₂ (D05). Einmal als Rechnung in der Planung, einmal als Messung im ersten Winter.'),
])

personen = N('step', 'b-personen', 'Für wen: drei Personen', 'done', text='Roman vor Ort, ist von Anfang an oben (E24) und führt Produkt und Projekt (E62). Ein Teammitglied, das Agenten baut und Kundenprojekte liefert (E70). Eine Käuferin oder ein Käufer mit eigenem Haus, auch im Winter (E50, E79). Die Matrix vom 03.11.2026 rechnet mit denselben drei Rollen (Person A, B, C).', dom='b-personen')

anforderungen = [personen] + stufen + [neuer, szenarien]

# ---------- Versorgung je Ressource mit Ausbaupfad (M06) ----------
def res(nid, title, kids, text=None, ziel=None):
    return N('step', None, title, 'open', text=text, kids=kids, dom=nid, ziel=ziel or ['Z1'])

def lvl(label, title, text=None, state='open'):
    return X(label, title, text, state=state)

versorgung = [
    res('b-res-strom', 'Energie', [
        lvl('Grundbetrieb', 'Netz mit Batterie oder Generator, dazu Solar (E35).', 'Muss-Lasten etwa 380 W ohne Pumpe, über 10–12 Stunden 3,8–4,56 kWh vor Verlusten (S03, Annahme).', 'rule'),
        lvl('Störung', 'Netz 6 Stunden weg: Licht, Laptops, Starlink, Router, Pumpe und Kühlschrank laufen weiter.', 'Batterie im Warmen, Generator draußen mit Kraftstoff für 3 Tage (S03, Annahme). Die Batteriegröße ist nicht nachgewiesen.', 'untested'),
        lvl('Ausbau', 'Lasten für Team und Mieter in Phase 1.', 'Neu rechnen nach Lage und Bauart (O29). Keine E-Bikes in Phase 0 (D65).', 'wait'),
        lvl('Autarkie', 'Phase 0 Netz plus Generator, Phase 1 Solar plus Speicher.', 'Entschieden am 13.11. (D59).', 'rule'),
        lvl('fehlt', 'Netzkapazität und Anschlussrecht.', 'Netzanschluss beantragen (D59); Leitung zum Grundstück (A019 der Anschaffungsliste).', 'open')]),
    res('b-res-waerme', 'Wärme', [
        lvl('Grundbetrieb', 'Ofen mit Plan zum Überwintern (D60).', 'Heizlast je Objekt bei −20 °C rechnen (H02). Annahme: mindestens 12 °C im Schlafbereich und 16 °C im Arbeitsbereich nach 8 Stunden ohne Feuer; am Arbeitsplatz mindestens 20 °C (H03).', 'open'),
        lvl('Störung', 'Der Ofen ist über Nacht aus.', 'Winter-Arbeitstag 06:30; Rauch- und CO-Melder, Generator nur draußen (S01).', 'untested'),
        lvl('Ausbau', 'Je weiteres Haus eine eigene Heizlast.', 'Person A soll nachts nicht mehrere Öfen versorgen (Matrix, Folgen für den Plan).', 'wait'),
        lvl('Autarkie', 'Eigenes Holz und zugekauftes Holz (D60).', 'Bäume auf dem Grundstück müssen gefällt werden und sind nass; sie trocknen etwa ein Jahr. Für den ersten Winter trockenes Holz kaufen. Lagerung in jedem Fall.', 'rule')]),
    res('b-res-wasser', 'Wasser', [
        lvl('Grundbetrieb', 'Grundwasser aus dem Brunnen, aufbereitet zu Trinkwasser (D61); 50 l je Person und Tag.', 'Für 3 Personen 150 l am Tag (H05). Anfangsstufe bauen, Ausbau vorbereiten (D61).', 'rule'),
        lvl('Störung', 'Pumpe steht oder Auffahrt 10 Tage gesperrt.', 'Trinkwasser-Notvorrat 60 l für 3 Personen (H04); für 10 Tage Sperre 1.500 l (H05, Annahme).', 'untested'),
        lvl('Ausbau', '120 l je Person und Tag.', 'Für 3 Personen 360 l am Tag und 3.600 l für 10 Tage (H05, nach E26). Tank, Boiler und Leitung werden für den Ausbau vorbereitet, gebaut wird zuerst die Anfangsstufe (H05).', 'wait'),
        lvl('fehlt', 'Laboranalyse des Grundwassers, Schüttung im Winter.', 'Die Analyse bestimmt die Aufbereitung. Abwasser: lokale Kläranlage wie im Detailplan, ab Phase 0 (D62).', 'open')]),
    res('b-res-netz', 'Internet', [
        lvl('Grundbetrieb', 'Eigener Anschluss (D63).', 'Zwei Videocalls gleichzeitig: mindestens etwa 8 Mbit/s Upload in 95 % der Minuten (D01, Annahme).', 'rule'),
        lvl('Störung', 'Starlink als Reserve, auch bei Schnee; Mobilfunk gibt es oben nicht (D63).', 'Ist zusätzlich die Auffahrt frei: Ausweicharbeitsplatz unten (A03, M02-39).', 'untested'),
        lvl('Ausbau', 'Bandbreite für Team und Mieter in Phase 1.', 'Neu rechnen (O29).', 'wait'),
        lvl('fehlt', 'Anbieter oben und gemessene Bandbreite.', 'Bandbreite, Router und Anbieter vergleichen (D63).', 'open')]),
    res('b-res-essen', 'Essen', [
        lvl('Grundbetrieb', 'Kochen für drei Personen mit Kühlung, gemeinsam oder privat.', 'H07, E81; Küche im Kommunalgebäude (E74, 2.4.4); Kühlschrank im Mittel 40 W in der Lastliste (S03).', 'open'),
        lvl('Herkunft', 'Gemüsegarten, Höfe in der Umgebung, Lieferung über die Zufahrt.', 'Garten am Kommunalgebäude (E74); Milch und Käse vor Ort prüfen (E15, 2.4.6); Person A holt Lieferungen unten an der Auffahrt (Sommer-Arbeitstag).', 'open'),
        lvl('Störung', 'Auffahrt gesperrt: keine Lieferung.', 'Vorrat für 10 Tage nach BBK (H07, M02-08); Notfallplan 2.4.7.', 'untested'),
        lvl('Ausbau', 'Essen für Team und Mieter in Phase 1.', 'Essen gegen Mitarbeit (D36).', 'wait'),
        lvl('fehlt', 'Was der Garten wann liefert; Anbieter mit Preis, Entfernung und Winterzugang; Lieferweg im Winter.', '2.4.6, 2.2.4, 2.4.7.', 'open')]),
    res('b-res-digital', 'Daten und digitale Arbeit', [
        lvl('Grundbetrieb', 'Projektdaten gesichert, Zugang zu OneDrive und x-portal.eu geschützt.', 'S05; die KI arbeitet DSGVO-konform auf OneDrive (E12, 2.5.7).', 'open'),
        lvl('Störung', 'Eine Datei wiederherstellen; kein Serverausfall.', 'S05, E46.', 'untested'),
        lvl('Ausbau', 'Server oben für personenbezogene Daten mit Deutschland verbunden.', 'Nur bei VC-Funding (D47); ob das zulässig ist, prüfen die Anwälte (O05).', 'wait')]),
]
ausbau = N('group', 'g-ausbau', 'Ausbaupfad: von drei Personen bis zum nächsten Node', label='dt-spine', text='Jede Stufe beginnt erst, wenn die vorige ihren Test bestanden hat (M06).', kids=[
    N('step', 'b-aus-1', 'Drei Personen: das Team oben', 'wait', text='2–3 Leute wohnen und arbeiten ganzjährig oben (E01, E23); Grundbetrieb aller Ressourcen.', ziel=['Z1'], dom='b-aus-1'),
    N('chance', None, 'Test: Nutzungstest und erster Winter', 'untested', text='T00 bis T06 (2.4.9) und die Messung bei Frost (2.3.5).'),
    N('step', 'b-aus-2', 'Team und erste Mieter (Phase 1)', 'wait', text='Kommunalgebäude zuerst (D64), dann Wohn- und Arbeitsobjekte für Mieter und Team. Strom, Wasser und Wärme wachsen mit; die Infrastruktur aus Phase 0 ist dafür ausgelegt (D55).', ziel=['Z1', 'Z2'], dom='b-aus-2'),
    N('step', 'b-aus-3', 'Das Grundstück mit Mietern gefüllt (Phase 2)', 'wait', text='So viele Objekte, wie Detailplan, Geologie und Zusatzerkundung erlauben; Mieter nach Nachfrage (D50). Die Herrenhaus-Fläche wird zuletzt bebaut.', ziel=['Z2'], dom='b-aus-3'),
    N('end', None, 'Der nächste Node mit demselben Schema', None, text='Standardisierung von Anfang an; Node001 ist der Proof of Concept, sein Modell wird für den nächsten Node übernommen (D51). Geologie und Gelände sind an jedem Ort neu.', ziel=['Z4']),
    X('Rückfall', 'Nur eine Person oben.', 'Vorschlag aus der Matrix (S06, 03.11.2026), nicht entschieden: Gibt es bis 31.12.2026 kein bezahltes Projekt, gilt nur die Stufe „1 Person“.', state='open'),
])

# ---------- Make-or-Buy (M05) ----------
def V(letter, title, *facts, state=None):
    return O(letter, title, facts=list(facts), state=state)

KURS = 'Preise aus dem Internet, bei 50 UAH/EUR (E20), ohne Montage, Transport und Anschluss, sofern nicht anders genannt.'
makebuy = [
    N('decision', 'mb-zeitraum', 'Betrachtungszeitraum für alle Vergleiche', 'open', hint=KI,
      text='Vollkosten sind nur vergleichbar, wenn jede Variante über denselben Zeitraum gerechnet wird (M05). Festgelegt ist er nicht.',
      opts=[O('A', 'Bis zum Ende des ersten Winters'), O('B', 'Über die Nutzungsdauer der Objekte', 'Für Objekte in Phase 1, die vermietet werden.')]),
    N('decision', 'mb-haus', 'Objekt für Phase 0 (2.2.3)', 'open', ziel=['Z1', 'Z2'],
      text='Bauart offen (D56); eine Bau-KI plant nach den lokalen Gegebenheiten. Mindestbedingungen aus M02: H01, H02, H06, H08, S04, D02, D03. Gründung nach Geologie: leichte eingeschossige Objekte auf IGE-3 mit Streifen- und Stützfundament. Transport auf kleinem Fahrzeug (D57). Kostenregister: Modul 18 m² 674.900 UAH laut Anbieter inklusive Transport und Montage (Annahme, kein Angebot).',
      opts=[V('A', 'Bausatz in Teilen', ('Kosten', 'Angebot fehlt (O31)'), ('Transport', 'kleines Fahrzeug; Teilegewicht nennt kein Anbieter öffentlich'), ('Eigenleistung', 'Montage oben (2.4.8)')),
            V('B', 'Fertiges Wohnmodul', ('Kosten', 'Kostenregister: Modul 18 m² 674.900 UAH; früher gefunden: gedämmtes Modul 15 m² ab 444.000 UAH ohne Heizung'), ('Transport', 'ob es die Zufahrt hochkommt, ist offen (2.2.4)')),
            V('C', 'Massive Bauweise', ('Stand', 'für dauerhafte Gebäude auf IGE-4 mit Zusatzerkundung; eher Phase 1')),
            V('D', 'Erstes Objekt selbst bauen', ('Kosten', 'Schätzung der Projektleitung vom 03.11.: höchstens 10.000–15.000 € ohne Wasser und Strom'), ('Stand', 'Idee, nicht entschieden'))]),
    N('decision', 'mb-strom', 'Strom: Größen und Kosten (2.3.2)', 'done', ziel=['Z1'],
      text='Entschieden am 13.11. (D59): Phase 0 Netzanschluss beantragen und Generator als Reserve; Phase 1 Solar mit Speicher. Größen offen. Mindestbedingungen: S03, D04. Kippt bei: Netzkapazität, Energiepreis, Lasten im Ausbau (O29). Test: Störungstag.',
      opts=[V('A', 'Netzanschluss', ('Kosten', '2.927 UAH je kW, für 10–15 kW 29.270–43.905 UAH, ohne Leitung; Leitung 30 m laut Kostenregister 12.600–17.400 UAH'), ('Kippt bei', 'Netzkapazität und Anschlussrecht offen'), state='done'),
            V('B', 'Solar mit Speicher, ab Phase 1', ('Kosten', 'Kostenregister: 5 kW mit 5,12 kWh ab 155.000 UAH mit Montage; früher 4,8 kWp für 189.900 UAH'), ('Kippt bei', 'reicht im Winter nicht zum Heizen; die Batterie reicht nach S03 nicht sicher')),
            V('C', 'Generator als Reserve', ('Kosten', 'Kostenregister: 3,2 kW für 17.424 UAH; Eignung nach Lastliste'), ('Betrieb', 'Kraftstoff für 3 Tage, steht draußen (S03, Annahme)'), state='done')]),
    N('decision', 'mb-waerme', 'Wärme: Ofen je Objekt oder zentral (2.3.2)', 'done', ziel=['Z1'],
      text='Entschieden am 13.11. (D60): Mix; Ofen als eine Möglichkeit mit Plan zum Überwintern, eigenes und gekauftes Holz, Holzlager in jedem Fall. Mindestbedingungen: H02, H03, S01, H08. Annahme: grob 1,5–3 kW Heizlast je gut gedämmtem Modul bei −20 °C (H02). Test: Winter-Arbeitstag.',
      opts=[V('A', 'Holzofen mit Kochplatte je Objekt', ('Kosten', 'Kostenregister: Ofen 5.200 UAH, Kaminsatz 15.788 UAH nur Material, Montage 3.500–6.000 UAH'), ('Kippt bei', 'Öfen haben meist 6–10 kW; zu groß gedrosselt schwelen sie und bilden CO (H02)'), ('Eigenleistung', 'Holz machen und nachlegen, Person A'), state='done'),
            V('B', 'Zentrale Wärmequelle', ('Kosten', 'fehlt'), ('Grund', 'Person A soll nachts nicht mehrere Öfen versorgen')),
            V('C', 'Ofen plus zweite Wärmequelle', ('Stand', 'ob nötig, entscheidet der Morgenwert aus H02'), ('Kosten', 'Kostenregister: Heizlüfter 2 kW 530 UAH als Reserve'))]),
    N('decision', 'mb-wasser', 'Wasser: wie groß wird der Speicher (2.3.2)', 'open', ziel=['Z1'],
      text='Entschieden am 13.11. (D61): Grundwasser, aufbereitet zu Trinkwasser; Anfangsstufe bauen, Ausbau vorbereiten. Mindestbedingungen: H04, H05. Kippt bei: Laborwerten und Schüttung im Winter. Ausbaupfad: zuerst die Anfangsstufe, Tank, Boiler und Leitung für den Ausbau vorbereitet (H05).',
      opts=[V('A', 'Tank 1.000 l', ('Kosten', '7.000–13.000 UAH, rund 140–260 €, ohne Quellfassung, Leitung und Filter (A4)'), ('Reicht', 'knapp 7 Tage in der Anfangsstufe, knapp 3 Tage im Ausbau (H05)'), ('Kippt bei', '1.000 l wiegen 1 t; die Bodenlast prüft eine Fachperson')),
            V('B', 'Speicher für 10 Tage Sperre', ('Menge', '1.500 l in der Anfangsstufe, 3.600 l im Ausbau (H05, Annahme)'), ('Kosten', 'fehlt'))]),
    N('decision', 'mb-toilette', 'Toilette, Dusche, Warmwasser, Abwasser: ab Phase 0 fest eingebaut (D62)', 'done', ziel=['Z1'],
      text='Entschieden am 13.11. (D62): von vornherein mit der Infrastruktur geplant und eingebaut; Warmwasser, Spülung, bei der man Klopapier spülen kann. Mindestbedingung: H06. Der Detailplan sieht lokale Kläranlagen vor.',
      opts=[V('A', 'Kleinkläranlage ab Phase 0', ('Kosten', 'Kostenregister: Anlage BIO-5 38.000 UAH nur Gerät, Einbau 8.000–15.000 UAH, Abwasserplanung 5.000–10.000 UAH'), ('Kippt bei', 'Genehmigung, Grundwasseraustritte am Hang'), state='done'),
            V('B', 'Trenntoilette', ('Stand', 'erfüllt die Spülung nach D62 nicht'))]),
    N('decision', 'mb-netz', 'Internet: Anschluss und Reserve', 'done', ziel=['Z1', 'Z3'], text='Entschieden (D63): eigener Anschluss, Starlink als Reserve; Bandbreite, Router und Anbieter werden verglichen. Mindestbedingungen: D01, Z02, A01. Test: D01 über beide Anschlüsse, Starlink bei Schnee.',
      opts=[V('A', 'Eigener Anschluss', ('Kosten', 'fehlt; Anbieter oben und Bandbreite fehlen (A4)'), state='done'),
            V('B', 'Starlink als Reserve', ('Kosten', 'Kostenregister: Gerät 24.000 UAH, Tarif 1.363 UAH im Monat'), state='done')]),
    N('decision', 'mb-essen', 'Essen: selbst anbauen, vor Ort kaufen oder liefern lassen', 'open', ziel=['Z1'],
      text='Mindestbedingung: H07, Kochen für drei Personen, Kühlung, Vorrat für 10 Tage. Wer zahlt, fragt D36. Test: Störungstag.',
      opts=[V('A', 'Gemüsegarten am Kommunalgebäude', ('Quelle', 'E74'), ('Eigenleistung', 'freiwillig mitarbeiten (M02-23)'), ('fehlt', 'was der Garten wann liefert')),
            V('B', 'Vor Ort kaufen', ('Quelle', 'Milch, Käse und Holz prüfen (E15, 2.4.6)'), ('fehlt', 'Anbieter, Preis, Entfernung, Zugang im Winter')),
            V('C', 'Lieferung über die Zufahrt', ('Ablauf', 'Person A holt sie unten an der Auffahrt'), ('Kippt bei', 'Auffahrt im Winter gesperrt (2.4.7)')),
            V('D', 'Vorrat', ('Menge', '10 Tage nach BBK (H07, M02-08)'))]),
    N('decision', 'mb-eigen', 'Selbst, mit Hilfe oder extern: je Leistung (2.4.8)', 'open', ziel=['Z1', 'Z2'],
      text='Planung, Transport, Fundament, Aufstellen, Anschlüsse, Innenausbau. Je Leistung Fähigkeit, Gerät, Stunden, Fachkosten, Vertretung und wer verantwortet. Eigenleistung bekommt Zeit-, Qualitäts- und Kapazitätsansätze (M05). Paul und Roman sind nicht vom Bau; technische Werte legt eine Fachperson fest (E22). Es fehlen die Wochenstunden von Paul (O13) und Roman.',
      opts=[O('A', 'Selbst'), O('B', 'Mit Hilfe'), O('C', 'Extern')]),
]

# ---------- Zielblatt (M01) ----------
ZB = [
    # id, Ebene, Ziel, Messgröße, Zielwert oder Klärungsauftrag, (klärung?), Zeithorizont, Verantwortung, Review, Grenze, zahlt ein auf
    ('Z1', 'Node001', '2–3 Leute wohnen und arbeiten ganzjährig oben', 'Personen, die den ersten Winter oben gewohnt und gearbeitet haben', '2–3 Personen vom Team; ab Phase 1 Mieter (D45)', False,
     'Baubeginn 2027 ist Ziel, nur nach den Gates (D58); ganzjährig nach dem ersten Winter', 'Projektleitung oben; Geschäftsführung mit dem Architekten (Beratung) für den Bau · Review G2, G3, G4', 'Zeit: Bauen erst ohne Frost. Kapital: Eigenkapital bis zur Bauplanung, danach Investoren (D46, D47)', '1 und 3', 'D45, D55, D58; prüft H1, H2, H3'),
    ('Z2', 'Node001', 'Das Grundstück voll bekommen', 'Verkaufte oder vermietete Plots von der Zahl, die die Geologie erlaubt', 'Zahl der Plots nach O01, Paul mit Nazar. Schwelle zum Bestellen: 5 Käufer mit belegtem Geld, 100 auf der Warteliste (E78)', True,
     'Verkauf ab Januar 2027 (E52)', 'Roman (Verkauf), Paul (Grundstück)', 'G0, G1', 'Kapital: bestellt wird erst mit dem Geld der 5 Käufer (E78); weniger als 5 entscheidet O23', '1 und 2'),
    ('Z3', 'Node001', 'Erster bezahlter Umsatz', 'Bezahlte Rechnungen je Monat in €, getrennt von Interesse und Marge', 'Monatswert festlegen; enthält die laufenden Kosten oben und das Einkommen der Geschäftsführung (D52 offen)', True,
     'laufend, vor dem Investorengespräch (D71)', 'Projektleitung und Geschäftsführung · Review monatlich (3.3)', '–', '1', 'D51, D52; prüft H4, H6'),
    ('Z4', 'Node001', 'Genome: wiederverwendbares Systemwissen für den nächsten Node', 'Systemlogik und validierte Standards getrennt von den Werten dieses Grundstücks; ein geänderter Standortparameter macht betroffene Anforderungen, Varianten und Beschlüsse auffindbar (2.6.6)', 'Standardisierung von Anfang an; Node001 als Proof of Concept (D51)', False,
     'ab jetzt; belastbar erst mit Node002', 'Geschäftsführung · Review nach dem ersten Winter', '–', '2', 'D51; prüft H7, H8'),
    ('X1', 'X-PORTAL-System', 'Firma und Plattform: Pre-Seed für Plattform und Lieferteam', 'Klärungsauftrag', 'Bekannt: Node001 ist „der erste von zehn Nodes“ (E63); Pre-Seed nach dem Nachweis aus Z2 (E57, E78)', True,
     'nach Stufe 1 (E69)', 'Paul: Gesellschaft, Geld, Nodes (E62)', 'quartalsweise (3.3)', 'Kapital: Pre-Seed nur für die Firma, nicht für den Ort (E57); Kapital über die Chain erst mit Umsatz (E30)', '1 und 2'),
    ('X2', 'X-PORTAL-System', 'Paul in Vollzeit', 'Ab wann Paul Vollzeit dabei ist', 'O13. Bekannt: dann 8.000 € netto im Monat, unabdingbar (E67)', True,
     'festlegen', 'Paul', 'monatlich (3.3)', 'Geld: Pauls Lebensunterhalt zuerst (E05)', '1'),
    ('X3', 'X-PORTAL-System', 'DT Agentur: Umsatz aus Projekten über x-portal.eu', 'Bezahlter Umsatz, Interesse und Marge getrennt (M09)', 'Heute kein Umsatz, keine dauerhaften Nutzer (E08); der erste Auftrag zählt in Z3', True,
     'nach Stufe 1 (E69)', 'Roman und Paul', 'monatlich (3.3)', '–', '1'),
]

import base64 as _b64
DETAILPLAN = 'data:image/jpeg;base64,' + _b64.b64encode((Path(__file__).resolve().parent.parent / 'quellen' / 'detailplan-blatt-3.jpg').read_bytes()).decode()

def zielblatt_html():
    head = '<tr><th>Nr</th><th style="min-width:150px">Ziel</th><th>Messgröße</th><th>Zielwert oder Klärungsauftrag</th><th>Zeithorizont</th><th>Verantwortung</th><th>Review</th><th>Grenze</th><th>Globalziel</th></tr>'
    rows = ''
    last = None
    for zid, ebene, ziel, mess, wert, klaer, zeit, wer, review, grenze, auf in ZB:
        if ebene != last:
            rows += f'<tr class="dt-zgrp"><th colspan="9">{html.escape(ebene)}{' · eigene Ziele nach Stufe 1 (E69); jetzt zu klären, wer was macht' if ebene.startswith('Aufteilung') else ''}</th></tr>'
            last = ebene
        pill = '<span class="dt-bpill st-open">Klärungsauftrag</span> ' if klaer else ''
        rows += (f'<tr id="zb-{zid}"><td class="mono">{zid}</td><td><b>{linkify(ziel)}</b></td><td>{linkify(mess)}</td><td>{pill}{linkify(wert)}</td>'
                 f'<td>{linkify(zeit)}</td><td>{linkify(wer)}</td><td>{linkify(review)}</td><td>{linkify(grenze)}</td><td>{linkify(auf)}</td></tr>')
    zb = f'<div class="tablewrap"><table class="dt-ztab"><thead>{head}</thead><tbody>{rows}</tbody></table></div>'
    grenzen = [
        ('Zeit', 'Alle Termine sind Ziele, keine Zusagen; Baubeginn 2027 nur nach technischen, wirtschaftlichen und finanziellen Gates (Deck)', '–', 'Investment-Readiness-Gate'),
        ('Zeit', 'Verkauf ab Januar 2027 (E51): ASSUMPTION, Produkt- und Preismodell wird validiert', 'G0 nicht frei: Termine neu (O24)', 'Terminkette rückwärts (O24)'),
        ('Zeit', 'Aufstellen frühestens März 2027, nur ohne Frost (E21, E55)', 'Boden gefroren: warten (E55)', 'Lieferzeit der Hersteller (O31)'),
        ('Zeit', 'Winterfest vor dem ersten Frost 2027 (E38, G3)', 'nicht winterfest: kein Winter oben', 'Abbruchregel bei Krise (O17)'),
        ('Kapital', 'Der Ort braucht keinen Investor; Käufergeld kommt zuerst (E57)', 'weniger als 5 Käufer zum Bestelltermin: O23', 'Obergrenze in Euro aus dem Geldfluss (2.1.3)'),
        ('Kapital', 'Paul entscheidet Bestellung und Betrag (E71); bestellt wird nur mit Geld auf dem Konto (3.2)', '–', 'Vorbereitungsbudget (O12); 3.500 € sind nur ein Diskussionsvorschlag (3.2)'),
        ('Kapital', 'Verkauf der Häuser über die Blockchain, etwa 30.000 € je Käufer, bezugsfähig im Frühjahr 2027 (E52, E55, E78)', 'Recht oder Zahlung passen nicht: kein Verkauf im Januar (G0)', 'Prüfaufträge A5; ob der Lieferant über die Blockchain bezahlt werden kann (siehe Kapitalentscheidung)'),
        ('Kapital', 'Company: Pre-Seed oder Equity-ähnlich für Plattform, Lieferteam, KI-Lösungen und Architektur (Deck)', '–', 'Struktur, Meilensteine, Investor Ask: festzulegen (Planungspunkt Pre-Seed)'),
        ('Umsatz', 'Erster bezahlter Auftrag bis Januar 2027 (E77)', 'Vorschlag S06: sonst nur Stufe „1 Person“', 'entscheiden, ob die Regel gilt'),
    ]
    gr = ''.join(f'<tr><td class="mono">{a}</td><td>{linkify(b)}</td><td>{linkify(c)}</td><td>{linkify(d)}</td></tr>' for a, b, c, d in grenzen)
    gt = f'<div class="tablewrap"><table><thead><tr><th>Art</th><th>Gesetzt</th><th>Wenn sie reißt</th><th>Fehlt noch</th></tr></thead><tbody>{gr}</tbody></table></div>'
    nutzen = [
        ('Wirtschaftliche Tragfähigkeit und Resilienz', 'Der Ort trägt sich aus Käufergeld (E57); die Leute oben verdienen dort Geld; alles läuft immer (E46).', 'Z2, Z3; Resilienz über Störungstag und T06'),
        ('Internationale Skalierung', 'Ein Schema für den nächsten Node (E11); X-PORTAL als Dachfirma, die weitere Grundstücke bebaut und verwaltet.', 'Z4, X1, X3'),
        ('Gesellschaftlicher Nutzen', 'Sichere, menschenzentrierte Orte über geprüfte Anforderungen nach Maslow und Sinnen; Wirkung auf die Region nach dem ersten Winter an echten Erfahrungen beurteilt (Kapitel 1).', 'Z1, Anforderungen unten'),
    ]
    nu = ''.join(f'<tr><td><b>{a}</b></td><td>{linkify(b)}</td><td>{linkify(c)}</td></tr>' for a, b, c in nutzen)
    nt = f'<div class="tablewrap"><table><thead><tr><th>Globalziel, in dieser Rangfolge (E29)</th><th>Was Node001 dafür liefert</th><th>gemessen über</th></tr></thead><tbody>{nu}</tbody></table></div>'
    return (f'<p>Jeder Ast darunter zahlt auf eine Zeile ein; die Knoten nennen sie unter „Dient“. Spalten nach M01: Ziel, Messgröße, Zielwert oder Klärungsauftrag, Zeithorizont, Verantwortung, Review. Eigene Ziele für Paul, DT Agentur und Plattform kommen nach Stufe 1 (E69); bis dahin stehen sie hier als Klärungsauftrag.</p>{zb}'
            f'<h4 class="dt-h4" id="b-grenzen">Grenzen, die entscheiden</h4><p>Kapital- und Zeitgrenzen werden wirksam, wenn feststeht, was passiert, sobald sie reißen.</p>{gt}'
            f'<h4 class="dt-h4" id="b-nutzen">Erwarteter Nutzen: Node001 im X-PORTAL-System</h4>{nt}')

personen = N('step', 'b-personen', 'Für wen: das Team oben, ab Phase 1 Mieter', 'done', dom='b-personen',
    text='Die Projektleitung ist von Anfang an oben, führt Produkt und Projekt und koordiniert den Betrieb. Zwei weitere Teammitglieder bauen Technologielösungen und liefern Kundenprojekte. Ab Phase 1 kommen Mieter dazu (D45); sie sind frei in Arbeit und Tagesablauf, ihre Gemeinschaftsarbeit wird angerechnet (D36, D38).')

spielregeln = N('step', 'b-spielregeln', 'Spielregeln oben: ein einfaches Leben aus Arbeit und Erholung', 'open', dom='b-spielregeln', ziel=['Z1'],
    meta=VORGABE,
    text='Wer oben ist, soll sich nur auf Arbeit und Erholung konzentrieren müssen. Versorgung, Technik und Betrieb laufen im Hintergrund; deshalb sind Grundbedürfnisse und Sicherheit nach Maslow geklärt, bevor jemand oben arbeitet (E53).',
    facts=[('Arbeitszeit', 'Kernzeit 9 bis 14 Uhr als Gleitzeit. Wer Kunden in einer anderen Zeitzone hat, verlegt sie, zum Beispiel auf den Abend.'),
           ('Pflicht', 'Jour fixe am Morgen und gemeinsame Aktivitäten wie Sport.'),
           ('Angebot', 'Zusammen arbeiten steht offen, ist aber keine Voraussetzung.'),
           ('Frei', 'Wellness, Sauna und Entspannung teilt sich jede und jeder selbst ein.'),
           ('Geteilt', 'Betriebsarbeiten wie Holz hacken, Wasser und Schnee übernimmt das Team im Wechsel, nach einem Plan (2.4.5).'),
           ('Mieter', 'frei; sie können bei allem mitmachen. Gemeinschaftsarbeit wie Schneeschippen, Pflanzenpflege, Kapellenbau und Kehrwoche wird gefördert, mit wenig Aufwand erfasst und von der Pauschale abgezogen (D36, D38).'),
           ('Essen', 'gegen Mitarbeit (D36).')])

leben = N('group', 'g-m-leben', 'Einfaches Leben: Arbeit und Erholung (neu)', text='Aus den Spielregeln; diese Zeilen fehlen noch in M02 und brauchen dort Prüfverfahren und Abnahme.', kids=[
    N('req', None, 'Kernzeit 9–14 Uhr, verlegbar bei Zeitverschiebung', 'untested', meta=VORGABE, tags=['Service', 'Digital'], ber='Service, Digital', dom='b-r-L01',
      facts=[('Prüfverfahren', 'festlegen; zum Beispiel ein Kundencall am Abend über den Hauptanschluss (D01)'), ('Abnahme', 'Roman')]),
    N('req', None, 'Jour fixe und gemeinsamer Sport sind Pflicht', 'untested', meta=VORGABE + ' · Jour fixe ist M02-44', tags=['Service'], ber='Service', dom='b-r-L02'),
    N('req', None, 'Betriebsarbeit im Team geteilt, nach Plan', 'untested', meta=VORGABE + ' · Plan in 2.4.5, Absprache A02', tags=['Service'], ber='Service', dom='b-r-L03'),
    N('req', None, 'Wellness, Sauna und Entspannung frei einteilen', 'untested', meta=VORGABE + ' · Sauna M02-46, offen über D35', tags=['Raum', 'Service'], ber='Raum, Service', dom='b-r-L04'),
    N('req', None, 'Nichts im Hintergrund muss man selbst lösen: Essen, Strom, Wasser, Internet laufen', 'untested', meta='aus E46 und E54', tags=['Versorgung', 'Service'], ber='Versorgung, Service', dom='b-r-L05'),
])

anforderungen = [personen, spielregeln, leben] + stufen + [neuer, szenarien]

imPlan.append(N('group', 'g-aufteilung', 'Aufteilung: Holding, Agentur, Node-Gesellschaft', text='X-PORTAL ist die Unternehmensarchitektur und hält Lizenzen und Markenrechte. Die Agentur übernimmt Projekte aus Deutschland, Österreich und der Schweiz. Node001 wird von einer ukrainischen Gesellschaft gehalten (D44).', kids=[
    N('decision', 'aufteilung', 'Was gehört zur Holding, was zur Agentur, was zur Node-Gesellschaft: Arbeit, Verträge, Geld, Rechte (2.5.3)?', 'open', meta='Geschäftsführung und Projektleitung · nach O05', ziel=['X1', 'X2', 'X3']),
    N('decision', 'rechnung', 'Wer stellt welche Rechnung: Miete, Pauschale, Projekte, Technologielösungen?', 'open', meta='Geschäftsführung und Projektleitung · vor G0', text='Davon hängen Verträge (2.5.5), Steuern und der Geldfluss (2.1.3) ab.', ziel=['X1', 'X2', 'X3']),
    N('decision', 'grund', 'Grundstück: wem gehört es, wer baut, wer vermietet, wer stellt den Betrieb?', 'open', meta='Geschäftsführung mit den Anwälten · vor G0', text='Bekannt: Node001 hält eine ukrainische Gesellschaft (D44); Mitwirkende werden am jeweiligen Node beteiligt (D37).', ziel=['X3']),
]))
imPlan.append(N('group', 'g-kapital', 'Kapitalentscheidungen', kids=[
    N('decision', 'preseed', 'Zwei Investment Cases: X-PORTAL Company und Node001. Welche Struktur, welcher Kapitalbedarf, welcher Investor Ask?', 'open', meta='Geschäftsführung · vor dem Investorengespräch (D71)', ziel=['X1', 'X3'],
      text='Node001: Eigenkapital bis zur vollendeten Bauplanung, Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen (D46, D47). Company: Kundenprojekte, Technologielösungen, später Skalierung (D51). Kapitalbedarf und Investor Ask entstehen erst aus den Angeboten (O31) und den Selbstkosten (O03); bis dahin keine Beträge nach außen (D53).'),
]))
imPlan.insert(0, N('group', 'g-od', 'Offene Architekturentscheidungen der Reference Architecture v0.4 (OD-001 bis OD-008)', text='Aus Abschnitt 16 der Baseline, mit dem Gate, vor dem sie fallen müssen, und den Stellen im Plan, die dazu schon etwas sagen.', kids=[
    N('decision', None, 'OD-001 · Systemgrenze X-PORTAL Organisation ↔ Node-Betrieb', 'open', meta='DECISION REQUIRED · vor Node001 Governance Design', text='Im Plan: Aufteilung X-PORTAL, DT Agentur, Grundstücke (X1 bis X3, 2.5.3, 2.5.5).', dom='b-OD-001'),
    N('decision', None, 'OD-002 · Kritische Funktionen und Ziel-Autarkie-/Autonomiewerte für Node001', 'open', meta='OPEN · vor Basis of Design', text='Im Plan: Versorgung je Ressource mit Grundbetrieb, Störung, Ausbau (Ast 3); Werte sind Annahmen, keine geprüft (E22).', see=[('#b-ressourcen', 'Ast 3 Versorgung')], dom='b-OD-002'),
    N('decision', None, 'OD-003 · Human Roles v1.0 und priorisierte Needs', 'open', meta='IN WORK · vor Service Architecture Freeze', text='Im Plan: Team und Mieter (Ast 2, D45). Die Infografik nennt acht Rollen: Siedler, digitale Nomaden, Gäste, Remote-Siedler, Mitarbeitende, Betreiber, Partner, Investoren. Die Zuordnung fehlt (Abgleich W08).', see=[('#b-anforderungen', 'Ast 2 Alltag')], dom='b-OD-003'),
    N('decision', None, 'OD-004 · System Model / Datenmodell v0.1', 'open', meta='OPEN · vor Digital-Twin-Implementierung', text='Im Plan bisher „digitaler Zwilling der Organisation“ (2.6.6, M07); nach der Baseline ist das ein System Model, kein Digital Twin.', dom='b-OD-004'),
    N('decision', None, 'OD-005 · Node001 PoC-KPIs und Go/Revise/Stop-Grenzen', 'open', meta='OPEN · vor Investitionsfreigabe', text='Jede Hypothese H1 bis H8 braucht Messgröße, Datengrundlage, Zielwert, Prüfzeitpunkt und Go/Revise/Stop-Kriterium. Im Plan: Zielblatt Z1 bis Z4 und Gates G0 bis G4; Zielwerte fehlen großenteils.', see=[('#b-zielblatt', 'Zielblatt')], dom='b-OD-005'),
    N('decision', None, 'OD-006 · Genome Invariants v0.1', 'open', meta='IN WORK · vor Node001 Architecture Freeze', text='Im Plan: Z4 und 2.6.6; wiederholbar sind Schema, Planung, Nutzbarkeit und Sinn (E11).', dom='b-OD-006'),
    N('decision', None, 'OD-007 · Safety/Security/Privacy/Legal Baseline Node001', 'open', meta='OPEN · vor Technologie- und Betriebsfreigabe', text='Im Plan: Prüfaufträge an die Anwälte (A5), Abnahmen (E53), Zugang und Server (Technik im Haus), Datenverbindung Ukraine–Deutschland (E85).', see=[('#b-technik', 'Technik im Haus')], dom='b-OD-007'),
    N('decision', None, 'OD-008 · Parametrischer Business Case und Architektur-Sensitivitäten', 'open', meta='OPEN · parallel zur Node001 System Architecture', text='Im Plan: Make-or-Buy (Ast 4), Selbstkosten je Objekt (O03), Geldfluss (2.1.3). Grundlage ist das Kostenregister vom 13.11.2026 (Teilrechnung); die alte Papierrechnung ist kein Business Case (Abgleich W05).', see=[('#b-makebuy', 'Ast 4 Make-or-Buy')], dom='b-OD-008'),
]))
imPlan.append(N('decision', 'gleitzeit', 'Gleitzeit: wie wird die Kernzeit 9–14 Uhr verlegt, und wer ist für Betrieb und Notfall erreichbar?', 'open',
    meta='Planungspunkt neu (' + VORGABE + ') · Paul und Roman',
    text='Kunden in anderen Zeitzonen verschieben Arbeit auf den Abend. Offen ist, wie die Verlegung angemeldet wird und wer in dieser Zeit für Betrieb und Notfall da ist (2.4.5, 2.4.7).', ziel=['Z1', 'Z3']))

# ---------- Grundlage: Endprodukt und Ziele ----------
ZB = [
    ('Z1', 'Node001', '2–3 Leute wohnen und arbeiten ganzjährig oben', 'Personen, die den ersten Winter oben gewohnt und gearbeitet haben', '2–3 Personen vom Team; ab Phase 1 Mieter (D45)', False,
     'Baubeginn 2027 ist Ziel, nur nach den Gates (D58); ganzjährig nach dem ersten Winter', 'Projektleitung oben; Geschäftsführung mit dem Architekten (Beratung) für den Bau · Review G2, G3, G4', 'Zeit: Bauen erst ohne Frost. Kapital: Eigenkapital bis zur Bauplanung, danach Investoren (D46, D47)', '1 und 3', 'D45, D55, D58; prüft H1, H2, H3'),
    ('Z2', 'Node001', 'Das Grundstück mit Mietern füllen', 'Vermietete Einheiten von der Zahl, die Geologie und Planung erlauben; Mietinteressenten vor dem Bau', 'Zahl der Einheiten nach geprüfter Geologie und Bau-KI-Planung (D54, D56). Interessenten jetzt sammeln (D50). Kein Immobilienverkauf im klassischen Sinn (D45, D48)', True,
     'Interessenten ab sofort; Einzug ab Phase 1, Termine sind Ziele (D58)', 'Projektleitung (Interessenten), Geschäftsführung (Grundstück) · Review G0, G1', 'Kapital: Eigenkapital bis zur fertigen Bauplanung, danach Investoren für Infrastruktur und Objekte (D46, D47)', '1 und 2', 'D45, D46, D48, D50; prüft H4'),
    ('Z3', 'Node001', 'Erster bezahlter Umsatz', 'Bezahlte Rechnungen je Monat in €, getrennt von Interesse und Marge', 'Monatswert festlegen; enthält die laufenden Kosten oben und das Einkommen der Geschäftsführung (D52 offen)', True,
     'laufend, vor dem Investorengespräch (D71)', 'Projektleitung und Geschäftsführung · Review monatlich (3.3)', '–', '1', 'D51, D52; prüft H4, H6'),
    ('Z4', 'Node001', 'Genome: wiederverwendbares Systemwissen für den nächsten Node', 'Systemlogik und validierte Standards getrennt von den Werten dieses Grundstücks; ein geänderter Standortparameter macht betroffene Anforderungen, Varianten und Beschlüsse auffindbar (2.6.6)', 'Standardisierung von Anfang an; Node001 als Proof of Concept (D51)', False,
     'ab jetzt; belastbar erst mit Node002', 'Geschäftsführung · Review nach dem ersten Winter', '–', '2', 'D51; prüft H7, H8'),
    ('X1', 'Aufteilung: Holding, Agentur, Node-Gesellschaft', 'X-PORTAL als Holding: Unternehmensarchitektur, Lizenzen, Markenrechte', 'festlegen, je Aufgabe', 'Rechtsprüfung der Struktur (D44); wo Services auf den Nodes abgewickelt werden, voraussichtlich in einer lokalen Gesellschaft als Teil der Holding (OD-001)', True,
     'vor dem Investorengespräch (D71)', 'Geschäftsführung und Projektleitung', 'Rechtsprüfung ist Teil des Pakets „Vor dem Investment“', '1 und 2', 'D44 mit Kommentar, 13.11.2026'),
    ('X2', 'Aufteilung: Holding, Agentur, Node-Gesellschaft', 'Agentur: übernimmt Projekte aus Deutschland, Österreich und der Schweiz', 'Bezahlter Umsatz, Interesse und Marge getrennt (M09)', 'Welche Projekte, Verträge und welches Geld bei der Agentur liegen und was an die Holding geht. Heute kein Umsatz (früher E08)', True,
     'erster bezahlter Auftrag vor dem Investorengespräch', 'Projektleitung und Geschäftsführung', '–', '1', 'D44, D51'),
    ('X3', 'Aufteilung: Holding, Agentur, Node-Gesellschaft', 'Node001: gehalten von einer ukrainischen Gesellschaft; Mitwirkende können am Node beteiligt werden', 'festlegen', 'Rechtsform, Verhältnis zur Holding und Beteiligung am jeweiligen Node statt an der Holding (D37, D44); Tokenisierung erst nach Klärung (D48)', True,
     'vor Phase 0', 'Geschäftsführung; Anwälte', 'Kapital: Eigenkapital plus Investoren (D46)', '1 und 2', 'D37, D44, D48'),
]

GRUNDLAGE = """<h4 class="dt-h4">Mission und Globalziele: der Ausgangspunkt (D42)</h4>
<p><b>Mission:</b> „Wir schaffen und vernetzen menschenzentrierte Innovationshubs, in denen Menschen leben, arbeiten und gemeinsam neue Lösungen entwickeln. Dafür verbinden wir moderne Technologien, geeignete Arbeits- und Lebensbedingungen und einen verantwortungsvollen Umgang mit Ressourcen.“</p>
<p><b>Globalziele, in dieser Rangfolge:</b> 1. wirtschaftliche Tragfähigkeit und Resilienz; 2. internationale Skalierung; 3. gesellschaftlicher Nutzen.</p>
<p><b>Vision (Reference Architecture v0.4):</b> „X-PORTAL entwickelt menschenzentrierte, weitgehend versorgungsautarke, operativ autonome, resiliente und wirtschaftlich tragfähige Lebens-, Arbeits- und Aufenthaltsumgebungen, in denen Mensch, physische Welt, Services, Organisation und Technologie als integriertes, lernendes Gesamtsystem zusammenwirken.“</p>
<p><b>Kerndefinition:</b> X-PORTAL definiert keinen Baukasten fertiger Lösungen, sondern einen kontrollierten Mechanismus, mit dem standortspezifische Lösungen entwickelt, betrieben, gemessen, verbessert und, soweit Evidenz es rechtfertigt, reproduziert werden. Node001 Beregniza ist die erste reale Umgebung dafür.</p>
<p><b>Entscheidungsgrundsatz:</b> Systementscheidungen werden an ihrer Wirkung auf Menschen bewertet (XP-SYS-001) und an CAPEX, OPEX und Lebenszyklus (XP-SYS-004). Menschenwürde, Sicherheit und gesetzliche Anforderungen sind verbindliche Grenzen.</p>
<p class="note">Mission und Globalziele sind der Ausgangspunkt (D42). Wie Mission, Globalziele, Vision v0.4 und Zielblatt eine durchgehende Logik werden, ist noch zu harmonisieren (Abgleich W21).</p>
<h4 class="dt-h4">Endprodukt Stufe 1</h4>
<p class="dt-endp">2–3 Leute vom Team wohnen und arbeiten ganzjährig oben und verdienen dort Geld; ab Phase 1 kommen Mieter dazu (D45). Vermietet wird, verkauft wird im klassischen Sinn nichts (D48). Der Betrieb trägt sich selbst, X-PORTAL stellt die Basis.</p>
<h4 class="dt-h4">Grundmodell eines Node</h4>
<ul class="dt-gm">
<li><b>Transport und Bauart:</b> In Phase 0 kommt alles auf kleinem Fahrzeug hoch, ohne Befestigung der Zufahrt am Anfang (D57). Die Bauart der Objekte ist offen (Holz, Beton, Glas, Metall); eine Bau-KI plant nach den lokalen Gegebenheiten (D56).</li>
<li><b>Kommunal und gemeinschaftlich:</b> Das Kommunalgebäude ist der erste Bau in Phase 1, mit Arbeitsplätzen, Küche und Sanitär (D64). Gemeinschaftsarbeit wird gefördert, erfasst und angerechnet (D36, D38).</li>
<li><b>Privatsphäre:</b> Jede Person hat ihre eigene Einheit. Phase 0: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur (D55). Ab Phase 1 wohnen und arbeiten Mieter und Team in eigenen Objekten.</li>
<li><b>Weitgehend versorgungsautark:</b> Netzanschluss mit Generator als Reserve, Solar mit Speicher ab Phase 1 (D59); Ofen mit eigenem und gekauftem Holz (D60); Grundwasser mit Aufbereitung zu Trinkwasser (D61); Spültoilette, Dusche, Warmwasser und Abwasser ab Phase 0 (D62). Zielwerte je kritischer Funktion sind OPEN (OD-002).</li>
<li><b>Mobilität:</b> ein gemeinsames Fahrzeug; keine E-Bikes in Phase 0 (D65).</li>
</ul>
<h4 class="dt-h4" id="b-ort">Der Ort: Detailplan Blatt 3 und Geologie</h4>
<p>Detailplan des Gebiets (Stadium ДПТ, Blatt 3 von 8, M 1:500): 2,0 ha, bebaute Fläche 4.701,2 m², 24 nummerierte Parzellen mit Flächen, Höhenlinien, Straßen mit 6 m Fahrbahn und Gehwegen, Bohrbrunnen und lokale Kläranlage.</p>
<figure class="dt-plan"><div class="dt-planbox"><img alt="Detailplan Blatt 3: Grundstück mit 24 Parzellen, Straßen, Höhenlinien und Legende" src="DETAILPLAN_SRC"></div><figcaption>Detailplan Blatt 3 (Architekt, Januar 2025). Zum Vergrößern: Bild antippen.</figcaption></figure>
<details class="dt-legende"><summary>Legende des Plans auf Deutsch (17 Objektarten)</summary><ol>
<li>Wachposten</li><li>Autowäsche</li><li>Müllsammelplatz</li><li>Gästeparkplatz</li><li>Verwaltungs- und Erholungskomplex mit Tiefgarage (Räume mit Doppelnutzung) und Technikräumen für die Siedlung</li>
<li>Handelspavillon</li><li>Laden mit Café</li><li>Restaurant- und Hotelkomplex</li><li>Handelspavillon</li><li>Kapelle</li><li>Kinderspielplatz</li><li>Handels- und Unterhaltungskomplex</li>
<li>Aussichtsterrasse, Platz für Sport</li><li>Einfamilienhaus</li><li>Erholungsplatz für Erwachsene</li><li>Lokale Kläranlage</li><li>Wohnhaus mit Büroräumen</li></ol>
<p>Funktionale Nutzung nach ukrainischem Klassifikator: 02.01 Wohnhaus mit Nebengebäuden; 03.04 Gemeinschafts- und religiöse Gebäude; 03.07 Handel; 03.08 Tourismus und Gastronomie; 10.08 Erholung, Sport und Tourismus.</p></details>
<p><b>Geologie:</b> Der technische Bericht des Ingenieurgeologen liegt vor (Vertrag 34.11/26). Hang mit Rutsch- und Fließprozessen, Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Empfohlen: Streifen- und Stützfundament, Stützkonstruktion hangseitig, Entwässerungsgraben; Zusatzerkundung für Zufahrt, Stützkonstruktionen und Hauptgebäude. Einzelheiten im Ast 1. Die deutsche Zusammenfassung ist KI-erstellt und wird mit dem Original abgeglichen.</p>
<p class="note">Offen: welche Parzelle die Herrenhaus-Fläche ist und wo darunter das Objekt Phase 0 steht (Ast 1, Lage). Wie weit das Bauprogramm des Plans (Hotel, Handel, Tiefgarage) zum Mietmodell und zu den Phasen passt, ist nicht entschieden.</p>"""

import base64 as _b64
DETAILPLAN = 'data:image/jpeg;base64,' + _b64.b64encode((Path(__file__).resolve().parent.parent / 'quellen' / 'detailplan-blatt-3.jpg').read_bytes()).decode()

def zielblatt_html():
    head = '<tr><th>Nr</th><th style="min-width:150px">Ziel</th><th>Messgröße</th><th>Zielwert oder Klärungsauftrag</th><th>Termin</th><th>Wer · Review</th><th>Grenze</th><th>Globalziel</th><th>Quelle</th></tr>'
    rows, last = '', None
    for zid, ebene, ziel, mess, wert, klaer, zeit, wer, grenze, auf, quelle in ZB:
        if ebene != last:
            rows += f'<tr class="dt-zgrp"><th colspan="9">{html.escape(ebene)}{' · jetzt zu klären, wer was macht' if ebene.startswith('Aufteilung') else ''}</th></tr>'
            last = ebene
        pill = '<span class="dt-bpill st-open">Klärungsauftrag</span> ' if klaer else ''
        rows += (f'<tr id="zb-{zid}"><td class="mono">{zid}</td><td><b>{linkify(ziel)}</b></td><td>{linkify(mess)}</td><td>{pill}{linkify(wert)}</td>'
                 f'<td>{linkify(zeit)}</td><td>{linkify(wer)}</td><td>{linkify(grenze)}</td><td>{linkify(auf)}</td><td>{linkify(quelle)}</td></tr>')
    zb = f'<div class="tablewrap"><table class="dt-ztab"><thead>{head}</thead><tbody>{rows}</tbody></table></div>'
    grenzen = [
        ('Zeit', 'Alle Termine sind Ziele, keine Zusagen; Baubeginn 2027 nur nach technischen, wirtschaftlichen und finanziellen Gates (D58)', '–', 'Investment-Readiness-Gate'),
        ('Zeit', 'Bauen erst, wenn der Boden frostfrei ist', 'Boden gefroren: warten', 'Lieferzeit der Anbieter (O31)'),
        ('Zeit', 'Winterfest vor dem ersten Frost nach dem Einzug (G3)', 'nicht winterfest: kein Winter oben', 'Abbruchregel bei Krise (O17)'),
        ('Kapital', 'Eigenkapital bis zur vollendeten Bauplanung; Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen (D46, D47)', 'Eigenmittel reichen nicht: Paket kürzen oder Rest beschaffen (D69)', 'Kostenband aus Angeboten, Kapitalbedarf (OD-008)'),
        ('Kapital', 'Die Geschäftsführung entscheidet Bestellung und Betrag; bestellt wird nur mit Geld auf dem Konto', '–', 'Paket vor dem Investment (O12, D69)'),
        ('Kapital', 'Miete und Pauschale aus Selbstkosten; kein Immobilienverkauf im klassischen Sinn (D48, D49)', 'Selbstkosten höher als die Miete, die Mieter zahlen: Modell neu rechnen', 'Selbstkosten je Objekt (O03)'),
        ('Umsatz', 'Bezahlte Kundenprojekte laufend, vor dem Investorengespräch (D51)', '–', 'Monatswert in Z3'),
    ]
    gr = ''.join(f'<tr><td class="mono">{a}</td><td>{linkify(b)}</td><td>{linkify(c)}</td><td>{linkify(d)}</td></tr>' for a, b, c, d in grenzen)
    gt = f'<div class="tablewrap"><table><thead><tr><th>Art</th><th>Gesetzt</th><th>Wenn sie reißt</th><th>Fehlt noch</th></tr></thead><tbody>{gr}</tbody></table></div>'
    nutzen = [
        ('Wirtschaftliche Tragfähigkeit und Resilienz', 'Miete und Services aus Selbstkosten; die Leute oben verdienen dort Geld; alles läuft immer, jede kritische Funktion hat eine Reserve.', 'Z2, Z3; Resilienz über Störungstag und T06'),
        ('Internationale Skalierung', 'Standardisierung von Anfang an; Node001 ist der Proof of Concept, sein Modell wird für weitere Nodes übernommen (D51). X-PORTAL als Holding.', 'Z4, X1, X3'),
        ('Gesellschaftlicher Nutzen', 'Sichere, menschenzentrierte Orte über geprüfte Anforderungen nach Maslow und Sinnen; Gemeinschaftsarbeit und Bergkapelle als Gruppenprojekt (D34, D36).', 'Z1, Ast 2'),
    ]
    nu = ''.join(f'<tr><td><b>{a}</b></td><td>{linkify(b)}</td><td>{linkify(c)}</td></tr>' for a, b, c in nutzen)
    nt = f'<div class="tablewrap"><table><thead><tr><th>Globalziel, in dieser Rangfolge (Ausgangspunkt nach D42)</th><th>Was Node001 dafür liefert</th><th>gemessen über</th></tr></thead><tbody>{nu}</tbody></table></div>'
    return (linkify_html(GRUNDLAGE).replace('DETAILPLAN_SRC', DETAILPLAN)
            + f'<h4 class="dt-h4" id="b-zielblatt-tab">Ziele (Zielblatt nach M01)</h4><p>Ziel, Messgröße, Zielwert oder Klärungsauftrag, Zeithorizont, Verantwortung und Review. Jeder Ast darunter nennt unter „Dient“, auf welche Zeile er einzahlt.</p>{zb}'
            + '<p class="note">Diese Ziele gelten für Node001. Eigene Ziele für Holding, Agentur und Plattform kommen danach dazu (X1 bis X3 sind bis dahin Klärungsaufträge).</p>'
            + f'<h4 class="dt-h4" id="b-grenzen">Grenzen von Stufe 1, die entscheiden</h4><p>Termine sind Ziele (D58). Beim Geld gilt: Eigenkapital bis zur Bauplanung, danach Investoren (D46, D47). Wirksam wird eine Grenze, wenn feststeht, was passiert, sobald sie reißt.</p>{gt}'
            + f'<h4 class="dt-h4" id="b-nutzen">Erwarteter Nutzen: Node001 im X-PORTAL-System</h4>{nt}'
            + '<h4 class="dt-h4" id="b-beschluss">Beschlussvorlagen (M03)</h4><p>Die Gates G0 bis G4 bleiben. Jede offene Entscheidung im Baum hat ein aufklappbares Beschlussblatt mit Vorbereitung, fachlicher Prüfung, Freigabebefugnis, Budgetgrenze, Gültigkeit und Wiedervorlage. Werte ohne Quelle darin sind Vorschlag KI.</p>')

def linkify_html(fragment):
    # linkify nur auf Textteilen, Tags bleiben stehen
    parts = re.split(r'(<[^>]+>)', fragment)
    return ''.join(x if x.startswith('<') else linkify(html.unescape(x)) for x in parts)

# ---------- Beschlussblatt (M03) ----------
TECH = re.compile(r'Haus|Wasser|Wärme|Strom|Toilette|Bauweise|Fundament|Technik|Zufahrt|Platz|E-Bikes|Heizung|Plots|Lösung|Speicher|Internet|Essen|liefert und baut', re.I)
LEGAL = {'O22', 'O11', 'D39', 'D40'}
GATE_BB = {
    'G0': ('KI stellt die Nachweise zusammen', 'je Teilergebnis der genannte Fachexperte', 'Geschäftsführung und Projektleitung', 'Paket vor dem Investment (O12, D69)', 'bis zum Investorengespräch (D71)', 'nicht frei: nacharbeiten und neu vorlegen'),
    'G1': ('KI rechnet den Geldfluss (2.1.3)', 'Anwälte zu Struktur und Verträgen (O05)', 'Gate: Geschäftsführung und Projektleitung; Bestellung und Betrag: Geschäftsführung', 'nur Geld auf dem Konto; Eigenkapital bis zur Bauplanung, danach Investoren (D46, D47)', 'für die Bestellung des Objekts Phase 0', 'neue Information zu Objekt, Kapital oder Budget: G1 und G2 neu'),
    'G2': ('KI stellt Abnahmen und Prüfsituationen zusammen', 'Fachexperte, schriftlich', 'Projektleitung prüft die Abnahmetabelle und gibt frei (D66)', 'im Beschluss genannt', 'für den Abschnitt, im Beschluss genannt', 'Wetter oder Straße: Einsatzplan neu, G2 neu'),
    'G3': ('KI stellt die Winterliste zusammen', 'Fachexperte Heizung und Schornstein', 'Geschäftsführung und Projektleitung', 'festlegen', 'erster Winter', 'vor dem ersten Frost'),
    'G4': ('KI misst Z1 bis Z3', '–', 'Geschäftsführung und Projektleitung', '–', 'Phase 0', 'Entscheidung über Phase 1'),
}

def beschluss(n):
    nid = n.get('id') or ''
    if n['kind'] == 'gate':
        v = GATE_BB.get(nid)
        if not v:
            return ''
    else:
        title = n['title']
        meta = n.get('meta') or ''
        tech = nid.startswith('mb-') or bool(TECH.search(title))
        geld = nid in {'D36', 'D37', 'D38', 'D39', 'D40', 'D41', 'O23', 'preis', 'O12', 'O13'} or 'Geld' in title
        pruef = 'Anwälte (O05)' if nid in LEGAL or 'Beteiligung' in title or 'Rechtsform' in title else 'Fachexperte; Architekt berät (D67)' if tech else 'KI rechnet, Geschäftsführung prüft (2.1.3)' if geld else '–'
        frei = 'Geschäftsführung und Projektleitung; Bestellung und Betrag: Geschäftsführung (D43)' if tech or geld else 'Geschäftsführung und Projektleitung gemeinsam'
        budget = 'festlegen; Obergrenze aus 2.1.3' if tech or geld else '–'
        m = re.search(r'(nach [^·]+|vor [^·]+|bis [^·]+)$', meta.strip())
        wv = m.group(1).strip() if m else 'Montagsrunde (3.3)'
        if wv.startswith('bis') and 'Vorschlag' not in wv:
            wv = 'spätestens ' + wv[4:]
        v = ('KI bereitet vor, gilt erst mit Wahl (D43)', pruef, frei, budget, 'bis ihr sie ändert', wv)
    keys = ('Vorbereitung', 'Fachliche Prüfung', 'Freigabe', 'Budgetgrenze', 'Gültigkeit', 'Wiedervorlage')
    return '<details class="dt-bb"><summary>Beschlussblatt (M03)</summary>' + facts_html(list(zip(keys, v))) + '</details>'

tree = [
    N('group', 'b-zielblatt', 'Grundlage: Mission, Ziele, Ort', raw='ZIELBLATT', label='root'),
    N('group', 'b-hauptweg', '1 · Der Weg: Geologie und Lage, Bauart, Zufahrt, Lieferant, Technik, dann Selbstkosten, Mieter, Kapital und Gates bis zum ersten Winter', kids=hauptweg, label='dt-spine',
      text='Geologiebericht und Detailplan liegen vor. Zuerst wird das Objekt Phase 0 im Detailplan verortet; dann Bauart, Zufahrt, wer liefert und baut, und die Technik. Danach Selbstkosten, Mieter, Kapital und die Gates bis zum ersten Winter.'),
    N('group', 'b-anforderungen', '2 · Alltag oben: prüfbare Anforderungen nach Maslow und Sinnen (M02)', kids=anforderungen, label='m02',
      text='Das Maslow- und Sinneskonzept als Anforderungen an Raum, Service, Versorgung und Digitales, jede mit Prüfverfahren und Abnahme. Stand: die 29 Zeilen vom 03.11.2026 und die Spielregeln vom 05.11.2026; angepasst sind nur die Zeilen, die eine Entscheidung vom 13.11. betrifft.'),
    N('group', 'b-ressourcen', '3 · Versorgung je Ressource: Grundbetrieb, Störung, Ausbau (M06)', kids=versorgung + [ausbau],
      text='Je Ressource drei Zustände: normaler Betrieb, Störung und Ausbau auf Team und Mieter in Phase 1. Entschieden ist die Lösung je Ressource (D59 bis D63); offen sind Größen und Werte.'),
    N('group', 'b-makebuy', '4 · Make-or-Buy: Varianten mit Kosten, Sensitivität und Test (M05)', kids=makebuy,
      text='Verglichen wird die betriebsfähige Lösung für das Team mit Ausbaupfad. Die am 13.11. gewählten Varianten sind markiert; Preise aus dem Kostenregister vom 13.11.2026 sind Annahmen aus Internet-Richtwerten, keine Angebote. Einzelposten stehen in der Anschaffungsliste (A001 bis A120).'),
    N('group', 'b-parallel', '5 · Parallel, ohne auf Lage und Bauart zu warten', kids=parallel),
    N('group', 'b-seite', '6 · Entscheidungsseite: 32 Karten am 13.11. beantwortet, offen D52, D56 und D69 bis D72', kids=seite, page=True,
      text='Je Karte die Antwort und der Kommentar im Wortlaut; die gewählte Möglichkeit ist markiert. Wo der Kommentar die Wahl ändert, gilt der Kommentar.'),
    N('group', 'b-plan', '7 · Offen im Plan, noch ohne Karte auf der Entscheidungsseite', kids=imPlan,
      text='Die offenen Architekturentscheidungen der Baseline, die Aufteilung von Holding, Agentur und Node-Gesellschaft, Kapital, Rollen und Betrieb oben.'),
    N('group', 'b-entschieden', '8 · Entschieden am 13.11.2026, darunter das alte Log als Historie', kids=[
        N('group', 'g-13', 'Was seit 13.11.2026 gilt', kids=[N('decision', None, f'{i} · {THEMA[i]}', 'done', text=FOLGT[i]) for i in sorted(FOLGT) if i in ANT and i not in OFFEN_KARTEN and (ANT[i].get('wahl') or '') != 'unklar']),
        N('group', 'g-hist', 'Historie: Entscheidungslog E01–E85, am 13.11.2026 zurückgenommen', kids=entschieden, opened=False,
          text='Nur noch zur Nachvollziehbarkeit. Es gilt, was darüber steht.'),
    ]),
]

ZIEL = {'lage': ['Z1', 'Z2'], 'mieter': ['Z2'], 'O01': ['Z1', 'Z2'], 'O03': ['Z2'], 'G0': ['Z2'], 'verkauf': ['Z2'], 'O23': ['Z2'], 'G1': ['Z2'], 'frost': ['Z1'], 'G2': ['Z1'],
        'G3': ['Z1'], 'G4': ['Z1', 'Z3'], 'O05': ['Z2'], 'O12': ['Z2'], 'texte': ['Z2'], 'O31': ['Z1', 'Z2'], 'O04': ['Z3', 'X2'], 'preis': ['Z3'],
        'O11': ['X1'], 'D34': ['Z1'], 'D35': ['Z1'], 'D36': ['Z1'], 'D37': ['Z1', 'Z3'], 'D38': ['Z2'], 'D39': ['X1'], 'D40': ['Z2'], 'D41': ['Z2'],
        'O13': [], 'O17': ['Z1'], 'O25': ['Z1'], 'versorgung': ['Z1'], 'O16': [], 'O18': []}

def set_ziel(nodes):
    for n in nodes:
        if n.get('id') in ZIEL and not n.get('ziel'):
            n['ziel'] = ZIEL[n['id']]
        set_ziel(n.get('kids', []))
set_ziel(tree)

ROLLEN = [(r'Der Jurist \(Max H\.\)', 'Ein Jurist'), (r'\bPaul mit Nazar\b', 'die Geschäftsführung mit dem Architekten (Beratung)'),
          (r'\bPaul und Roman\b', 'Geschäftsführung und Projektleitung'), (r'\bRoman und Paul\b', 'Projektleitung und Geschäftsführung'),
          (r'\bRoman, Paul\b', 'Projektleitung, Geschäftsführung'), (r'\bPaul, Roman\b', 'Geschäftsführung, Projektleitung'),
          (r'\bPauls Maslow- und Sinneskonzept\b', 'das Maslow- und Sinneskonzept'), (r'\bPauls\b', 'der Geschäftsführung'), (r'\bPaul\b', 'Geschäftsführung'),
          (r'\bRomans\b', 'der Projektleitung'), (r'\bRoman\b', 'Projektleitung'), (r'\bNazars\b', 'des Architekten'), (r'\bNazar\b', 'Architekt (Beratung)'),
          (r'\beine Fachperson\b', 'ein Fachexperte'), (r'\beiner Fachperson\b', 'einem Fachexperten'), (r'\bdie Fachperson\b', 'der Fachexperte'),
          (r'\bder Fachperson\b', 'dem Fachexperten'), (r'\bFachperson\b', 'Fachexperte'), (r'\bTiny Houses?\b', 'Objekt'), (r'Freelancer oder Käufer', 'Freelancer oder Mieter'), (r'\bje Haus\b', 'je Objekt')]
def rolle(t):
    if not isinstance(t, str):
        return t
    for a, b in ROLLEN:
        t = re.sub(a, b, t)
    return t
def rollen_baum(nodes):
    for n in nodes:
        if n.get('id') == 'g-hist':
            continue
        for k in ('title', 'meta', 'text', 'hint'):
            n[k] = rolle(n.get(k))
        n['facts'] = [(a, b if a.startswith('Kommentar') else rolle(b)) for a, b in n.get('facts', [])]
        for o in n.get('opts', []):
            o['title'] = rolle(o['title']); o['text'] = rolle(o.get('text'))
            o['facts'] = [(a, rolle(b)) for a, b in o.get('facts', [])]
        rollen_baum(n.get('kids', []))
rollen_baum(tree)

ALT = ['Käufer', 'Plot', 'Verkauf ab Januar', 'Verkaufsstart', 'Container', 'Variante 2', 'wartet auf Nazar', 'Pre-Seed', '5 Käufer', 'Token mit Pacht']
def pruefe_baum(nodes, pfad=''):
    fehler = []
    for n in nodes:
        if n.get('id') == 'g-hist':
            continue
        texte = [n.get('title'), n.get('meta'), n.get('text'), n.get('hint')] + [b for a, b in n.get('facts', []) if not a.startswith('Kommentar') and not a.startswith('Antwort')]
        texte += [x for o in n.get('opts', []) for x in [o['title'], o.get('text')] + [b for a, b in o.get('facts', [])] if not n.get('page')]
        for t in texte:
            for w in ALT:
                if t and w in t:
                    fehler.append(f'{n.get("id") or n.get("title")[:50]}: „{w}“ in „{t[:90]}“')
        if n.get('kind') == 'chance' and n.get('id') == 'O01' and n.get('state') == 'wait':
            fehler.append('O01: Geologie steht noch auf „wartet“')
        fehler += pruefe_baum(n.get('kids', []))
    return fehler

# ---------- Ausgabe ----------

ANCHOR = {'2.1': 'k2-1-gesch-ftsmodell-und-geld', '2.2': 'k2-2-standort-und-bau', '2.3': 'k2-3-versorgung',
          '2.4': 'k2-4-menschen', '2.5': 'k2-5-firma-und-recht', '2.6': 'k2-6-umsatz'}
APPX = {'A1': 'ka1-methoden-m01-m11', 'A2': 'ka2-bekannte-werte-geld', 'A3': 'ka3-standort-pfad-geologie-transport-frag',
        'A4': 'ka4-bekannte-werte-versorgung', 'A5': 'ka5-pr-fauftr-ge-f-r-die-anw-lte', 'A6': 'ka6-freigabe-zum-aufstellen-m04'}
TREE_IDS = set()
DOMS = set()

def collect(nodes):
    for n in nodes:
        if n.get('id'):
            TREE_IDS.add(n['id'])
        if n.get('dom'):
            DOMS.add(n['dom'])
        collect(n.get('kids', []))
collect(tree)

TOKEN = re.compile(r'(?<![\w.,])(M02-\d\d|E\d\d|D\d\d|O\d\d|G[0-4]|2\.[1-6](?:\.\d{1,2})?|[HSZAV]0\d|A[1-6]|Z[1-4]|X[1-3])(?![\w])(?!\.\d)')

def href(tok):
    if tok.startswith('M02-'):
        return f'#b-{tok}' if f'b-{tok}' in DOMS else None
    if re.fullmatch(r'[HSZAV]0\d|D0[1-5]', tok):
        return f'#b-r-{tok}' if f'b-r-{tok}' in DOMS else None
    if re.fullmatch(r'[ZX]\d', tok):
        return f'#zb-{tok}'
    if tok.startswith('E'):
        return f'#{tok}' if tok in E_IDS else None
    if tok.startswith('D'):
        return f'#b-{tok}' if tok in TREE_IDS else None
    if tok.startswith('O'):
        return f'#b-{tok}' if tok in TREE_IDS else '#k4-offen'
    if tok.startswith('G'):
        return f'#b-{tok}'
    if tok.startswith('A'):
        return f'#{APPX[tok]}'
    return f'#{ANCHOR[tok[:3]]}'

def linkify(text):
    out, last = [], 0
    esc = html.escape(text, quote=False)
    for m in TOKEN.finditer(esc):
        h = href(m.group(1))
        out.append(esc[last:m.start()])
        out.append(f'<a class="ref" href="{h}">{m.group(1)}</a>' if h else m.group(1))
        last = m.end()
    out.append(esc[last:])
    return ''.join(out)

STATE = {'open': 'offen', 'wait': 'wartet', 'done': 'entschieden', 'rule': 'Regel steht', 'run': 'in Arbeit', 'later': 'später', 'untested': 'nicht geprüft'}
LIVE = {'open', 'wait', 'run', 'untested'}

def facts_html(facts):
    if not facts:
        return ''
    return '<dl class="dt-facts">' + ''.join(f'<div><dt>{html.escape(k)}</dt><dd>{linkify(v)}</dd></div>' for k, v in facts) + '</dl>'

def live(n):
    return n.get('state') in LIVE or any(live(k) for k in n.get('kids', []))

def chip(tok):
    h = href(tok) if TOKEN.fullmatch(tok) else ('#u-geld' if tok == 'Business Case' else None)
    if tok.startswith('T03'):
        h = f'#{ANCHOR["2.4"]}'
    return f'<a class="dt-bchip" href="{h}">{html.escape(tok)}</a>' if h else f'<span class="dt-bchip">{html.escape(tok)}</span>'

def render_opt(o, keep):
    t = f' {linkify(o["text"])}' if o.get('text') else ''
    st = f' <span class="dt-bpill st-{o["state"]}">{STATE[o["state"]]}</span>' if o.get('state') else ''
    return (f'<li class="dt-bopt" data-keep="{keep}"><div class="dt-brow"><span class="dt-bol" aria-hidden="true">{o["letter"]}</span>'
            f'<span class="dt-bti"><span class="dt-sr">Möglichkeit {o["letter"]}: </span><b>{html.escape(o["title"])}.</b>{t}{st}{facts_html(o.get("facts"))}</span></div></li>')

def render(n, depth=0, top=False):
    kind, state = n['kind'], n.get('state')
    keep = '1' if live(n) else '0'
    nid = n.get('id')
    dom_id = f' id="{n["dom"]}"' if n.get('dom') else (f' id="{nid}"' if top else (f' id="b-{nid}"' if nid and kind != 'group' else (f' id="{nid}"' if nid else '')))
    if kind == 'group':
        open_now = n['opened'] if n['opened'] is not None else True
        counts = [(st, sum(1 for _ in iter_state(n, st))) for st in ('open', 'wait', 'untested')]
        tags = ''.join(f'<span class="dt-bpill st-{st}">{c} {STATE[st]}</span>' for st, c in counts if c)
        if n.get('raw') == 'ZIELBLATT':
            tags = f'<span class="dt-bpill st-done">Leitlinie, Endprodukt, Ziele</span><span class="dt-bpill st-open">{sum(1 for z in ZB if z[5])} Klärungsaufträge</span>'
        elif not tags:
            tags = f'<span class="dt-bpill st-done">{len(n["kids"])} Themen</span>'
        body = f'<div class="dt-bnb"><p>{linkify(n["text"])}</p>' if n.get('text') else '<div class="dt-bnb">'
        if n.get('page'):
            body += f'<p><a href="{ENTSCHEIDUNGSSEITE}" target="_blank" rel="noreferrer">Auf der Entscheidungsseite wählen →</a></p>'
        if n.get('raw') == 'ZIELBLATT':
            body += zielblatt_html()
        if n.get('label') == 'm02':
            body += ('<div class="dt-ber" role="group" aria-label="Anforderungen nach Bereich filtern">'
                     + ''.join(f'<button type="button" data-ber="{b}" aria-pressed="{str(b == "").lower()}">{b or "Alle Bereiche"}</button>' for b in ('', 'Raum', 'Service', 'Versorgung', 'Digital'))
                     + '</div>')
        body += '</div>'
        kids = ''.join(render(k, depth + 1) for k in n['kids'])
        cls = 'dt-bkids dt-spine' if n.get('label') == 'dt-spine' else 'dt-bkids'
        if not kids:
            hd = 'dt-bgrp' if depth == 0 else 'dt-bgrp dt-sub'
            return (f'<li class="{hd}" data-keep="1"{dom_id}><details open data-top="{1 if depth == 0 else 0}">'
                    f'<summary class="dt-brow"><span class="dt-bti"><b>{html.escape(n["title"])}</b></span>{tags}</summary>{body}</details></li>')
        head = 'dt-bgrp' if depth == 0 else 'dt-bgrp dt-sub'
        return (f'<li class="{head}" data-keep="{keep}"{dom_id}><details{" open" if open_now else ""} data-top="{1 if depth == 0 else 0}">'
                f'<summary class="dt-brow"><span class="dt-bti"><b>{html.escape(n["title"])}</b></span>{tags}</summary>{body}<ul class="{cls}">{kids}</ul></details></li>')
    glyph = (f'<span class="dt-boc">{html.escape(n["label"])}</span>' if kind == 'outcome'
             else f'<span class="dt-bg k-{kind}" aria-hidden="true"></span>')
    kind_word = {'decision': 'Entscheidung', 'chance': 'Ereignis', 'gate': 'Gate', 'step': 'Schritt', 'end': 'Ende', 'outcome': 'Ausgang', 'req': 'Anforderung'}[kind]
    idtxt = f'<span class="dt-bid">{html.escape(nid)}</span>' if nid and re.fullmatch(r'[A-Z]\d\d|G\d', nid) else ''
    pill = f'<span class="dt-bpill st-{state}">{STATE[state]}</span>' if state else ''
    tagtxt = ''.join(f'<span class="dt-tag">{html.escape(t)}</span>' for t in n.get('tags', []))
    row = (f'{glyph}{idtxt}<span class="dt-bti"><span class="dt-sr">{kind_word}: </span>{linkify(n["title"])}{tagtxt}</span>{pill}')
    body = ''
    if n.get('meta'):
        body += f'<p class="dt-bmeta">{linkify(n["meta"])}</p>'
    if n.get('text'):
        body += f'<p>{linkify(n["text"])}</p>'
    body += facts_html(n.get('facts'))
    if n.get('ziel'):
        body += '<p class="dt-blinks"><span>Dient</span>' + ''.join(chip(t) for t in n['ziel']) + '</p>'
    if n.get('needs'):
        body += '<p class="dt-blinks"><span>Braucht</span>' + ''.join(chip(t) for t in n['needs']) + '</p>'
    if n.get('feeds'):
        body += '<p class="dt-blinks"><span>Wirkt auf</span>' + ''.join(chip(t) for t in n['feeds']) + '</p>'
    if n.get('see'):
        body += '<p class="dt-blinks"><span>Siehe</span>' + ''.join(f'<a class="dt-bchip" href="{h}">{html.escape(t)}</a>' for h, t in n['see']) + '</p>'
    if n.get('hint'):
        body += f'<p class="dt-bhint">{linkify(n["hint"])}</p>'
    if kind in ('decision', 'gate') and state in ('open', 'wait') and not n.get('container'):
        body += beschluss(n)
    if n.get('page'):
        body += f'<p><a href="{ENTSCHEIDUNGSSEITE}" target="_blank" rel="noreferrer">{nid} auf der Entscheidungsseite wählen →</a></p>'
    kids = ''.join(render_opt(o, keep) for o in n['opts']) + ''.join(render(k, depth + 1) for k in n['kids'])
    s_attr = (f' data-s="{state}"' if state else '') + (f' data-ber="{html.escape(n["ber"])}"' if n.get('ber') else '')
    if not body and not kids:
        return f'<li class="dt-bnode" data-keep="{keep}"{s_attr}{dom_id}><div class="dt-brow">{row}</div></li>'
    open_now = n['opened'] if n['opened'] is not None else (state == 'open' or kind in ('outcome', 'end') or nid == 'O01')
    return (f'<li class="dt-bnode" data-keep="{keep}"{s_attr}{dom_id}><details{" open" if open_now else ""}>'
            f'<summary class="dt-brow">{row}</summary><div class="dt-bnb">{body}</div>'
            + (f'<ul class="dt-bkids">{kids}</ul>' if kids else '') + '</details></li>')

def iter_state(n, s):
    for k in n.get('kids', []):
        if k.get('state') == s and k['kind'] not in ('outcome',) and not k.get('container'):
            yield k
        yield from iter_state(k, s)

def count(kind=None, state=None):
    c = 0
    def walk(nodes):
        nonlocal c
        for n in nodes:
            if not n.get('container') and (kind is None or n['kind'] == kind) and (state is None or n.get('state') == state):
                c += 1
            walk(n.get('kids', []))
    walk(tree)
    return c

n_open = count('decision', 'open') + count('chance', 'open') + count('step', 'open')
n_dec_open = count('decision', 'open')
n_wait = count('decision', 'wait')
n_chance = count('chance')
n_gates = count('gate')

blockers = [('lage', 'Lage von Phase 0 im Detailplan', 'Geschäftsführung mit dem Architekten'), ('mieter', 'Mietinteressenten gewinnen', 'Projektleitung · ab sofort'),
            ('O12', 'Paket vor dem Investment (D69)', 'Geschäftsführung'), ('O31', 'Angebote für Objekt Phase 0', 'Projektleitung · nach Bauart'),
            ('O05', 'Anwälte und Prüfaufträge', 'Geschäftsführung und Projektleitung · vor G0')]

def md_html(md):
    """Kleiner Markdown-Umsetzer für die Baseline: Überschriften, Listen, Tabellen, Zitate."""
    def inline(t):
        t = html.escape(t, quote=False)
        t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
        return t
    out, i, lines = [], 0, md.split('\n')
    sec_open = False
    while i < len(lines):
        l = lines[i].rstrip()
        if l.startswith('## '):
            if sec_open: out.append('</div></details>')
            num = l[3:].split('.')[0].strip()
            keep_open = num in ('2', '3', '14', '18')
            out.append(f'<details class="kap dt-ra" id="ra-{num}"{" open" if keep_open else ""}><summary><span class="dt-ra-h">{inline(l[3:])}</span></summary><div>')
            sec_open = True
        elif l.startswith('### '):
            out.append(f'<h4 class="dt-h4">{inline(l[4:])}</h4>')
        elif l.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            i -= 1
            head, body_rows = rows[0], rows[2:]
            def cell(c):
                if re.fullmatch(r'XP-SYS-\d+|OD-\d+|H\d', c): return f'<td class="mono" id="ra-{c}">{c}</td>'
                return f'<td>{inline(c)}</td>'
            out.append('<div class="tablewrap"><table><thead><tr>' + ''.join(f'<th>{inline(h)}</th>' for h in head) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(cell(c) for c in r) + '</tr>' for r in body_rows) + '</tbody></table></div>')
        elif l.startswith('> '):
            out.append(f'<blockquote class="dt-quote">{inline(l[2:])}</blockquote>')
        elif re.match(r'(- |\d+\. )', l):
            tag = 'ul' if l.startswith('- ') else 'ol'
            items = []
            while i < len(lines) and re.match(r'(- |\d+\. )', lines[i]):
                items.append(inline(re.sub(r'^(- |\d+\. )', '', lines[i].rstrip()))); i += 1
            i -= 1
            out.append(f'<{tag}>' + ''.join(f'<li>{x}</li>' for x in items) + f'</{tag}>')
        elif l and not l.startswith('#') and not l.startswith('---') and not re.match(r'\*\*(Version|Date|Status):', l):
            out.append(f'<p>{inline(l)}</p>')
        i += 1
    if sec_open: out.append('</div></details>')
    return '\n'.join(out)

RA_MD = (Path(__file__).resolve().parent.parent / 'quellen' / 'reference-architecture-v0.4.md').read_text()
RA_MD = RA_MD.split('---', 2)[2] if RA_MD.startswith('---') else RA_MD

# Abgleich: Nr, Thema, bisher im Index, Baseline v0.4 / Deck 11.2026, was jetzt gilt, Status, erledigt?
ABGLEICH = [
    ('W01', 'Vision und Mission', 'Vision der Leitlinie P01; Mission „Innovationshubs“ (E28)', 'Neue Vision (Abschnitt 2), keine Mission, Kerndefinition (Abschnitt 18)', 'Vision v0.4 steht in der Grundlage des Baums. Ob eine Mission bleibt, ist offen.', 'OPEN', 'angepasst'),
    ('W02', 'Was „X-PORTAL“ heißt', '„Dachfirma“ (Vorgabe 05.11.), „Firma“', 'X-PORTAL ist das sozio-technische Gesamtsystem; die Firma heißt X-PORTAL Organisation bzw. Company; Systemgrenze zum Node-Betrieb offen (OD-001)', 'Zielblatt X1 heißt „X-PORTAL Organisation (Company)“. Wo die DT Agentur steht, nennen Baseline und Deck nicht.', 'DECISION REQUIRED', 'angepasst'),
    ('W03', 'Kapital für Node001', '„Kein Investor“ (E04); der Ort trägt sich aus Käufergeld, Pre-Seed nur für die Firma (E57)', 'Zwei getrennte Investment Cases; Node001 als eigener Project-/Asset-Case mit Kapital für Infrastruktur und ersten Bauabschnitt', 'Entschieden in D46 am 13.11.2026: Käufermodell abgewählt; Eigenkapital plus Investoren, verbunden mit wiederkehrenden Erlösen.', 'DOCUMENTED', 'entschieden 13.11.'),
    ('W04', 'Produkt- und Preismodell', 'Hausverkauf als Token über die Blockchain, Grund pachten, etwa 30.000 € je Plot, Verkauf ab Januar 2027 (E50, E52, E78)', '„Miete bzw. geeignetes Eigentums-/Nutzungsmodell“, Produktmix und Preis werden validiert; kein öffentliches Angebot von Kryptowerten', 'Entschieden in D45, D48, D49, D50 am 13.11.2026: kein klassischer Immobilienverkauf, zuerst Mieter, Selbstkostenpreis, Tokenisierung erst nach Klärung.', 'DOCUMENTED', 'entschieden 13.11.'),
    ('W05', 'Zahlen zum Invest', 'Papierrechnung rund 12 Mio. € „rechtfertigt das Invest“ (E84); Kostenhochrechnung 12,5 Mio. € (E65)', 'Parametrischer Business Case offen (OD-008); Scheingenauigkeit vermeiden (KI-Regel 10); Kostenband „zu validieren“', 'Beide Zahlen bleiben intern und gehören in keine Investorenunterlage.', 'ASSUMPTION', 'markiert'),
    ('W06', 'Termine', 'Verkauf Januar 2027, Container ab März, „Einzug ab Frühjahr 2027“ (E51, E55)', '„Baubeginn 2027 · Ziel“, nur nach Gates; Meilensteine sind Ziele, keine Zusagen', 'Grenzentabelle führt alle Termine als Ziele.', 'ASSUMPTION', 'angepasst'),
    ('W07', 'Genehmigung und Finanzierung', '„Genehmigung und Planung liegen vor, 12,5 Mio. € privat finanziert“ (E60, durch E65 schon berichtigt)', 'Finanzierung des ersten Bauabschnitts und Freigaben: „zu validieren“; „Grundstück gesichert“', 'Es gilt das Deck. Belege zum Grundstück fehlen weiter (O14): DOCUMENTED, nicht VERIFIED.', 'DOCUMENTED', 'markiert'),
    ('W08', 'Rollen der Menschen', 'Team (drei Personen) und Käufer oder Mieter (E63)', 'Acht Rollen in der Infografik: Siedler, digitale Nomaden, Gäste, Remote-Siedler, Mitarbeitende, Betreiber, Partner, Investoren; Human Roles v1.0 in Arbeit (OD-003)', 'Der Plan bleibt bei Team und Käufern, bis OD-003 entschieden ist.', 'IN WORK', 'markiert'),
    ('W09', 'Digital Twin', '„Digitaler Zwilling der Organisation“, „Unternehmenszwilling“ (2.6.6, M07)', 'System Model ist nicht Digital Twin; voller Twin später und nur bei Nutzen', 'Text in 2.6.6 angepasst; M07 bleibt als Methodenname der Historie.', 'OPEN', 'angepasst'),
    ('W10', 'Zahl der Nodes', '„Node001, der erste von zehn Nodes“ (E63)', 'Node002 als Replikationstest; keine Zahl; Multi-Node-Plattform nicht im MVS', 'Die Zahl zehn steht in keiner aktuellen Aussage mehr.', 'ASSUMPTION', 'CHANGE REQUEST'),
    ('W11', 'Genome', '„Schema für den nächsten Node“ (Z4, E11)', 'X-PORTAL Genome: Invarianten, Module, Parameter, Entscheidungsregeln, Evidenz; belastbar erst mit Evidenz aus Node001 und Node002', 'Z4 heißt jetzt Genome.', 'IN WORK', 'angepasst'),
    ('W12', 'Autarkie', '„autark“ (E46, E54, E72)', '„weitgehend versorgungsautark, operativ autonom“; Zielwerte je kritischer Funktion offen (OD-002)', 'Grundmodell angepasst.', 'OPEN', 'angepasst'),
    ('W13', 'Statusbegriffe', 'offen, wartet, nicht geprüft, entschieden, Regel steht', 'VERIFIED, DOCUMENTED, IN WORK, ASSUMPTION, OPEN, DECISION REQUIRED', 'Zuordnung steht in der Legende des Baums. „Entschieden“ heißt DOCUMENTED, nicht VERIFIED.', 'DOCUMENTED', 'angepasst'),
    ('W14', 'Team und Rollen', 'Paul ist CEO zu 100 %, Roman Produkt und Projekt (E62); Nazar ist beauftragte Fachperson (E64)', 'Deck nennt als operatives Team Roman Dering, Pavel J., Nazar D. („Architekt · Nodes“); Founder-, Ownership- und Governance-Darstellung vor Versand offen', 'Wer Gründer und Gesellschafter ist und ob Nazar Teammitglied oder Auftragnehmer ist, muss vor dem Versand feststehen.', 'DECISION REQUIRED', 'offen'),
    ('W15', 'Ortsangabe', 'Website nennt, wenn überhaupt, nur „Ukraine“ (E66)', 'Deck: „Karpatenregion, Westukraine“; Baseline: „Node001 Beregniza“', 'Für Investoren gilt die Angabe des Decks; E66 betrifft die öffentliche Website.', 'DOCUMENTED', 'markiert'),
    ('W16', 'Erlöse', 'Agenten je Aufruf über Masumi (E56); Einstieg ab 490 € (E76, abgelöst durch E83)', 'Vier Erlösstufen: Kundenprojekte (heute), KI-Lösungen (in Entwicklung), Nutzung und Services Node001, System-Skalierung (später)', 'Preismodell bleibt offen (E83); Masumi ist eine Option, keine Aussage im Deck.', 'OPEN', 'markiert'),
    ('W17', 'Versionsstand der Infografik', '–', 'Infografik „Integrierte Managementarchitektur · SGMM II“ nennt Reference Architecture v0.2; Baseline und Deck nennen v0.4', 'Widerspruch innerhalb der neuen Unterlagen: Infografik auf v0.4 heben, bevor sie rausgeht.', 'DECISION REQUIRED', 'offen'),
    ('W18', 'Kürzel H1 bis H8', 'H01 bis H09 sind Anforderungen der Stufe Grundbedürfnisse (M02)', 'H1 bis H8 sind die PoC-Hypothesen', 'Verwechslungsgefahr. Im Index heißen Hypothesen immer H1 bis H8 ohne Null, Anforderungen H01 bis H09.', 'DOCUMENTED', 'markiert'),
    ('W19', 'Container oder Objekte', 'Die Container sind die Tiny Houses der Käufer und bleiben stehen (E59, D21 B)', 'Kommentar zu D55: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur; danach Wohn- und Arbeitsobjekte und Kommunalgebäude', 'Entschieden in D55 am 13.11.2026. Material und Bauart plant eine Bau-KI (D56).', 'DOCUMENTED', 'entschieden 13.11.'),
    ('W20', 'Preis', 'Etwa 30.000 € je Käufer (E78, E84)', 'Kommentar zu D49: Selbstkostenpreis statt Verkaufspreis', 'Entschieden in D49 am 13.11.2026; Zahlen aus dem Business Case (OD-008).', 'DOCUMENTED', 'entschieden 13.11.'),
    ('W21', 'Mission', 'Die Baseline v0.4 nennt keine Mission (W01)', 'Kommentar zu D42: Mission und Globalziele sind der Ausgangspunkt; der Bruch in der Logik muss harmonisiert werden', 'Aufgabe: Mission, Globalziele, Vision v0.4 und Zielblatt in eine Logik bringen.', 'DECISION REQUIRED', 'offen'),
    ('W22', 'Kostenstand', 'Papierrechnung 12 Mio. € (E84), 12,5 Mio. € (E65)', 'Kostenregister vom 13.11.2026: Teilsumme für eine kleine Phase 0, 69 von 137 Positionen ohne Betrag', 'Für Investoren keine Beträge, bis Angebote vorliegen (D53: neu rechnen).', 'ASSUMPTION', 'markiert'),
]
PILL = {'OPEN': 'st-open', 'DECISION REQUIRED': 'st-open', 'ASSUMPTION': 'st-untested', 'IN WORK': 'st-run', 'DOCUMENTED': 'st-done', 'VERIFIED': 'st-done'}
def abgleich_html():
    rows = ''.join(f'<tr id="ab-{n}"><td class="mono">{n}</td><td><b>{html.escape(t)}</b></td><td>{linkify(a)}</td><td>{linkify(b)}</td><td>{linkify(c)}</td>'
                   f'<td><span class="dt-bpill {PILL[st]}">{st}</span></td><td>{html.escape(done)}</td></tr>' for n, t, a, b, c, st, done in ABGLEICH)
    return ('<div class="tablewrap"><table class="dt-ztab"><thead><tr><th>Nr</th><th>Thema</th><th>Bisher im Index</th><th>Baseline v0.4 und Deck 11.2026</th><th>Was jetzt gilt</th><th>Status</th><th>Im Index</th></tr></thead><tbody>'
            + rows + '</tbody></table></div>')

HYP = [('H1', 'Human Value', 'Z1; Anforderungen nach Maslow und Sinnen (Ast 2), Nutzungstest 2.4.9'), ('H2', 'Autarkie & Resilienz', 'Z1; Versorgung je Ressource (Ast 3), Störungstag'),
       ('H3', 'Operational Viability', 'Z1; Betrieb oben 2.4.5, Abnahmen (E53)'), ('H4', 'Economic Viability', 'Z2, Z3; Selbstkosten je Objekt (O03), Geldfluss 2.1.3, OD-008'),
       ('H5', 'Digital Value', 'OD-004; Technik im Haus'), ('H6', 'AI Value', 'Z3; eigene Agenten (E56), Preismodell 2.6.2'),
       ('H7', 'Learning Capability', 'Routine 3.3, Entscheidungslog'), ('H8', 'Replicability', 'Z4 Genome, 2.6.6; Beweis erst mit Node002')]
ra_section = ('<section id="ra"><h2>Reference Architecture v0.4: der Bezugsrahmen</h2>'
    '<p class="lede2">Seit dem 12.11.2026 ist die Reference Architecture v0.4-WB1 die gemeinsame Arbeitsreferenz für Menschen und KI. Alles Frühere in diesem Index, auch das Entscheidungslog E01 bis E85, ist Evidenz und Historie und gilt nur, soweit es der Baseline nicht widerspricht (KI-Regel 1). Widersprüche stehen im Abgleich und sind nicht stillschweigend geglättet (KI-Regel 8).</p>'
    '<p>Die Managementarchitektur nach dem St. Galler Modell, die Bauphasen (ein Objekt zuerst, dann Objekte und Kommunalgebäude) und die Funktionsketten bis zum Werkzeug mit Internetpreisen stehen auf der <a href="https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G">SGMM-Seite</a> (Repo: <code>plan/sgmm/</code>). Für Werkzeug, Preis und Zeitaufwand zu Ast 3 (Versorgung) und Ast 4 (Make-or-Buy) gilt die SGMM-Seite.</p>'
    '<h3 id="ra-abgleich">Abgleich: Widersprüche zwischen Index und Baseline</h3>'
    f'<p>{len(ABGLEICH)} Punkte. „angepasst“: der Index sagt jetzt, was die Baseline sagt. „CHANGE REQUEST“: die Entscheidung im Log muss von Geschäftsführung und Projektleitung geändert werden. „markiert“: der alte Stand bleibt als Historie stehen und ist gekennzeichnet. „offen“: Widerspruch in den neuen Unterlagen selbst.</p>'
    + abgleich_html()
    + '<h3 id="ra-hyp">PoC-Hypothesen H1 bis H8 und wo der Plan sie prüft</h3><div class="tablewrap"><table><thead><tr><th>ID</th><th>Hypothese</th><th>Im Plan</th><th>Messgröße, Zielwert, Go/Revise/Stop</th></tr></thead><tbody>'
    + ''.join(f'<tr><td class="mono">{a}</td><td><b>{b}</b></td><td>{linkify(c)}</td><td><span class="dt-bpill st-open">OPEN</span> OD-005</td></tr>' for a, b, c in HYP)
    + '</tbody></table></div>'
    + '<p class="note">Der Wortlaut der Baseline steht im Repo unter plan/index-3/quellen/reference-architecture-v0.4.md.</p></section>\n')

section = f'''<section id="baum"><h2>Offener Entscheidungsbaum</h2>
<p class="lede2">Der ganze Plan Stufe 1 als Baum. Die Grundlage ist das Endprodukt mit seinen Zielen. Darunter stehen die Äste in der Reihenfolge, in der jetzt gearbeitet wird: 1 der Weg ab der Geologie, 2 der Alltag oben mit seinen prüfbaren Anforderungen, 3 die Versorgung je Ressource mit Ausbaupfad, 4 die Make-or-Buy-Vergleiche. Werkzeug, Preis und Zeitaufwand je Funktion stehen auf der <a href="https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G#ketten">SGMM-Seite</a>. Offene Äste bleiben aufgeklappt und zeigen jede Möglichkeit mit ihrer Folge; Entschiedenes ist eingeklappt. Gewählt wird weiter auf der <a href="{ENTSCHEIDUNGSSEITE}" target="_blank" rel="noreferrer">Entscheidungsseite</a>.</p>
<ul class="dt-bkey" aria-label="Zeichen im Baum">
<li><span class="dt-bg k-decision" aria-hidden="true"></span>Entscheidung, nur ihr</li>
<li><span class="dt-bg k-chance" aria-hidden="true"></span>Ereignis, ihr wartet auf das Ergebnis</li>
<li><span class="dt-bg k-gate" aria-hidden="true"></span>Gate G0–G4</li>
<li><span class="dt-bg k-step" aria-hidden="true"></span>Schritt oder Rechnung</li>
<li><span class="dt-bg k-req" aria-hidden="true"></span>Anforderung, prüfbar</li>
<li><span class="dt-bg k-end" aria-hidden="true"></span>Ende von Stufe 1</li>
<li><span class="dt-bol" aria-hidden="true">A</span>Möglichkeit</li>
</ul>
<p class="note">Status nach der Baseline: offen = OPEN oder DECISION REQUIRED · wartet = IN WORK · nicht geprüft = ASSUMPTION · entschieden und „Regel steht“ = DOCUMENTED. VERIFIED ist bisher nichts: keine Anforderung ist fachlich geprüft.</p>
<div class="dt-bstats">
<div class="dt-bstat"><b>{len(ZB)}</b><span>Ziele im Zielblatt</span><small>{sum(1 for z in ZB if z[5])} davon mit Klärungsauftrag</small></div>
<div class="dt-bstat"><b>{len(M02)}</b><span>Anforderungen</span><small>keine geprüft; die M02 im Repo hat 46</small></div>
<div class="dt-bstat"><b>{len(makebuy) - 1}</b><span>Make-or-Buy-Vergleiche</span><small>keiner mit Vollkosten gerechnet</small></div>
<div class="dt-bstat"><b>{n_dec_open}</b><span>Entscheidungen offen</span><small>davon 6 auf der Entscheidungsseite</small></div>
<div class="dt-bstat"><b>{n_wait}</b><span>Entscheidungen warten</span><small>auf Angebote, Anwälte oder Kapital</small></div>
<div class="dt-bstat"><b>{sum(1 for i in ANT if i not in OFFEN_KARTEN and (ANT[i].get("wahl") or "") != "unklar")}</b><span>entschieden am 13.11.</span><small>mit Kommentaren, Ast 6 und 8</small></div>
</div>
<h3 id="b-jetzt">Woran gerade am meisten hängt</h3>
<ol class="dt-bnow">{''.join(f'<li><a href="#b-{i}"><span class="dt-bid">{i}</span><b>{html.escape(t)}</b><small>{html.escape(w)}</small></a></li>' for i, t, w in blockers)}</ol>
<div class="dt-btools" role="toolbar" aria-label="Baum anzeigen">
<button type="button" id="b-f-alles" aria-pressed="true">Alles</button>
<button type="button" id="b-f-offen" aria-pressed="false">Nur offene Äste</button>
<button type="button" id="b-auf">Alles aufklappen</button>
<button type="button" id="b-zu">Zuklappen</button>
</div>
<ul class="dt-bt" id="btree">{''.join(render(n, 0, top=True) for n in tree)}</ul>
<p class="note">Neu in Index 3.0, sonst unverändert gegenüber <a href="{INDEX2}" target="_blank" rel="noreferrer">Index 2.0</a>. Der Baum ist aus Plan, Entscheidungsseite und Kapitel 4 zusammengesetzt (Stand 04.11.2026) und noch nicht im Generator <code>plan/werkzeuge/index_seite.py</code>.</p>
</section>
'''

css = '''<style>
/* Index 3.0 · Offener Entscheidungsbaum: eine Liste mit Linien, Knoten als Zeilen, offene Äste aufgeklappt. */
.dt-sr { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap }
.dt-bkey { display:flex; flex-wrap:wrap; gap:8px 18px; list-style:none; padding:0; margin:8px 0 16px; max-width:none; font-size:13px; color:var(--body) }
.dt-bkey li { display:flex; align-items:center; gap:8px; margin:0 }
.dt-bstats { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap:8px; margin:0 0 6px }
.dt-bstat { background:var(--surface); border:1px solid var(--line); padding:10px 12px; display:flex; flex-direction:column; gap:2px }
.dt-bstat b { font-size:28px; line-height:1.1; color:var(--ink); font-variant-numeric:tabular-nums } .dt-bstat span { color:var(--ink); font-weight:600; font-size:13.5px } .dt-bstat small { color:var(--muted); font-size:12px }
ol.dt-bnow { list-style:none; padding:0; margin:0 0 18px; max-width:none; display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:8px }
.dt-bnow li { margin:0 } .dt-bnow a { display:flex; flex-direction:column; gap:2px; height:100%; background:var(--surface); border:1px solid var(--line); border-top:3px solid var(--wait); padding:8px 10px; text-decoration:none; color:var(--body) }
.dt-bnow a:hover { border-color:var(--ink); border-top-color:var(--wait) } .dt-bnow b { color:var(--ink); font-size:14px } .dt-bnow small { color:var(--muted); font-size:12px }
.dt-btools { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 12px }
.dt-btools button { font:inherit; font-size:13px; cursor:pointer; border:1px solid var(--line); background:var(--surface); color:var(--ink); padding:6px 12px; border-radius:6px }
.dt-btools button:hover { border-color:var(--ink) } .dt-btools button[aria-pressed="true"] { background:var(--ink); color:var(--bg); border-color:var(--ink) }
.dt-btools button:focus-visible, .dt-bt summary:focus-visible, .dt-bt a:focus-visible, .dt-bnow a:focus-visible { outline:2px solid var(--ink); outline-offset:2px }
ul.dt-bt, ul.dt-bt ul.dt-bkids { list-style:none; max-width:none } ul.dt-bt { margin:0; padding:0 }
.dt-bt li { margin:0; position:relative }
.dt-bt > li { margin:0 0 10px }
.dt-bt details > summary { list-style:none; cursor:pointer; margin:0; font-weight:inherit; color:inherit }
.dt-bt details > summary::-webkit-details-marker { display:none }
.dt-brow { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; padding:7px 10px; background:var(--surface); border:1px solid var(--line); border-radius:6px; font-size:14px; line-height:1.35; color:var(--ink) }
.dt-brow > .dt-bg, .dt-brow > .dt-bol { flex:none; margin-inline:2px }
.dt-brow > .dt-bid { flex:none; min-width:2.4em }
.dt-brow > .dt-bti { flex:1 1 0; min-width:min(8em, 100%) }
.dt-brow > .dt-bpill:first-of-type { margin-left:auto }
summary.dt-brow::after { content:"▸"; flex:none; width:12px; text-align:right; color:var(--muted); font-size:11px; transition:transform .15s }
details[open] > summary.dt-brow::after { transform:rotate(90deg) }
@media (prefers-reduced-motion: reduce) { summary.dt-brow::after { transition:none } }
.dt-bgrp > details > summary.dt-brow { background:var(--ink); color:var(--bg); border-color:var(--ink); padding:10px 12px; font-size:15.5px }
.dt-bgrp > details > summary.dt-brow::after { color:var(--bg) }
.dt-bgrp > details > summary.dt-brow b { color:var(--bg) } .dt-bgrp.dt-sub > details > summary.dt-brow b { color:var(--ink) }
.dt-bgrp.dt-sub > details > summary.dt-brow { background:var(--bg); color:var(--ink); border:1.5px solid var(--ink); font-size:14.5px; padding:8px 10px }
.dt-bgrp.dt-sub > details > summary.dt-brow::after { color:var(--muted) }
.dt-bti { min-width:0 } .dt-bti b { font-weight:600 } .dt-bti p { margin:2px 0 0; font-size:13px; color:var(--body); font-weight:400 }
.dt-bid { font-family:var(--mono); font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums }
.dt-bnb { padding:6px 10px 8px 40px; font-size:13.5px; color:var(--body) } .dt-bnb p { margin:0 0 5px; max-width:80ch } .dt-bgrp > details > .dt-bnb { padding-left:12px }
.dt-bmeta { color:var(--muted); font-size:12.5px }
.dt-bhint { color:var(--run); font-size:12.5px }
.dt-blinks { display:flex; flex-wrap:wrap; align-items:center; gap:5px } .dt-blinks > span:first-child { font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-right:2px }
.dt-bchip { font-family:var(--mono); font-size:11.5px; border:1px solid var(--line); background:var(--surface); color:var(--ink); padding:1px 7px; border-radius:999px; text-decoration:none }
a.dt-bchip:hover { border-color:var(--ink) }
.dt-bpill { font-size:11.5px; font-weight:600; padding:2px 8px; border-radius:999px; white-space:nowrap; border:1px solid transparent }
.st-open { background:var(--wait-bg); color:var(--wait) } .st-wait { background:transparent; color:var(--wait); border:1px dashed var(--wait) }
.st-done, .st-rule { background:var(--go-bg); color:var(--go) } .st-run { background:var(--run-bg); color:var(--run) } .st-later { background:var(--bg); color:var(--muted); border-color:var(--line) }
.dt-bgrp > details > summary .dt-bpill.st-open { background:var(--wait-bg); color:var(--wait) } .dt-bgrp > details > summary .dt-bpill.st-wait { background:var(--surface); color:var(--wait) } .dt-bgrp > details > summary .dt-bpill.st-done { background:var(--go-bg); color:var(--go) }
/* Zeichen */
.dt-bg { --c:var(--ink); display:inline-block; box-sizing:border-box; width:14px; height:14px; border:2px solid var(--c); background:var(--surface) }
.dt-bg.k-decision { border-radius:2px } .dt-bg.k-chance { border-radius:50% } .dt-bg.k-gate { width:12px; height:12px; transform:rotate(45deg) }
.dt-bg.k-step { width:18px; height:11px; border-radius:3px; border-width:1.5px } .dt-bg.k-end { border:0; background:var(--c); clip-path:polygon(0 0, 100% 50%, 0 100%) }
li[data-s="open"] > * > .dt-brow .dt-bg, li[data-s="open"] > .dt-brow .dt-bg { --c:var(--wait); background:var(--wait-bg) }
li[data-s="wait"] > * > .dt-brow .dt-bg, li[data-s="wait"] > .dt-brow .dt-bg { --c:var(--wait); border-style:dashed }
li[data-s="done"] > * > .dt-brow .dt-bg, li[data-s="rule"] > * > .dt-brow .dt-bg, li[data-s="done"] > .dt-brow .dt-bg { --c:var(--go); background:var(--go-bg) }
.dt-bg.k-gate { border-style:solid !important }
.dt-bol { display:inline-grid; place-items:center; width:20px; height:20px; border:1.5px solid var(--wait); color:var(--wait); border-radius:4px; font:600 12px var(--mono) }
.dt-boc { flex:none; font-family:var(--mono); font-size:11px; line-height:1.2; border:1px solid var(--line); color:var(--muted); padding:2px 6px; border-radius:4px; white-space:nowrap }
.dt-bopt .dt-brow { align-items:flex-start; background:var(--bg); border-style:dashed; border-color:var(--wait); font-size:13.5px } .dt-bopt .dt-bti b { color:var(--ink) }
/* Linien: die Senkrechte je Kind bis zum nächsten Geschwister, beim letzten nur bis zum Abzweig; der Abzweig trägt die Farbe des Zustands */
ul.dt-bt ul.dt-bkids { margin:0 0 4px 11px; padding:4px 0 0 22px }
.dt-bkids > li { padding-top:4px }
.dt-bkids > li::after { content:""; position:absolute; left:-22px; top:0; bottom:0; border-left:1.5px solid var(--line) }
.dt-bkids > li:last-child::after { bottom:auto; height:23px }
.dt-bkids > li::before { content:""; position:absolute; left:-22px; top:22px; width:18px; border-top:1.5px solid var(--line) }
.dt-bkids > li[data-s="open"]::before, .dt-bkids > li.dt-bopt::before { border-top-color:var(--wait) }
.dt-bkids > li[data-s="wait"]::before { border-top:1.5px dashed var(--wait) }
.dt-bkids.dt-spine > li::after { border-left:2.5px solid var(--ink); left:-22.5px }
.dt-bkids.dt-spine > li::before { border-top-width:2.5px }
.dt-bg.k-req { width:13px; height:13px; border-radius:3px; border-width:1.5px }
li[data-s="untested"] > * > .dt-brow .dt-bg, li[data-s="untested"] > .dt-brow .dt-bg { --c:var(--run); border-style:dashed }
li[data-s="later"] > * > .dt-brow .dt-bg, li[data-s="later"] > .dt-brow .dt-bg { --c:var(--muted) }
.st-untested { background:transparent; color:var(--run); border:1px dashed var(--run) }
.dt-bkids > li[data-s="untested"]::before { border-top:1.5px dashed var(--run) }
.dt-tag { display:inline-block; font-size:11.5px; font-weight:400; color:var(--muted); border:1px solid var(--line); border-radius:4px; padding:0 5px; margin-left:6px; white-space:nowrap; vertical-align:1px }
.dt-facts { display:grid; grid-template-columns:minmax(0,8.5em) minmax(0,1fr); gap:4px 12px; margin:6px 0; font-size:13px; max-width:92ch; font-weight:400 }
.dt-facts > div { display:contents }
.dt-facts dt { color:var(--muted); font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding-top:2px }
.dt-facts dd { margin:0; color:var(--body) }
.dt-bopt .dt-facts { margin:6px 0 2px }
.dt-ztab { min-width:900px } .dt-ztab th { white-space:normal } .dt-ztab td, .dt-ztab th { font-size:13px } .dt-ztab td b { font-weight:600 }
tr.dt-zgrp th { background:var(--bg); color:var(--ink); font-size:11.5px }
.dt-h4 { font-size:14.5px; color:var(--ink); margin:20px 0 6px }
.dt-ber { display:flex; flex-wrap:wrap; gap:6px; margin:6px 0 2px }
.dt-ber button { font:inherit; font-size:12.5px; cursor:pointer; border:1px solid var(--line); background:var(--surface); color:var(--ink); padding:4px 10px; border-radius:999px }
.dt-ber button[aria-pressed="true"] { background:var(--ink); color:var(--bg); border-color:var(--ink) } .dt-ber button:focus-visible { outline:2px solid var(--ink); outline-offset:2px }
.dt-off { display:none !important }
blockquote.dt-quote { margin:8px 0 12px; padding:10px 14px; border-left:4px solid var(--ink); background:var(--surface); color:var(--ink); font-size:16px; max-width:80ch }
details.dt-ra { border-top:1px solid var(--line); padding:8px 0 } details.dt-ra > summary { margin:0 } .dt-ra-h { font-size:16px; color:var(--ink) }
details.dt-ra > div { padding-top:8px } details.dt-ra li { margin:4px 0 }
#ra h3 { margin-top:28px }
.dt-endp { font-size:16px; color:var(--ink); font-weight:600; max-width:70ch }
ul.dt-gm { margin:0 0 8px; padding-left:20px; max-width:90ch } ul.dt-gm li { margin:3px 0 }
details.dt-bb { margin:6px 0 2px; border-top:1px dashed var(--line); padding-top:4px }
details.dt-bb > summary { cursor:pointer; font-family:var(--mono); font-size:11.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); list-style:none }
details.dt-bb > summary::before { content:"▸ "; } details.dt-bb[open] > summary::before { content:"▾ "; }
details.dt-bb > summary::-webkit-details-marker { display:none }
.dt-endbox { background:var(--surface); border:1.5px solid var(--ink); padding:12px 14px; margin:12px 0 4px }
.dt-endbox h4 { margin:0 0 6px; font-size:14.5px; color:var(--ink) } .dt-endbox p { margin:0 0 6px; font-size:13.5px }
.dt-endbox ol { margin:4px 0 0; padding-left:20px; font-size:13.5px; max-width:none } .dt-endbox li { margin:2px 0 }
.dt-rules { background:var(--surface); border:1px solid var(--line); border-left:4px solid var(--a-gemeinschaft); padding:10px 12px; margin:8px 0 12px }
.dt-rules h5 { margin:0 0 6px; font-size:14px; color:var(--ink) } .dt-rules ul { margin:0; padding-left:18px; font-size:13.5px; max-width:none } .dt-rules li { margin:2px 0 }
.rc dd .pp a, .rc dd a.dt-bchip { font-size:11.5px }
.dt-plan { margin:10px 0 6px } .dt-planbox { overflow:auto; max-height:80vh; border:1px solid var(--line); background:#fff; cursor:zoom-in }
.dt-planbox img { display:block; width:100%; height:auto } .dt-planbox.gross { cursor:zoom-out } .dt-planbox.gross img { width:2400px; max-width:none }
.dt-legende { margin:6px 0 10px } .dt-legende ol { margin:6px 0; padding-left:22px; columns:2 18em } .dt-legende li { margin:2px 0 }
details.dt-hist { margin:28px 0 0; border:1px dashed var(--line); padding:10px 14px } details.dt-hist > summary { cursor:pointer; font-weight:600; color:var(--ink) }
.dt-zbmap { background:var(--surface); border:1px solid var(--line); padding:12px 14px; margin:12px 0 4px }
.dt-zbmap h4 { margin:0 0 4px; font-size:14.5px; color:var(--ink) } .dt-zbmap > p { margin:0 0 8px; font-size:13px; color:var(--muted) }
.dt-zbmap ol { list-style:none; margin:0; padding:0; max-width:none; display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap:8px }
.dt-zbmap li { display:grid; grid-template-columns:26px minmax(0,1fr); gap:8px; margin:0; align-items:start }
.dt-zbmap li b { display:block; font-size:13.5px; margin-bottom:4px } .dt-zbmap .dt-chips { display:flex; flex-wrap:wrap; gap:4px }
.dt-zbmap .dt-bchip { font-family:var(--font); font-size:12px }
@media (max-width:640px) { .dt-facts { grid-template-columns:minmax(0,1fr); gap:0 } .dt-facts dd { margin-bottom:6px } }
@media (max-width:640px) { ul.dt-bt ul.dt-bkids { margin-left:6px; padding-left:14px } .dt-bkids > li::before, .dt-bkids > li::after { left:-14px } .dt-bkids.dt-spine > li::after { left:-14.5px } .dt-bkids > li::before { width:10px } .dt-bnb { padding-left:10px } .dt-brow { padding:6px 8px } }
</style>
'''

js = '''<script>
(() => {
  const tree = document.getElementById('btree'); if (!tree) return;
  const all = document.getElementById('b-f-alles'), only = document.getElementById('b-f-offen');
  const filter = on => {
    tree.querySelectorAll('li[data-keep]').forEach(li => { li.hidden = on && li.dataset.keep === '0'; });
    all.setAttribute('aria-pressed', String(!on)); only.setAttribute('aria-pressed', String(on));
  };
  all.addEventListener('click', () => filter(false));
  only.addEventListener('click', () => filter(true));
  document.getElementById('b-auf').addEventListener('click', () => tree.querySelectorAll('details:not(.dt-bb)').forEach(d => { d.open = true; }));
  document.getElementById('b-zu').addEventListener('click', () => tree.querySelectorAll('details').forEach(d => { d.open = d.dataset.top === '1'; }));
  const req = document.getElementById('b-anforderungen');
  if (req) {
    const btns = [...req.querySelectorAll('.dt-ber button')];
    btns.forEach(b => b.addEventListener('click', () => {
      const sel = b.dataset.ber;
      btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      req.querySelectorAll('li[data-ber]').forEach(li => li.classList.toggle('dt-off', !!sel && !li.dataset.ber.includes(sel)));
      req.querySelectorAll('li.dt-bgrp.dt-sub').forEach(g => {
        const rows = g.querySelectorAll('li[data-ber]');
        g.classList.toggle('dt-off', !!sel && rows.length > 0 && [...rows].every(li => li.classList.contains('dt-off')));
      });
    }));
  }
  const openTarget = id => { const el = document.getElementById(id); const d = el && el.querySelector(':scope > details'); if (d) d.open = true; };
  document.addEventListener('click', ev => { const a = ev.target.closest('a[href^="#b-"]'); if (a) openTarget(a.getAttribute('href').slice(1)); });
  if (location.hash.startsWith('#b-')) openTarget(location.hash.slice(1));
})();
</script>
'''

toc = ('<li><a href="#baum" data-k="baum">Offener Entscheidungsbaum</a><ol>'
       '<li><a href="#b-zielblatt" data-k="b-zielblatt">Grundlage: Mission, Ziele, Ort</a></li>'
       '<li><a href="#b-hauptweg" data-k="b-hauptweg">1 Der Weg ab jetzt</a></li>'
       '<li><a href="#b-anforderungen" data-k="b-anforderungen">2 Alltag und Anforderungen</a></li>'
       '<li><a href="#b-ressourcen" data-k="b-ressourcen">3 Versorgung und Ausbaupfad</a></li>'
       '<li><a href="#b-makebuy" data-k="b-makebuy">4 Make-or-Buy</a></li>'
       '<li><a href="#b-parallel" data-k="b-parallel">5 Parallel</a></li>'
       '<li><a href="#b-seite" data-k="b-seite">6 Entscheidungsseite</a></li>'
       '<li><a href="#b-plan" data-k="b-plan">7 Offen im Plan</a></li>'
       '<li><a href="#b-entschieden" data-k="b-entschieden">8 Entschieden</a></li>'
       '</ol></li>')

# ---------- In Index 2.0 einsetzen ----------

start = page.index('<body>') + len('<body>')
end = page.rindex('</body>')
body = page[start:end].lstrip('\n')

def sub_once(s, old, new, count=1):
    assert s.count(old) == count, (old, s.count(old))
    return s.replace(old, new)

body = sub_once(body, '<title>X-PORTAL Index 2.0</title>', '<title>X-PORTAL Index 3.0</title>')
body = sub_once(body, 'X-PORTAL Index 2.0 · Node001 · Stand 04.11.2026', 'X-PORTAL Index 3.0 · Node001 · Stand 14.11.2026 · Entscheidungen vom 13.11.2026 · Bezugsrahmen Reference Architecture v0.4-WB1')
old_lede = '<p class="lede">Oben sechs Bilder nach PRINCE2, darunter der Plan zum Arbeiten, unten zum Nachschlagen.'
body = sub_once(body, old_lede, '<p class="lede">Oben der offene Entscheidungsbaum mit der Grundlage: Mission und Ziele, Endprodukt, Ort mit Detailplan und Geologie, Zielblatt. Darunter der Abgleich mit der Reference Architecture v0.4 und, eingeklappt, der Index 2.0 vom 04.11.2026 als Historie.')
body = sub_once(body, '<ol class="side"><li><a href="#ueberblick" data-k="ueberblick">', '<ol class="side">' + toc + '<li><a href="#ra" data-k="ra">Reference Architecture v0.4</a><ol><li><a href="#ra-abgleich" data-k="ra-abgleich">Abgleich: Widersprüche</a></li><li><a href="#ra-hyp" data-k="ra-hyp">Hypothesen H1–H8</a></li></ol></li><li><a href="#index-2-historie">Historie: Index 2.0 vom 04.11.</a></li><li><a href="#ueberblick" data-k="ueberblick">', count=2)
body = sub_once(body, '<div class="wrap" id="top">', css + '<div class="wrap" id="top">')
REQ_NAME = {r['id']: r['bedarf'] for r in M02}
REQ_NAME.update({'M02-44': 'Jour fixe', 'M02-45': 'Laufen, Wandern, Yoga', 'M02-46': 'Sauna', 'M02-21': 'Feuerstelle', 'M02-25': 'Gastronomie',
                 'M02-14': 'Gemeinsamer Weg', 'M02-23': 'Gemüsegarten', 'M02-28': 'Technik'})
def rchip(code):
    h = href(code)
    return f'<a class="dt-bchip" href="{h}">{code} {html.escape(REQ_NAME.get(code, ""))}</a>' if h else f'<span class="dt-bchip">{code}</span>'
ZBMAP = [(1, 'Wohnhaus mit E-Bike-Unterstand', ['H01', 'H02', 'H06', 'H08', 'S04', 'D02']),
         (2, 'Kommunalgebäude: Arbeitsplatz, Küche, Sanitär', ['H03', 'H05', 'H07', 'Z01', 'D01', 'D03', 'D05', 'M02-44']),
         (3, 'Gemüsegarten', ['M02-23', 'H07']),
         (4, 'Feuerstelle mit Grill', ['M02-21']),
         (5, 'Restaurant und Bar', ['M02-25']),
         (6, 'Technik: Strom, Solar, Wasser', ['S03', 'D04', 'H04', 'M02-28']),
         (7, 'Gemeinsamer Weg, private Abzweige', ['H09', 'M02-14', 'S02'])]
NICHT_IM_BILD = ['S05', 'S06', 'S07', 'Z02', 'Z03', 'A01', 'A02', 'A03', 'V01', 'V02', 'M02-45', 'M02-46']
zbmap = ('<div class="dt-zbmap" id="u-zielbild-m02"><h4>Was jeder Bereich den Menschen bieten muss</h4>'
         '<p>Pauls Maslow- und Sinneskonzept als prüfbare Anforderungen (M02); ein Klick führt zur Zeile im Entscheidungsbaum. Stand der Matrix: 03.11.2026, keine Zeile geprüft.</p><ol>'
         + ''.join(f'<li><span class="zb-n">{n}</span><div><b>{html.escape(t)}</b><span class="dt-chips">{"".join(rchip(c) for c in cs)}</span></div></li>' for n, t, cs in ZBMAP)
         + '</ol><p style="margin:10px 0 4px">Nicht im Bild, aber gefordert:</p><span class="dt-chips">' + ''.join(rchip(c) for c in NICHT_IM_BILD) + '</span></div>')
body = sub_once(body, 'Die Sauna ist nicht im Bild; wo sie hinkommt, fragt D35.</p></div></div>', 'Die Sauna ist nicht im Bild; wo sie hinkommt, fragt D35.</p></div></div>' + zbmap)
HIST_START = '<details class="dt-hist" id="index-2-historie"><summary>Index 2.0 vom 04.11.2026: Überblick und Kapitel 1–4. Historie, Stand vor den Entscheidungen vom 13.11.2026</summary>'
body = sub_once(body, '<main>\n', '<main>\n' + section + ra_section + HIST_START) if '<main>\n' in body else sub_once(body, '<main>', '<main>' + section + ra_section + HIST_START)
body = sub_once(body, '</main>', '</details></main>')
body = body.replace('Fragen an Nazar', 'Fragen an den Architekten')
body = sub_once(body, '<footer>Erzeugt aus plan/PLAN.md, plan/daten/ und plan/entscheidungen.md mit plan/werkzeuge/index_seite.py.</footer>',
                '<footer>Erzeugt aus plan/PLAN.md, plan/daten/ und plan/entscheidungen.md mit plan/werkzeuge/index_seite.py. Der offene Entscheidungsbaum ist für Index 3.0 dazugekommen und noch nicht im Generator.</footer>')

# ---------- Index: Alltag oben neu ----------
DAYS = [
    ('Roman, vor Ort', 'Führt Produkt und Projekt (E62) und koordiniert den Betrieb oben (E24).', [
        ('a-betrieb', '06:30–07:15', 'Rundgang Technik: Strom, Wasser, Wege', 'Betrieb · M02-28'),
        ('a-essen', '07:15–08:15', 'Frühstück privat im Haus', 'Essen · M02-08'),
        ('a-gemeinschaft', '08:30–08:45', 'Jour fixe im Kommunalgebäude, Pflicht', 'Gemeinschaft · M02-44'),
        ('a-arbeit', '09:00–14:00', 'Kernzeit: Projektmanagement und Kundencalls', 'Arbeit · M02-09, M02-12'),
        ('a-essen', '12:30–13:15', 'Mittagessen gemeinsam oder privat', 'Essen · M02-20, M02-08'),
        ('a-betrieb', '14:00–15:30', 'Lieferung mit dem E-Bike, Wartung', 'Betrieb · M02-17, M02-19'),
        ('a-gesundheit', '16:00–17:00', 'Gemeinsamer Sport, Pflicht', 'Gesundheit · M02-45'),
        ('a-freizeit', '19:00–21:00', 'Frei: Sauna, Feuerstelle oder privat', 'Freizeit · M02-46, M02-21'),
    ]),
    ('Teammitglied, baut Agenten', 'Arbeitet in der Kernzeit konzentriert an Agenten und Kundenprojekten aus Deutschland (E70).', [
        ('a-essen', '07:30–08:30', 'Frühstück privat', 'Essen · M02-08'),
        ('a-gemeinschaft', '08:30–08:45', 'Jour fixe, Pflicht', 'Gemeinschaft · M02-44'),
        ('a-arbeit', '09:00–14:00', 'Kernzeit: Fokusarbeit und Calls', 'Arbeit · M02-09, M02-10'),
        ('a-essen', '12:30–13:15', 'Mittagessen gemeinsam, Gemüse aus dem Garten', 'Essen · M02-20, M02-23'),
        ('a-arbeit', '14:00–15:30', 'Angebot: gemeinsam weiterarbeiten im Kommunalgebäude', 'Arbeit · M02-40'),
        ('a-gesundheit', '16:00–17:00', 'Gemeinsamer Sport, Pflicht', 'Gesundheit · M02-45'),
        ('a-betrieb', '17:00–18:00', 'Holz hacken, diese Woche im Wechsel dran', 'Betrieb · 2.4.5'),
        ('a-freizeit', '20:00–21:30', 'Frei: Videocall mit der Familie, Rückzug', 'Freizeit · M02-37, M02-01'),
    ]),
    ('Teammitglied, Kunden in anderer Zeitzone', 'Liefert Projekte für Kunden, die später am Tag arbeiten; verlegt die Kernzeit auf den Abend (Gleitzeit).', [
        ('a-gemeinschaft', '08:30–08:45', 'Jour fixe, Pflicht', 'Gemeinschaft · M02-44'),
        ('a-betrieb', '09:00–10:30', 'Holz stapeln, Garten, im Wechsel', 'Betrieb · 2.4.5, M02-23'),
        ('a-gesundheit', '10:30–12:00', 'Frei: Sauna, Entspannung, Wandern', 'Gesundheit · M02-46, M02-45'),
        ('a-essen', '12:30–13:15', 'Mittagessen gemeinsam', 'Essen · M02-20'),
        ('a-arbeit', '13:30–15:30', 'Vorbereitung, Abstimmung im Team', 'Arbeit · M02-40'),
        ('a-gesundheit', '16:00–17:00', 'Gemeinsamer Sport, Pflicht', 'Gesundheit · M02-45'),
        ('a-arbeit', '17:00–22:00', 'Verlegte Kernzeit: Kundencalls', 'Arbeit · M02-09, M02-12'),
    ]),
]
cnt = {}
for _, _, items in DAYS:
    for c, *_ in items:
        cnt[c] = cnt.get(c, 0) + 1
NAMES = [('a-arbeit', 'Arbeit'), ('a-essen', 'Essen'), ('a-gesundheit', 'Gesundheit'), ('a-freizeit', 'Freizeit'), ('a-gemeinschaft', 'Gemeinschaft'), ('a-betrieb', 'Betrieb')]
legend = '<div class="legend">' + ''.join(f'<span><i class="sw {c}"></i>{n} ({cnt.get(c, 0)})</span>' for c, n in NAMES) + '</div>'
def kcode(k):
    head, _, codes = k.partition(' · ')
    return f'{head} · <code>{linkify(codes)}</code>'
pers = '<div class="pers">' + ''.join(
    f'<div class="pc"><h4>{html.escape(t)}</h4><p>{linkify(d)}</p><ol class="day">'
    + ''.join(f'<li class="{c}"><span class="t">{tm}</span><span class="x">{html.escape(x)}</span><span class="k">{kcode(k)}</span></li>' for c, tm, x, k in items)
    + '</ol></div>' for t, d, items in DAYS) + '</div>'
rules = ('<div class="dt-rules"><h5>Spielregeln oben: ein einfaches Leben aus Arbeit und Erholung</h5><ul>'
         '<li>Wer oben ist, konzentriert sich auf Arbeit und Erholung; Versorgung, Technik und Betrieb laufen im Hintergrund.</li>'
         '<li>Kernzeit 9 bis 14 Uhr als Gleitzeit; bei Kunden in einer anderen Zeitzone verlegbar, zum Beispiel auf den Abend. Wie das geregelt wird, ist ein Planungspunkt (<a href="#b-gleitzeit">Gleitzeit</a>).</li>'
         '<li>Pflicht: Jour fixe am Morgen und gemeinsame Aktivitäten wie Sport. Zusammen arbeiten steht offen, ist aber keine Voraussetzung.</li>'
         '<li>Frei einteilen: Wellness, Sauna, Entspannung.</li>'
         '<li>Betriebsarbeiten wie Holz hacken, Wasser und Schnee teilt sich das Team im Wechsel, nach einem Plan (' + linkify('2.4.5') + ').</li>'
         '<li>Käuferinnen und Käufer wohnen in ihrem eigenen Haus und sind frei; sie können bei allem mitmachen, müssen aber nicht (' + linkify('E63') + '). Deshalb stehen sie in keinem Tagesablauf.</li>'
         '</ul><p class="note" style="margin:6px 0 0">Vorgabe vom 05.11.2026, noch nicht im Entscheidungslog. Die Tagesabläufe sind ein Vorschlag der KI danach und gelten, bis ihr widersprecht (' + linkify('E80') + ').</p></div>')

def card(title, rows):
    MISS = ' class="miss"'
    dl = ''.join(f'<dt>{k}</dt><dd{MISS if k == "Was fehlt" else ""}>{v}</dd>' for k, v in rows)
    return f'<div class="rc"><h5>{html.escape(title)}</h5><dl>{dl}</dl></div>'
L = linkify
def see(h, t):
    return f' <a class="dt-bchip" href="{h}">{html.escape(t)}</a>'
RES = [
    ('Energie', [('Quelle', L('Netz, dazu Solar (E35); Laden der E-Bikes (E73)')), ('Reserve', L('Batterie im Warmen oder Generator draußen, Kraftstoff für 3 Tage (S03, Annahme)')),
                 ('Bei Ausfall', L('Muss-Lasten etwa 380 W ohne Pumpe laufen weiter; Batteriegröße nicht nachgewiesen (M02-30)')),
                 ('Was fehlt', L('Netzkapazität und Anschlussrecht; Lasten für Team plus 5 Käufer (O29)')), ('Planungspunkt', L('2.3.2') + see('#b-mb-strom', 'Make-or-Buy Strom'))]),
    ('Wärme', [('Quelle', L('offen: Ofen je Haus oder zentral (2.3.2); Holz aus der Umgebung (E15)')), ('Reserve', 'festlegen'),
               ('Bei Ausfall', L('mindestens 12 °C im Schlafbereich nach 8 Stunden ohne Feuer (Annahme, M02-06); Rauch- und CO-Melder (S01)')),
               ('Was fehlt', L('Heizlast je Haus bei −20 °C (H02)')), ('Planungspunkt', L('2.3.2') + see('#b-mb-waerme', 'Make-or-Buy Wärme'))]),
    ('Wasser', [('Quelle', L('Quellen auf oder bei dem Gelände (O27); 50 l je Person und Tag (E26)')), ('Reserve', L('Tank; Notvorrat Trinkwasser 60 l für 3 Personen (M02-04); 1.500 l für 10 Tage Sperre (H05)')),
                ('Bei Ausfall', 'Pumpe steht: Wasser aus Tank und Notvorrat'), ('Was fehlt', L('Schüttung im Winter, Laborwerte (O27); Garten in der Bilanz (2.3.1)')),
                ('Planungspunkt', L('2.3.2') + see('#b-mb-wasser', 'Make-or-Buy Wasser'))]),
    ('Toilette und Abwasser', [('Quelle', L('Toilette im Warmen (E38); Campingtoilette als Übergang oder Trenntoilette (A4)')), ('Reserve', 'festlegen'),
                               ('Bei Ausfall', L('frostsicher und ohne Geruch (H06)')), ('Was fehlt', L('genehmigungsfähiges Abwasserkonzept (O28)')),
                               ('Planungspunkt', L('2.3.2') + see('#b-mb-toilette', 'Make-or-Buy Toilette'))]),
    ('Internet', [('Quelle', L('eigener Anschluss (E49); zwei Videocalls gleichzeitig, etwa 8 Mbit/s Upload (D01)')), ('Reserve', L('Starlink; Mobilfunk gibt es oben nicht (E49)')),
                  ('Bei Ausfall', L('Ausweicharbeitsplatz unten, wenn die Auffahrt frei ist (M02-39)')), ('Was fehlt', L('Anbieter oben und gemessene Bandbreite (A4)')),
                  ('Planungspunkt', L('2.3.2'))]),
    ('Daten und Server', [('Quelle', L('OneDrive in Microsoft 365 (E12); Server oben, für personenbezogene Daten mit Deutschland verbunden (E85)')),
                          ('Reserve', L('Datensicherung; Wiederherstellung einer Datei getestet (S05)')), ('Bei Ausfall', L('kein Serverausfall (E46)')),
                          ('Was fehlt', L('welche Hardware und wer sie liefert; Rechtsprüfung der Datenverbindung (A5); Matching BW Bank für IT (2.1.7)')),
                          ('Planungspunkt', see('#b-technik', 'Technik im Haus') + ' ' + L('2.5.7'))]),
    ('Zugang und Sicherheit', [('Quelle', L('eigener abschließbarer Bereich je Person (S04); Zugangskontrolle mit Chip an den Türen (neu, 05.11.2026)')), ('Reserve', 'festlegen'),
                               ('Bei Ausfall', L('Rauch- und CO-Melder, Feuerlöscher (S01); Brandschutz schriftlich abgenommen (E53)')),
                               ('Was fehlt', L('wer die Zugangskontrolle liefert und einbaut; Haftung und Versicherung (S07)')),
                               ('Planungspunkt', see('#b-technik', 'Technik im Haus') + ' ' + L('2.3.3'))]),
    ('Zufahrt und Mobilität', [('Quelle', L('unbefestigte Zufahrt, letzte 200 m über 15 % (A3); E-Bikes statt Benzin (E73)')), ('Reserve', L('im Notfall in unter 2 Stunden unten (E26)')),
                               ('Bei Ausfall', L('Auffahrt gesperrt: Notfallplan und Vorräte für 10 Tage (2.4.7)')),
                               ('Was fehlt', L('wer im Winter räumt; Bestätigung des Spediteurs (2.2.4); wie viele E-Bikes und wo laden (O25)')),
                               ('Planungspunkt', see('#b-zufahrt', 'Zufahrt') + ' ' + L('O25'))]),
    ('Essen und Einkauf', [('Quelle', L('Gemüsegarten (E74); Milch und Käse vor Ort (E15); Lieferung über die Zufahrt')), ('Reserve', L('Vorrat für 10 Tage nach BBK (H07)')),
                           ('Bei Ausfall', 'Auffahrt zu: keine Lieferung'), ('Was fehlt', L('Anbieter mit Preis, Entfernung und Winterzugang (2.4.6); was der Garten wann liefert; wer zahlt (D36)')),
                           ('Planungspunkt', L('2.4.6') + see('#b-mb-essen', 'Make-or-Buy Essen'))]),
    ('Betrieb und Aufgaben', [('Quelle', 'Holz, Wasser, Schnee und Wartung im Team geteilt, nach Plan (Vorgabe 05.11.2026)'), ('Reserve', L('Vertretung je Leistung (2.4.8)')),
                              ('Bei Ausfall', L('schriftliche Absprache, nach vier Wochen überprüft (A02)')), ('Was fehlt', L('Aufgabenliste mit Personen und Stunden (2.4.5)')),
                              ('Planungspunkt', L('2.4.5') + see('#b-gleitzeit', 'Gleitzeit'))]),
    ('Gesundheit und Notfall', [('Quelle', L('Erste Hilfe und Kontakt nach unten (S02)')), ('Reserve', L('in unter 2 Stunden unten (E26)')),
                                ('Bei Ausfall', L('wer holt jemanden ab und womit (S02)')), ('Was fehlt', L('Haftung und Versicherung (S07); Abbruchregel bei Krise (O17)')),
                                ('Planungspunkt', L('2.4.7, O17'))]),
]
res_html = ('<h4 class="sub">Was der Alltag braucht: Ressourcen und Ausfall (M06)</h4><div class="res">' + ''.join(card(t, r) for t, r in RES) + '</div>'
            '<p class="note">Je Ressource drei Zustände: normaler Betrieb, Störung, Erweiterung auf Team plus 5 Käufer (' + L('E79') + '). Im Baum unter Ast 3 stehen sie einzeln, mit Ausbaupfad. Kritische Fehlerarten bewertet die Fachperson (' + L('2.3.7') + '); getestet wird im Nutzungstest (' + L('2.4.9') + '). Die nächste Autarkiestufe kommt erst nach bestandenem Test (M06).</p>')
ia = body.index('<h3 id="u-alltag">'); ib = body.index('<h3 id="u-struktur">')
old = body[ia:ib]
h3_end = old.index('</h3>') + 5
body = body[:ia] + old[:h3_end] + rules + legend + pers + res_html + '<p class="note">Dahinter stehen die Anforderungen nach Maslow und Sinnen, noch keine geprüft (Ast 2 im Baum), und der Nutzungstest mit 7 Prüfsituationen (' + L('2.4.9') + '). Technische Werte legt eine Fachperson fest (' + L('E22') + ').</p>' + body[ib:]

# ---------- Zielbild: Endprodukt und Ziele ----------
endbox = ('<div class="dt-endbox" id="u-endprodukt"><h4>Endprodukt und Ziele</h4>'
          '<p><b>Endprodukt Stufe 1:</b> 2–3 Leute wohnen und arbeiten ganzjährig oben und verdienen dort Geld (' + L('E01, E23, E24') + '). Der Betrieb trägt sich selbst, X-PORTAL stellt die Basis (' + L('E54') + ').</p>'
          '<p><b>Grundmodell:</b> leichter Transport, kommunal und gemeinschaftlich, Privatsphäre im eigenen Haus, autark Schritt für Schritt (' + L('E72') + '–' + L('E74') + ').</p><ol>'
          + ''.join(f'<li><a href="#zb-{z[0]}">{z[0]}</a> {html.escape(z[2])}: {L(z[6])}</li>' for z in ZB if z[0].startswith('Z'))
          + '</ol><p style="margin:6px 0 0"><a href="#b-zielblatt">Leitlinie, Zielblatt, Grenzen und Nutzen im Entscheidungsbaum →</a></p></div>')
body = sub_once(body, '<div class="dt-zbmap" id="u-zielbild-m02">', endbox + '<div class="dt-zbmap" id="u-zielbild-m02">')

# ---------- „unten links“ heißt die Fläche des späteren Herrenhauses ----------
HH = 'auf der Fläche des späteren Herrenhauses (im Lageplan unten links)'
for a, b in [('im Entwurf unten links', 'im Entwurf ' + HH), ('zuerst unten links', 'zuerst ' + HH),
             ('auf der Fläche unten links im Generalplan', 'auf der Fläche, auf der im Generalplan das Herrenhaus steht (unten links)'),
             ('Die Fläche unten links,', 'Die Fläche des späteren Herrenhauses (im Lageplan unten links),'),
             ('Fläche unten links', 'Fläche des späteren Herrenhauses (unten links)')]:
    body = body.replace(a, b)

# Falschaussage zu 2.5.8 gestrichen (Hinweis vom 05.11.2026)
body = sub_once(body, '<td>Förderung: Start-up BW. Die Vorhabenbeschreibung KI-Transfer-KMU ist eingereicht und weicht von euren Entscheidungen ab</td>', '<td>Förderung: Start-up BW</td>')
body = sub_once(body, '<a class="ref" href="#E57">E57</a>; <code>plan/recherchen/2026-11-03-vorhaben-abweichungen.md</code></td></tr>', '<a class="ref" href="#E57">E57</a></td></tr>')
HIST = '<p class="note" style="border-left:3px solid var(--wait);padding-left:10px"><b>Historie.</b> Stand 04.11.2026, vor der Reference Architecture v0.4. Bei Widerspruch gilt die Baseline; die bekannten Widersprüche stehen im <a href="#ra-abgleich">Abgleich</a>.</p>'
body = sub_once(body, '<section id="k1-endprodukt-und-ziele"><h2>1 Endprodukt und Ziele</h2>', '<section id="k1-endprodukt-und-ziele"><h2>1 Endprodukt und Ziele</h2>' + HIST)
body = sub_once(body, 'Als Konzept beschrieben ist ein digitaler Zwilling der Organisation', 'Als Konzept beschrieben ist ein System Model der Organisation (bisher „digitaler Zwilling“ genannt; nach der Reference Architecture v0.4 kein Digital Twin)')
body = body.rstrip() + '\n' + js + '''<script>
(() => {
  document.querySelectorAll('.dt-planbox').forEach(b => b.addEventListener('click', () => b.classList.toggle('gross')));
  const oeffne = () => { const id = decodeURIComponent(location.hash.slice(1)); const el = id && document.getElementById(id); if (!el) return; let p = el.parentElement; while (p) { if (p.tagName === 'DETAILS') p.open = true; p = p.parentElement; } el.scrollIntoView(); };
  window.addEventListener('hashchange', oeffne);
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) setTimeout(oeffne, 0); });
})();
</script>'''

_fehler = pruefe_baum(tree)
_g = zielblatt_html()
_fehler += [f'Grundlage: „{w}“' for w in ALT if w in re.sub(r'<[^>]+>', ' ', _g)]
for _w in ('Mission:', 'Globalziele, in dieser Rangfolge'):
    if _w not in _g: _fehler.append(f'Grundlage: {_w} fehlt')
if 'DETAILPLAN_SRC' in _g or 'data:image/jpeg;base64,' not in _g: _fehler.append('Detailplan fehlt in der Grundlage')
assert not _fehler, 'Alter Stand im gültigen Teil:\n' + '\n'.join(_fehler)
OUT.write_text(body)
print('ok', len(body), 'open decisions', n_dec_open, 'wait', n_wait, 'chance', n_chance, 'gates', n_gates, 'themes', len(entschieden))

# ---------- Export für Agenten: JSON und Markdown ----------
if len(sys.argv) > 3:
    import json
    outdir = Path(sys.argv[3]); outdir.mkdir(parents=True, exist_ok=True)
    def clean(n):
        d = {k: v for k, v in n.items() if v not in (None, [], '', False) and k not in ('raw', 'container', 'opened', 'label')}
        if 'kids' in d: d['kids'] = [clean(k) for k in n['kids']]
        if 'opts' in d: d['opts'] = [{k: v for k, v in o.items() if v not in (None, [], '')} for o in n['opts']]
        if 'facts' in d: d['facts'] = [{'feld': a, 'wert': b} for a, b in n['facts']]
        if n['kind'] in ('decision', 'gate') and n.get('state') in ('open', 'wait') and not n.get('container'):
            bb = re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', beschluss(n))
            d['beschlussblatt'] = {html.unescape(a): html.unescape(re.sub(r'<[^>]+>', '', b)) for a, b in bb}
        return d
    zkeys = ('nr', 'ebene', 'ziel', 'messgroesse', 'zielwert', 'klaerungsauftrag', 'termin', 'wer_review', 'grenze', 'globalziel', 'quelle')
    data = {'titel': 'X-PORTAL Index 3.0', 'stand': '2026-11-12', 'bezugsrahmen': 'Reference Architecture v0.4-WB1 (quellen/reference-architecture-v0.4.md)', 'abgleich': [dict(zip(('nr', 'thema', 'bisher', 'baseline', 'gilt', 'status', 'im_index'), r)) for r in ABGLEICH], 'artefakt': 'https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F',
            'zielblatt': [dict(zip(zkeys, z)) for z in ZB], 'anforderungen_m02': M02, 'baum': [clean(n) for n in tree]}
    (outdir / 'entscheidungsbaum.json').write_text(json.dumps(data, ensure_ascii=False, indent=1))
    WORD = {'decision': 'Entscheidung', 'chance': 'Ereignis', 'gate': 'Gate', 'step': 'Schritt', 'end': 'Ende', 'outcome': 'Ausgang', 'req': 'Anforderung', 'group': 'Ast'}
    md = ['# X-PORTAL Index 3.0: Entscheidungsbaum', '', 'Bezugsrahmen ist die Reference Architecture v0.4-WB1 (`quellen/reference-architecture-v0.4.md`); bei Widerspruch gilt sie.', '', '## Abgleich: Widersprüche zwischen Index und Baseline', '', '| Nr | Thema | Bisher im Index | Baseline v0.4 und Deck | Was jetzt gilt | Status | Im Index |', '|---|---|---|---|---|---|---|'] + ['| ' + ' | '.join(r) + ' |' for r in ABGLEICH] + ['', 'Stand 12.11.2026. Erzeugt aus `werkzeug/baum.py`; die lesbare Seite ist `index-3.html`. Quellen in Klammern (E = Entscheidung, O = offener Punkt, 2.x.y = Teilergebnis, H01 … = Anforderung).', '',
          '## Zielblatt', '', '| Nr | Ziel | Messgröße | Zielwert oder Klärungsauftrag | Termin | Wer · Review | Grenze | Globalziel | Quelle |', '|---|---|---|---|---|---|---|---|---|']
    for z in ZB:
        md.append('| ' + ' | '.join([z[0], z[2], z[3], ('Klärungsauftrag: ' if z[5] else '') + z[4], z[6], z[7], z[8], z[9], z[10]]).replace('\n', ' ') + ' |')
    md.append('')
    def walk(n, d):
        ind = '  ' * d
        lab = n.get('label') if n['kind'] == 'outcome' else None
        head = f"{ind}- **{WORD.get(n['kind'], n['kind'])}{' ' + n['id'] if n.get('id') and re.fullmatch(r'[A-Z]\d\d|G\d', n['id']) else ''}{' (' + lab + ')' if lab else ''}:** {n['title']}"
        if n.get('state'): head += f" _[{STATE.get(n['state'], n['state'])}]_"
        out = [head]
        for k in ('meta', 'text', 'hint'):
            if n.get(k): out.append(f"{ind}  - {n[k]}")
        for a, b in n.get('facts', []): out.append(f"{ind}  - {a}: {b}")
        if n.get('ziel'): out.append(f"{ind}  - Dient: {', '.join(n['ziel'])}")
        if n.get('needs'): out.append(f"{ind}  - Braucht: {', '.join(n['needs'])}")
        if n['kind'] in ('decision', 'gate') and n.get('state') in ('open', 'wait') and not n.get('container'):
            for a, b in re.findall(r'<dt>(.*?)</dt><dd>(.*?)</dd>', beschluss(n)):
                out.append(f"{ind}  - Beschlussblatt, {html.unescape(a)}: {html.unescape(re.sub(r'<[^>]+>', '', b))}")
        for o in n.get('opts', []):
            line = f"{ind}  - Möglichkeit {o['letter']}: {o['title']}" + (f" — {o['text']}" if o.get('text') else '') + (f" [{STATE[o['state']]}]" if o.get('state') else '')
            out.append(line)
            for a, b in o.get('facts', []): out.append(f"{ind}    - {a}: {b}")
        for k in n.get('kids', []): out += walk(k, d + 1)
        return out
    for n in tree:
        md += ['', f"## {n['title']}", '']
        if n.get('text'): md += [n['text'], '']
        if n.get('raw') == 'ZIELBLATT':
            md += [html.unescape(re.sub(r'<[^>]+>', '', GRUNDLAGE)).strip(), '']
        for k in n.get('kids', []): md += walk(k, 0)
    (outdir / 'entscheidungsbaum.md').write_text('\n'.join(md) + '\n')
    print('export ok', outdir)
