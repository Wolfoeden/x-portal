#!/usr/bin/env python3
"""X-PORTAL nach St. Galler Management-Modell (SGMM II, Bleicher), geschärft bis auf Werkzeugebene.

Eine Quelle für Seite (HTML), Markdown und JSON. Whitepaper und Präsentation übernehmen Zahlen von hier.
Aufruf (aus plan/sgmm):  python3 werkzeug/sgmm.py .
Schreibt sgmm.body.html (Artefakt-Inhalt), sgmm.html (eigenständig), sgmm.md, sgmm.json.

Regeln (Reference Architecture v0.4, Abschnitt 15): nichts erfinden; Werte ohne Quelle sind ASSUMPTION oder OPEN;
jedes Element nennt Systemebene, XP-SYS-IDs, Status und Node001-Relevanz (REQUIRED / PREPARE / DEFER).
Preise: Internetpreise in UAH, Suche November 2026, 50 UAH/EUR (E20), ohne Montage und Transport.
"""
import html, json, re, sys
from pathlib import Path

STAND = '13.11.2026'
KURS = 50
INDEX = 'https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F'
WP = 'https://claude.ai/artifact/8Tsy5boPuHAm5wkfqMnPeD'
ENTSCH = 'https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP'
STATUS = ['VERIFIED', 'DOCUMENTED', 'IN WORK', 'ASSUMPTION', 'OPEN', 'DECISION REQUIRED']

# ---------------------------------------------------------------- Umwelt und Anspruchsgruppen
UMWELT = [
    ('Natur', 'Karpaten, Hang, Winter mit Schnee; Heizlast bei −20 °C angenommen (H02). Ob der Grund trägt, ist offen (O01, Geologie). Quellschüttung im Februar und Laborwerte offen (O27).', 'OPEN'),
    ('Gesellschaft', 'Dorf Bereschnyzja, Ortsteil Hrun; lokale Handwerker, Holz, Milch, Käse, Transport (2.4.6). Recht für Ausländer, Haus auf fremdem Grund, Pacht: Prüfauftrag an Anwälte (A5).', 'IN WORK'),
    ('Wirtschaft', 'Preise in UAH, gerechnet mit 50 UAH/EUR (E20). Nachfrage über Warteliste (E51, E58). Produkt- und Preismodell nicht validiert (W04).', 'ASSUMPTION'),
    ('Technologie', 'Netz mit Batterie oder Generator, dazu Solar (E35); eigener Internetanschluss, Starlink als Reserve, kein Mobilfunk oben (E49). KI heute; Robotik, Drohnen und mechanische Systeme perspektivisch, nicht im MVS.', 'DOCUMENTED'),
]
ROLLEN = [  # Rolle, Stand im Plan, Stufe-1-Bezug, Status, Relevanz
    ('Mitarbeitende (Team oben)', 'Zwei bis drei Personen mit Tagesabläufen; Gleitzeit 9–14 Uhr, Jour fixe und Sport Pflicht (Vorgabe 05.11.2026).', 'Wohnen und arbeiten ab Phase 0 im Objekt', 'DOCUMENTED', 'REQUIRED'),
    ('Mieter', 'Wohnen und arbeiten zur Miete; kein Immobilienverkauf im klassischen Sinn (D45, D48). Monatliche Pauschale, erbrachte Projekt- und Gemeinschaftsleistungen werden abgezogen (D38).', 'Interessenten ab jetzt sammeln (D50); Einzug ab Phase 1', 'DOCUMENTED', 'REQUIRED'),
    ('Mitwirkende mit Beteiligung', 'Wer mitwirkt, kann am jeweiligen Node beteiligt werden, nicht an der Holding (D37). Tokenisierung erst nach Klärung (D48).', 'Struktur vor Phase 1 klären', 'DECISION REQUIRED', 'PREPARE'),
    ('Digitale Nomaden', 'Nicht im Plan der Stufe 1.', 'Später, nach Auslastungsdaten', 'OPEN', 'DEFER'),
    ('Gäste', 'Nicht im Plan der Stufe 1; Sauna und Feuerstelle als Möglichkeiten im Index.', 'Später', 'OPEN', 'DEFER'),
    ('Bauarbeiter', 'Bleiben längere Zeit oben.', 'Phase 0 und 1, im Objekt unterhalb der Herrenhaus-Fläche (D55)', 'DOCUMENTED', 'REQUIRED'),
    ('Betreiber', 'Node001 wird von einer ukrainischen Gesellschaft gehalten; wo Services abgewickelt werden, ist rechtlich zu klären (D44, OD-001).', 'Vor Phase 0', 'DECISION REQUIRED', 'REQUIRED'),
    ('Partner und Lieferanten', 'Anbieter für Objekt, Brunnen, Kläranlage, Fundament; Bauer (Holz, Räumen), Elektriker, Spediteur; Architekt in beratender Funktion (D67).', 'Ab Vor-Phase: drei Angebote je großem Posten', 'IN WORK', 'REQUIRED'),
    ('Investoren', 'Eigenkapital bis zur fertigen Bauplanung; Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen (D46, D47).', 'Nach dem Paket „Vor dem Investment“', 'IN WORK', 'REQUIRED'),
    ('Staat und Behörden', 'Genehmigungen, Anschlussrecht Strom, Abwasser (Reference Architecture 6.2).', 'Vor Phase 0', 'OPEN', 'REQUIRED'),
]

