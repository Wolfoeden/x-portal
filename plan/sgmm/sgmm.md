# X-PORTAL nach SGMM II: von der Vision bis zur Axt

Stand 13.11.2026. Bezugsrahmen Reference Architecture v0.4-WB1. Preise in UAH, 50 UAH/EUR (E20), Internetpreise November 2026.

## 01 Umwelt

- **Natur** [OPEN]: Karpaten, Hang, Winter mit Schnee; Heizlast bei −20 °C angenommen (H02). Ob der Grund trägt, ist offen (O01, Geologie). Quellschüttung im Februar und Laborwerte offen (O27).
- **Gesellschaft** [IN WORK]: Dorf Bereschnyzja, Ortsteil Hrun; lokale Handwerker, Holz, Milch, Käse, Transport (2.4.6). Recht für Ausländer, Haus auf fremdem Grund, Pacht: Prüfauftrag an Anwälte (A5).
- **Wirtschaft** [ASSUMPTION]: Preise in UAH, gerechnet mit 50 UAH/EUR (E20). Nachfrage über Warteliste (E51, E58). Produkt- und Preismodell nicht validiert (W04).
- **Technologie** [DOCUMENTED]: Netz mit Batterie oder Generator, dazu Solar (E35); eigener Internetanschluss, Starlink als Reserve, kein Mobilfunk oben (E49). KI heute; Robotik, Drohnen und mechanische Systeme perspektivisch, nicht im MVS.

## Anspruchsgruppen

| Rolle | Stand | Stufe 1 | Status | Node001 |
|---|---|---|---|---|
| Mitarbeitende (Team oben) | Zwei bis drei Personen mit Tagesabläufen; Gleitzeit 9–14 Uhr, Jour fixe und Sport Pflicht (Vorgabe 05.11.2026). | Wohnen und arbeiten ab Phase 0 im Objekt | DOCUMENTED | REQUIRED |
| Mieter | Wohnen und arbeiten zur Miete; kein Immobilienverkauf im klassischen Sinn (D45, D48). Monatliche Pauschale, erbrachte Projekt- und Gemeinschaftsleistungen werden abgezogen (D38). | Interessenten ab jetzt sammeln (D50); Einzug ab Phase 1 | DOCUMENTED | REQUIRED |
| Mitwirkende mit Beteiligung | Wer mitwirkt, kann am jeweiligen Node beteiligt werden, nicht an der Holding (D37). Tokenisierung erst nach Klärung (D48). | Struktur vor Phase 1 klären | DECISION REQUIRED | PREPARE |
| Digitale Nomaden | Nicht im Plan der Stufe 1. | Später, nach Auslastungsdaten | OPEN | DEFER |
| Gäste | Nicht im Plan der Stufe 1; Sauna und Feuerstelle als Möglichkeiten im Index. | Später | OPEN | DEFER |
| Bauarbeiter | Bleiben längere Zeit oben. | Phase 0 und 1, im Objekt unterhalb der Herrenhaus-Fläche (D55) | DOCUMENTED | REQUIRED |
| Betreiber | Node001 wird von einer ukrainischen Gesellschaft gehalten; wo Services abgewickelt werden, ist rechtlich zu klären (D44, OD-001). | Vor Phase 0 | DECISION REQUIRED | REQUIRED |
| Partner und Lieferanten | Anbieter für Objekt, Brunnen, Kläranlage, Fundament; Bauer (Holz, Räumen), Elektriker, Spediteur; Architekt in beratender Funktion (D67). | Ab Vor-Phase: drei Angebote je großem Posten | IN WORK | REQUIRED |
| Investoren | Eigenkapital bis zur fertigen Bauplanung; Infrastruktur und Objekte mit Investoren, verbunden mit wiederkehrenden Erlösen (D46, D47). | Nach dem Paket „Vor dem Investment“ | IN WORK | REQUIRED |
| Staat und Behörden | Genehmigungen, Anschlussrecht Strom, Abwasser (Reference Architecture 6.2). | Vor Phase 0 | OPEN | REQUIRED |

