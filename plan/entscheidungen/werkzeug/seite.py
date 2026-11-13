#!/usr/bin/env python3
"""Entscheidungsseite Node001, neu aufgesetzt am 13.11.2026: alle früheren Entscheidungen E01–E85 sind zurückgenommen
und werden auf neuen Karten (D34–D38, D42–D68) neu getroffen.

Eingaben (aus plan/entscheidungen):
  quellen/entscheidungsseite-2026-11-04.html  gesicherte alte Seite: Kopf, Stil, Generalplan-Bilder und Speicher-Skript werden übernommen
  archiv/log-E01-E84.json                     die 84 früheren Log-Einträge (E01–E85, E48 fehlt schon im Original)
  archiv/wahl-2026-11-04/wahl/*.json          die 30 früheren Antworten (Wahl, Kommentar)
Aufruf:  python3 werkzeug/seite.py .   → entscheidungsseite.html (Artefakt-Inhalt), entscheidungen.md, entscheidungen.json

Regeln: Vorschläge der KI sind markiert und nie vorgewählt. Eine Entscheidung gilt erst, wenn sie auf der Seite gewählt ist.
Die Speicherlogik der alten Seite bleibt unverändert: jede Karte speichert in der Sammlung `wahl` unter ihrer ID.
"""
import html, json, re, sys
from pathlib import Path

STAND = '13.11.2026'  # Antworten vom 13.11. liegen in antworten-2026-11-13/
INDEX = 'https://claude.ai/artifact/FFCJBeXkZAUyrREAbvZz9F'
SGMM = 'https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G'
WP = 'https://claude.ai/artifact/8Tsy5boPuHAm5wkfqMnPeD'

def K(id, q, why, opts, frueher=(), bereich=None):
    return dict(id=id, frage=q, warum=why, opts=opts, frueher=list(frueher), bereich=bereich)
def o(letter, title, text, ki=False):
    return dict(v=letter, titel=title, text=text, ki=ki)