# ---------------------------------------------------------------- Bleicher-Matrix
# Ebene → (Aktivitäten, Strukturen, Verhalten); jede Zelle: (Titel, Punkte, XP-SYS, Status)
MATRIX = {
    'Normativ': [
        ('Vision und Politik', ['Vision v0.4 (Baseline Abschnitt 2) und Kerndefinition (Abschnitt 18)',
                                'Disziplin: Node001 trägt sich aus realer Nutzung; Genome- und IP-Erlöse sind Upside',
                                'Mission: in v0.4 nicht enthalten, OPEN (W01)'], 'XP-SYS-001, 004', 'DOCUMENTED'),
        ('Verfassung und Governance', ['X-PORTAL Organisation als Dach; DT Agentur übernimmt Projekte aus Deutschland; Grundstücke (X1–X3)',
                                       'Systemgrenze Organisation ↔ Node-Betrieb: OD-001',
                                       'KI bereitet vor (E13); Paul und Roman geben frei, Bestellung und Betrag Paul (E71); Vorschlag gilt ohne Widerspruch (E80)',
                                       'Änderungen an Kernbegriffen nur als CHANGE REQUEST (XP-SYS-014)'], 'XP-SYS-005, 014', 'DECISION REQUIRED'),
        ('Kultur', ['Prinzipien aus Abschnitt 5: Menschenzentrierung, Resilienz, Wartbarkeit, Messbarkeit, Lernfähigkeit',
                    'Spielregeln oben: Gleitzeit 9–14, Jour fixe und Sport Pflicht, Wellness frei, Arbeit wie Holz machen gemeinsam',
                    'Mieter sind frei in Arbeit und Tagesablauf; Gemeinschaftsarbeit wird gefördert und angerechnet (D36)'], 'XP-SYS-001', 'DOCUMENTED'),
    ],
    'Strategisch': [
        ('Programme', ['Vier Erlösstufen: Kundenprojekte, Technologielösungen, Nutzung und Services, System-Skalierung',
                       'Zwei Investment Cases: Company und Node001',
                       'Roadmap: Marktnachweis → Site Truth → Product & Economics → Financing & Permissions → Build & Operate → Learn & Replicate',
                       'Bauphasen: ein Objekt als Übergang, danach Objekte und Kommunalgebäude (D55)', 'Mietmodell mit Selbstkosten als Basis; kein klassischer Immobilienverkauf (D48, D49)'], 'XP-SYS-004', 'IN WORK'),
        ('Organisation und Standards', ['Reference Architecture v0.4 als Arbeitsbaseline',
                                        'X-PORTAL Genome v0.1: Invarianten, Module, Parameter, Regeln, Evidenz (OD-006)',
                                        'Team: Produkt und Projekt, Lead Developer; Architektur und Bau als externe Beratung (D67); Geschäftsführung in der Darstellung offen (W14)'], 'XP-SYS-006, 014', 'IN WORK'),
        ('Lernkultur', ['Evidenz statt Behauptung: jede Annahme im Assumption Register',
                        'Widersprüche werden markiert, nicht geglättet (Abgleich W01–W20)',
                        'Node002 ist der Beweismaßstab für Reproduzierbarkeit (H8)'], 'XP-SYS-010', 'DOCUMENTED'),
    ],
    'Operativ': [
        ('Aufträge', ['Node001 in Arbeitsreihenfolge: Geologie → Hausart → Zufahrt → Lieferant → Technik (Zugang, Server, Netz)',
                      'Gates G0–G4 im Index 3.0',
                      'Funktionsketten F01–F12 bis auf Werkzeug und Preis (dieses Dokument)'], 'XP-SYS-002, 003, 012', 'IN WORK'),
        ('Prozesse und Register', ['CONOPS CO-01 bis CO-06 (Entwickeln, Nutzen, Betreiben, Störung, Lernen, neuer Node)',
                                   'Beschlussblätter M03 mit Vorbereitung, Prüfung, Freigabe, Budgetgrenze, Gültigkeit, Wiedervorlage',
                                   'Asset- und Systemregister als System Model, kein Digital Twin (OD-004)'], 'XP-SYS-005, 008', 'OPEN'),
        ('Leistung und Zusammenarbeit', ['Tagesabläufe der drei Personen; Holz, Wasser, Schnee und Wartung im Wechsel nach Plan (2.4.5)',
                                         'Notfallplan und Absprachen (2.4.7)',
                                         'Feedback der Bewohner nach CO-02'], 'XP-SYS-001, 012', 'OPEN'),
    ],
}
SPALTEN = ['Aktivitäten', 'Strukturen', 'Verhalten']

# ---------------------------------------------------------------- Bauphasen
PHASEN = [
    ('Phase 0', 'Objekt als Übergang', 'Ein Wohn- und Arbeitsobjekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur für Wasser, Strom und Internet (D55). Spültoilette, Dusche, Warmwasser und Abwasser fest eingebaut (D62). Netzanschluss mit Generator als Reserve (D59).', 'Team (2–3) und Bauarbeiter (Zahl OPEN)', 'Teilsumme im Kostenregister für ein Modul mit 18 m² und zwei Personen; 69 von 137 Positionen ohne Betrag. Siehe „Vor dem Investment“.', 'ASSUMPTION'),
    ('Phase 1', 'Objekte und Kommunalgebäude', 'Zuerst das Kommunalgebäude (D64), dann Wohn- und Arbeitsobjekte für Mieter und Team. Material offen (Holz, Beton, Glas, Metall); eine Bau-KI plant nach den lokalen Gegebenheiten (D56). Solar mit Speicher, Feuerstelle, Sauna, Bergkapelle als Gruppenprojekt (D59, D34, D35).', 'Mieter, Team', 'Nicht gerechnet. Selbstkosten je Objekt aus dem Business Case (D49, OD-008).', 'OPEN'),
    ('Phase 2', 'Ausbau', 'Weitere Objekte nach Nachfrage. Die Herrenhaus-Fläche wird zuletzt bebaut.', 'Alle Rollen', 'OPEN', 'OPEN'),
]
CR = [  # früher Change Requests; seit 13.11.2026 auf der Entscheidungsseite entschieden
    ('D55', 'Container oder Objekte', 'Container sind die Tiny Houses der Käufer und bleiben (E59).', 'Ein Objekt als Übergang für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche; danach Objekte und Kommunalgebäude.', 'Antwort mit Kommentar, 13.11.2026', 'DOCUMENTED'),
    ('D56', 'Bauart', 'Tiny Houses in Teilen, oben montiert (E75).', 'Material offen (Holz, Beton, Glas, Metall); Bau-KI plant und bewertet nach lokalen Gegebenheiten.', 'Kommentar, 13.11.2026', 'OPEN'),
    ('D49', 'Preis', 'Etwa 30.000 € je Käufer (E78).', 'Selbstkostenpreis je Objekt statt Verkaufspreis; kein Immobilienverkauf im klassischen Sinn.', 'Kommentar, 13.11.2026', 'DOCUMENTED'),
    ('D46', 'Kapital Node001', 'Kein Investor; der Ort trägt sich aus Käufergeld (E57).', 'Käufermodell abgewählt; Eigenkapital plus Investoren, verbunden mit wiederkehrenden Erlösen.', 'Kommentar, 13.11.2026', 'DOCUMENTED'),
    ('D69', 'Vor dem Investment', '–', 'Welches Paket aus Eigenmitteln und Eigenleistung (Kern, Optimum, Erweitert).', 'Karte offen', 'DECISION REQUIRED'),
]

# ---------------------------------------------------------------- Funktionsketten
# Positionen: (Gegenstand, Menge, UAH von, UAH bis, Quelle, Status); None = Preis OPEN
def P(name, menge, lo, hi, quelle, status='DOCUMENTED'):
    return dict(gegenstand=name, menge=menge, uah_von=lo, uah_bis=hi, quelle=quelle, status=status)