## 02 SGMM-Matrix

### Normativ · Aktivitäten: Vision und Politik [DOCUMENTED; XP-SYS-001, 004]
- Vision v0.4 (Baseline Abschnitt 2) und Kerndefinition (Abschnitt 18)
- Disziplin: Node001 trägt sich aus realer Nutzung; Genome- und IP-Erlöse sind Upside
- Mission: in v0.4 nicht enthalten, OPEN (W01)

### Normativ · Strukturen: Verfassung und Governance [DECISION REQUIRED; XP-SYS-005, 014]
- X-PORTAL Organisation als Dach; DT Agentur übernimmt Projekte aus Deutschland; Grundstücke (X1–X3)
- Systemgrenze Organisation ↔ Node-Betrieb: OD-001
- KI bereitet vor (E13); Paul und Roman geben frei, Bestellung und Betrag Paul (E71); Vorschlag gilt ohne Widerspruch (E80)
- Änderungen an Kernbegriffen nur als CHANGE REQUEST (XP-SYS-014)

### Normativ · Verhalten: Kultur [DOCUMENTED; XP-SYS-001]
- Prinzipien aus Abschnitt 5: Menschenzentrierung, Resilienz, Wartbarkeit, Messbarkeit, Lernfähigkeit
- Spielregeln oben: Gleitzeit 9–14, Jour fixe und Sport Pflicht, Wellness frei, Arbeit wie Holz machen gemeinsam
- Mieter sind frei in Arbeit und Tagesablauf; Gemeinschaftsarbeit wird gefördert und angerechnet (D36)

### Strategisch · Aktivitäten: Programme [IN WORK; XP-SYS-004]
- Vier Erlösstufen: Kundenprojekte, Technologielösungen, Nutzung und Services, System-Skalierung
- Zwei Investment Cases: Company und Node001
- Roadmap: Marktnachweis → Site Truth → Product & Economics → Financing & Permissions → Build & Operate → Learn & Replicate
- Bauphasen: ein Objekt als Übergang, danach Objekte und Kommunalgebäude (D55)
- Mietmodell mit Selbstkosten als Basis; kein klassischer Immobilienverkauf (D48, D49)

### Strategisch · Strukturen: Organisation und Standards [IN WORK; XP-SYS-006, 014]
- Reference Architecture v0.4 als Arbeitsbaseline
- X-PORTAL Genome v0.1: Invarianten, Module, Parameter, Regeln, Evidenz (OD-006)
- Team: Produkt und Projekt, Lead Developer; Architektur und Bau als externe Beratung (D67); Geschäftsführung in der Darstellung offen (W14)

### Strategisch · Verhalten: Lernkultur [DOCUMENTED; XP-SYS-010]
- Evidenz statt Behauptung: jede Annahme im Assumption Register
- Widersprüche werden markiert, nicht geglättet (Abgleich W01–W20)
- Node002 ist der Beweismaßstab für Reproduzierbarkeit (H8)

### Operativ · Aktivitäten: Aufträge [IN WORK; XP-SYS-002, 003, 012]
- Node001 in Arbeitsreihenfolge: Geologie → Hausart → Zufahrt → Lieferant → Technik (Zugang, Server, Netz)
- Gates G0–G4 im Index 3.0
- Funktionsketten F01–F12 bis auf Werkzeug und Preis (dieses Dokument)

### Operativ · Strukturen: Prozesse und Register [OPEN; XP-SYS-005, 008]
- CONOPS CO-01 bis CO-06 (Entwickeln, Nutzen, Betreiben, Störung, Lernen, neuer Node)
- Beschlussblätter M03 mit Vorbereitung, Prüfung, Freigabe, Budgetgrenze, Gültigkeit, Wiedervorlage
- Asset- und Systemregister als System Model, kein Digital Twin (OD-004)