ABSCHNITTE = [
 ('vorinvest', 'Vor dem Investment: was aus Eigenkapital und Eigenleistung geht', [
  K('D69', 'Welches Paket vor dem Investment?',
    'Richtwert etwa 10.000 € Eigenkapital; möglichst viel Eigenleistung, um einen höheren Eigenanteil zu halten. Die Beträge kommen aus dem Kostenregister vom 13.11. (Teilschätzung, keine Angebote). Nicht enthalten sind Reisen, Architektenhonorar, Gebühren und Gründungskosten. Details auf der Seite „Vor dem Investment“.',
    [o('A', 'Kern', 'Nachweise auf Papier (Geologie-Prüfung, Zusatzerkundung, Vermessung, Wasseranalyse, Planung, Rechtsprüfung, Angebote), Werkzeug und Kurse, Holz schlagen und einlagern, Interessenten und Unterlagen. 3.226–6.172 € (mit Reserve bis 7.098 €).'),
     o('B', 'Optimum', 'Kern, dazu Netzanschluss beantragen und den Entwässerungsgraben bauen. 4.403–8.236 € (mit Reserve bis 9.472 €).', ki=True),
     o('C', 'Erweitert', 'Optimum, dazu den Brunnen bohren. Beweist Wasser am Ort; Tiefe unbekannt. 5.119–9.825 € (mit Reserve bis 11.299 €).')]),
  K('D70', 'Wie wird Eigenleistung bewertet und belegt?',
    'Im Optimum stecken rund 443 Stunden eigene Arbeit. Ob und mit welchem Satz sie als Einlage zählt, ist eine Steuer- und Rechtsfrage.',
    [o('A', 'Stundenbuch plus Steuerberater', 'Jede Stunde mit Datum, Rolle, Tätigkeit und Foto festhalten; der Steuerberater legt fest, wie sie in die Gesellschaft eingeht.', ki=True),
     o('B', 'Nur dokumentieren', 'Stunden und Ergebnisse festhalten und Investoren zeigen, ohne sie zu bewerten.'),
     o('C', 'Mit deutschem Stundensatz ansetzen', 'Eigenleistung mit einem Marktsatz aus Deutschland bewerten und als Einlage verhandeln.')]),
  K('D71', 'Ab wann sprechen wir Investoren an?',
    'Für Investoren zählen geprüfte Nachweise. Das Deck nennt als Gate: belastbares Kostenband, validiertes Revenue Model, rechtliche Struktur, messbare Meilensteine, klarer Kapitalbedarf.',
    [o('A', 'Nach Stufe A', 'Sobald Geologie geprüft, Wasser analysiert, Struktur geklärt und je großem Posten drei Angebote da sind. Erste Gespräche zum Kennenlernen schon vorher.', ki=True),
     o('B', 'Sofort mit dem heutigen Stand', 'Gespräche jetzt führen, mit offenen Punkten klar benannt.'),
     o('C', 'Erst nach dem ersten Winter', 'Warten, bis Messreihen, trockenes Holz und erste Mieter-Interessenten vorliegen.')]),
  K('D72', 'Welche offenen Kosten zuerst mit Angeboten belegen?',
    'Im Register haben 69 von 137 Positionen keinen Betrag. Die größten Unbekannten bestimmen den Kapitalbedarf.',
    [o('A', 'Die fünf größten Posten', 'Objekt Phase 0, Fundament mit Stützkonstruktion, Brunnen mit Aufbereitung, Kläranlage mit Einbau, Netzanschluss mit Leitung.', ki=True),
     o('B', 'Alles nach Maslow', 'Zuerst Grundbedürfnisse (Wärme, Wasser, Sanitär), dann Sicherheit, dann Arbeit und Verbindung.'),
     o('C', 'Phase 1 gleich mit', 'Zusätzlich Richtangebote für Wohn- und Arbeitsobjekte und das Kommunalgebäude.')]),
 ]),
 ('normativ', 'Normativ: wofür und nach welchen Regeln', [
  K('D42', 'Vision und Mission: was gilt?',
    'Die Reference Architecture v0.4 bringt eine neue Vision und eine Kerndefinition, aber keine Mission (Abgleich W01). Die alte Mission „Innovationshubs“ und die drei Globalziele stammen aus der Zeit davor.',
    [o('A', 'Vision v0.4, keine eigene Mission', 'Es gilt die Vision v0.4 mit Kerndefinition. Mission und Globalziele entfallen; die Ziele stehen im Zielblatt (Z1–Z4).', ki=True),
     o('B', 'Vision v0.4 plus Mission', 'Die Vision v0.4 gilt; die Mission „Innovationshubs“ bleibt als kurze Fassung für Website und Pitch.'),
     o('C', 'Vision v0.4 plus neue Mission', 'Die KI entwirft eine Mission, die zur Vision v0.4 passt; ihr entscheidet sie danach.')],
    ['E28', 'E29']),
  K('D43', 'Wer bereitet vor, wer prüft, wer gibt frei?',
    'Bisher: Die KI macht, was sie kann, ein Mensch prüft; technische Werte legt eine Fachexperte fest; Vorschläge der KI gelten bis zum Widerspruch; die Geschäftsführung entscheidet über Bestellungen und Betrag. Die Baseline verlangt nachvollziehbare Entscheidungsrechte (OD-001, XP-SYS-005).',
    [o('A', 'Wie bisher, aber ohne stilles Gelten', 'KI bereitet vor, Fachexperte prüft Technik, Geschäftsführung und Projektleitung geben frei, die Geschäftsführung entscheidet über Bestellung und Betrag. Ein Vorschlag der KI gilt erst, wenn er auf dieser Seite gewählt ist.', ki=True),
     o('B', 'Wie bisher', 'Alles wie vor dem 13.11., auch: Vorschläge der KI gelten, bis Geschäftsführung oder Projektleitung widersprechen.'),
     o('C', 'Mit Budgetgrenzen', 'Wie A; zusätzlich darf die Projektleitung bis zu einer festen Summe allein bestellen. Die Summe legt die Geschäftsführung fest.')],
    ['E13', 'E16', 'E22', 'E71', 'E80']),
  K('D44', 'Organisation: wer ist was?',
    'Vorgabe vom 05.11.: X-PORTAL als Dach, die DT Agentur übernimmt Projekte aus Deutschland, Grundstücke als eigener Bereich (X1–X3). Die Baseline nennt die Firma „X-PORTAL Organisation“; die Grenze zum Node-Betrieb ist offen (OD-001). Bisher: UG, später GmbH, ein SPV je Grundstück; heute tritt ein Einzelunternehmen auf.',
    [o('A', 'Drei Einheiten', 'X-PORTAL Organisation (Dach, Plattform, Architektur), DT Agentur (Projekte aus Deutschland), Node001 als eigene Grundstücks- und Betriebsgesellschaft. Rechtsform je Einheit prüft ein Steuerberater.', ki=True),
     o('B', 'Eine Firma, Node001 als SPV', 'Eine UG für alles außer dem Grundstück; Node001 bekommt ein eigenes SPV.'),
     o('C', 'Erst eine Firma', 'Alles läuft vorerst über eine Gesellschaft; getrennt wird erst, wenn Investoren einsteigen.')],
    ['E07', 'E08', 'E17', 'E18', 'E19', 'E61']),
  K('D45', 'Ziel der Stufe 1: wer wohnt und arbeitet oben?',
    'Bisher: 2–3 Leute ganzjährig oben, die Projektleitung von Anfang an; im ersten Winter Team plus 5 Käufer; Remote-Freelancer aus Deutschland als Zielgruppe. Die Infografik nennt acht Rollen, Human Roles v1.0 sind in Arbeit (OD-003, W08).',
    [o('A', 'Erst das Team', 'Stufe 1 heißt: 2–3 Leute vom Team wohnen und arbeiten ganzjährig oben und verdienen dort Geld. Käufer ziehen ab Phase 1 in ihre Häuser.', ki=True),
     o('B', 'Team plus erste Käufer', 'Team und die ersten Käufer wohnen schon im ersten Winter oben; Versorgung für beide.'),
     o('C', 'Team plus Mieter', 'Zuerst Team und einige Mieter (Remote-Freelancer, Buchung etwa ein Jahr); Verkauf an Käufer später.')],
    ['E01', 'E23', 'E24', 'E42', 'E69', 'E79']),
 ]),
 ('strategisch', 'Strategisch: womit und in welcher Reihenfolge', [
  K('D46', 'Kapital für Node001: woher?',
    'Bisher: kein Investor für den Ort, er trägt sich aus Käufergeld; externes Kapital später über fraktionalisierte Grundstücke on chain. Deck und Baseline: Node001 ist ein eigener Project- oder Asset-Case (W03).',
    [o('A', 'Eigener Project-Case', 'Node001 wird als eigener Investment Case geprüft: Kapital für Infrastruktur und ersten Bauabschnitt, getrennt von der Firma. Käufergeld kommt dazu.', ki=True),
     o('B', 'Aus Käufergeld', 'Wie bisher: Der Ort trägt sich aus dem Geld der Käufer und Eigenleistung; kein Investor im Ort.'),
     o('C', 'Mischung mit Schwelle', 'Erst Käufergeld bis zu einer Schwelle; reicht es nicht, kommt ein Investor in den Ort.')],
    ['E04', 'E05', 'E30', 'E57']),
  K('D47', 'Kapital für die Firma: woher?',
    'Bisher: Umsatz aus Projekten aus Deutschland; Pre-Seed von VC und Start-up BW erlaubt; Matching der BW Bank für IT. Das Deck nennt Pre-Seed oder Equity-ähnlich, Struktur offen.',
    [o('A', 'Projektumsatz plus Förderung', 'Zuerst Umsatz aus Projekten und Förderprogramme; Pre-Seed erst mit Revenue Model und Meilensteinen.', ki=True),
     o('B', 'Pre-Seed jetzt', 'Eine Pre-Seed-Runde wird jetzt vorbereitet, parallel zu Projekten.'),
     o('C', 'Nur Projektumsatz', 'Kein externes Kapital für die Firma; sie wächst aus Projekten.')],
    ['E31', 'E85']),
  K('D48', 'Was kaufen oder mieten Siedler?',
    'Bisher: Haus kaufen, Grund pachten, angeboten über die Blockchain; Mieten mit Monatsmiete nach dem Einzug. Deck und Baseline: Miete oder geeignetes Eigentums- oder Nutzungsmodell, wird validiert; kein öffentliches Angebot von Kryptowerten (W04). Rechtsprüfung A5 offen.',
    [o('A', 'Haus kaufen, Grund pachten', 'Käufer besitzen ihr Haus und pachten den Grund; Miete ist auch möglich. Ob und wie Token dazukommen, entscheidet ihr nach der Rechtsprüfung.', ki=True),
     o('B', 'Nur Miete am Anfang', 'In Phase 1 wird nur vermietet; Verkauf erst, wenn Recht und Preis geklärt sind.'),
     o('C', 'Token wie bisher', 'Haus und Nutzung werden über die Blockchain verkauft und gemietet, wie im alten Modell.')],
    ['E47', 'E50', 'E52']),
  K('D49', 'Hausgröße und Preis je Haus',
    'Bisher: etwa 30.000 € je Käufer, 45 m² je Haus. Ein Holzhaus mit 45 m² kostet im Rohbau grob 19.800–36.000 €, ohne Innenausbau, Transport und Anschlüsse (ASSUMPTION, SGMM F12, W20). Die frühere Frage, was die 30.000 € umfassen (D40) und was 45 m² sind (D41), ist hier enthalten.',
    [o('A', 'Erst rechnen, dann festlegen', 'Größe und Preis kommen aus dem parametrischen Business Case (OD-008) mit Herstellerangeboten. Bis dahin keine Preisangabe nach außen.', ki=True),
     o('B', 'Kleines Haus für 30.000 €', 'Der Preis bleibt bei 30.000 €; das Haus wird so klein, dass es mit Anschluss passt (etwa 20–25 m²).'),
     o('C', '45 m² mit höherem Preis', 'Das Haus hat 45 m² Wohnfläche; der Preis folgt aus den Kosten und liegt über 30.000 €.')],
    ['E78', 'E84']),
  K('D50', 'Verkaufsstart und Schwelle zum Bestellen',
    'Bisher: Verkauf ab Januar 2027, Warteliste als Nachfragebeleg, bestellt wird bei 5 Käufern mit belegtem Geld und 100 auf der Warteliste. Termine sind laut Deck Ziele, keine Zusagen (W06). Auf der Website heißt der Ort bisher nur „Ukraine“.',
    [o('A', 'Warteliste jetzt, Verkauf nach Gate', 'Die Warteliste läuft mit Bildern und Ablauf; verkauft wird erst nach Rechtsprüfung, Preis und Gate G2. Die Schwelle zum Bestellen steht im Business Case.', ki=True),
     o('B', 'Wie bisher', 'Verkauf ab Januar 2027; bestellt wird bei 5 Käufern mit belegtem Geld.'),
     o('C', 'Erst Mieter', 'Zuerst Mieter gewinnen; der Verkauf startet, wenn die ersten Häuser stehen.')],
    ['E51', 'E58', 'E66']),
  K('D51', 'Was verkauft die Firma?',
    'Bisher: oben werden KI-Agenten gebaut und je Aufruf verkauft (Masumi); das Team liefert alle Projekte; Einstieg ab 490 €, dann Preismodell offen; erster bezahlter Auftrag bis Januar 2027; Drohnen und Robotik gestrichen. Heute: vier Erlösstufen, Stufe 02 heißt Technologielösungen (KI zuerst, später Robotik, Drohnen, Mechanik).',
    [o('A', 'Vier Erlösstufen', 'Kundenprojekte heute, Technologielösungen in Entwicklung, Nutzung und Services am Node, Skalierung später. Preismodell je Stufe offen.', ki=True),
     o('B', 'Projekte und Agenten', 'Nur Kundenprojekte und eigene KI-Agenten; Robotik und Drohnen bleiben draußen.'),
     o('C', 'Erst Projekte', 'Bis zum ersten Bauabschnitt nur Kundenprojekte; eigene Produkte danach.')],
    ['E56', 'E63', 'E70', 'E76', 'E77', 'E83']),
  K('D52', 'Einkommen der Geschäftsführung und die Reihenfolge des Geldes',
    'Bisher: Die Geschäftsführung braucht 8.000 € netto im Monat für Vollzeit, das kommt vor den Kosten auf dem Berg; aber es soll nicht im Mittelpunkt stehen. Im Zielblatt steht dieser Punkt nicht mehr (Vorgabe Projektleitung).',
    [o('A', 'Als Kostenzeile', '8.000 € netto stehen als Kostenzeile der Firma im Business Case, ab dem Monat, in dem die Geschäftsführung Vollzeit dabei ist. Keine eigene Reihenfolge.', ki=True),
     o('B', 'Wie bisher zuerst', 'Das Einkommen der Geschäftsführung kommt vor allen anderen Kosten.'),
     o('C', 'Erst später', 'Das Einkommen der Geschäftsführung kommt erst, wenn die Firma Umsatz hat; bis dahin keine Zeile im Plan.')],
    ['E03', 'E32', 'E67']),
  K('D53', 'Zahlen für Investoren: 12 Mio. und 12,5 Mio. €',
    'Bisher: rund 12 Mio. € Erlös auf dem Papier „rechtfertigen das Invest“; 12,5 Mio. € sind eine Hochrechnung der Kosten; der Pitch sagte „privat finanziert“, das wurde berichtigt. Grundstück 2 ha. Baseline: Scheingenauigkeit vermeiden, Business Case offen (W05, W07). Die frühere Karte D39 ist hier enthalten.',
    [o('A', 'Intern lassen', 'Beide Zahlen bleiben intern und kommen in keine Investorenunterlage, bis der Business Case steht.', ki=True),
     o('B', 'Als Größenordnung zeigen', 'Im Gespräch als grobe Größenordnung nennen, klar als Annahme gekennzeichnet.'),
     o('C', 'Neu rechnen lassen', 'Die KI rechnet beide Zahlen mit Quellen neu, dann entscheidet ihr.')],
    ['E60', 'E65', 'E82']),
 ]),
 ('operativ', 'Operativ: wer macht was, womit, wann (in Arbeitsreihenfolge)', [
  K('D54', 'Geologie und Lageplan: wer, bis wann?',
    'Der Geologiebericht (3 Schürfe, 12 Bohrpunkte) fehlt; davon hängen Plots, Fundament und alle Kosten ab (O01). Bisher: der Architekt ist beauftragt und macht die Abnahmen; den Kontakt hält die Geschäftsführung; Generalplan Variante 1 ist Grundlage, Grundstücksdaten reichen.',
    [o('A', 'Architekt mit Frist', 'Der Architekt liefert den Bericht mit fester Frist; die Geschäftsführung hält den Kontakt. Danach Lageplan auf Variante 1 und Plots ausmessen.', ki=True),
     o('B', 'Zweite Fachexperte', 'Wie A, dazu prüft eine zweite Fachexperte den Bericht.'),
     o('C', 'Neu ausschreiben', 'Geologie und Abnahmen werden neu vergeben.')],
    ['E06', 'E10', 'E27', 'E33', 'E37', 'E43', 'E64']),
  K('D55', 'Bauphasen: Container nur für den Anfang?',
    'Vorgabe vom 12.11.: Container nur für den Anfang, danach richtige Häuser wie auf dem Titelbild. Bisher galt: Container sind die Tiny Houses der Käufer und bleiben (W19). Siehe Abschnitt Bauphasen oben.',
    [o('A', 'Container nur Übergang', 'Phase 0 Container für Team und Bauarbeiter auf der Herrenhaus-Fläche; Phase 1 Holzhäuser und Kommunalgebäude; Phase 2 Ausbau, die Herrenhaus-Fläche zuletzt.', ki=True),
     o('B', 'Container auch für Käufer', 'Wie bisher: Käufer bekommen Container als Tiny House.'),
     o('C', 'Ohne Container', 'Kein Übergang; Team und Bauarbeiter wohnen bis zum ersten Haus unten im Ort.')],
    ['E34', 'E39', 'E40', 'E41', 'E44', 'E45', 'E59']),
  K('D56', 'Hausart in Phase 1',
    'Grundmodell bisher: leichter Transport, kommunal, gemeinschaftlich, autark; Häuser in Teilen (Rahmen oder Paneele), oben montiert. Die Wahl hängt an Geologie (D54) und Zufahrt (D57).',
    [o('A', 'Holzfertighaus in Teilen', 'Bausatz vom Hersteller, Teile auf kleinem Fahrzeug hoch, oben montiert. Angebote mit schwerstem Teil und Montagezeit.', ki=True),
     o('B', 'Holzrahmenbau vor Ort', 'Ein lokaler Zimmerer baut vor Ort aus Holz; Material kommt in kleinen Mengen hoch.'),
     o('C', 'Fertigmodul', 'Ganze Module mit Kran; nur wenn die Zufahrt es trägt.')],
    ['E72', 'E75']),
  K('D57', 'Zufahrt und Transport',
    'Die Zufahrt ist heute unbefestigt; Befestigung und Entwässerung sind geplant (2.2.4). Die Einfahrt liegt vermutlich oben links in Variante 1. Im Winter räumt nach SGMM F07 am besten ein Bauer mit Traktor.',
    [o('A', 'Befestigen vor Phase 1', 'Zufahrt wird vor den Häusern befestigt; Spediteur bestätigt schriftlich, was hochkommt; Räumvertrag für den Winter.', ki=True),
     o('B', 'Erst kleines Fahrzeug', 'Keine Befestigung am Anfang; alles kommt auf kleinem Fahrzeug hoch.'),
     o('C', 'Fachexperte entscheidet', 'Der Fachexperte legt nach der Geologie fest, was nötig ist.')],
    ['E36']),
  K('D58', 'Bauzeit und Termine',
    'Bisher: gebaut im Sommer, gewohnt auch im Winter; Baubeginn erst ohne Frost; Container ab März, Werbung „Einzug ab Frühjahr 2027“. Deck: Baubeginn 2027 ist Ziel, nur nach Gates (W06).',
    [o('A', 'Ziele mit Gates', 'Baubeginn 2027 ist Ziel, sobald der Boden frostfrei ist und die Gates erreicht sind. Kein Einzugstermin in der Werbung.', ki=True),
     o('B', 'Wie bisher', 'Container ab März 2027, Werbung „Einzug ab Frühjahr 2027“.'),
     o('C', 'Später', 'Baubeginn erst 2028, mehr Zeit für Planung und Kapital.')],
    ['E02', 'E21', 'E38', 'E55']),
  K('D59', 'Strom',
    'Bisher: Netz mit Batterie oder Generator, dazu Solar. Muss-Lasten etwa 380 W (S03). Preise: Netzanschluss etwa 2.927 UAH je kW, Generator 3 kW 18.749–32.599 UAH, Solar 4,8 kWp 189.900 UAH (SGMM F02).',
    [o('A', 'Netz plus Generator, Solar ab Phase 1', 'Phase 0: Netzanschluss und Generator als Reserve. Phase 1: Solar mit Speicher dazu.', ki=True),
     o('B', 'Gleich mit Solar', 'Netz, Generator und Solar von Anfang an.'),
     o('C', 'Ohne Netz', 'Inselanlage mit Solar, Speicher und Generator.')],
    ['E35']),
  K('D60', 'Wärme, und: Axt oder Säge?',
    'Holzofen je Haus kostet 6.000–13.000 UAH; Brennholz 3.700–4.500 UAH je m³, 3–6 m³ je Haus und Winter (ASSUMPTION). CO-Melder Pflicht (S01). Details: SGMM F01.',
    [o('A', 'Holz kaufen, Axt und Bügelsäge', 'Holzofen je Haus; Brennholz ofenfertig kaufen; Spaltaxt und Bügelsäge für Nachschnitt. Motorsäge erst mit Schulung und Schutzausrüstung.', ki=True),
     o('B', 'Selbst machen mit Motorsäge', 'Rundholz kaufen und selbst sägen und spalten; Motorsäge, Schnittschutz und Schulung von Anfang an.'),
     o('C', 'Zentrale Wärme', 'Eine zentrale Wärmequelle für mehrere Häuser statt Öfen.')],
    []),
  K('D61', 'Wasser',
    'Quellfassung → Pumpe → Tank → Filter → Boiler. Bisher: 50 l je Person und Tag für den Anfang; Notfall in unter 2 Stunden unten. Schüttung und Laborwerte offen (O27). Details: SGMM F03.',
    [o('A', 'Anfangsstufe, Ausbau vorbereitet', 'Tank für 10 Tage Sperre in der Anfangsstufe; Leitung und Boiler für den Ausbau vorbereitet.', ki=True),
     o('B', 'Gleich Ausbaustufe', 'Speicher und Leitung gleich für 120 l je Person und Tag.'),
     o('C', 'Nach Laborwerten', 'Erst Laborprobe und Schüttung im Februar, dann entscheiden.')],
    ['E26']),
  K('D62', 'Toilette und Abwasser',
    'Phase 0 Campingtoilette (1.600–3.700 UAH); dauerhaft Kleinkläranlage oder Komposttoilette, mit Genehmigung (SGMM F04).',
    [o('A', 'Camping jetzt, Anlage ab Phase 1', 'Campingtoilette in Phase 0; die dauerhafte Lösung plant eine Fachexperte mit Genehmigung für Phase 1.', ki=True),
     o('B', 'Komposttoilette dauerhaft', 'Komposttoiletten in allen Häusern, keine Kläranlage.'),
     o('C', 'Kläranlage sofort', 'Die dauerhafte Anlage kommt schon in Phase 0.')],
    []),
  K('D63', 'Internet',
    'Bisher: eigener Anschluss, Starlink als Reserve, kein Mobilfunk oben. Starlink Mini 20.820–25.900 UAH plus 2.950 UAH im Monat; Test: zwei Videocalls gleichzeitig (SGMM F05).',
    [o('A', 'Eigener Anschluss plus Starlink', 'Wie bisher; Anbieter für den Hauptanschluss wird gesucht, Router mit Umschaltung.', ki=True),
     o('B', 'Nur Starlink am Anfang', 'Phase 0 nur mit Starlink, Hauptanschluss ab Phase 1.'),
     o('C', 'Zwei Satelliten', 'Zwei Starlink-Anschlüsse statt Kabel.')],
    ['E49']),
  K('D64', 'Kommunalgebäude und Garten',
    'Bisher: eigenes Kommunalgebäude mit Arbeitsplatz, Küche und Sanitär; Gemüsegarten für Autarkie; vor Ort prüfen, was es gibt (Holz, Milch, Käse, Sauna, Reparatur).',
    [o('A', 'Zuerst in Phase 1', 'Das Kommunalgebäude ist der erste Bau in Phase 1, vor den Häusern der Käufer; Garten daneben.', ki=True),
     o('B', 'Mit den Häusern', 'Kommunalgebäude und Häuser parallel.'),
     o('C', 'In Phase 0 aus Containern', 'Wie im Entwurf vom 04.11.: zwei Container als Gemeinschaftsplatz, festes Gebäude später.')],
    ['E15', 'E74']),
  K('D65', 'Mobilität',
    'Bisher: E-Bikes statt Benzin, das Netz wird dafür ausgebaut. E-Bike 27.028–32.989 UAH; im Winter auf Schnee fraglich (SGMM F08).',
    [o('A', 'E-Bikes plus Winterlösung', 'E-Bikes im Sommer; im Winter Fahrdienst oder Bauer für die Auffahrt.', ki=True),
     o('B', 'Nur E-Bikes', 'Wie bisher, nur E-Bikes.'),
     o('C', 'Gemeinsames Fahrzeug', 'Ein geländegängiges Fahrzeug für alle, dazu E-Bikes.')],
    ['E73']),
  K('D66', 'Betrieb: alles muss laufen',
    'Bisher: Vorrang „alles läuft immer“ (kein Serverausfall, kein Problem mit Strom oder Wasser); Betrieb autark wie ein organisches System; Grundversorgung nach Maslow in fester Reihenfolge; vor dem ersten Übernachten ist alles abgenommen. Baseline: Zielwerte je kritischer Funktion offen (OD-002).',
    [o('A', 'Zielwerte je Funktion', 'Für jede kritische Funktion (SGMM F01–F12) Ausfallzeit, Notbetrieb und Reserve festlegen; Abnahme vor dem ersten Übernachten.', ki=True),
     o('B', 'Wie bisher', '„Alles läuft immer“ als Grundsatz, ohne Zielwerte.'),
     o('C', 'Schritt für Schritt', 'Zuerst Toilette, Küche, Strom, Wasser, Internet, Schlafplatz; Zielwerte nach dem ersten Winter.')],
    ['E14', 'E46', 'E53', 'E54']),
  K('D67', 'Team, Rollen und Alltag oben',
    'Bisher: Geschäftsführung (CEO) zu 100 %, Projektleitung für Produkt und Projekt und oben; Architekt beauftragt. Das Deck nennt drei Personen als operatives Team (W14). Vorgabe vom 05.11.: Gleitzeit 9–14 Uhr, Jour fixe und Sport Pflicht, Wellness frei, Käufer frei.',
    [o('A', 'Rollen klären, Spielregeln wie Vorgabe', 'Founder, Ownership und Rollen werden vor dem Investorenkontakt festgelegt; oben gelten die Spielregeln vom 05.11.', ki=True),
     o('B', 'Wie im Pitch', 'Rollen wie bisher: Geschäftsführung (CEO), Projektleitung für Produkt und Projekt.'),
     o('C', 'Mit Architekt im Team', 'Der Architekt wird Teammitglied (Architekt Nodes), nicht Auftragnehmer.')],
    ['E62', 'E81']),
  K('D68', 'Arbeitsweise: Ablage, Kosten, Nachfrage',
    'Bisher: Ablage in OneDrive; Kosten mit Internetpreisen, Kurs etwa 50 UAH/EUR; keine Nachfrage messen ohne Produkt; ein Plan in einer Datei; Maslow und Sinne als Gliederung; wiederholbar sind Schema und Planung. Baseline: System Model, Traceability, Genome.',
    [o('A', 'Repo als Quelle, Regeln der Baseline', 'Plan, Entscheidungen und Archiv im Repo; Ablage OneDrive für Dokumente; Kosten mit Internetpreisen und Quelle; Gliederung nach Maslow, Sinnen und SGMM.', ki=True),
     o('B', 'Wie bisher', 'Alles wie vor dem 13.11.'),
     o('C', 'Alles in OneDrive', 'Plan und Entscheidungen auch in OneDrive, Repo nur für Agenten.')],
    ['E09', 'E11', 'E12', 'E20', 'E25', 'E68']),
 ]),
 ('alltag', 'Alltag oben (offen seit 04.11., Texte angepasst)', [
  K('D34', 'Restaurant/Bar und Feuerstelle aus dem Zielbild: wann?',
    'Das Zielbild zeigt eine Feuerstelle mit Grill und ein Restaurant mit Bar. Gastronomie braucht Gäste, Personal, Hygiene und eigene Nachweise (M02-25 bis M02-27); die Feuerstelle braucht Brandschutz und einen windarmen Platz (M02-21, M02-22).',
    [o('A', 'Beides später', 'Stufe 1 ohne Feuerstelle und Gastronomie; beides bekommt einen eigenen Plan.'),
     o('B', 'Feuerstelle jetzt, Gastronomie später', 'Feuerstelle mit Grill am Kommunalgebäude in Phase 1, mit Prüfauftrag Brandschutz.'),
     o('C', 'Beides in Stufe 1', 'Feuerstelle und kleine Gastronomie; dann braucht der Plan Gästezahl, Personal, Hygiene und Kosten.')]),
  K('D35', 'Sauna: eigene oder im Ort?',
    'Sauna gehört zum Alltag oben, wenn ihr das so entscheidet (D67). Eine eigene Sauna braucht Holz oder Strom, Wasser und Brandschutz.',
    [o('A', 'Eigene Sauna in Phase 1', 'Am Kommunalgebäude, mit Kosten und Brandschutz.'),
     o('B', 'Erst im Ort, eigene später', 'Am Anfang eine Sauna in der Umgebung (2.4.6).'),
     o('C', 'Keine Sauna', 'Gesundheit oben heißt Laufen, Wandern, Sport (M02-45).')]),
  K('D36', 'Essen oben: wie wird es bezahlt?',
    'Offen ist, ob Essen inklusive ist, bezahlt wird oder gegen Mitarbeit geht. Das geht in die Leistungsliste (2.1.8) und in die Kosten je Haus.',
    [o('A', 'Monatspauschale', 'Gemeinsames Essen in einer monatlichen Pauschale; privat auf eigene Kosten.'),
     o('B', 'Selbst bezahlt', 'Jede Mahlzeit oder jeder Einkauf wird bezahlt.'),
     o('C', 'Gegen Mitarbeit', 'Wer in Küche oder Garten mitarbeitet, isst ohne Zahlung; Stunden werden erfasst.')]),
  K('D37', 'Wie wird das Team oben bezahlt?',
    'Offen ist, wie die Leute oben Geld bekommen. Das hängt an D44 (Organisation) und D51 (was die Firma verkauft).',
    [o('A', 'Honorar je Projekt', 'Honorar je Projekt; Wohnen und Essen zahlen die Leute selbst.'),
     o('B', 'Anteil am Umsatz', 'Fester Anteil am Umsatz der Projekte, an denen jemand arbeitet.'),
     o('C', 'Wohnen und Essen frei, dazu Anteil', 'Wohnen und Essen oben frei, dazu ein kleinerer Anteil am Umsatz.')]),
  K('D38', 'Wie zahlen Siedler für Leistungen oben?',
    'Strom, Wasser, Internet, Sauna und Coworking müssen bezahlt werden. Das hängt am Produktmodell (D48).',
    [o('A', 'Monatliche Pauschale', 'Feste Nebenkostenpauschale für alle Leistungen.'),
     o('B', 'Nach Verbrauch', 'Strom und Wasser nach Zähler, Sauna und Coworking je Nutzung.'),
     o('C', 'Im Preis enthalten', 'Leistungen stecken im Kaufpreis, der Pacht oder der Miete.')]),
 ]),
]