KETTEN = [
 dict(id='F01', name='Wärme', ebene='Physische Welt', anf='S01, H02, H03, H08', sys='XP-SYS-002, 003, 009, 012', rel='REQUIRED', status='DECISION REQUIRED',
  ziel='Morgens in der Einheit warm, ohne CO-Gefahr, auch bei −20 °C und 10 Tagen Sperre.',
  kette=[('Funktion', 'Wärme je Einheit und im Kommunalgebäude'), ('Lösung', 'Holzofen mit Kochplatte je Einheit (Möglichkeit A); zentral (B) offen'),
         ('Betriebsmittel', 'Brennholz trocken, 3–6 m³ je Einheit und Winter (ASSUMPTION, aus Heizlast H02 rechnen)'),
         ('Beschaffung', 'Mix (D60): Bäume am Grundstück fällen und aufarbeiten; sie sind nass und trocknen etwa ein Jahr. Für den ersten Winter trockenes Holz zukaufen.'),
         ('Werkzeug', 'Spaltaxt, Bügelsäge, Spaltkeil, Hackklotz, Handschuhe, Schutzbrille; Motorsäge nur mit Schulung und Schnittschutz'),
         ('Lager', 'Überdachtes, belüftetes Holzlager für zwei Winter, in jedem Fall (D60); Tagesvorrat im Warmen'),
         ('Wer', 'Nachlegen jeder in der eigenen Einheit; Holz holen und spalten Team im Wechsel (2.4.5)'),
         ('Wartung', 'Schornstein reinigen (Intervall: Fachexperte), Axt schleifen, Sägeblatt tauschen'),
         ('Ausfall', 'CO- und Rauchmelder je Raum mit Ofen, Feuerlöscher; zweite Wärmequelle nach Morgenwert H02 (Möglichkeit C)')],
  wahl=('Axt oder Säge?', 'Entschieden am 13.11. (D60): beides. Eigenes Holz braucht Motorsäge mit Schutzausrüstung und Kurs; Spaltaxt, Keile und Bügelsäge für das Spalten und Nachschneiden. Haftung und Versicherung der Eigenleistung sind offen (S07).'),
  pos=[P('Holzofen mit Kochplatte', 'je Einheit', 6000, 13000, 'Index A4'),
       P('Brennholz Eiche/Hainbuche, gespalten', 'je m³', 3700, 4500, 'tsn.ua, Preise Kyjiw; Iwano-Frankiwsk nicht gefunden'),
       P('Brennholz je Einheit und Winter', '3–6 m³', 11100, 27000, 'Rechnung aus den Zeilen darüber', 'ASSUMPTION'),
       P('Spaltaxt Fiskars X21 (L), Set', '1 je Node', 3599, 4398, 'bigl.ua, vnedorognik.ua'),
       P('Motorsäge Stihl MS 180 (Option)', '1 je Node', 6519, 7310, 'zaxid.net; gebraucht ab 3.990 UAH bei prom.ua'),
       P('Bügelsäge, Spaltkeil, Schnittschutzhose, Helm', 'Satz', None, None, 'nicht gefunden', 'OPEN'),
       P('CO-Melder', 'je Raum mit Ofen', 580, 4249, 'Tuya Rauch+CO 580; Ajax FireProtect 2 3.899–4.249')],
  stunden='Nachlegen und Asche 15–30 Minuten am Tag je Einheit; Holz holen und spalten 1–2 Stunden je Woche für das Team (ASSUMPTION).'),

 dict(id='F02', name='Strom', ebene='Physische Welt', anf='S03, D04', sys='XP-SYS-002, 003, 004', rel='REQUIRED', status='DECISION REQUIRED',
  ziel='Muss-Lasten laufen bei Netzausfall weiter: Licht, Laptops, Starlink, Router, Pumpe, Kühlschrank.',
  kette=[('Funktion', 'Strom für Arbeit, Wasser, Kühlung, Licht'), ('Lösung', 'Netz mit Batterie oder Generator, dazu Solar (E35)'),
         ('Betriebsmittel', 'Netzstrom; Benzin für 3 Tage (S03, ASSUMPTION)'),
         ('Beschaffung', 'Netzanschluss beim Versorger beantragen; Elektriker vor Ort (Buy)'),
         ('Werkzeug', 'Generator 3 kW, Kanister, Außenkabel, Spannungsprüfer'),
         ('Lager', 'Batterie im Warmen, Generator draußen unter Dach'),
         ('Wer', 'Elektriker installiert und prüft; Team startet den Generator monatlich zur Probe (ASSUMPTION)'),
         ('Wartung', 'Ölwechsel und Zündkerze nach Herstellerangabe; Batterie prüfen'),
         ('Ausfall', 'Generator, dann Batterie; Muss-Lasten etwa 380 W, 3,8–4,56 kWh über 10–12 Stunden (S03)')],
  pos=[P('Netzanschluss 10–15 kW', 'einmal', 29270, 43905, 'Index A4, 2.927 UAH je kW, ohne Leitung zum Haus'),
       P('Generator 3 kW', '1', 18749, 32599, 'Black+Decker BXGNP3000E 18.749 (Aktion); Kärcher PGG 3/1 27.999; A-iPower SC3250i Inverter 32.599'),
       P('Solar-Inselanlage 4,8 kWp mit 4,8 kWh Batterie (Phase 1)', '1', 189900, 189900, 'Index A4, ohne Montage'),
       P('Kanister, Außenkabel, Spannungsprüfer', 'Satz', None, None, 'nicht gesucht', 'OPEN')],
  stunden='Probelauf 30 Minuten im Monat; im Ausfall Tanken alle paar Stunden (ASSUMPTION).'),

 dict(id='F03', name='Wasser', ebene='Physische Welt', anf='H04, H05', sys='XP-SYS-002, 003, 009', rel='REQUIRED', status='OPEN',
  ziel='Trinkwasser und warmes Wasser, auch bei 10 Tagen Sperre; Leitung frostfrei ohne Heizkabel.',
  kette=[('Funktion', 'Trink-, Koch- und Duschwasser'), ('Lösung', 'Grundwasser (Brunnen) → Pumpe → Tank → Aufbereitung zu Trinkwasser → Boiler (D61)'),
         ('Betriebsmittel', '150 l am Tag in der Anfangsstufe, 360 l im Ausbau, für 3 Personen (H05, ASSUMPTION)'),
         ('Beschaffung', 'Laboranalyse zuerst; sie bestimmt die Aufbereitung. Brunnen und Leitung durch Fachfirma.'),
         ('Werkzeug', 'Pumpe passend zur Förderhöhe, Tank, Filter, Boiler, Rohrzange, Ersatzdichtungen'),
         ('Lager', 'Tank im Warmen oder frostfrei; 1.000 l wiegen 1 t, Bodenlast prüft eine Fachexperte'),
         ('Wer', 'Fachfirma baut; Team prüft Füllstand täglich im Winter'),
         ('Wartung', 'Filter tauschen, Boiler entkalken, Laborprobe jährlich (Intervall: Fachexperte)'),
         ('Ausfall', 'Tankvorrat: 1.000 l reichen knapp 7 Tage am Anfang, knapp 3 Tage im Ausbau (H05); Trinkwasser in Kanistern')],
  pos=[P('Tauchpumpe Klarwasser Aquatica 773175, 550 W, 9,5 m', '1', 2115, 2644, 'ek.ua; passt nur bei geringer Förderhöhe'),
       P('Quell- oder Brunnenpumpe nach Förderhöhe', '1', None, None, 'Förderhöhe unbekannt', 'OPEN'),
       P('Tank 1.000 l', '1–2', 7000, 13000, 'Index A4'),
       P('Filter, gegebenenfalls UV', 'Satz', None, None, 'hängt an Laborwerten (O27)', 'OPEN'),
       P('Boiler 80 l', 'je Einheit oder zentral', 4399, 5387, 'Electrolux Quantum Pro 4.399 (nicht lieferbar); Nova Tec 4.702–5.387; bt.rozetka.com.ua')],
  stunden='Kontrolle 5 Minuten am Tag; Filterwechsel und Entkalken wenige Stunden im Jahr (ASSUMPTION).'),

 dict(id='F04', name='Abwasser und Sanitär', ebene='Physische Welt', anf='H06, D62', sys='XP-SYS-009, 011, 012', rel='REQUIRED', status='OPEN',
  ziel='Spültoilette (Klopapier spülbar), Dusche und Warmwasser ab Phase 0, fest eingebaut; Abwasser rechtlich zulässig.',
  kette=[('Funktion', 'Toilette, Dusche, Warmwasser, Abwasser'), ('Lösung', 'Kleinkläranlage oder Mehrkammergrube ab Phase 0, mit der Infrastruktur geplant (D62)'),
         ('Betriebsmittel', 'Wasser aus F03, Strom aus F02'),
         ('Beschaffung', 'Abwasserplanung und Genehmigung durch Fachexperten; Anlage mit Einbau'),
         ('Werkzeug', 'Anlage, frostfreie Leitungen mit Gefälle, Spültoilette, Dusche, Boiler'), ('Wer', 'Fachfirma baut; Team kontrolliert'),
         ('Wartung', 'Schlamm abfahren ein- bis zweimal im Jahr; ob ein Saugwagen die Zufahrt schafft, ist offen'), ('Ausfall', 'Notlösung für Sperre der Anlage: OPEN')],
  pos=[P('Kleinkläranlage für 5 Personen, nur Gerät', '1', 38000, 38000, 'Kostenregister 13.11.', 'ASSUMPTION'),
       P('Einbau der Anlage', '1', 8000, 15000, 'Kostenregister 13.11.', 'ASSUMPTION'),
       P('Abwasserplanung', '1', 5000, 10000, 'Kostenregister 13.11.', 'ASSUMPTION')],
  stunden='Kontrolle wenige Minuten je Woche (ASSUMPTION).'),

 dict(id='F05', name='Internet', ebene='Technologie', anf='Arbeitsplatz oben, E49', sys='XP-SYS-002, 003, 007', rel='REQUIRED', status='OPEN',
  ziel='Zwei gleichzeitige Videocalls, während die dritte Person arbeitet, auch bei Schnee.',
  kette=[('Funktion', 'Bezahlte digitale Arbeit oben'), ('Lösung', 'Eigener Internetanschluss, Starlink als Reserve; kein Mobilfunk oben (E49)'),
         ('Beschaffung', 'Anbieter für den Hauptanschluss: OPEN; Starlink für die Adresse auf starlink.com prüfen'),
         ('Werkzeug', 'Router mit Umschaltung, Teleskopbesen für Schnee auf der Antenne'),
         ('Wer', 'Pavel richtet ein (ASSUMPTION); Team räumt die Antenne'),
         ('Wartung', 'Firmware, Kabel prüfen'), ('Ausfall', 'Umschalten auf Starlink; Test: 30 Minuten zwei Calls über jeden Anschluss')],
  pos=[P('Starlink Mini', '1', 20820, 25900, 'Index A4'), P('Starlink Abo', 'je Monat', 2950, 2950, 'Suchergebnisse; für die Adresse prüfen'),
       P('Hauptanschluss', 'einmal und monatlich', None, None, 'Anbieter offen', 'OPEN'), P('Router mit zwei WAN', '1', None, None, 'nicht gesucht', 'OPEN')],
  stunden='Antenne freiräumen bei Schneefall, wenige Minuten (ASSUMPTION).'),

 dict(id='F06', name='Essen und Küche', ebene='Services', anf='H07, E74, E81', sys='XP-SYS-001, 002', rel='REQUIRED', status='OPEN',
  ziel='Drei Mahlzeiten am Tag; Vorrat für eine Sperre; Küche im Kommunalgebäude.',
  kette=[('Funktion', 'Kochen, Kühlen, Vorrat'), ('Lösung', 'Phase 0 Kochplatte am Ofen und Kühlschrank im Objekt; ab Phase 1 Küche im Kommunalgebäude (E74)'),
         ('Betriebsmittel', 'Lebensmittel, Vorrat für 10 Tage (ASSUMPTION, wie Wasser); Milch und Käse vor Ort (2.4.6)'),
         ('Beschaffung', 'Einkauf unten; Person A holt Lieferungen an der Auffahrt'),
         ('Werkzeug', 'Kühlschrank (im Mittel 40 W, S03), Töpfe, Vorratsregal'), ('Wer', 'Gemeinsam, nach Plan; Garten freiwillig (E74)'),
         ('Ausfall', 'Kochen auf dem Holzofen; Vorrat')],
  pos=[P('Kühlschrank', 'je Objekt', None, None, 'nicht gesucht', 'OPEN'), P('Kochfeld für das Kommunalgebäude (Phase 1)', '1', None, None, 'nicht gesucht', 'OPEN')],
  stunden='Einkauf unten 2–3 Stunden je Woche (ASSUMPTION).'),

 dict(id='F07', name='Zufahrt und Schnee', ebene='Physische Welt', anf='2.2.4, Wege sicher begehbar', sys='XP-SYS-003, 009, 012', rel='REQUIRED', status='OPEN',
  ziel='Auffahrt im Winter passierbar; Wege zu Holzlager, Toilette und Generator sicher bei Schnee und Dunkelheit.',
  kette=[('Funktion', 'Auffahrt und Wege frei'), ('Lösung', 'Auffahrt räumt ein Bauer mit Traktor per Vertrag (Buy); Wege am Haus räumt das Team (Make)'),
         ('Betriebsmittel', 'Streugut (Sand oder Splitt)'), ('Beschaffung', 'Räumvertrag mit Preis je Einsatz; Streugut lokal'),
         ('Werkzeug', 'Schneeschaufeln, Schneeschieber, Eispickel; Schneefräse nur, wenn kein Räumvertrag'),
         ('Wer', 'Team im Wechsel (2.4.5)'), ('Wartung', 'Geländer und Wegelicht prüfen vor dem Winter'),
         ('Ausfall', 'Auffahrt zu: Arbeit läuft oben weiter (E46, E54); Vorrat aus F03 und F06')],
  pos=[P('Schneeschaufel', '3–4', 270, 427, 'Epicentr: mit Holzstiel 270, Lemira groß 427 (je Stück)'),
       P('Räumvertrag Auffahrt', 'je Einsatz', None, None, 'mit Bauer verhandeln', 'OPEN'),
       P('Schneefräse Benzin (Option)', '1', None, None, 'nicht gefunden', 'OPEN')],
  stunden='Wege räumen 30–60 Minuten je Schneefall (ASSUMPTION).'),

 dict(id='F08', name='Mobilität', ebene='Physische Welt', anf='D65', sys='XP-SYS-002, 004', rel='REQUIRED', status='ASSUMPTION',
  ziel='Einkauf, Notfall und kleine Lasten über die Auffahrt, auch im Winter.',
  kette=[('Funktion', 'Personen und kleine Lasten bewegen'), ('Lösung', 'Ein gemeinsames geländegängiges Fahrzeug; keine E-Bikes in Phase 0 (D65)'),
         ('Betriebsmittel', 'Kraftstoff'), ('Werkzeug', 'Fahrzeug, Winterreifen, Schneeketten, Abschleppseil'),
         ('Wer', 'Team; Wartung im Wechsel'), ('Ausfall', 'Bauer mit Traktor')],
  pos=[P('Geländegängiges Fahrzeug, gebraucht', '1', 170507, 170507, 'Kostenregister 13.11.', 'ASSUMPTION'), P('Winterreifen', '4', 10968, 10968, 'Kostenregister 13.11., ohne Ketten', 'ASSUMPTION')],
  stunden='Pflege wenige Stunden im Jahr (ASSUMPTION).'),

 dict(id='F09', name='Wartung und Reparatur', ebene='Organisation', anf='2.4.5, 2.4.6', sys='XP-SYS-008, 012', rel='REQUIRED', status='OPEN',
  ziel='Kritische Systeme unter lokalen Bedingungen wartbar; Ersatzteile oben.',
  kette=[('Funktion', 'Instand halten'), ('Lösung', 'Wartungsplan je Asset im Asset- und Systemregister'),
         ('Betriebsmittel', 'Ersatzteile: Sicherungen, Filter, Dichtungen, Pumpe als Reserve'), ('Beschaffung', 'Handwerker vor Ort (2.4.6), Ersatzteile auf Vorrat'),
         ('Werkzeug', 'Werkzeugkoffer, Akkuschrauber, Leiter, Stirnlampe'), ('Wer', 'Team im Wechsel; Fachfirma für Strom und Wasser'),
         ('Ausfall', 'Reservepumpe, Kontakt Handwerker, Notbetrieb nach CO-04')],
  pos=[P('Werkzeugkoffer und Akkuschrauber', 'Satz', None, None, 'nicht gefunden', 'OPEN')],
  stunden='Wartungsrunde 1–2 Stunden je Woche (ASSUMPTION).'),

 dict(id='F10', name='Notfall und Sicherheit', ebene='Querschnitt', anf='S01, S07, 2.4.7', sys='XP-SYS-003, 009', rel='REQUIRED', status='OPEN',
  ziel='Brand, CO, Verletzung und Abschneiden werden erkannt und beherrscht.',
  kette=[('Funktion', 'Personen schützen'), ('Lösung', 'Melder, Löscher, Erste Hilfe, Notfallplan, Kommunikation'),
         ('Beschaffung', 'Kaufen; Erste-Hilfe-Kurs für alle'), ('Werkzeug', 'Rauch- und CO-Melder, Feuerlöscher je Einheit, Erste-Hilfe-Set, Stirnlampen'),
         ('Wer', 'Alle; Notfallplan verantwortet Roman (ASSUMPTION)'), ('Wartung', 'Melder monatlich testen, Löscher nach Prüffrist'),
         ('Ausfall', 'Rettungszeit nach unten und Hubschrauberplatz: OPEN')],
  pos=[P('Rauch- und CO-Melder', 'je Raum mit Ofen', 580, 4249, 'siehe F01'), P('Feuerlöscher', 'je Einheit', None, None, 'nicht gefunden', 'OPEN'),
       P('Erste-Hilfe-Set', 'je Einheit', None, None, 'nicht gefunden', 'OPEN')],
  stunden='Melder testen 10 Minuten im Monat; Kurs einmalig (ASSUMPTION).'),

 dict(id='F11', name='Zugang, Server und Daten', ebene='Technologie', anf='Technik-Schritt, OD-004', sys='XP-SYS-007, 008, 009, 013', rel='PREPARE', status='OPEN',
  ziel='Türen per Chip; Daten lokal gesichert; kein Serverausfall (E46).',
  kette=[('Funktion', 'Zugang und Daten'), ('Lösung', 'Chip-Türöffnung je Einheit; kleiner Server (NAS) mit Sicherung außer Haus'),
         ('Betriebsmittel', 'Strom aus F02 über kleine USV'), ('Werkzeug', 'RFID-Schloss, NAS, USV'),
         ('Wer', 'Pavel richtet ein (ASSUMPTION)'), ('Wartung', 'Updates, Sicherung prüfen'), ('Ausfall', 'Mechanischer Schlüssel als Reserve')],
  pos=[P('NAS Synology DS224+', '1', 20200, 20750, 'EU-Shops rund 404–415 €, ohne Platten'), P('RFID-Schloss', 'je Tür', None, None, 'nicht gefunden', 'OPEN')],
  stunden='Pflege 1 Stunde im Monat (ASSUMPTION).'),

 dict(id='F12', name='Wohnen und Arbeiten (Objekt)', ebene='Physische Welt', anf='D55, D56', sys='XP-SYS-001, 004, 006', rel='REQUIRED', status='OPEN',
  ziel='Phase 0: ein Objekt für Team und Bauarbeiter; ab Phase 1 Wohn- und Arbeitsobjekte zur Miete.',
  kette=[('Funktion', 'Wohnen, Arbeiten, Rückzug'), ('Lösung', 'Bauart offen: Holz, Beton, Glas, Metall; Bau-KI plant nach lokalen Gegebenheiten (D56)'),
         ('Beschaffung', 'Drei schriftliche Angebote; kaufen oder mieten'),
         ('Werkzeug', 'Kleines Fahrzeug für den Transport in Phase 0 (D57); Fundament nach geprüfter Geologie'),
         ('Wer', 'Fachexperte Bau plant und nimmt ab; Architekt berät'), ('Ausfall', 'OPEN')],
  pos=[P('Modul 18 m² mit Transport und Montage laut Anbieter', '1', 674900, 674900, 'Kostenregister 13.11.', 'ASSUMPTION')],
  stunden='Montage: OPEN, Herstellerangabe.'),
]