### Operativ · Verhalten: Leistung und Zusammenarbeit [OPEN; XP-SYS-001, 012]
- Tagesabläufe der drei Personen; Holz, Wasser, Schnee und Wartung im Wechsel nach Plan (2.4.5)
- Notfallplan und Absprachen (2.4.7)
- Feedback der Bewohner nach CO-02

## 03 Bauphasen

### Phase 0: Objekt als Übergang [ASSUMPTION]
- Was: Ein Wohn- und Arbeitsobjekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur für Wasser, Strom und Internet (D55). Spültoilette, Dusche, Warmwasser und Abwasser fest eingebaut (D62). Netzanschluss mit Generator als Reserve (D59).
- Für wen: Team (2–3) und Bauarbeiter (Zahl OPEN)
- Kosten: Teilsumme im Kostenregister für ein Modul mit 18 m² und zwei Personen; 69 von 137 Positionen ohne Betrag. Siehe „Vor dem Investment“.

### Phase 1: Objekte und Kommunalgebäude [OPEN]
- Was: Zuerst das Kommunalgebäude (D64), dann Wohn- und Arbeitsobjekte für Mieter und Team. Material offen (Holz, Beton, Glas, Metall); eine Bau-KI plant nach den lokalen Gegebenheiten (D56). Solar mit Speicher, Feuerstelle, Sauna, Bergkapelle als Gruppenprojekt (D59, D34, D35).
- Für wen: Mieter, Team
- Kosten: Nicht gerechnet. Selbstkosten je Objekt aus dem Business Case (D49, OD-008).

### Phase 2: Ausbau [OPEN]
- Was: Weitere Objekte nach Nachfrage. Die Herrenhaus-Fläche wird zuletzt bebaut.
- Für wen: Alle Rollen
- Kosten: OPEN

## 04 Entschieden am 13.11.2026

| ID | Betrifft | Heute | Vorschlag | Anlass | Status |
|---|---|---|---|---|---|
| D55 | Container oder Objekte | Container sind die Tiny Houses der Käufer und bleiben (E59). | Ein Objekt als Übergang für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche; danach Objekte und Kommunalgebäude. | Antwort mit Kommentar, 13.11.2026 | DOCUMENTED |
| D56 | Bauart | Tiny Houses in Teilen, oben montiert (E75). | Material offen (Holz, Beton, Glas, Metall); Bau-KI plant und bewertet nach lokalen Gegebenheiten. | Kommentar, 13.11.2026 | OPEN |
| D49 | Preis | Etwa 30.000 € je Käufer (E78). | Selbstkostenpreis je Objekt statt Verkaufspreis; kein Immobilienverkauf im klassischen Sinn. | Kommentar, 13.11.2026 | DOCUMENTED |
| D46 | Kapital Node001 | Kein Investor; der Ort trägt sich aus Käufergeld (E57). | Käufermodell abgewählt; Eigenkapital plus Investoren, verbunden mit wiederkehrenden Erlösen. | Kommentar, 13.11.2026 | DOCUMENTED |
| D69 | Vor dem Investment | – | Welches Paket aus Eigenmitteln und Eigenleistung (Kern, Optimum, Erweitert). | Karte offen | DECISION REQUIRED |

## 05 Funktionsketten

### F01 Wärme [DECISION REQUIRED; REQUIRED]
Ziel: Morgens in der Einheit warm, ohne CO-Gefahr, auch bei −20 °C und 10 Tagen Sperre.
Systemebene Physische Welt; Anforderungen S01, H02, H03, H08; XP-SYS-002, 003, 009, 012

