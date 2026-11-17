"""Übernahme aus dem Index 2.0 vom 04.11.2026 in den Baum, Stand 17.11.2026.

Was noch gilt, steht hier auf aktuellem Stand (Entscheidungen vom 13.11., Kommentare vom 12., 15. und 17.11.).
Was entfällt, steht in ENTFALLEN mit Grund. Das Entscheidungslog E01–E85 ist am 13.11.2026 zurückgenommen;
E-Nummern stehen nur noch als Herkunft da.
"""

# Teilergebnisse: (nr, titel, fertig_wenn, rolle, abhaengig, stand, quelle, state)
TE = {
 '2.1': ('Geschäftsmodell und Geld', [
  ('2.1.3', 'Geldfluss Phase 0 und Chargen: welches Geld wann kommt (Eigenkapital, Investoren, Miete) und wann es gebraucht wird', 'Monatstabelle, jede Zeile mit Quelle', 'rechnet: planende KI · prüft: Geschäftsführung', 'O03, AP-C4, AP-C5', 'offen; Grundlage ist das Kostenregister vom 13.11.2026 (Teilrechnung)', 'D46, D47, D69, D71', 'open'),
  ('2.1.4', 'Kapazität der Geschäftsführung: ab wann Vollzeit, und wie sie finanziert ist', 'Angabe der Geschäftsführung mit Monat und Finanzierung', 'Geschäftsführung', '2.6.1', 'offen; der frühere Betrag stammt aus dem zurückgenommenen Log und ist neu zu bestätigen', 'früher E03, E67', 'open'),
  ('2.1.5', 'Kapital für die Firma', 'entschieden', 'Geschäftsführung', 'O11', 'Eigenkapital bis zur vollendeten Bauplanung; Infrastruktur und Objekte mit Investoren. Förderung wird nicht öffentlich gezeigt, nur die Pflichtangaben gegenüber Kapitalgebern', 'D47, Kommentar 13.11.2026', 'done'),
  ('2.1.6', 'Paket vor dem Investment: was vor dem Investorengespräch bezahlt werden muss und woher das Geld kommt', 'Betrag je Posten und Monat, von der Geschäftsführung bestätigt', 'stellt auf: planende KI · entscheidet: Geschäftsführung', 'AP-A5, O05', 'offen; ohne Geologie-Fachprüfung, Zusatzerkundung und Vermessung, die vorliegen (Kommentar 15.11.2026)', 'D69, D71; Seite „Vor dem Investment“', 'open'),
  ('2.1.7', 'Matching der BW Bank für IT in Deutschland: Rechner, Server, Hardware', 'Betrag und Bedingungen schriftlich; Liste der IT mit Kosten; Antwort der Anwälte zur Datenverbindung', 'Geschäftsführung · IT-Liste: planende KI', 'O05', 'offen; Server oben nur bei VC-Funding mit Deutschland verbunden', 'D47', 'open'),
  ('2.1.8', 'Geld und Leistungen oben: wie das Team bezahlt wird und wie Mieter für Leistungen zahlen (Essen, Strom, Wasser, Internet, Sauna, Coworking, Betrieb)', 'Leistungsliste mit Preis oder Gegenleistung, von Geschäftsführung und Projektleitung entschieden', 'bereitet vor: planende KI · entscheiden: Geschäftsführung und Projektleitung', 'O03, 2.4.5', 'offen; Regeln aus D36 bis D38 umsetzen', 'D36, D37, D38', 'open'),
 ]),
 '2.2': ('Standort und Bau', [
  ('2.2.1', 'Geologie', 'Bericht und Fachprüfung liegen vor', 'Geschäftsführung', '–', 'Bericht 34.11/26 liegt vor (Grundlage, O01); Fachprüfung, Zusatzerkundung und Vermessung liegen vor, noch nicht im Plan abgelegt (AP-A1)', 'Kommentar 15.11.2026', 'done'),
  ('2.2.2', 'Lageplan Phase 0 und Ausbau: Lage der Objekte, Zufahrt, Leitungen, Entwässerung, freie Flächen', 'Lageplan auf Grundlage des Detailplans, vom Fachexperten geprüft', 'Architekt (Beratung) mit Fachexperte Bau', 'lage, AP-A4', 'offen; Grundlage Detailplan Blatt 3', 'D55, D56', 'open'),
  ('2.2.3', 'Objekt Phase 0 gewählt: in Teilen geliefert, über die einspurige, enge Straße transportierbar', 'Angebot mit Preis, Lieferform, größtem und schwerstem Teil, Montageaufwand', 'Projektleitung · entscheidet: Geschäftsführung', 'hausart, AP-A0, AP-C1', 'offen', 'D56, GB1; Kommentar 17.11.2026', 'open'),
  ('2.2.4', 'Zufahrt und Transport, im Sommer und im Winter', 'Streckenprotokoll; Spediteur bestätigt schriftlich, dass die Teile auf kleinem Fahrzeug hochkommen; Winterräumung geregelt', 'Projektleitung', 'AP-A0, AP-C3', 'Phase 0 entschieden: kleines Fahrzeug, keine Befestigung am Anfang (D57); Strecke noch nicht gemessen', 'D57; Kommentar 17.11.2026', 'open'),
  ('2.2.5', 'Belege zum Grundstück', 'Kopien von Eigentumsnachweis, Detailplan und Bebauungsplan im Plan; Klärung, ob die Katasternummer für alle Teile gilt', 'liefert: Geschäftsführung · legt ab: Projektleitung', 'AP-A1', 'Grundstück im Besitz, Detailplan und Bebauungsplan liegen vor (Kommentar 12.11.2026); Kopien fehlen im Plan', 'Kommentar 12.11.2026 im Whitepaper', 'open'),
  ('2.2.6', 'Genehmigung: was aufgestellt und bewohnt werden darf', 'Schriftliche Auskunft', 'Architekt (Beratung), Anwälte Ukraine', 'lage, O05', 'offen', '–', 'open'),
  ('2.2.7', 'Leitungen geplant: Wasser, Abwasser, Strom, Internet', 'Leitungsplan', 'Fachexperten', 'AP-A4', 'offen', 'D59 bis D63', 'open'),
  ('2.2.8', 'Fundament und Aufstellen', 'Objekte stehen auf dem Fundament, abgenommen', 'Fachexperte Bau', 'AP-D3, G1', 'wartet', 'Geologiebericht 34.11/26', 'wait'),
 ]),
 '2.3': ('Versorgung', [
  ('2.3.1', 'Ressourcenbilanz für Team und erste Mieter: Energie (auch E-Bikes), Wärme, Wasser, Kommunikation; je Ressource Last, Quelle, Reserve und Ausfallfolge', 'Tabelle mit Ausbaustufen, Werte vom Fachexperten bestätigt', 'planende KI aus M02 · bestätigt: Fachexperte', 'AP-C5 (Größe der Charge 1)', 'teilweise; die M02-Mengen gelten für 3 Personen und werden für Team plus erste Mieter neu gerechnet', 'M02', 'open'),
  ('2.3.2', 'Lösung je Ressource', 'entschieden', 'Geschäftsführung', '–', 'Netz mit Generator, Solar ab Phase 1; Grundwasser mit Aufbereitung; Sanitär fest ab Phase 0; Holzofen; Internet mit Vergleich', 'D59 bis D63', 'done'),
  ('2.3.3', 'Abnahmeliste vor dem Einzug', 'Abnahmetabelle ausgefüllt und von der Projektleitung freigegeben', 'Fachexperten · Freigabe Projektleitung', 'AP-E1', 'Entwurf in AP-E1', 'D66', 'open'),
  ('2.3.4', 'Vor dem ersten Frost fertig: Heizung nach Heizlast, frostfreie Wasserleitung, Toilette und Batterie im Warmen, Generator draußen', 'Abnahme durch Fachexperten', 'Fachexperte Heizung', 'G3', 'wartet', 'D59, D60', 'wait'),
  ('2.3.5', 'Messung bei Frost im ersten Winter', 'Alle M02-Zeilen „Grundbetrieb“ bei Frost gemessen und bestanden', 'Team · wertet aus: planende KI', 'AP-F1', 'später', 'M02', 'later'),
  ('2.3.6', 'E-Bikes und Laden: wie viele, wo geladen wird, welche Leistung, wer zahlt', 'Last in 2.3.1 und Kosten im Register', 'bereitet vor: planende KI · entscheidet: Geschäftsführung', '2.3.1', 'offen', '–', 'open'),
  ('2.3.7', 'Kritische Fehlerarten und zulässige Tests (FMEA) für Wärme, Wasser, Strom für die Arbeit, Brand und CO, Zugang', 'Je Funktion Fehlerart, Wirkung, Erkennung, Maßnahme, Test; vom Fachexperten bewertet', 'entwirft: planende KI · bewertet: Fachexperte', '2.3.1, 2.3.2', 'offen', 'M06', 'open'),
 ]),
 '2.4': ('Menschen', [
  ('2.4.1', 'Team oben: Rollen, Plätze, Finanzierung; je Person, womit sie Geld verdient, Geräte, Strom und Internet', 'Liste je Rolle', 'Geschäftsführung und Projektleitung', '–', 'offen', '–', 'open'),
  ('2.4.2', 'Whitelist der künftigen Mieter', 'Whitelist läuft, Einträge gezählt', 'Projektleitung', 'AP-A8, 2.5.4', 'noch nicht eingerichtet (Kommentar 12.11.2026: „ist nicht vorhanden, kommt erst“)', 'D50; Antwort 17.11.2026', 'open'),
  ('2.4.3', 'Werbematerial für Mietinteressenten: Video und Bilder, die Objekte realitätsnah auf dem Grundstück', 'Video und Bilder fertig; der Jurist hat die Texte gesehen', 'Projektleitung mit KI', '2.5.4', 'in Arbeit', '–', 'run'),
  ('2.4.4', 'Kommunalgebäude: Arbeitsplatz, Küche, Sanitär, Gemüsegarten', 'Planung mit Kosten', 'Geschäftsführung mit Architekt (Beratung)', 'AP-G2', 'erster Bau in Phase 1', 'D64', 'later'),
  ('2.4.5', 'Betrieb oben: wer Holz, Wasser, Schnee und Wartung übernimmt', 'Liste mit Aufgaben und Rollen', 'Geschäftsführung und Projektleitung', '2.4.1', 'offen', '–', 'open'),
  ('2.4.6', 'Was es vor Ort gibt: Holz, Lebensmittel, Reparatur, Kraftstoff, Handwerker, Transport', 'Liste mit Anbieter, Preis, Entfernung, im Winter erreichbar', 'ausführende KI · prüft: Projektleitung', '–', 'offen', '–', 'open'),
  ('2.4.7', 'Absprachen oben und Notfallplan, auch bei gesperrter Auffahrt', 'Schriftliche Absprachen; Notfallplan mit Vorräten (Menge legt der Fachexperte fest)', 'Projektleitung', '2.4.1, 2.4.2', 'offen', 'M02-08', 'open'),
  ('2.4.8', 'Wer macht was selbst: je Leistung (Planung, Transport, Fundament, Aufstellen, Anschlüsse, Innenausbau) selbst, mit Hilfe oder extern', 'Liste je Leistung mit Stunden und Fachkosten', 'bereitet vor: planende KI · bestätigen: Geschäftsführung und Projektleitung', '2.4.1', 'offen', 'D70', 'open'),
  ('2.4.9', 'Nutzungstest mit drei Personas: Prüfsituationen T00 bis T06', 'Matrix M02 ausgefüllt mit Kriterium, Nachweis, Prüfer, Datum', 'führt: Projektleitung · bestätigen: Fachexperten', '2.3.7', 'offen; T00 vor der Bestellung, T01, T05, T06 vor dem Einzug', 'M02', 'open'),
 ]),
 '2.5': ('Firma und Recht', [
  ('2.5.1', 'Wer tritt auf: Rechtsform der Gesellschaften', 'siehe O11', 'Geschäftsführung', 'O11', 'nach D44', 'D44', 'open'),
  ('2.5.2', 'Verhältnis von Holding, Agentur und Node-Gesellschaft', 'Antwort des Anwalts', 'Anwalt Deutschland', 'O05', 'Prüfauftrag', '–', 'open'),
  ('2.5.3', 'Welche Arbeit, welches Geld und welche Rechte zu X-PORTAL gehören und welche zur Agentur', 'Übersicht, von Geschäftsführung und Projektleitung freigegeben', 'Geschäftsführung und Projektleitung', '2.5.1', 'offen', '–', 'open'),
  ('2.5.4', 'Website und Whitelist rechtlich geprüft, auch „Daten in der EU“ gegen die Server oben', 'Ein Jurist hat die Texte gesehen', 'Projektleitung', 'AP-A8', 'offen', 'GB10', 'open'),
  ('2.5.5', 'Vertrags- und Rollenmodell: wer vermietet, wer betreibt die Infrastruktur, wer erfüllt welche Zusage, was der Token ist', 'Antworten der Anwälte in Deutschland und der Ukraine', 'Anwälte', 'O05, AP-A6', 'Prüfauftrag', 'D45, D48', 'open'),
  ('2.5.7', 'Ablage: KI arbeitet sicher und DSGVO-konform auf OneDrive', 'Testordner ohne Personaldaten verbunden; Zustimmung des Admins; Vertrag zur Auftragsverarbeitung', 'Projektleitung', '–', 'offen', '–', 'open'),
  ('2.5.8', 'Förderung', 'Gespräch mit dem Förderer geführt', 'Geschäftsführung', 'O11', 'offen; nicht öffentlich zeigen', 'D47', 'open'),
 ]),
 '2.6': ('Umsatz', [
  ('2.6.1', 'Erster bezahlter Auftrag mit Testkarte (M09)', 'Bezahlte Rechnung', 'Geschäftsführung und Projektleitung', '2.6.2', 'offen; laufend, vor dem Investorengespräch', 'D51, D71', 'open'),
  ('2.6.2', 'Preismodell für Agenten: Abo, Einmalzahlung mit Betreuung, nach Nutzung', 'Modell entschieden, mit Kosten je Leistung', 'rechnet: planende KI · entscheiden: Geschäftsführung und Projektleitung', '–', 'offen', '–', 'open'),
  ('2.6.4', 'Agenten über Masumi verkaufen', 'Erster bezahlter Verkauf eines Agenten', 'Team oben', '2.6.1', 'später', '–', 'later'),
  ('2.6.6', 'Schema für den nächsten Node: Standards getrennt von den Werten dieses Grundstücks (System Model, Datenwörterbuch)', 'Probe: Ein geänderter Standortparameter macht betroffene Anforderungen, Varianten und Beschlüsse auffindbar', 'planende KI · Geschäftsführung', 'AP-H3', 'später; Probe vor G1', 'Z4', 'later'),
 ]),
}