LERNEN = ['Anforderung', 'Annahme / Designentscheidung', 'Implementierung', 'Betrieb', 'Datenerfassung', 'Analyse', 'Bewertung', 'Entscheidung', 'Anpassung', 'neuer Standard']
NEU_W = [
    ('W19', 'Container oder Objekte', 'Container sind die Tiny Houses der Käufer und bleiben (E59)', 'Ein Objekt als Übergang, danach Objekte und Kommunalgebäude', 'Entschieden in D55 am 13.11.2026', 'DOCUMENTED'),
    ('W20', 'Preis', 'Etwa 30.000 € je Käufer (E78)', 'Selbstkostenpreis je Objekt; kein klassischer Verkauf', 'Entschieden in D49 am 13.11.2026; Zahlen aus OD-008', 'DOCUMENTED'),
    ('W21', 'Mission', 'Baseline v0.4 nennt keine Mission', 'Mission und Globalziele bleiben Ausgangspunkt (Kommentar D42)', 'Harmonisierung offen', 'DECISION REQUIRED'),
]

# ---------------------------------------------------------------- Ausgabe
e = html.escape
def eur(u): return f'{round(u / KURS):,}'.replace(',', '.')
def uah(u): return f'{u:,}'.replace(',', '.')
def preis(p):
    if p['uah_von'] is None: return 'OPEN'
    a, b = p['uah_von'], p['uah_bis']
    if a == b: return f'{uah(a)} UAH · {eur(a)} €'
    return f'{uah(a)}–{uah(b)} UAH · {eur(a)}–{eur(b)} €'