- Funktion: Wärme je Einheit und im Kommunalgebäude
- Lösung: Holzofen mit Kochplatte je Einheit (Möglichkeit A); zentral (B) offen
- Betriebsmittel: Brennholz trocken, 3–6 m³ je Einheit und Winter (ASSUMPTION, aus Heizlast H02 rechnen)
- Beschaffung: Mix (D60): Bäume am Grundstück fällen und aufarbeiten; sie sind nass und trocknen etwa ein Jahr. Für den ersten Winter trockenes Holz zukaufen.
- Werkzeug: Spaltaxt, Bügelsäge, Spaltkeil, Hackklotz, Handschuhe, Schutzbrille; Motorsäge nur mit Schulung und Schnittschutz
- Lager: Überdachtes, belüftetes Holzlager für zwei Winter, in jedem Fall (D60); Tagesvorrat im Warmen
- Wer: Nachlegen jeder in der eigenen Einheit; Holz holen und spalten Team im Wechsel (2.4.5)
- Wartung: Schornstein reinigen (Intervall: Fachexperte), Axt schleifen, Sägeblatt tauschen
- Ausfall: CO- und Rauchmelder je Raum mit Ofen, Feuerlöscher; zweite Wärmequelle nach Morgenwert H02 (Möglichkeit C)
- **Axt oder Säge?** Entschieden am 13.11. (D60): beides. Eigenes Holz braucht Motorsäge mit Schutzausrüstung und Kurs; Spaltaxt, Keile und Bügelsäge für das Spalten und Nachschneiden. Haftung und Versicherung der Eigenleistung sind offen (S07).

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Holzofen mit Kochplatte | je Einheit | 6.000–13.000 UAH · 120–260 € | Index A4 | DOCUMENTED |
| Brennholz Eiche/Hainbuche, gespalten | je m³ | 3.700–4.500 UAH · 74–90 € | tsn.ua, Preise Kyjiw; Iwano-Frankiwsk nicht gefunden | DOCUMENTED |
| Brennholz je Einheit und Winter | 3–6 m³ | 11.100–27.000 UAH · 222–540 € | Rechnung aus den Zeilen darüber | ASSUMPTION |
| Spaltaxt Fiskars X21 (L), Set | 1 je Node | 3.599–4.398 UAH · 72–88 € | bigl.ua, vnedorognik.ua | DOCUMENTED |
| Motorsäge Stihl MS 180 (Option) | 1 je Node | 6.519–7.310 UAH · 130–146 € | zaxid.net; gebraucht ab 3.990 UAH bei prom.ua | DOCUMENTED |
| Bügelsäge, Spaltkeil, Schnittschutzhose, Helm | Satz | OPEN | nicht gefunden | OPEN |
| CO-Melder | je Raum mit Ofen | 580–4.249 UAH · 12–85 € | Tuya Rauch+CO 580; Ajax FireProtect 2 3.899–4.249 | DOCUMENTED |

Zeitaufwand: Nachlegen und Asche 15–30 Minuten am Tag je Einheit; Holz holen und spalten 1–2 Stunden je Woche für das Team (ASSUMPTION).

### F02 Strom [DECISION REQUIRED; REQUIRED]
Ziel: Muss-Lasten laufen bei Netzausfall weiter: Licht, Laptops, Starlink, Router, Pumpe, Kühlschrank.
Systemebene Physische Welt; Anforderungen S03, D04; XP-SYS-002, 003, 004

- Funktion: Strom für Arbeit, Wasser, Kühlung, Licht
- Lösung: Netz mit Batterie oder Generator, dazu Solar (E35)
- Betriebsmittel: Netzstrom; Benzin für 3 Tage (S03, ASSUMPTION)
- Beschaffung: Netzanschluss beim Versorger beantragen; Elektriker vor Ort (Buy)
- Werkzeug: Generator 3 kW, Kanister, Außenkabel, Spannungsprüfer
- Lager: Batterie im Warmen, Generator draußen unter Dach
- Wer: Elektriker installiert und prüft; Team startet den Generator monatlich zur Probe (ASSUMPTION)
- Wartung: Ölwechsel und Zündkerze nach Herstellerangabe; Batterie prüfen
- Ausfall: Generator, dann Batterie; Muss-Lasten etwa 380 W, 3,8–4,56 kWh über 10–12 Stunden (S03)

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Netzanschluss 10–15 kW | einmal | 29.270–43.905 UAH · 585–878 € | Index A4, 2.927 UAH je kW, ohne Leitung zum Haus | DOCUMENTED |
| Generator 3 kW | 1 | 18.749–32.599 UAH · 375–652 € | Black+Decker BXGNP3000E 18.749 (Aktion); Kärcher PGG 3/1 27.999; A-iPower SC3250i Inverter 32.599 | DOCUMENTED |
| Solar-Inselanlage 4,8 kWp mit 4,8 kWh Batterie (Phase 1) | 1 | 189.900 UAH · 3.798 € | Index A4, ohne Montage | DOCUMENTED |
| Kanister, Außenkabel, Spannungsprüfer | Satz | OPEN | nicht gesucht | OPEN |