ANS = 'https://claude.ai/artifact/Xt8ocuZNXnnwsZNfAfPsoY'
VOR = 'https://claude.ai/artifact/2zHiqw7dU8oHFnsZWBsh1P'
# Was aus Wahl und Kommentar vom 13.11.2026 folgt. Wo der Kommentar die Wahl ändert, gilt der Kommentar.
FOLGT = {
 'D42': 'Mission und Globalziele bleiben der Ausgangspunkt. Aufgabe: mit Vision v0.4 und Zielblatt in eine durchgehende Logik bringen.',
 'D43': 'Rollenbasiert: Texte nennen Rollen statt Namen; „Fachexperte“ statt „Fachperson“. Ein KI-Vorschlag gilt erst mit Wahl auf dieser Seite.',
 'D44': 'X-PORTAL hält als Holding Lizenzen und Markenrechte. Die DT Agentur übernimmt Projekte in Deutschland, Österreich und der Schweiz. Node001 hält eine ukrainische Gesellschaft. Offen: wo Services am Node abgewickelt werden (voraussichtlich lokale Gesellschaft); Rechtsprüfung.',
 'D45': 'Team plus Mieter. Es gibt keinen Immobilienverkauf im klassischen Sinn.',
 'D46': 'Das Käufermodell ist abgewählt. Node001 wird mit Eigenkapital und VC oder Investments finanziert, verbunden mit wiederkehrenden Erlösen.',
 'D47': 'Eigenkapital bis zur fertigen Bauplanung; Infrastruktur und Objekte mit Investoren. Förderung wird nicht öffentlich gezeigt, nur was Kapitalgeber verlangen. IT-Matching der BW Bank nur bei VC-Funding.',
 'D48': 'Nur Miete am Anfang; kein klassischer Verkauf. Tokenisierung und Beteiligung auf mehreren Ebenen erst nach Klärung.',
 'D49': 'Statt eines Preises je Haus wird der Selbstkostenpreis je Objekt ermittelt.',
 'D50': 'Zuerst Mieter gewinnen, schon vor dem Bau: Interessenten jetzt sammeln.',
 'D51': 'Vier Erlösstufen; Skalierung und Standardisierung werden von Anfang an mitgedacht, Node001 ist der Proof of Concept.',
 'D52': 'Noch unklar.',
 'D53': 'Die KI rechnet beide Zahlen mit Quellen neu; danach Entscheidung.',
 'D54': 'Der Geologiebericht liegt als KI-Zusammenfassung vor (XPB-N001-GEO-SUM-001, nicht geprüft). Fachprüfung und Freigabe fehlen.',
 'D55': 'Phase 0: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur für Wasser, Strom und Internet. Phase 1: Wohn- und Arbeitsobjekte und Kommunalgebäude. Phase 2: Ausbau.',
 'D56': 'Material offen (Holz, Beton, Glas, Metall). Eine Bau-KI plant und bewertet nach den lokalen Gegebenheiten.',
 'D57': 'Phase 0: voraussichtlich kleines Fahrzeug, keine Befestigung. Gesamtplanung der Zufahrt in Phase 1 mit 3D-Modellen.',
 'D58': 'Baubeginn 2027 als Ziel, nur nach Gates; kein Einzugstermin in der Werbung.',
 'D59': 'Netzanschluss beantragen, Generator als Reserve; Solar mit Speicher ab Phase 1.',
 'D60': 'Mix: Ofen mit Plan zum Überwintern; eigene Bäume fällen (nass, müssen trocknen) und Holz kaufen; Holzlager in jedem Fall.',
 'D61': 'Grundwasser nutzen und zu Trinkwasser aufbereiten; Anfangsstufe bauen, Ausbau vorbereiten.',
 'D62': 'Spültoilette (Klopapier spülbar), Dusche, Warmwasser und Abwasser fest eingebaut ab Phase 0.',
 'D63': 'Bandbreite, Router und Anbieter vergleichen; steht in der Anschaffungsliste.',
 'D64': 'Kommunalgebäude ist der erste Bau in Phase 1.',
 'D65': 'Gemeinsames Fahrzeug; keine E-Bikes in Phase 0.',
 'D66': 'Zielwerte je kritischer Funktion; Tabelle der Abnahme-Entscheidungen, die Projektleitung prüft und gibt frei.',
 'D67': 'Rollen wie im Pitch. Der Architekt berät zu Architektur und Bau und ist kein Teammitglied.',
 'D68': 'Repo als Quelle und Regeln der Baseline; vieles ist noch zu klären.',
 'D34': 'Feuerstelle in Phase 1, Gastronomie später. Die Bergkapelle wird als Gruppenprojekt der Bewohner geplant und so kommuniziert.',
 'D35': 'Eigene Sauna in Phase 1.',
 'D36': 'Essen gegen Mitarbeit. Gemeinschaftsarbeit (Schnee, Pflanzen, Kapelle, Kehrwoche) wird gefördert und mit wenig Aufwand erfasst, voraussichtlich über Zugangstechnik auf Cardano.',
 'D37': 'Wohnen und Essen frei plus Anteil; der Anteil liegt am jeweiligen Node, nicht an der Holding. Die Unternehmensstruktur muss das abbilden.',
 'D38': 'Monatliche Pauschale; erbrachte Projekt- und Gemeinschaftsleistungen werden abgezogen. Weiter zu besprechen.',
}
UEBERHOLT = {'D45', 'D46', 'D48', 'D49', 'D50'}
PHASEN = [('Phase 0', 'Objekt als Übergang', 'Ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur für Wasser, Strom und Internet. Die Bauart ist offen.'),
          ('Phase 1', 'Objekte und Kommunalgebäude', 'Wohn- und Arbeitsobjekte und das Kommunalgebäude. Material und Bauart plant eine Bau-KI nach den lokalen Gegebenheiten. Zuerst das Kommunalgebäude.'),
          ('Phase 2', 'Ausbau', 'Weitere Objekte nach Nachfrage; die Herrenhaus-Fläche wird zuletzt bebaut.')]