ENTFALLEN = [
 ('2.1.1 Angebot je Gruppe: Kaufpreis, Pacht, Miete', 'kein Verkauf (D45, D48); ersetzt durch Selbstkosten, Miete und Pauschale (O03, D49)'),
 ('2.1.2 Kosten je Plot', 'ersetzt durch Selbstkosten je Objekt (O03, D49) und Make-or-Buy (Ast 4)'),
 ('2.5.6 Technik für den Verkauf: Token, Pachtvertrag, Zahlung', 'kein Verkauf (D45, D48); Token über Cardano nach Rechtsprüfung (AP-A6, AP-B2)'),
 ('2.6.3 Das Team oben liefert alle Projekte; eigenes Produkt nur Agenten', 'Entscheidung aus dem zurückgenommenen Log (E70); bei Bedarf neu entscheiden'),
 ('2.6.5 Kapital über die Chain: fraktionalisiertes Land', 'ersetzt durch Token über Cardano nach Rechtsprüfung (AP-A6, AP-B2; D37, D48)'),
 ('Überblick 4: Ablauf in BPMN 2.0', 'beruhte auf Verkauf ab Januar 2027 und 5 Käufern; ersetzt durch den Ablaufplan A bis H'),
 ('Überblick 5: Business Case mit Papierrechnung (30.000 € je Plot)', 'kein Verkauf; Business Case ist Whitelist, Chargen und Mieterlöse (Kommentar 17.11.2026, AP-C5, AP-F3)'),
 ('Überblick 6: Stand und Blocker mit festen Zahlen', 'Zahlen vom 04.11. waren eingetragen, nicht gezählt; jetzt zählt der Generator aus dem Baum'),
 ('Kapitel 1 Endprodukt und Ziele', 'steht aktuell in der Grundlage'),
 ('Kapitel 3.0 bis 3.2: Weg, Gates, Freigaben', 'stehen aktuell in Ast 1 und in den Beschlussblättern (M03)'),
 ('Kapitel 3.4 Terminkette rückwärts mit Verkauf im Januar und Containern im März', 'Termine sind Ziele (D58); ersetzt durch Bestellzeitpunkte rückwärts (AP-C4)'),
 ('Kapitel 5 Entscheidungen kurz und Log E01–E85', 'Log am 13.11.2026 zurückgenommen; Historie steht in Ast 8'),
 ('Anhang A2 Bekannte Werte Geld (Preis je Plot, Hochrechnung)', 'kein Verkauf; Kosten im Kostenregister vom 13.11.2026'),
 ('Anhang A6 Freigabe zum Aufstellen', 'steht als Ausgänge bei „frost“ und G2 in Ast 1'),
 ('O16 Widersprüche zwischen alten Entscheidungen', 'Log zurückgenommen'),
 ('O24 Terminkette', 'ersetzt durch AP-C4'),
]