Zeitaufwand: Probelauf 30 Minuten im Monat; im Ausfall Tanken alle paar Stunden (ASSUMPTION).

### F03 Wasser [OPEN; REQUIRED]
Ziel: Trinkwasser und warmes Wasser, auch bei 10 Tagen Sperre; Leitung frostfrei ohne Heizkabel.
Systemebene Physische Welt; Anforderungen H04, H05; XP-SYS-002, 003, 009

- Funktion: Trink-, Koch- und Duschwasser
- Lösung: Grundwasser (Brunnen) → Pumpe → Tank → Aufbereitung zu Trinkwasser → Boiler (D61)
- Betriebsmittel: 150 l am Tag in der Anfangsstufe, 360 l im Ausbau, für 3 Personen (H05, ASSUMPTION)
- Beschaffung: Laboranalyse zuerst; sie bestimmt die Aufbereitung. Brunnen und Leitung durch Fachfirma.
- Werkzeug: Pumpe passend zur Förderhöhe, Tank, Filter, Boiler, Rohrzange, Ersatzdichtungen
- Lager: Tank im Warmen oder frostfrei; 1.000 l wiegen 1 t, Bodenlast prüft eine Fachexperte
- Wer: Fachfirma baut; Team prüft Füllstand täglich im Winter
- Wartung: Filter tauschen, Boiler entkalken, Laborprobe jährlich (Intervall: Fachexperte)
- Ausfall: Tankvorrat: 1.000 l reichen knapp 7 Tage am Anfang, knapp 3 Tage im Ausbau (H05); Trinkwasser in Kanistern

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Tauchpumpe Klarwasser Aquatica 773175, 550 W, 9,5 m | 1 | 2.115–2.644 UAH · 42–53 € | ek.ua; passt nur bei geringer Förderhöhe | DOCUMENTED |
| Quell- oder Brunnenpumpe nach Förderhöhe | 1 | OPEN | Förderhöhe unbekannt | OPEN |
| Tank 1.000 l | 1–2 | 7.000–13.000 UAH · 140–260 € | Index A4 | DOCUMENTED |
| Filter, gegebenenfalls UV | Satz | OPEN | hängt an Laborwerten (O27) | OPEN |
| Boiler 80 l | je Einheit oder zentral | 4.399–5.387 UAH · 88–108 € | Electrolux Quantum Pro 4.399 (nicht lieferbar); Nova Tec 4.702–5.387; bt.rozetka.com.ua | DOCUMENTED |

Zeitaufwand: Kontrolle 5 Minuten am Tag; Filterwechsel und Entkalken wenige Stunden im Jahr (ASSUMPTION).

### F04 Abwasser und Sanitär [OPEN; REQUIRED]
Ziel: Spültoilette (Klopapier spülbar), Dusche und Warmwasser ab Phase 0, fest eingebaut; Abwasser rechtlich zulässig.
Systemebene Physische Welt; Anforderungen H06, D62; XP-SYS-009, 011, 012