SCLS = {'VERIFIED': 'ok', 'DOCUMENTED': 'doc', 'IN WORK': 'doc', 'ASSUMPTION': 'ass', 'OPEN': 'ass', 'DECISION REQUIRED': 'dec'}
def st(s): return f'<span class="st st-{SCLS[s]}">{e(s)}</span>'
def rel(r): return f'<span class="rel">{e(r)}</span>'

CSS = '''
:root { --bg:#f3f5f1; --paper:#fff; --ink:#10201a; --body:#33423b; --muted:#66756d; --line:#d9dfd8; --forest:#1d5a3c; --forest-bg:#e2efe6; --amber:#8a5a00; --amber-bg:#f6ecd4; --slate:#2c5378; --slate-bg:#e2ebf4; --red:#9b2c2c; --red-bg:#f8e3e1;
  --display:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif; --text:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; --red:#f2a49c; --red-bg:#3a1c1a; color-scheme:dark } }
:root[data-theme="dark"] { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; --red:#f2a49c; --red-bg:#3a1c1a; color-scheme:dark }
* { box-sizing:border-box }
body { background:var(--bg); color:var(--body); font-family:var(--text); font-size:16px; line-height:1.55; margin:0; padding:0 max(16px, env(safe-area-inset-right, 0px)) 72px max(16px, env(safe-area-inset-left, 0px)) }
.sg { max-width:1100px; margin:0 auto; display:flex; flex-direction:column; gap:48px; padding-top:28px }
h1 { font-family:var(--display); font-size:clamp(30px,5vw,48px); line-height:1.05; letter-spacing:-.02em; color:var(--ink); margin:0; text-wrap:balance }
h2 { font-family:var(--display); font-size:clamp(22px,3vw,28px); line-height:1.15; color:var(--ink); margin:0; text-wrap:balance }
h3 { font-family:var(--display); font-size:17px; color:var(--ink); margin:0 }
p { margin:0; max-width:75ch }
section, header { display:flex; flex-direction:column; gap:14px }
.eyebrow, .num { font-family:var(--mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--forest); margin:0 }
.lead { font-size:18px; color:var(--ink) }
nav.toc { display:flex; flex-wrap:wrap; gap:6px } nav.toc a { font-size:14px; border:1px solid var(--line); background:var(--paper); border-radius:999px; padding:4px 12px; text-decoration:none; color:var(--ink) }
a { color:var(--forest) }
.card { background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:14px 16px; display:flex; flex-direction:column; gap:6px; min-width:0 }
.grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(min(100%,240px),1fr)) }
.st { font-family:var(--mono); font-size:11px; padding:2px 8px; border-radius:999px; white-space:nowrap; display:inline-block }
.st-ok { background:var(--forest-bg); color:var(--forest) } .st-doc { background:var(--slate-bg); color:var(--slate) } .st-ass { background:var(--amber-bg); color:var(--amber) } .st-dec { background:var(--red-bg); color:var(--red) }
.rel { font-family:var(--mono); font-size:11px; padding:1px 7px; border:1px solid var(--line); border-radius:4px; color:var(--muted) }
.meta { display:flex; flex-wrap:wrap; gap:6px; align-items:center; font-size:13px; color:var(--muted) }
.matrix { display:grid; grid-template-columns:130px repeat(3, minmax(0,1fr)); gap:8px }
.matrix .hd { font-family:var(--mono); font-size:11.5px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); align-self:end }
.matrix .lv { font-family:var(--display); font-weight:600; color:var(--ink); padding-top:14px }
.matrix ul, .card ul { margin:0; padding-left:18px; font-size:14.5px } .matrix li, .card li { margin:3px 0 }
@media (max-width:760px) { .matrix { grid-template-columns:1fr } .matrix .hd { display:none } .matrix .lv { padding-top:10px; border-top:2px solid var(--forest) } .matrix .card h3::before { content:attr(data-col) " · "; color:var(--muted); font-weight:500 } }
.tw { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--paper) }
table { border-collapse:collapse; width:100%; font-size:14.5px }
th, td { text-align:left; vertical-align:top; padding:9px 11px; border-top:1px solid var(--line) }
thead th { border-top:0; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); font-weight:500 }
td.id { font-family:var(--mono); font-size:12.5px; color:var(--forest); white-space:nowrap }
.ph { display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(min(100%,300px),1fr)) }
.ph .card { border-top:4px solid var(--forest) } .ph .card:first-child { border-top-color:var(--amber) } .ph .card:last-child { border-top-color:var(--slate) }
.ph dl { margin:0; display:grid; gap:4px; font-size:14px } .ph dt { font-family:var(--mono); font-size:11px; text-transform:uppercase; color:var(--muted) } .ph dd { margin:0 0 6px }
details.f { background:var(--paper); border:1px solid var(--line); border-radius:6px }
details.f > summary { list-style:none; cursor:pointer; padding:14px 16px; display:flex; flex-wrap:wrap; gap:8px 12px; align-items:center }
details.f > summary::-webkit-details-marker { display:none }
details.f > summary::before { content:"+"; font-family:var(--mono); color:var(--forest); width:14px } details.f[open] > summary::before { content:"−" }
details.f > summary b { font-family:var(--display); font-size:17px; color:var(--ink) } details.f > summary .id { font-family:var(--mono); color:var(--forest); font-size:13px }
details.f > summary .z { flex-basis:100%; font-size:14px; color:var(--body); padding-left:26px }
.fb { padding:0 16px 16px; display:flex; flex-direction:column; gap:12px }
ol.chain { list-style:none; margin:0; padding:0; display:grid; gap:0 }
ol.chain li { display:grid; grid-template-columns:130px minmax(0,1fr); gap:10px; padding:7px 0; border-top:1px dashed var(--line); font-size:14.5px }
ol.chain li span { font-family:var(--mono); font-size:11.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--forest); padding-top:2px }
@media (max-width:560px) { ol.chain li { grid-template-columns:1fr; gap:2px } }
.wahl { border-left:4px solid var(--red); background:var(--red-bg); padding:10px 14px; border-radius:0 6px 6px 0; color:var(--ink); font-size:14.5px }
.loop { display:flex; flex-wrap:wrap; gap:6px; align-items:center; font-size:14px } .loop span { background:var(--paper); border:1px solid var(--line); border-radius:999px; padding:4px 11px; color:var(--ink) } .loop i { color:var(--muted); font-style:normal }
.note { font-size:13.5px; color:var(--muted) }
footer { font-size:13px; color:var(--muted); border-top:1px solid var(--line); padding-top:14px }
'''

