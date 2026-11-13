# X-PORTAL nach SGMM II: von der Vision bis zur Axt

Stand 12.11.2026. Bezugsrahmen Reference Architecture v0.4-WB1. Preise in UAH, 50 UAH/EUR (E20), Internetpreise November 2026.

## 01 Umwelt

- **Natur** [OPEN]: Karpaten, Hang, Winter mit Schnee; Heizlast bei −20 °C angenommen (H02). Ob der Grund trägt, ist offen (O01, Geologie). Quellschüttung im Februar und Laborwerte offen (O27).
- **Gesellschaft** [IN WORK]: Dorf Bereschnyzja, Ortsteil Hrun; lokale Handwerker, Holz, Milch, Käse, Transport (2.4.6). Recht für Ausländer, Haus auf fremdem Grund, Pacht: Prüfauftrag an Anwälte (A5).
- **Wirtschaft** [ASSUMPTION]: Preise in UAH, gerechnet mit 50 UAH/EUR (E20). Nachfrage über Warteliste (E51, E58). Produkt- und Preismodell nicht validiert (W04).
- **Technologie** [DOCUMENTED]: Netz mit Batterie oder Generator, dazu Solar (E35); eigener Internetanschluss, Starlink als Reserve, kein Mobilfunk oben (E49). KI heute; Robotik, Drohnen und mechanische Systeme perspektivisch, nicht im MVS.

## Anspruchsgruppen

| Rolle | Stand | Stufe 1 | Status | Node001 |
|---|---|---|---|---|
| Mitarbeitende (Team oben) | Drei Personen mit Tagesabläufen; Gleitzeit 9–14 Uhr, Jour fixe und Sport Pflicht (Vorgabe 05.11.2026). | Wohnen in Phase 0 im Container, ab Phase 1 im Haus | DOCUMENTED | REQUIRED |
| Siedler (Käufer) | Kaufen das Haus, pachten den Grund (E52); frei in Arbeit und Tagesablauf. | Ab Phase 1 im richtigen Holzhaus, nicht im Container (CR-01) | DECISION REQUIRED | REQUIRED |
| Remote-Siedler (Mieter) | Miete nach dem Einzug, kein Geld vorab (E47). | Ab Phase 1 | DOCUMENTED | PREPARE |
| Digitale Nomaden | Nicht im Plan der Stufe 1. | Später, nach Auslastungsdaten | OPEN | DEFER |
| Gäste | Nicht im Plan der Stufe 1; Sauna und Feuerstelle als Möglichkeiten im Index. | Später | OPEN | DEFER |
| Bauarbeiter | Bleiben längere Zeit oben (E44). | Phase 0 und 1, Container auf der Herrenhaus-Fläche | DOCUMENTED | REQUIRED |
| Betreiber | X-PORTAL Organisation oder eigener Node-Betrieb; Systemgrenze offen (OD-001). | Ab Phase 0 | DECISION REQUIRED | REQUIRED |
| Partner und Lieferanten | Hausbauer, Containerlieferant, Bauer (Holz, Räumen), Elektriker, Spediteur (2.2.3, 2.2.4, 2.4.6). | Ab Phase 0 | IN WORK | REQUIRED |
| Investoren | Zwei getrennte Investment Cases: Company und Node001 (Deck, W03). | Vor Phase 1 | IN WORK | REQUIRED |
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
- Käufer sind frei, nicht Teil des Teams

### Strategisch · Aktivitäten: Programme [IN WORK; XP-SYS-004]
- Vier Erlösstufen: Kundenprojekte, Technologielösungen, Nutzung und Services, System-Skalierung
- Zwei Investment Cases: Company und Node001
- Roadmap: Marktnachweis → Site Truth → Product & Economics → Financing & Permissions → Build & Operate → Learn & Replicate
- Bauphasen: Container nur als Übergang, danach richtige Holzhäuser (Abschnitt Bauphasen)

### Strategisch · Strukturen: Organisation und Standards [IN WORK; XP-SYS-006, 014]
- Reference Architecture v0.4 als Arbeitsbaseline
- X-PORTAL Genome v0.1: Invarianten, Module, Parameter, Regeln, Evidenz (OD-006)
- Team: Roman Dering, Pavel J., Nazar D.; Geschäftsführung in der Darstellung offen (W14)

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