- Funktion: Toilette, Dusche, Warmwasser, Abwasser
- Lösung: Kleinkläranlage oder Mehrkammergrube ab Phase 0, mit der Infrastruktur geplant (D62)
- Betriebsmittel: Wasser aus F03, Strom aus F02
- Beschaffung: Abwasserplanung und Genehmigung durch Fachexperten; Anlage mit Einbau
- Werkzeug: Anlage, frostfreie Leitungen mit Gefälle, Spültoilette, Dusche, Boiler
- Wer: Fachfirma baut; Team kontrolliert
- Wartung: Schlamm abfahren ein- bis zweimal im Jahr; ob ein Saugwagen die Zufahrt schafft, ist offen
- Ausfall: Notlösung für Sperre der Anlage: OPEN

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Kleinkläranlage für 5 Personen, nur Gerät | 1 | 38.000 UAH · 760 € | Kostenregister 13.11. | ASSUMPTION |
| Einbau der Anlage | 1 | 8.000–15.000 UAH · 160–300 € | Kostenregister 13.11. | ASSUMPTION |
| Abwasserplanung | 1 | 5.000–10.000 UAH · 100–200 € | Kostenregister 13.11. | ASSUMPTION |

Zeitaufwand: Kontrolle wenige Minuten je Woche (ASSUMPTION).

### F05 Internet [OPEN; REQUIRED]
Ziel: Zwei gleichzeitige Videocalls, während die dritte Person arbeitet, auch bei Schnee.
Systemebene Technologie; Anforderungen Arbeitsplatz oben, E49; XP-SYS-002, 003, 007

- Funktion: Bezahlte digitale Arbeit oben
- Lösung: Eigener Internetanschluss, Starlink als Reserve; kein Mobilfunk oben (E49)
- Beschaffung: Anbieter für den Hauptanschluss: OPEN; Starlink für die Adresse auf starlink.com prüfen
- Werkzeug: Router mit Umschaltung, Teleskopbesen für Schnee auf der Antenne
- Wer: Pavel richtet ein (ASSUMPTION); Team räumt die Antenne
- Wartung: Firmware, Kabel prüfen
- Ausfall: Umschalten auf Starlink; Test: 30 Minuten zwei Calls über jeden Anschluss

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Starlink Mini | 1 | 20.820–25.900 UAH · 416–518 € | Index A4 | DOCUMENTED |
| Starlink Abo | je Monat | 2.950 UAH · 59 € | Suchergebnisse; für die Adresse prüfen | DOCUMENTED |
| Hauptanschluss | einmal und monatlich | OPEN | Anbieter offen | OPEN |
| Router mit zwei WAN | 1 | OPEN | nicht gesucht | OPEN |

Zeitaufwand: Antenne freiräumen bei Schneefall, wenige Minuten (ASSUMPTION).

### F06 Essen und Küche [OPEN; REQUIRED]
Ziel: Drei Mahlzeiten am Tag; Vorrat für eine Sperre; Küche im Kommunalgebäude.
Systemebene Services; Anforderungen H07, E74, E81; XP-SYS-001, 002

- Funktion: Kochen, Kühlen, Vorrat
- Lösung: Phase 0 Kochplatte am Ofen und Kühlschrank im Objekt; ab Phase 1 Küche im Kommunalgebäude (E74)
- Betriebsmittel: Lebensmittel, Vorrat für 10 Tage (ASSUMPTION, wie Wasser); Milch und Käse vor Ort (2.4.6)
- Beschaffung: Einkauf unten; Person A holt Lieferungen an der Auffahrt
- Werkzeug: Kühlschrank (im Mittel 40 W, S03), Töpfe, Vorratsregal
- Wer: Gemeinsam, nach Plan; Garten freiwillig (E74)
- Ausfall: Kochen auf dem Holzofen; Vorrat

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Kühlschrank | je Objekt | OPEN | nicht gesucht | OPEN |
| Kochfeld für das Kommunalgebäude (Phase 1) | 1 | OPEN | nicht gesucht | OPEN |

Zeitaufwand: Einkauf unten 2–3 Stunden je Woche (ASSUMPTION).

### F07 Zufahrt und Schnee [OPEN; REQUIRED]
Ziel: Auffahrt im Winter passierbar; Wege zu Holzlager, Toilette und Generator sicher bei Schnee und Dunkelheit.
Systemebene Physische Welt; Anforderungen 2.2.4, Wege sicher begehbar; XP-SYS-003, 009, 012