# Offene Punkte aus Kapitel 4, die nicht im Baum standen: wohin sie gehen
O_ZIEL = {'O14': 'te-2-2-5', 'O26': 'AP-A1', 'O29': 'te-2-3-1', 'O25': 'te-2-3-6', 'O27': 'AP-A2', 'O28': 'AP-A4',
          'O30': 'AP-A7', 'O32': 'te-2-1-8', 'O24': 'AP-C4', 'O19': 'AP-A4', 'O06': 'te-2-1-3', 'O15': 'b-plan', 'O20': 'b-anforderungen', 'O21': 'AP-A7'}

STEUERUNG = [
 ('Bei jeder Runde zuerst die Eingänge', 'Bevor etwas geändert wird, liest die planende KI die Kommentare auf allen Seiten (Index, Entscheidungsseite, Vor dem Investment, Anschaffungen, SGMM, Whitepaper) und die Antworten in der Datenbank. Jeder Eingang steht im Änderungsprotokoll mit Seite, Datum, Wortlaut, Umsetzung und Stelle; danach prüft ein Skript alle Seiten auf alten Stand.', 'Vorgabe vom 17.11.2026'),
 ('Montag, 15 Minuten', 'Geschäftsführung und Projektleitung gehen den Plan durch: was fertig ist, was überfällig, was frei. Der Wechselkurs wird neu angesetzt.', 'Index 2.0, 3.3 (M10)'),
 ('Neue Markt- oder Preisinformation', 'Mit Quelle und Datum notieren, als Fakt, Angebotspreis, Annahme oder Szenario kennzeichnen, mit der betroffenen Annahme und dem nötigen Test oder Beschluss.', 'Index 2.0, 3.3 (M08)'),
 ('Monatsende', 'Eine Zeile: was lief, was nicht, was ändern wir, was kommt ins Schema für den nächsten Node. Größere Probleme als A3-Fall: Beobachtung, Ausgangswert, Ursache, Maßnahme, Freigabe, Ergebnis, Änderung am Standard.', 'Index 2.0, 3.3 (M11)'),
 ('Quartal', 'Plan, Methoden und Bausteine im Ganzen: was wird vereinfacht, was bleibt, was wird vertieft.', 'Index 2.0, 3.3'),
]