### Phase 0: Container als Übergang [DECISION REQUIRED]
- Was: Wohncontainer für Team und Bauarbeiter auf der Fläche des späteren Herrenhauses (E44, E45). Je Person ein eigener Container (E40). Netzstrom mit Generator als Reserve, Tank, Campingtoilette, Starlink. Die Container sind Baustelleneinrichtung, kein Produkt.
- Für wen: Team (3) und Bauarbeiter (Zahl OPEN)
- Kosten: BlokModul BK1 ab 444.000 UAH, rund 8.880 € je Container ohne Heizung (E39); Listenpreis nicht bestätigt (O31). Kauf mit Rückverkauf oder Miete ist offen.

### Phase 1: Richtige Häuser und Kommunalgebäude [ASSUMPTION]
- Was: Holzhäuser wie auf dem Titelbild, in Teilen hochgebracht und oben montiert (E75). Zuerst Kommunalgebäude mit Küche, Sanitär und Arbeitsplätzen (E74), dann Häuser für Käufer und Team. Versorgung wächst mit: Solar und Speicher, Wasser im Ausbau, dauerhafte Abwasserlösung.
- Für wen: Käufer, Mieter, Team zieht aus dem Container ins Haus
- Kosten: Richtwert Rohbau 22.000–40.000 UAH je m², also 0,99–1,8 Mio. UAH oder rund 19.800–36.000 € für 45 m² (eigene Rechnung aus ukrsmeta.ua, 100 m² für 2,2–4 Mio. UAH); ohne Innenausbau, Transport und Anschlüsse. ASSUMPTION.

### Phase 2: Ausbau bis das Grundstück voll ist [OPEN]
- Was: Weitere Häuser nach Nachfrage (E51). Container gehen zurück oder werden verkauft. Die Herrenhaus-Fläche wird als letztes fest bebaut (E45).
- Für wen: Alle Rollen
- Kosten: OPEN, folgt aus dem parametrischen Business Case (OD-008)

## 04 Neu zu entscheiden (Entscheidungsseite D49, D55, D56)

| ID | Betrifft | Heute | Vorschlag | Anlass | Status |
|---|---|---|---|---|---|
| CR-01 | E59 ersetzen (Karte D21 B) | „Die Container sind die Tiny Houses der Käufer und bleiben stehen; für sie gilt E44 (Übergang) nicht mehr.“ | Container sind Übergang für Team und Bauarbeiter auf der Herrenhaus-Fläche. Käufer bekommen richtige Holzhäuser. E44 gilt wieder. E52 (Grund pachten) bleibt. | Vorgabe Roman, 12.11.2026; Titelbild Whitepaper und Deck | DECISION REQUIRED |
| CR-02 | E39 einschränken | Neue gedämmte Wohncontainer, zum Beispiel BlokModul BK1, als Haus. | Gilt nur noch für Phase 0. Zahl der Container = Team plus Bauarbeiter. Kauf mit Rückverkauf oder Miete wird verglichen. | Folgt aus CR-01 | DECISION REQUIRED |
| CR-03 | E40 präzisieren | Für jede Person ein eigener Container mit allem drin. | In Phase 0 ein Container je Person; ab Phase 1 ein eigenes Haus. Der Satz im Endprodukt „Container, der ihr Tiny House ist“ entfällt. | Folgt aus CR-01 | DECISION REQUIRED |
| CR-04 | E75 prüfen | Die Tiny Houses kommen in Teilen auf kleinem Fahrzeug hoch und werden oben montiert. | Bleibt für Holzhäuser (Rahmen oder Paneele). Zu prüfen: größtes Teil bei 45 m² (E84) und Zufahrt im Winter (2.2.4). | Herstelleranfrage O31 | OPEN |
| CR-05 | Preis je Haus neu rechnen | Etwa 30.000 € je Käufer, bezugsfertig im Frühjahr (E78). | Ein Holzhaus mit 45 m² liegt im Rohbau schon bei 19.800–36.000 € (Phase 1). 30.000 € decken Haus, Anschluss und Anteil am Kommunalgebäude nur bei kleinem Haus oder Eigenleistung. Preis und Größe gehören in den Business Case (OD-008). | W20 | DECISION REQUIRED |

## 05 Funktionsketten