- Funktion: Auffahrt und Wege frei
- Lösung: Auffahrt räumt ein Bauer mit Traktor per Vertrag (Buy); Wege am Haus räumt das Team (Make)
- Betriebsmittel: Streugut (Sand oder Splitt)
- Beschaffung: Räumvertrag mit Preis je Einsatz; Streugut lokal
- Werkzeug: Schneeschaufeln, Schneeschieber, Eispickel; Schneefräse nur, wenn kein Räumvertrag
- Wer: Team im Wechsel (2.4.5)
- Wartung: Geländer und Wegelicht prüfen vor dem Winter
- Ausfall: Auffahrt zu: Arbeit läuft oben weiter (E46, E54); Vorrat aus F03 und F06

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Schneeschaufel | 3–4 | 270–427 UAH · 5–9 € | Epicentr: mit Holzstiel 270, Lemira groß 427 (je Stück) | DOCUMENTED |
| Räumvertrag Auffahrt | je Einsatz | OPEN | mit Bauer verhandeln | OPEN |
| Schneefräse Benzin (Option) | 1 | OPEN | nicht gefunden | OPEN |

Zeitaufwand: Wege räumen 30–60 Minuten je Schneefall (ASSUMPTION).

### F08 Mobilität [ASSUMPTION; REQUIRED]
Ziel: Einkauf, Notfall und kleine Lasten über die Auffahrt, auch im Winter.
Systemebene Physische Welt; Anforderungen D65; XP-SYS-002, 004

- Funktion: Personen und kleine Lasten bewegen
- Lösung: Ein gemeinsames geländegängiges Fahrzeug; keine E-Bikes in Phase 0 (D65)
- Betriebsmittel: Kraftstoff
- Werkzeug: Fahrzeug, Winterreifen, Schneeketten, Abschleppseil
- Wer: Team; Wartung im Wechsel
- Ausfall: Bauer mit Traktor

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Geländegängiges Fahrzeug, gebraucht | 1 | 170.507 UAH · 3.410 € | Kostenregister 13.11. | ASSUMPTION |
| Winterreifen | 4 | 10.968 UAH · 219 € | Kostenregister 13.11., ohne Ketten | ASSUMPTION |

Zeitaufwand: Pflege wenige Stunden im Jahr (ASSUMPTION).

### F09 Wartung und Reparatur [OPEN; REQUIRED]
Ziel: Kritische Systeme unter lokalen Bedingungen wartbar; Ersatzteile oben.
Systemebene Organisation; Anforderungen 2.4.5, 2.4.6; XP-SYS-008, 012

- Funktion: Instand halten
- Lösung: Wartungsplan je Asset im Asset- und Systemregister
- Betriebsmittel: Ersatzteile: Sicherungen, Filter, Dichtungen, Pumpe als Reserve
- Beschaffung: Handwerker vor Ort (2.4.6), Ersatzteile auf Vorrat
- Werkzeug: Werkzeugkoffer, Akkuschrauber, Leiter, Stirnlampe
- Wer: Team im Wechsel; Fachfirma für Strom und Wasser
- Ausfall: Reservepumpe, Kontakt Handwerker, Notbetrieb nach CO-04

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Werkzeugkoffer und Akkuschrauber | Satz | OPEN | nicht gefunden | OPEN |

Zeitaufwand: Wartungsrunde 1–2 Stunden je Woche (ASSUMPTION).

### F10 Notfall und Sicherheit [OPEN; REQUIRED]
Ziel: Brand, CO, Verletzung und Abschneiden werden erkannt und beherrscht.
Systemebene Querschnitt; Anforderungen S01, S07, 2.4.7; XP-SYS-003, 009