def build_html():
    o = []
    o.append(f'''<div class="sg">
<header><p class="eyebrow">X-PORTAL · Managementarchitektur nach SGMM II · Stand {STAND}</p>
<h1>Von der Vision bis zur Axt</h1>
<p class="lead">X-PORTAL und Node001 nach dem St. Galler Management-Modell: normativ, strategisch, operativ. Jede kritische Funktion ist bis auf Betriebsmittel, Werkzeug, Preis, Person und Ausfall heruntergebrochen.</p>
<p class="note">Bezugsrahmen ist die Reference Architecture v0.4-WB1. Werte ohne Quelle sind ASSUMPTION oder OPEN. Preise sind Internetpreise in UAH (Suche 12.11.2026 und Kostenregister 13.11.2026), umgerechnet mit 50 UAH/EUR, ohne Montage und Transport, sofern nicht anders genannt. Vorschläge der KI sind keine Entscheidungen; entschieden wird auf der <a href="{ENTSCH}">Entscheidungsseite</a>. Plan im Detail: <a href="{INDEX}">Index 3.0</a> · <a href="https://claude.ai/artifact/Xt8ocuZNXnnwsZNfAfPsoY">Anschaffungsliste</a> · <a href="https://claude.ai/artifact/2zHiqw7dU8oHFnsZWBsh1P">Vor dem Investment</a> · Investoren: <a href="{WP}">Whitepaper</a>.</p>
<div class="meta">Status: {" ".join(st(s) for s in STATUS)} · Relevanz für Node001: {rel("REQUIRED")} {rel("PREPARE")} {rel("DEFER")}</div>
<nav class="toc"><a href="#umwelt">Umwelt</a><a href="#matrix">SGMM-Matrix</a><a href="#bauphasen">Bauphasen</a><a href="#change">Entschieden 13.11.</a><a href="#ketten">Funktionsketten</a><a href="#lernen">Lernkreislauf</a><a href="#abgleich">Neue Widersprüche</a></nav></header>''')
    # Umwelt
    o.append('<section id="umwelt"><p class="num">01 · Umwelt und Anspruchsgruppen</p><h2>Wer und was auf Node001 einwirkt</h2><div class="grid">')
    for n, t, s in UMWELT: o.append(f'<div class="card"><h3>{e(n)}</h3><p>{e(t)}</p><div class="meta">{st(s)}</div></div>')
    o.append('</div><div class="tw"><table><thead><tr><th>Anspruchsgruppe</th><th>Stand im Plan</th><th>Stufe 1</th><th>Status</th><th>Node001</th></tr></thead><tbody>')
    for r, a, b, s, rr in ROLLEN: o.append(f'<tr><td><b>{e(r)}</b></td><td>{e(a)}</td><td>{e(b)}</td><td>{st(s)}</td><td>{rel(rr)}</td></tr>')
    o.append('</tbody></table></div><p class="note">Die Rollen der Infografik werden gegen OD-003 (Human Roles v1.0, IN WORK) abgeglichen; der Plan arbeitet bis dahin mit Team und Mietern (W08). Bauarbeiter sowie Staat und Behörden sind ergänzt.</p></section>')
    # Matrix
    o.append('<section id="matrix"><p class="num">02 · Managementmatrix nach Bleicher</p><h2>Drei Ebenen, je Aktivitäten, Strukturen und Verhalten</h2><div class="matrix"><div></div>')
    o.append(''.join(f'<div class="hd">{c}</div>' for c in SPALTEN))
    for lv, cells in MATRIX.items():
        o.append(f'<div class="lv">{lv}</div>')
        for col, (t, pts, sysid, s) in zip(SPALTEN, cells):
            o.append(f'<div class="card"><h3 data-col="{col}">{e(t)}</h3><ul>{"".join(f"<li>{e(x)}</li>" for x in pts)}</ul><div class="meta">{st(s)} {e(sysid)}</div></div>')
    o.append('</div></section>')
    # Bauphasen
    o.append('<section id="bauphasen"><p class="num">03 · Bauphasen</p><h2>Ein Objekt für den Anfang, danach Objekte und Kommunalgebäude</h2><p>Stand der Entscheidung D55 vom 13.11.2026. Termine sind Ziele; jede Phase braucht die Freigabe über die Gates.</p><div class="ph">')
    for p, t, was, wer, kosten, s in PHASEN:
        o.append(f'<div class="card"><p class="eyebrow">{p}</p><h3>{e(t)}</h3><dl><dt>Was</dt><dd>{e(was)}</dd><dt>Für wen</dt><dd>{e(wer)}</dd><dt>Kosten</dt><dd>{e(kosten)}</dd></dl><div class="meta">{st(s)}</div></div>')
    o.append('</div></section>')
    # CR
    o.append('<section id="change"><p class="num">04 · Entschieden am 13.11.2026</p><h2>Was sich gegenüber dem alten Log geändert hat</h2><p>Die früheren Entscheidungen E01–E85 sind zurückgenommen. Auf der <a href="https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP">Entscheidungsseite</a> gelten Wahl und Kommentar zusammen.</p><div class="tw"><table><thead><tr><th>Karte</th><th>Betrifft</th><th>Früher im Log</th><th>Jetzt</th><th>Beleg</th><th>Status</th></tr></thead><tbody>')
    for i, t, alt, neu, q, s in CR: o.append(f'<tr><td class="id">{i}</td><td><b>{e(t)}</b></td><td>{e(alt)}</td><td>{e(neu)}</td><td>{e(q)}</td><td>{st(s)}</td></tr>')
    o.append('</tbody></table></div></section>')
    # Ketten
    o.append('<section id="ketten"><p class="num">05 · Ausführungsebene</p><h2>Funktionsketten bis zum Werkzeug</h2><p>Jede Kette folgt demselben Muster: Funktion → Lösung → Betriebsmittel → Beschaffung → Werkzeug → Lager → wer → Wartung → Ausfall. Wo eine Wahl besteht, steht sie rot markiert. Aufklappen für Details.</p>')
    for k in KETTEN:
        o.append(f'<details class="f" id="{k["id"]}"><summary><span class="id">{k["id"]}</span><b>{e(k["name"])}</b>{st(k["status"])}{rel(k["rel"])}<span class="z">{e(k["ziel"])}</span></summary><div class="fb">')
        o.append(f'<div class="meta">Systemebene: {e(k["ebene"])} · Anforderungen: {e(k["anf"])} · {e(k["sys"])}</div><ol class="chain">')
        o.append(''.join(f'<li><span>{e(a)}</span><div>{e(b)}</div></li>' for a, b in k['kette']))
        o.append('</ol>')
        if k.get('wahl'): o.append(f'<p class="wahl"><b>{e(k["wahl"][0])}</b> {e(k["wahl"][1])}</p>')
        o.append('<div class="tw"><table><thead><tr><th>Gegenstand</th><th>Menge</th><th>Preis</th><th>Quelle</th><th>Status</th></tr></thead><tbody>')
        for p in k['pos']: o.append(f'<tr><td><b>{e(p["gegenstand"])}</b></td><td>{e(p["menge"])}</td><td style="white-space:nowrap">{e(preis(p))}</td><td>{e(p["quelle"])}</td><td>{st(p["status"])}</td></tr>')
        o.append(f'</tbody></table></div><p class="note">Zeitaufwand: {e(k["stunden"])}</p></div></details>')
    o.append('</section>')
    # Lernen
    o.append('<section id="lernen"><p class="num">06 · Lernkreislauf</p><h2>Wie aus Betrieb ein Standard wird</h2><div class="loop">' + '<i>→</i>'.join(f'<span>{x}</span>' for x in LERNEN) + '</div><p>Für Node001 heißt das konkret: Jede Annahme in den Funktionsketten (zum Beispiel 3–6 m³ Holz je Einheit und Winter) wird im ersten Winter gemessen. Der Messwert ersetzt die Annahme und geht als Parameter ins Genome (XP-SYS-010, CO-05).</p></section>')
    # Abgleich
    o.append('<section id="abgleich"><p class="num">07 · Abgleich</p><h2>Neue Widersprüche zu W01–W18</h2><div class="tw"><table><thead><tr><th>ID</th><th>Thema</th><th>Bisher</th><th>Jetzt</th><th>Lösung</th><th>Status</th></tr></thead><tbody>')
    for w in NEU_W: o.append(f'<tr><td class="id">{w[0]}</td><td><b>{e(w[1])}</b></td><td>{e(w[2])}</td><td>{e(w[3])}</td><td>{e(w[4])}</td><td>{st(w[5])}</td></tr>')
    o.append('</tbody></table></div></section>')
    o.append(f'<footer>Erzeugt aus plan/sgmm/werkzeug/sgmm.py im Repo Wolfoeden/x-portal, Stand {STAND}. Grundlage: Reference Architecture v0.4-WB1, Investor Deck 11.2026, Infografik „Integrierte Managementarchitektur · SGMM II“, Index 3.0. Keine Anlageberatung, kein Angebot.</footer></div>')
    return '\n'.join(o)