### F01 Wärme [DECISION REQUIRED; REQUIRED]
Ziel: Morgens im Haus warm, ohne CO-Gefahr, auch bei −20 °C und 10 Tagen Sperre.
Systemebene Physische Welt; Anforderungen S01, H02, H03, H08; XP-SYS-002, 003, 009, 012

- Funktion: Wärme je Haus und im Kommunalgebäude
- Lösung: Holzofen mit Kochplatte je Haus (Möglichkeit A); zentral (B) offen
- Betriebsmittel: Brennholz trocken, 3–6 m³ je Haus und Winter (ASSUMPTION, aus Heizlast H02 rechnen)
- Beschaffung: Ofenfertig gespalten kaufen beim Bauern oder Holzhändler vor Ort (Buy)
- Werkzeug: Spaltaxt, Bügelsäge, Spaltkeil, Hackklotz, Handschuhe, Schutzbrille; Motorsäge nur mit Schulung und Schnittschutz
- Lager: Überdachter Holzunterstand am Haus, Tagesvorrat im Warmen
- Wer: Nachlegen jeder im eigenen Haus; Holz holen und spalten Team im Wechsel (2.4.5)
- Wartung: Schornstein reinigen (Intervall: Fachperson), Axt schleifen, Sägeblatt tauschen
- Ausfall: CO- und Rauchmelder je Raum mit Ofen, Feuerlöscher; zweite Wärmequelle nach Morgenwert H02 (Möglichkeit C)
- **Axt oder Säge?** Phase 0: Holz ofenfertig kaufen; Spaltaxt und Bügelsäge reichen für Nachschnitt und Anmachholz. Eine Motorsäge erst, wenn Rundholz selbst gemacht wird, dann mit Schulung, Schnittschutzhose, Helm und geklärter Haftung (S07). Vorschlag KI, nicht entschieden.

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Holzofen mit Kochplatte | je Haus | 6.000–13.000 UAH · 120–260 € | Index A4 | DOCUMENTED |
| Brennholz Eiche/Hainbuche, gespalten | je m³ | 3.700–4.500 UAH · 74–90 € | tsn.ua, Preise Kyjiw; Iwano-Frankiwsk nicht gefunden | DOCUMENTED |
| Brennholz je Haus und Winter | 3–6 m³ | 11.100–27.000 UAH · 222–540 € | Rechnung aus den Zeilen darüber | ASSUMPTION |
| Spaltaxt Fiskars X21 (L), Set | 1 je Node | 3.599–4.398 UAH · 72–88 € | bigl.ua, vnedorognik.ua | DOCUMENTED |
| Motorsäge Stihl MS 180 (Option) | 1 je Node | 6.519–7.310 UAH · 130–146 € | zaxid.net; gebraucht ab 3.990 UAH bei prom.ua | DOCUMENTED |
| Bügelsäge, Spaltkeil, Schnittschutzhose, Helm | Satz | OPEN | nicht gefunden | OPEN |
| CO-Melder | je Raum mit Ofen | 580–4.249 UAH · 12–85 € | Tuya Rauch+CO 580; Ajax FireProtect 2 3.899–4.249 | DOCUMENTED |

Zeitaufwand: Nachlegen und Asche 15–30 Minuten am Tag je Haus; Holz holen und spalten 1–2 Stunden je Woche für das Team (ASSUMPTION).

### F02 Strom [DECISION REQUIRED; REQUIRED]
Ziel: Muss-Lasten laufen bei Netzausfall weiter: Licht, Laptops, Starlink, Router, Pumpe, Kühlschrank.
Systemebene Physische Welt; Anforderungen S03, D04; XP-SYS-002, 003, 004