e = html.escape

def card_html(k, log, alt):
    i = k['id']
    opts = ''.join(f'<li class="opt" data-opt="{x["v"]}"><div><b>{x["v"]} · {e(x["titel"])}</b>{" <span class=ki>Vorschlag KI</span>" if x["ki"] else ""}<p>{e(x["text"])}</p></div>\n'
                   f'<button type="button" class="pick" data-d="{i}" data-v="{x["v"]}">Gefällt mir</button></li>' for x in k['opts'])
    a = NEU.get(i, {}); stand = ''
    if i in FOLGT:
        lab = {'unklar': 'weiß ich noch nicht', 'keine': 'keine davon', '': 'ohne Wahl'}.get(a.get('wahl') or '', a.get('wahl'))
        stand = (f'<div class="st13"><p><b>Stand 13.11.2026:</b> {e(lab)}. {e(FOLGT[i])}</p>'
                 + (f'<blockquote>{e(a["kommentar"])}</blockquote>' if a.get('kommentar') else '')
                 + ('<p class="note">Der Kommentar überholt die Möglichkeiten unten; sie stehen nur noch zur Nachvollziehbarkeit da.</p>' if i in UEBERHOLT else '') + '</div>')
    fr = ''
    if k['frueher']:
        rows = ''.join(f'<li><span class="no">{eid}</span>{e(log[eid])}</li>' for eid in k['frueher'])
        kom = ''.join(f'<li><span class="no">{d} · {e(alt[d].get("wahl") or "–")}</span>„{e(alt[d]["kommentar"])}“</li>' for d in sorted({d for eid in k['frueher'] for d in re.findall(r'\bD\d\d\b', log[eid])}) if d in alt and alt[d].get('kommentar'))
        fr = (f'<details class="fr"><summary>Früher entschieden, jetzt zurückgenommen ({len(k["frueher"])})</summary><ol class="done">{rows}</ol>'
              + (f'<p class="note">Kommentare damals:</p><ol class="done">{kom}</ol>' if kom else '') + '</details>')
    return f'''<article class="dec" id="{i}" data-id="{i}">
<header><span class="no">{i}</span><h3>{e(k["frage"])}</h3><span class="state" data-state="{i}">offen</span></header>
<p class="why">{e(k["warum"])}</p>
{stand}
<ol class="opts">{opts}</ol>
<div class="row">
<button type="button" class="alt" data-d="{i}" data-v="unklar">Weiß ich noch nicht</button>
<button type="button" class="alt" data-d="{i}" data-v="keine">Keine davon, neue Entwürfe</button>
</div>
<label class="note" for="n-{i}">Kommentar für die Agenten</label>
<textarea id="n-{i}" data-note="{i}" rows="2" maxlength="2000" placeholder="Was gefällt, was fehlt, was soll anders sein?"></textarea>
<p class="who" data-who="{i}"></p>
{fr}
</article>'''