def build_md():
    L = [f'# X-PORTAL nach SGMM II: von der Vision bis zur Axt', '', f'Stand {STAND}. Bezugsrahmen Reference Architecture v0.4-WB1. Preise in UAH, 50 UAH/EUR (E20), Internetpreise November 2026.', '',
         '## 01 Umwelt', ''] + [f'- **{n}** [{s}]: {t}' for n, t, s in UMWELT] + ['', '## Anspruchsgruppen', '', '| Rolle | Stand | Stufe 1 | Status | Node001 |', '|---|---|---|---|---|']
    L += [f'| {r} | {a} | {b} | {s} | {rr} |' for r, a, b, s, rr in ROLLEN]
    L += ['', '## 02 SGMM-Matrix', '']
    for lv, cells in MATRIX.items():
        for col, (t, pts, sysid, s) in zip(SPALTEN, cells):
            L.append(f'### {lv} · {col}: {t} [{s}; {sysid}]')
            L += [f'- {x}' for x in pts] + ['']
    L += ['## 03 Bauphasen', '']
    for p, t, was, wer, kosten, s in PHASEN: L += [f'### {p}: {t} [{s}]', f'- Was: {was}', f'- Für wen: {wer}', f'- Kosten: {kosten}', '']
    L += ['## 04 Entschieden am 13.11.2026', '', '| ID | Betrifft | Heute | Vorschlag | Anlass | Status |', '|---|---|---|---|---|---|']
    L += [f'| {i} | {t} | {alt} | {neu} | {q} | {s} |' for i, t, alt, neu, q, s in CR]
    L += ['', '## 05 Funktionsketten', '']
    for k in KETTEN:
        L += [f'### {k["id"]} {k["name"]} [{k["status"]}; {k["rel"]}]', f'Ziel: {k["ziel"]}', f'Systemebene {k["ebene"]}; Anforderungen {k["anf"]}; {k["sys"]}', '']
        L += [f'- {a}: {b}' for a, b in k['kette']]
        if k.get('wahl'): L += [f'- **{k["wahl"][0]}** {k["wahl"][1]}']
        L += ['', '| Gegenstand | Menge | Preis | Quelle | Status |', '|---|---|---|---|---|']
        L += [f'| {p["gegenstand"]} | {p["menge"]} | {preis(p)} | {p["quelle"]} | {p["status"]} |' for p in k['pos']]
        L += ['', f'Zeitaufwand: {k["stunden"]}', '']
    L += ['## 06 Lernkreislauf', '', ' → '.join(LERNEN), '', '## 07 Neue Widersprüche', '', '| ID | Thema | Bisher | Jetzt | Lösung | Status |', '|---|---|---|---|---|---|']
    L += ['| ' + ' | '.join(w) + ' |' for w in NEU_W]
    return '\n'.join(L) + '\n'