- Funktion: Strom für Arbeit, Wasser, Kühlung, Licht, E-Bikes
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
- Lösung: Quellfassung → Pumpe → Tank → Filter → Boiler
- Betriebsmittel: 150 l am Tag in der Anfangsstufe, 360 l im Ausbau, für 3 Personen (H05, ASSUMPTION)
- Beschaffung: Quellfassung und Leitung durch Fachfirma; Laborprobe (O27)
- Werkzeug: Pumpe passend zur Förderhöhe, Tank, Filter, Boiler, Rohrzange, Ersatzdichtungen
- Lager: Tank im Warmen oder frostfrei; 1.000 l wiegen 1 t, Bodenlast prüft eine Fachperson
- Wer: Fachfirma baut; Team prüft Füllstand täglich im Winter
- Wartung: Filter tauschen, Boiler entkalken, Laborprobe jährlich (Intervall: Fachperson)
- Ausfall: Tankvorrat: 1.000 l reichen knapp 7 Tage am Anfang, knapp 3 Tage im Ausbau (H05); Trinkwasser in Kanistern

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Tauchpumpe Klarwasser Aquatica 773175, 550 W, 9,5 m | 1 | 2.115–2.644 UAH · 42–53 € | ek.ua; passt nur bei geringer Förderhöhe | DOCUMENTED |
| Quell- oder Brunnenpumpe nach Förderhöhe | 1 | OPEN | Förderhöhe unbekannt | OPEN |
| Tank 1.000 l | 1–2 | 7.000–13.000 UAH · 140–260 € | Index A4 | DOCUMENTED |
| Filter, gegebenenfalls UV | Satz | OPEN | hängt an Laborwerten (O27) | OPEN |
| Boiler 80 l | je Haus oder zentral | 4.399–5.387 UAH · 88–108 € | Electrolux Quantum Pro 4.399 (nicht lieferbar); Nova Tec 4.702–5.387; bt.rozetka.com.ua | DOCUMENTED |

Zeitaufwand: Kontrolle 5 Minuten am Tag; Filterwechsel und Entkalken wenige Stunden im Jahr (ASSUMPTION).

### F04 Abwasser und Toilette [OPEN; REQUIRED]
Ziel: Toilette ohne Geruch, im Winter im Warmen erreichbar, frostsicher; Abwasser rechtlich zulässig.
Systemebene Physische Welt; Anforderungen H06; XP-SYS-009, 011, 012

- Funktion: Toilette, Grauwasser aus Dusche und Küche
- Lösung: Phase 0 Campingtoilette; ab Phase 1 Kleinkläranlage oder Komposttoilette
- Betriebsmittel: Sanitärflüssigkeit oder Streu; Entleerungsstelle
- Beschaffung: Phase 0 kaufen; dauerhafte Lösung plant eine Fachperson mit Genehmigung
- Werkzeug: Handschuhe, Spaten, Behälter
- Wer: Jede Person für ihren Container; Entleerung im Wechsel
- Wartung: Leeren nach Füllstand; Anlage nach Herstellerangabe
- Ausfall: Zweite Campingtoilette als Reserve

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Campingtoilette (Phase 0) | je Container | 1.600–3.700 UAH · 32–74 € | Index A4 | DOCUMENTED |
| Kleinkläranlage oder Komposttoilette (Phase 1) | je Haus oder zentral | OPEN | Fachperson und Genehmigung | OPEN |

Zeitaufwand: Leeren etwa alle paar Tage je Container (ASSUMPTION).

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
- Lösung: Phase 0 Kochplatte am Ofen und Kühlschrank im Container; ab Phase 1 Küche im Kommunalgebäude (E74)
- Betriebsmittel: Lebensmittel, Vorrat für 10 Tage (ASSUMPTION, wie Wasser); Milch und Käse vor Ort (2.4.6)
- Beschaffung: Einkauf unten; Person A holt Lieferungen an der Auffahrt
- Werkzeug: Kühlschrank (im Mittel 40 W, S03), Töpfe, Vorratsregal
- Wer: Gemeinsam, nach Plan; Garten freiwillig (E74)
- Ausfall: Kochen auf dem Holzofen; Vorrat

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Kühlschrank | je Container | OPEN | nicht gesucht | OPEN |
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

### F08 Mobilität [ASSUMPTION; PREPARE]
Ziel: Ins Dorf ohne Benzin; Lasten über die Auffahrt.
Systemebene Physische Welt; Anforderungen E72, E73, 2.3.6; XP-SYS-002, 004