EXTRA_CSS = '''<style>
.st13 { background:var(--go-bg); border-left:3px solid var(--go); padding:10px 12px; display:flex; flex-direction:column; gap:6px; color:var(--ink) } .st13 blockquote { margin:0; font-size:13.5px; color:var(--body); white-space:pre-line }
.ph-note { background:var(--bg); border:1px dashed var(--line); padding:10px 12px; font-size:14px }
table.ueb { border-collapse:collapse; width:100%; font-size:14px } table.ueb td, table.ueb th { text-align:left; vertical-align:top; padding:6px 8px; border-top:1px solid var(--line) } .tw2 { overflow-x:auto }
.ki { font-size:11px; font-weight:600; padding:1px 7px; border-radius:999px; background:var(--wait-bg); color:var(--wait); margin-left:6px; white-space:nowrap }
details.fr { padding:8px 12px; background:var(--bg) } details.fr summary { font-weight:500; font-size:13px; color:var(--muted) }
details.fr .done { margin-top:6px } .reset { background:var(--wait-bg); border:1px solid var(--wait); padding:12px 16px; color:var(--ink) }
.phasen { display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)) } .phasen div { background:var(--bg); border:1px solid var(--line); padding:10px 12px } .phasen p { font-size:14px }
</style>'''

NEU = {}
def build(src, log, alt):
    plans = re.findall(r'<div class="plans">.*?</div>', src, re.S)
    assert len(plans) == 2, len(plans)
    head = src[src.index('<title>'):src.index('<div class="wrap">')]
    script = src[src.index('<script>'):src.rindex('</script>') + len('</script>')] + '\n'
    ids, where = [], {}
    for _, _, ks in ABSCHNITTE:
        for k in ks:
            ids.append(k['id']); assert len(k['opts']) >= 2, k['id']
            assert sum(x['ki'] for x in k['opts']) <= 1, k['id']
            for eid in k['frueher']:
                assert eid in log, eid; where.setdefault(eid, []).append(k['id'])
    assert len(ids) == len(set(ids)), 'doppelte Karten-IDs'
    missing = [x for x in log if x not in where]; assert not missing, f'nicht zugeordnet: {missing}'
    v1 = re.search(r'<figure><img alt="Generalplan Variante 1.*?</figure>', plans[0], re.S).group(0)
    lage = '<div class="plans">' + v1.replace('Generalplan Variante 1: Grundlage für Stufe 1', 'Generalplan Variante 1') + '</div><p class="ph-note">Das Bild „Generalplan Variante 2“ war falsch und ist entfernt. Das Grundstück stimmt; ein neues Bild folgt.</p>'
    alt_plans = plans[1].replace('<figcaption>Ausschnitt: Fläche unten links</figcaption>', '<figcaption>Entwurf vom 04.11.2026 (Historie): Container unten links</figcaption>').replace('<figcaption>Gesamter Plan mit Legende</figcaption>', '<figcaption>Entwurf vom 04.11.2026 (Historie): gesamter Plan</figcaption>')
    hist = ''.join(f'<li><span>{eid}</span>{e(t)} <span>→ {", ".join(where[eid])}</span></li>' for eid, t in log.items())
    body = [f'''<div class="wrap">
<p class="no">Node001 Beregniza · Stand {STAND}</p>
<h1>Entscheidungen Node001</h1>
<p class="reset"><b>Am 13.11.2026 sind alle 32 Karten neu beantwortet.</b> Es gelten Wahl und Kommentar zusammen; wo der Kommentar die Wahl ändert, gilt der Kommentar. Jede Karte zeigt oben, was daraus folgt. Die früheren Entscheidungen E01–E85 sind zurückgenommen und stehen unten als Historie.</p>
<p><b>Nächster Schritt:</b> vier neue Karten D69–D72 zur Frage, was vor dem Investment aus Eigenkapital und Eigenleistung geht. Optimum laut Kostenregister: 4.403–8.236 € (mit Reserve bis 9.472 €). <a href="{VOR}" target="_blank" rel="noreferrer">Vor dem Investment →</a> · <a href="{ANS}" target="_blank" rel="noreferrer">Anschaffungsliste →</a></p>
<details><summary>Überblick: was seit 13.11. gilt ({len(FOLGT)})</summary><div class="tw2"><table class="ueb"><tbody>{"".join(f"<tr><td class=no>{k}</td><td>{e(v)}</td></tr>" for k, v in sorted(FOLGT.items()))}</tbody></table></div></details>
<p>Zu jeder Entscheidung: <b>Gefällt mir</b> bei einer Möglichkeit, <b>Weiß ich noch nicht</b>, oder <b>Keine davon</b>, dann machen die Agenten neue Entwürfe. „Vorschlag KI“ ist nur ein Vorschlag und gilt erst, wenn ihr ihn wählt.</p>
<p class="status" id="status">Lädt …</p>
<p><a href="{INDEX}" target="_blank" rel="noreferrer">Plan im Detail: Index 3.0 →</a> · <a href="{SGMM}" target="_blank" rel="noreferrer">SGMM und Funktionsketten →</a> · <a href="{WP}" target="_blank" rel="noreferrer">Whitepaper →</a></p>

<h2>Anfang</h2>
<section class="start">
<p><b>Vision (Reference Architecture v0.4):</b> X-PORTAL entwickelt menschenzentrierte, weitgehend versorgungsautarke, operativ autonome, resiliente und wirtschaftlich tragfähige Lebens-, Arbeits- und Aufenthaltsumgebungen, in denen Mensch, physische Welt, Services, Organisation und Technologie als integriertes, lernendes Gesamtsystem zusammenwirken.</p>
<p><b>Mission und Globalziele:</b> offen, siehe D42.</p>
<p><b>Grundstück:</b> Bereschnyzja (Beregniza), Ortsteil Hrun, bei Werchowyna, Kataster 2620885502:02:001:0013, etwa 1.016–1.077 m hoch (Geologiebericht), Nordosthang des Bila Kobyla.</p>
<p><b>Geologie:</b> KI-Zusammenfassung XPB-N001-GEO-SUM-001 vom 13.11.2026, nicht geprüft und nicht freigegeben. Hang mit Rutsch- und Fließprozessen, Grundwasseraustritte an drei Bohrpunkten; empfohlen sind Streifen- und Stützfundament und ein hangseitiger Entwässerungsgraben. Maßgeblich bleibt der ukrainische Originalbericht (Repo: <code>plan/entscheidungen/quellen/</code>).</p>
{lage}
</section>

<h2>Bauphasen (nach D55 mit Kommentar)</h2>
<section class="start"><div class="phasen">{"".join(f"<div><p class=no>{a}</p><b>{e(b)}</b><p>{e(c)}</p></div>" for a, b, c in PHASEN)}</div>
<details><summary>Entwurf vom 04.11.2026 (Historie)</summary>{alt_plans}</details></section>
''']
    for key, title, ks in ABSCHNITTE:
        body.append(f'<h2 id="{key}">{e(title)}</h2>')
        body += [card_html(k, log, alt) for k in ks]
    body.append(f'''<details><summary>Historie: früher entschieden, jetzt zurückgenommen ({len(log)})</summary><ol>{hist}</ol></details>
<h2>Ende</h2>
<section class="end"><p><b>Ziel:</b> Stufe 1 ist fertig geplant, wenn hier keine Entscheidung mehr offen ist. Dann steht fest, was gebaut und bestellt wird, wo, was es kostet, wie es bezahlt wird und wann.</p></section>
</div>
''')
    page = head.replace('<title>Node001 Entscheidungen</title>', '<title>Node001 Entscheidungen</title>') + EXTRA_CSS + '\n' + '\n'.join(body) + script
    allids = re.findall(r' id="([^"]+)"', page); assert len(allids) == len(set(allids)), 'doppelte HTML-IDs'
    return page, where