def build_json():
    return dict(stand=STAND, kurs_uah_eur=KURS, statusmodell=STATUS,
                umwelt=[dict(sphaere=n, text=t, status=s) for n, t, s in UMWELT],
                anspruchsgruppen=[dict(rolle=r, stand=a, stufe1=b, status=s, node001=rr) for r, a, b, s, rr in ROLLEN],
                matrix={lv: {col: dict(titel=t, punkte=pts, xp_sys=sysid, status=s) for col, (t, pts, sysid, s) in zip(SPALTEN, cells)} for lv, cells in MATRIX.items()},
                bauphasen=[dict(phase=p, titel=t, was=was, fuer=wer, kosten=kosten, status=s) for p, t, was, wer, kosten, s in PHASEN],
                change_requests=[dict(id=i, betrifft=t, heute=alt, vorschlag=neu, anlass=q, status=s) for i, t, alt, neu, q, s in CR],
                funktionsketten=KETTEN, lernkreislauf=LERNEN,
                abgleich_neu=[dict(zip(['id', 'thema', 'bisher', 'jetzt', 'loesung', 'status'], w)) for w in NEU_W])

if __name__ == '__main__':
    out = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
    body = f'<title>X-PORTAL SGMM</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n<style>{CSS}</style>\n{build_html()}'
    (out / 'sgmm.body.html').write_text(body)
    (out / 'sgmm.html').write_text(f'<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">{body.split(chr(10),1)[0]}{fonts}<style>{CSS}</style></head><body>{build_html()}</body></html>\n')
    (out / 'sgmm.md').write_text(build_md())
    (out / 'sgmm.json').write_text(json.dumps(build_json(), ensure_ascii=False, indent=1))
    ids = re.findall(r' id="([^"]+)"', body); assert len(ids) == len(set(ids)), 'doppelte IDs'
    print('ok', len(KETTEN), 'Ketten', sum(len(k['pos']) for k in KETTEN), 'Positionen')