METHODEN = [
 ('M01', 'Zielbaum und kompakte Ergebniskennzahlen', 'jetzt; Zielblatt in der Grundlage'),
 ('M02', 'Nutzungsszenarien, Anforderungs- und Testmatrix', 'jetzt; Ast 2, Werte vom Fachexperten offen'),
 ('M03', 'Angepasste PRINCE2-Steuerung, eindeutige Rollen', 'jetzt; Beschlussblätter, Gates'),
 ('M04', 'Ausgewählte Abläufe und Entscheidungstabellen', 'jetzt; Ausgänge im Baum'),
 ('M05', 'Make-or-Buy, Vollkosten, Sensitivität', 'vor der Investition; Ast 4'),
 ('M06', 'Ressourcenbilanzen, gezielte FMEA, Szenariotests', 'vor der Investition und im Pilot; Ast 3, 2.3.1, 2.3.7'),
 ('M07', 'Systemmodell, Schnittstellen und Konfiguration', 'Probe vor G1; 2.6.6'),
 ('M08', 'Markt, PESTL und Trends mit Quellen', 'jetzt, je Entscheidung'),
 ('M09', 'Umsatz und Technologiepartner: Experimente, Ergebnisrechnung', 'jetzt; 2.6.1'),
 ('M10', 'Arbeitsfluss und Terminplan nach Abhängigkeiten', 'jetzt; Ablaufplan, AP-C4'),
 ('M11', 'Verbesserung (PDCA), A3-Fälle, Standardversionen', 'jetzt; ab Betrieb mit mehr Daten'),
]