def md(log, where):
    L = [f'# Entscheidungsseite Node001, neu ab {STAND}', '', 'Alle früheren Entscheidungen E01–E85 sind zurückgenommen. Neu gilt nur, was auf der Seite gewählt ist.', '']
    for _, title, ks in ABSCHNITTE:
        L += [f'## {title}', '']
        for k in ks:
            L += [f'### {k["id"]} {k["frage"]}', k['warum'], '']
            L += [f'- {x["v"]} · {x["titel"]}{" (Vorschlag KI)" if x["ki"] else ""}: {x["text"]}' for x in k['opts']]
            if k['frueher']: L += ['', 'Früher: ' + ', '.join(k['frueher'])]
            L.append('')
    L += ['## Historie', ''] + [f'- {eid} → {", ".join(where[eid])}: {t}' for eid, t in log.items()]
    return '\n'.join(L) + '\n'

if __name__ == '__main__':
    base = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    src = (base / 'quellen/entscheidungsseite-2026-11-04.html').read_text()
    log = {x['id']: x['text'] for x in json.loads((base / 'archiv/log-E01-E84.json').read_text())}
    alt = {}
    for f in sorted((base / 'archiv/wahl-2026-11-04/wahl').glob('D*.json')):
        d = json.loads(f.read_text()); alt[f.stem] = d.get('data', d)
    for f in sorted((base / 'antworten-2026-11-13/wahl').glob('D*.json')):
        d = json.loads(f.read_text()); NEU[f.stem] = d.get('data', d)
    assert set(NEU) >= set(FOLGT), set(FOLGT) - set(NEU)
    page, where = build(src, log, alt)
    (base / 'entscheidungsseite.html').write_text(page)
    (base / 'entscheidungen.md').write_text(md(log, where))
    (base / 'entscheidungen.json').write_text(json.dumps(dict(stand=STAND, abschnitte=[dict(key=a, titel=b, karten=c) for a, b, c in ABSCHNITTE], historie_zu_karte=where), ensure_ascii=False, indent=1))
    print('ok', sum(len(c) for _, _, c in ABSCHNITTE), 'Karten,', len(where), 'E-Einträge zugeordnet,', len(page), 'Bytes')