- Funktion: Personen schützen
- Lösung: Melder, Löscher, Erste Hilfe, Notfallplan, Kommunikation
- Beschaffung: Kaufen; Erste-Hilfe-Kurs für alle
- Werkzeug: Rauch- und CO-Melder, Feuerlöscher je Einheit, Erste-Hilfe-Set, Stirnlampen
- Wer: Alle; Notfallplan verantwortet Roman (ASSUMPTION)
- Wartung: Melder monatlich testen, Löscher nach Prüffrist
- Ausfall: Rettungszeit nach unten und Hubschrauberplatz: OPEN

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Rauch- und CO-Melder | je Raum mit Ofen | 580–4.249 UAH · 12–85 € | siehe F01 | DOCUMENTED |
| Feuerlöscher | je Einheit | OPEN | nicht gefunden | OPEN |
| Erste-Hilfe-Set | je Einheit | OPEN | nicht gefunden | OPEN |

Zeitaufwand: Melder testen 10 Minuten im Monat; Kurs einmalig (ASSUMPTION).

### F11 Zugang, Server und Daten [OPEN; PREPARE]
Ziel: Türen per Chip; Daten lokal gesichert; kein Serverausfall (E46).
Systemebene Technologie; Anforderungen Technik-Schritt, OD-004; XP-SYS-007, 008, 009, 013

- Funktion: Zugang und Daten
- Lösung: Chip-Türöffnung je Einheit; kleiner Server (NAS) mit Sicherung außer Haus
- Betriebsmittel: Strom aus F02 über kleine USV
- Werkzeug: RFID-Schloss, NAS, USV
- Wer: Pavel richtet ein (ASSUMPTION)
- Wartung: Updates, Sicherung prüfen
- Ausfall: Mechanischer Schlüssel als Reserve

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| NAS Synology DS224+ | 1 | 20.200–20.750 UAH · 404–415 € | EU-Shops rund 404–415 €, ohne Platten | DOCUMENTED |
| RFID-Schloss | je Tür | OPEN | nicht gefunden | OPEN |

Zeitaufwand: Pflege 1 Stunde im Monat (ASSUMPTION).

### F12 Wohnen und Arbeiten (Objekt) [OPEN; REQUIRED]
Ziel: Phase 0: ein Objekt für Team und Bauarbeiter; ab Phase 1 Wohn- und Arbeitsobjekte zur Miete.
Systemebene Physische Welt; Anforderungen D55, D56; XP-SYS-001, 004, 006

- Funktion: Wohnen, Arbeiten, Rückzug
- Lösung: Bauart offen: Holz, Beton, Glas, Metall; Bau-KI plant nach lokalen Gegebenheiten (D56)
- Beschaffung: Drei schriftliche Angebote; kaufen oder mieten
- Werkzeug: Kleines Fahrzeug für den Transport in Phase 0 (D57); Fundament nach geprüfter Geologie
- Wer: Fachexperte Bau plant und nimmt ab; Architekt berät
- Ausfall: OPEN

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Modul 18 m² mit Transport und Montage laut Anbieter | 1 | 674.900 UAH · 13.498 € | Kostenregister 13.11. | ASSUMPTION |

Zeitaufwand: Montage: OPEN, Herstellerangabe.

## 06 Lernkreislauf

Anforderung → Annahme / Designentscheidung → Implementierung → Betrieb → Datenerfassung → Analyse → Bewertung → Entscheidung → Anpassung → neuer Standard

## 07 Neue Widersprüche

| ID | Thema | Bisher | Jetzt | Lösung | Status |
|---|---|---|---|---|---|
| W19 | Container oder Objekte | Container sind die Tiny Houses der Käufer und bleiben (E59) | Ein Objekt als Übergang, danach Objekte und Kommunalgebäude | Entschieden in D55 am 13.11.2026 | DOCUMENTED |
| W20 | Preis | Etwa 30.000 € je Käufer (E78) | Selbstkostenpreis je Objekt; kein klassischer Verkauf | Entschieden in D49 am 13.11.2026; Zahlen aus OD-008 | DOCUMENTED |
| W21 | Mission | Baseline v0.4 nennt keine Mission | Mission und Globalziele bleiben Ausgangspunkt (Kommentar D42) | Harmonisierung offen | DECISION REQUIRED |