PRUEFAUFTRAEGE = '''Prüfaufträge an die Anwälte (aus Anhang A5 vom 04.11.2026, auf Stand 17.11.2026; Token-Fragen in AP-A6)

Deutschland
1. Mietinteressenten auf der Whitelist: Was gilt für Daten, Werbung und Zusagen? Dürfen wiederkehrende Mieterlöse im Pitch als Nachweis gezeigt werden?
2. Dürfen personenbezogene Daten zwischen Servern oben in der Ukraine und Servern in Deutschland verarbeitet und übertragen werden (DSGVO, Drittland, Auftragsverarbeitung)? Was braucht es dafür (D47)?
3. Verhältnis von Holding, Agentur und Node-Gesellschaft: Wie wird es gesellschaftsrechtlich umgesetzt, und wo muss die Gesellschaft sitzen, damit die Förderung möglich ist?
4. Was darf Werbung für einen Ort in der Ukraine versprechen (Reisewarnung, Lage)?

Ukraine
5. Dürfen Ausländer Objekte auf dem Grundstück nutzen oder mieten; was gilt für die Node-Gesellschaft als Vermieter?
6. Gilt ein vorgefertigtes Objekt dort als Gebäude oder als bewegliche Sache; was braucht es zum Aufstellen und Bewohnen (2.2.6)?
7. Mietvertrag: Form, Sprache, Steuern, Meldepflichten.
8. Wo werden Miete und Pauschale versteuert, in der Ukraine oder in Deutschland?
9. Einnahmen in USDM über Masumi: Wie werden sie verbucht und versteuert; braucht der Umtausch in Euro eine Erlaubnis?'''