- Funktion: Personen und kleine Lasten bewegen
- Lösung: E-Bikes statt Benzin (E72); Lasten mit kleinem Fahrzeug (2.2.4)
- Betriebsmittel: Strom aus F02
- Werkzeug: E-Bikes, Ladeplatz, Schloss, Flickzeug
- Wer: Jede Person; Wartung im Wechsel
- Ausfall: Im Winter sind E-Bikes auf Schnee fraglich (ASSUMPTION); Fahrdienst oder Bauer

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| E-Bike Formula eAlpina 2026 | je Person | 27.028–28.663 UAH · 541–573 € | ek.ua | DOCUMENTED |
| E-Bike Formula eF-1 | je Person | 31.204–32.989 UAH · 624–660 € | ek.ua | DOCUMENTED |

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
- Werkzeug: Rauch- und CO-Melder, Feuerlöscher je Haus, Erste-Hilfe-Set, Stirnlampen
- Wer: Alle; Notfallplan verantwortet Roman (ASSUMPTION)
- Wartung: Melder monatlich testen, Löscher nach Prüffrist
- Ausfall: Rettungszeit nach unten und Hubschrauberplatz: OPEN

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Rauch- und CO-Melder | je Raum mit Ofen | 580–4.249 UAH · 12–85 € | siehe F01 | DOCUMENTED |
| Feuerlöscher | je Haus | OPEN | nicht gefunden | OPEN |
| Erste-Hilfe-Set | je Haus | OPEN | nicht gefunden | OPEN |

Zeitaufwand: Melder testen 10 Minuten im Monat; Kurs einmalig (ASSUMPTION).

### F11 Zugang, Server und Daten [OPEN; PREPARE]
Ziel: Türen per Chip; Daten lokal gesichert; kein Serverausfall (E46).
Systemebene Technologie; Anforderungen Technik-Schritt, OD-004; XP-SYS-007, 008, 009, 013

- Funktion: Zugang und Daten
- Lösung: Chip-Türöffnung je Haus; kleiner Server (NAS) mit Sicherung außer Haus
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

### F12 Wohnen (Haus) [DECISION REQUIRED; REQUIRED]
Ziel: Privatsphäre im eigenen Haus; Phase 0 Container, ab Phase 1 richtige Holzhäuser.
Systemebene Physische Welt; Anforderungen E40, E59, E75, E84; XP-SYS-001, 004, 006

- Funktion: Wohnen und Rückzug
- Lösung: Phase 0: Wohncontainer; Phase 1: Holzhaus in Teilen, oben montiert (E75)
- Beschaffung: Container: kaufen mit Rückverkauf oder mieten. Holzhaus: Bausatz vom Hersteller, Montage durch Bauarbeiter oben
- Werkzeug: Kran oder kleines Fahrzeug nach 2.2.4; Fundament nach Geologie (O01)
- Wer: Nazar plant und nimmt ab (E38); Bauarbeiter montieren
- Ausfall: Container bleiben bis zum Umzug als Reserve

| Gegenstand | Menge | Preis | Quelle | Status |
|---|---|---|---|---|
| Wohncontainer BlokModul BK1, 15 m², ohne Heizung (Phase 0) | je Person | 444.000 UAH · 8.880 € | E39, Listenpreis nicht bestätigt (O31) | DOCUMENTED |
| Holzhaus 45 m², Rohbau (Phase 1) | je Haus | 990.000–1.800.000 UAH · 19.800–36.000 € | eigene Rechnung aus ukrsmeta.ua (100 m² für 2,2–4 Mio. UAH) | ASSUMPTION |

Zeitaufwand: Montage je Haus: OPEN, Herstellerangabe.

## 06 Lernkreislauf

Anforderung → Annahme / Designentscheidung → Implementierung → Betrieb → Datenerfassung → Analyse → Bewertung → Entscheidung → Anpassung → neuer Standard

## 07 Neue Widersprüche

| ID | Thema | Bisher | Jetzt | Lösung | Status |
|---|---|---|---|---|---|
| W19 | Container oder Häuser | Container sind die Tiny Houses der Käufer und bleiben (E59, D21 B) | Container nur Übergang für Team und Bauarbeiter, dann richtige Holzhäuser (Vorgabe 12.11.2026; Titelbild) | CR-01 bis CR-03 | DECISION REQUIRED |
| W20 | Preis je Haus | Etwa 30.000 € je Käufer, bezugsfertig (E78) | Holzhaus 45 m² im Rohbau 19.800–36.000 € (Richtwert, ASSUMPTION) | CR-05, Business Case OD-008 | DECISION REQUIRED |
