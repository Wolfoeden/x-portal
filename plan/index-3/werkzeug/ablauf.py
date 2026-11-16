"""Ablaufplan Node001 von Schritt 1 bis Projektende (Ast 1 des Index 3.0), Stand 16.11.2026.

Jedes Arbeitspaket (AP) hat: Wann, Voraussetzungen, Blockiert, Grundbestimmungen, Rolle, Ergebnis,
fertige Unterlagen zum Kopieren und, wo sinnvoll, einen Auftrag für die ausführende KI.
Nichts wird automatisch bestellt oder versendet. Termine ohne Quelle gibt es nicht; unbekannte Vorläufe stehen als offen.
"""

# Grundbestimmungen: gegen sie wird jedes Arbeitspaket geprüft.
GB = [
    ('GB1', 'Weg nach oben', 'Letzte etwa 200 m mit über 15 % Steigung, unbefestigt. Bis 2,6 m Breite Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug. In Phase 0 kommt alles auf kleinem Fahrzeug hoch, keine Befestigung am Anfang. Im Winter muss geräumt werden.', 'Standortangaben im Index (Anhang A3); D57'),
    ('GB2', 'Boden und Hang', 'Rutsch- und Fließprozesse; Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Streifen- und Stützfundament, hangseitige Stützkonstruktion und Entwässerungsgraben; Zusatzerkundung für Zufahrt, Stützbauwerke und massive Gebäude.', 'Geologiebericht 34.11/26'),
    ('GB3', 'Lage', 'Phase 0: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche; Grundlage ist der Detailplan Blatt 3.', 'D55; Detailplan'),
    ('GB4', 'Frost und Termine', 'Gebaut wird nur ohne Frost. Termine sind Ziele und gelten erst nach den Gates.', 'D58'),
    ('GB5', 'Sanitär', 'Spültoilette (Klopapier spülbar), Dusche, Warmwasser und Abwasser ab Phase 0 fest eingebaut.', 'D62'),
    ('GB6', 'Wasser', 'Grundwasser, aufbereitet zu Trinkwasser; Anfangsstufe bauen, Ausbau vorbereiten.', 'D61'),
    ('GB7', 'Strom', 'Netzanschluss mit Generator als Reserve; Solar mit Speicher ab Phase 1.', 'D59'),
    ('GB8', 'Geld und Freigabe', 'Eigenkapital bis zur fertigen Bauplanung, danach Investoren. Bestellt wird nur mit Freigabe der Geschäftsführung und Geld auf dem Konto.', 'D43, D46, D47'),
    ('GB9', 'Recht', 'Rechtsprüfung vor Mietvertrag, Token, Import und Fällung. Kein öffentliches Angebot, bevor die Rechtslage geklärt ist.', 'D48'),
    ('GB10', 'Datenschutz und Sicherheit', 'Kamera, Zugang und Daten nur mit geprüftem Konzept; Server oben nur bei VC-Funding mit Deutschland verbunden.', 'XP-SYS-009; D47'),
    ('GB11', 'Rollen und Freigabe', 'Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.', 'D43'),
]
GB_IDS = {g[0] for g in GB}

KI_TEILUNG = [
    ('Planende KI', 'das höchste verfügbare Modell', 'Plan und Abhängigkeiten, Entscheidungsvorlagen, fertige Unterlagen, Prüfung jedes Schritts gegen die Grundbestimmungen, Prüfung der Ergebnisse der ausführenden KI.'),
    ('Ausführende KI', 'ein kleineres Modell', 'Arbeitet die Aufträge der Arbeitspakete ab: Recherche, Übersetzung, Tabellen füllen, Entwürfe schreiben. Liefert im vorgegebenen Format, mit Quelle und Abrufdatum. Entscheidet nichts, bestellt nichts, versendet nichts.'),
    ('Mensch', 'Geschäftsführung, Projektleitung, Fachexperten', 'Prüft, entscheidet, gibt frei, verschickt die Unterlagen und bestellt.'),
]

REGELN_AUFTRAG = ('Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. '
                  'Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.')

def AP(N, nid, title, state, wann, voraus, blockiert, gb, rolle, ergebnis, vorlagen=(), auftrag=None, text=None, anr=None, see=None):
    facts = [('Wann', wann), ('Voraussetzung', voraus), ('Blockiert', blockiert), ('Grundbestimmungen', ', '.join(gb)), ('Rolle', rolle), ('Ergebnis', ergebnis)]
    if anr:
        facts.append(('Anschaffungen', anr))
    n = N('step', nid, title, state, text=text, facts=facts, see=see)
    n['ap'] = dict(wann=wann, voraus=voraus, blockiert=blockiert, gb=list(gb), rolle=rolle, ergebnis=ergebnis)
    n['vorlagen'] = [dict(titel=t, text=x) for t, x in vorlagen]
    n['auftrag'] = (auftrag.strip() + '\n\n' + REGELN_AUFTRAG) if auftrag else None
    return n

def ANFRAGE_OBJEKT(sprache):
    if sprache == 'en':
        return '''Subject: Request for quotation – insulated living/working module, Carpathians (Ukraine), delivery in parts

Dear Sir or Madam,

we are planning a living and working module for 2–3 persons in the Ukrainian Carpathians (approx. 1,050 m above sea level, winters down to −20 °C). Please send us a quotation including:

1. Model, floor area, interior height, wall/roof/floor build-up and U-values; suitability for −20 °C.
2. Delivery form: in parts or as complete module. Dimensions and weight of the heaviest and the largest part. The last 200 m of the access road are unpaved with more than 15 % gradient; transport width up to 2.6 m without permit.
3. Sanitary: prepared or installed flush toilet, shower, hot water, drainage connection.
4. Electrical installation, heating options (wood stove with chimney, electric backup).
5. Foundation requirements (point loads); our soil report recommends strip and retaining foundations.
6. Assembly: time, crew, tools, lifting equipment required; can a small team assemble it?
7. Price, Incoterms (FCA/DAP Ukrainian border), delivery time, payment terms, warranty.
8. Documents for export/import: invoice, packing list, certificate of origin, HS code.

This is a request for information and quotation only, not an order.

Kind regards
[Projektleitung, X-PORTAL]'''
    return '''Betreff: Angebotsanfrage – gedämmtes Wohn- und Arbeitsmodul, Karpaten (Ukraine), Lieferung in Teilen

Sehr geehrte Damen und Herren,

wir planen ein Wohn- und Arbeitsmodul für 2–3 Personen in den ukrainischen Karpaten (etwa 1.050 m Höhe, Winter bis −20 °C). Bitte senden Sie uns ein Angebot mit:

1. Modell, Fläche, Raumhöhe, Aufbau und U-Werte von Wand, Dach und Boden; Eignung für −20 °C.
2. Lieferform: in Teilen oder als ganzes Modul. Maße und Gewicht des schwersten und des größten Teils. Die letzten 200 m der Zufahrt sind unbefestigt mit über 15 % Steigung; Transportbreite bis 2,6 m ohne Genehmigung.
3. Sanitär: vorbereitet oder eingebaut für Spültoilette, Dusche, Warmwasser, Abwasseranschluss.
4. Elektroinstallation, Heizung (Holzofen mit Schornstein, elektrische Reserve).
5. Anforderungen an das Fundament (Punktlasten); unser Gutachten empfiehlt Streifen- und Stützfundament.
6. Montage: Dauer, Personen, Werkzeug, Hebegerät; ist Montage durch ein kleines Team möglich?
7. Preis, Lieferbedingung (FCA oder DAP ukrainische Grenze), Lieferzeit, Zahlungsbedingungen, Gewährleistung.
8. Unterlagen für Export und Import: Rechnung, Packliste, Ursprungszeugnis, Warennummer.

Dies ist eine Anfrage, keine Bestellung.

Mit freundlichen Grüßen
[Projektleitung, X-PORTAL]'''

def bau(N, X, O, alt):
    """Gibt den neuen Ast 1 zurück. alt: bestehende Knoten des Ast 1 nach id."""
    G = lambda gid, title, kids, text=None: N('group', gid, title, kids=kids, text=text)

    A = G('ab-a', 'A · Vor dem Investment: klären, was ein Investor sonst einpreist', [
        alt['O01'],
        AP(N, 'AP-A1', 'Geologie: deutsche Zusammenfassung mit dem ukrainischen Original abgleichen', 'open',
           'jetzt', 'Originalbericht 34.11/26 (16 Seiten) und Zusammenfassung XPB-N001-GEO-SUM-001 liegen vor', 'Fundament, Lage von Phase 0, Angebote',
           ['GB2', 'GB11'], 'führt aus: ausführende KI, dann Projektleitung · prüft: Architekt (Beratung)',
           'Abweichungsliste; geklärte Stellen, zum Beispiel die Mächtigkeit der bewegten Schichten (0,8–1,2 m gegen 0,9–1,2 m)',
           auftrag='''Ziel: Die deutsche KI-Zusammenfassung des Geologieberichts Satz für Satz mit dem ukrainischen Original abgleichen.
Eingang: Originalbericht (PDF, Ukrainisch), Zusammenfassung XPB-N001-GEO-SUM-001 (PDF, Deutsch).
Vorgehen: Für jede Zahl und jede Empfehlung der Zusammenfassung die Fundstelle im Original (Seite, Absatz) angeben und den Originalwortlaut zitieren; Übersetzung prüfen.
Ausgabe: Tabelle mit den Spalten Aussage Zusammenfassung | Fundstelle Original | Originalwortlaut | stimmt / weicht ab / fehlt | Hinweis.'''),
        AP(N, 'AP-A2', 'Wasseranalyse im Labor', 'open',
           'jetzt; Vorabprobe aus dem vorhandenen Grundwasser, Endprobe nach der Brunnenbohrung', 'akkreditiertes Labor gefunden', 'Auslegung der Aufbereitung, Angebot Brunnen und Aufbereitung',
           ['GB6', 'GB11'], 'entscheidet: Geschäftsführung · führt aus: Projektleitung · prüft: Fachexperte Wasser',
           'Laborbericht mit Bewertung als Trinkwasser und Empfehlung zur Aufbereitung', anr='A048, A053, A054',
           vorlagen=[('Anfrage an ein Labor (Deutsch; Ukrainisch durch die ausführende KI, von einer Muttersprachlerin geprüft)', '''Betreff: Anfrage Trinkwasseranalyse, Grundwasser, Bereschnyzja (Werchowyna)

Guten Tag,

wir möchten Grundwasser auf einem Grundstück in Bereschnyzja, Ortsteil Hrun (Kataster 2620885502:02:001:0013) auf Eignung als Trinkwasser untersuchen lassen. Bitte nennen Sie uns:
1. Parameterumfang für Trinkwasser nach ukrainischer Norm, einschließlich Mikrobiologie, Eisen, Mangan, Nitrat, Härte, Trübung.
2. Probenahme: durch Sie oder durch uns; Gefäße, Kühlung, Zeit bis zur Abgabe.
3. Preis, Dauer bis zum Bericht, Akkreditierung.

Mit freundlichen Grüßen
[Projektleitung, X-PORTAL]''')],
           auftrag='''Ziel: Akkreditierte Labore für Trinkwasseranalysen in der Oblast Iwano-Frankiwsk finden und vergleichen.
Ausgabe: Tabelle mit Labor | Ort | Akkreditierung | Parameterumfang | Preis | Dauer | Probenahme vor Ort möglich | Kontakt | Quelle.'''),
        AP(N, 'AP-A3', 'Netzanschluss: wer ist zuständig, was kostet er, wie lange dauert er', 'open',
           'jetzt, wegen der Bearbeitungszeit; die Frist selbst ist offen', 'Lastliste Phase 0 und Ausbau vom Fachexperten Elektro; Katasternummer; Eigentumsnachweis', 'Strom in Phase 0, Größe des Generators, Leitung zum Grundstück',
           ['GB7', 'GB8', 'GB11'], 'entscheidet: Geschäftsführung · führt aus: Projektleitung · prüft: Fachexperte Elektro',
           'Bescheid oder schriftliche Auskunft mit Leistung in kW, Kosten, Frist und Anschlusspunkt', anr='A018–A021',
           text='Zuständig ist vermutlich der Verteilnetzbetreiber der Oblast Iwano-Frankiwsk (АТ „Прикарпаттяобленерго“); das ist zu bestätigen. Aus einer früheren Recherche: etwa 2.927 UAH je kW ohne Leitung; Quelle beim Netzbetreiber bestätigen.',
           vorlagen=[('Anfrage an den Netzbetreiber (Deutsch; Ukrainisch durch die ausführende KI, geprüft)', '''Betreff: Anfrage Netzanschluss, Grundstück Bereschnyzja, Kataster 2620885502:02:001:0013

Guten Tag,

für das Grundstück in Bereschnyzja, Ortsteil Hrun (Gemeinde Werchowyna), Kataster 2620885502:02:001:0013, planen wir einen Netzanschluss. Bitte teilen Sie uns mit:
1. Ob Sie zuständig sind, und wenn nicht, wer.
2. Nächster Anschlusspunkt und verfügbare Leistung.
3. Antragsweg (Standardanschluss oder Einzelanschluss), benötigte Unterlagen, Gebühr je kW und Kosten der Leitung bis zur Grundstücksgrenze.
4. Bearbeitungs- und Bauzeit.
Geplante Leistung: [Wert vom Fachexperten Elektro] kW in der ersten Stufe, Erweiterung auf [Wert] kW vorgesehen.

Mit freundlichen Grüßen
[Geschäftsführung, Node-Gesellschaft bzw. Eigentümer]''')],
           auftrag='''Ziel: Für das Kataster 2620885502:02:001:0013 (Bereschnyzja, Gemeinde Werchowyna, Oblast Iwano-Frankiwsk) den zuständigen Verteilnetzbetreiber, das Antragsverfahren, die aktuelle Gebühr je kW für Standard- und Einzelanschluss, die Fristen und die nötigen Unterlagen ermitteln.
Ausgabe: Tabelle mit Punkt | Ergebnis | Quelle | Abrufdatum; dazu Kontaktdaten der zuständigen Stelle.'''),
        alt['hausart'],
        AP(N, 'AP-A4', 'Bauplanung Phase 0 mit Bau-KI und 3D-Modell (Basis of Design)', 'open',
           'nach Lage (O01) und Geologie-Abgleich (AP-A1)', 'Detailplan, Geologiebericht, Lastliste, Raumliste aus Ast 2', 'Angebote, Bestellung, Selbstkosten',
           ['GB1', 'GB2', 'GB3', 'GB5', 'GB6', 'GB7'], 'entscheidet: Geschäftsführung · führt aus: Fachexperte Bau mit Bau-KI · berät: Architekt',
           'Basis of Design: Objekt, Fundament, Entwässerung, Leitungen (Wasser, Abwasser, Strom, Internet), Weg, Lageplan; Grundlage für alle Anfragen', anr='A010',
           auftrag='''Ziel: Das Eingangspaket für die Bauplanung zusammenstellen.
Eingang: Detailplan Blatt 3, Geologiebericht und Abgleich (AP-A1), Anforderungen Ast 2 (Maslow und Sinne), Grundbestimmungen GB1–GB11.
Ausgabe: Liste der Planungsvorgaben je Gewerk (Objekt, Fundament, Entwässerung, Wasser, Abwasser, Strom, Internet, Weg) mit Quelle der Vorgabe und offenen Werten, die ein Fachexperte festlegen muss.'''),
        AP(N, 'AP-A5', 'Angebote für die großen Posten einholen', 'open',
           'nach der Bauplanung (AP-A4)', 'Basis of Design', 'Kostenband, Selbstkosten, Investorengespräch',
           ['GB1', 'GB8', 'GB11'], 'führt aus: Projektleitung · entscheidet: Geschäftsführung',
           'Je Posten drei schriftliche Angebote: Objekt Phase 0, Fundament mit Stützkonstruktion, Brunnen mit Aufbereitung, Kläranlage mit Einbau, Netzanschluss mit Leitung',
           see=[('#b-O31', 'Angebote (Ast 5)'), ('#b-AP-C1', 'Objekt: Ungarn, Polen, Alibaba')]),
        alt['O03'],
        alt['mieter'],
        AP(N, 'AP-A6', 'Token über Cardano: Rechtsprüfung', 'open',
           'jetzt; vor jeder Ansprache von Kleinanlegern', 'Anwälte in Deutschland und der Ukraine (O05)', 'Token-Crowdfunding (AP-B2)',
           ['GB9', 'GB11'], 'beauftragt: Geschäftsführung · prüft: Anwälte',
           'Schriftliche Einordnung des Tokens und Liste der Pflichten vor einem Angebot',
           vorlagen=[('Prüfauftrag an die Anwälte', '''Betreff: Prüfauftrag Token auf Cardano für Node001

Wir prüfen, ob Mitwirkende und Unterstützer über einen Token auf Cardano an Node001 beteiligt werden können. Bitte beantworten Sie:
1. Einordnung nach EU-Recht: Kryptowert nach MiCA (welche Kategorie) oder Finanzinstrument/Wertpapier? Was folgt daraus (Whitepaper, Prospekt, Erlaubnis, Plattform)?
2. Einordnung nach ukrainischem Recht über virtuelle Vermögenswerte; Besitz und Nutzung durch Ausländer.
3. Zwei Varianten: (a) Token als Nutzungsrecht oder Vorab-Miete am Node; (b) Token als Beteiligung an der Node-Gesellschaft, nicht an der Holding.
4. Pflichten zu KYC, Geldwäsche, Verbraucherschutz, Werbung.
5. Steuern beim Ausgeber und beim Erwerber in Deutschland und der Ukraine.
6. Was muss vor einem Angebot an die Öffentlichkeit fertig sein?

Bis zur Antwort wird nichts angeboten oder beworben.''')]),
        AP(N, 'AP-A7', 'Investorenunterlagen auf den Stand bringen', 'open',
           'nach Angeboten (AP-A5) und Selbstkosten (O03)', 'Kostenband, Selbstkosten, Rechtsprüfung', 'Investorengespräche',
           ['GB8', 'GB9'], 'führt aus: planende KI · prüft: Geschäftsführung, Jurist',
           'Whitepaper und Deck mit Meilensteinen aus diesem Ablaufplan, Mittelverwendung je Phase, Risiken; Beträge erst nach Angeboten'),
    ], text='Mit Eigenmitteln und Eigenleistung; Richtwert etwa 10.000 € (D69 offen).')

    B = G('ab-b', 'B · Kapital: vermieten können, Investoren, Token', [
        alt['G0'],
        AP(N, 'AP-B1', 'Investorengespräche', 'open',
           'nach Stufe A, Zeitpunkt nach D71', 'Unterlagen (AP-A7), Struktur (O05)', 'Bestellung Phase 0',
           ['GB8', 'GB9'], 'führt: Geschäftsführung · bereitet vor: Projektleitung',
           'Zusage oder Absage mit Bedingungen; Protokoll je Gespräch',
           vorlagen=[('Anschreiben an Investoren', '''Betreff: X-PORTAL Node001 – Gespräch zu einem ersten Bauabschnitt

Guten Tag,

X-PORTAL verbindet bezahlte digitale Arbeit mit realen Orten. Node001 entsteht in den ukrainischen Karpaten auf einem 2-ha-Grundstück; Geologiebericht und Detailplan liegen vor, die Bauplanung für einen ersten Abschnitt ist [Stand]. Finanziert ist die Planung aus Eigenkapital; für Infrastruktur und Objekte suchen wir Investoren, verbunden mit wiederkehrenden Erlösen aus Miete und Services.

Gern stellen wir Ihnen Whitepaper und Präsentation in einem Gespräch vor.

Dies ist kein Angebot von Wertpapieren oder Vermögensanlagen.

Mit freundlichen Grüßen
[Geschäftsführung]''')]),
        alt['O23'],
        AP(N, 'AP-B2', 'Token-Crowdfunding über Cardano vorbereiten', 'later',
           'erst nach der Rechtsprüfung (AP-A6)', 'schriftliche Einordnung, Struktur der Node-Gesellschaft', '–',
           ['GB9', 'GB10'], 'entscheidet: Geschäftsführung · prüft: Anwälte',
           'Entscheidungsvorlage zu Variante, Pflichten, Plattform und Zeitplan (wird in Stufe 3 ausgearbeitet)'),
        alt['G1'],
    ])

    C = G('ab-c', 'C · Beschaffung, Import und Transport', [
        AP(N, 'AP-C1', 'Objekt Phase 0: Anbieter aus Ungarn, Polen und über Alibaba vergleichen', 'open',
           'nach der Bauplanung (AP-A4); bestellen spätestens Lieferzeit plus Zoll plus Transport vor dem Montagebeginn (AP-C4)', 'Basis of Design', 'Bestellung, Logistik, Zoll',
           ['GB1', 'GB2', 'GB4', 'GB5', 'GB8'], 'führt aus: ausführende KI und Projektleitung · entscheidet: Geschäftsführung',
           'Vergleichstabelle mit mindestens je drei Anbietern; drei Angebote für die engere Wahl', anr='A009',
           vorlagen=[('Anfrage an Anbieter (Deutsch, für Ungarn und Polen)', ANFRAGE_OBJEKT('de')), ('Request for quotation (English, for Alibaba and others)', ANFRAGE_OBJEKT('en'))],
           auftrag='''Ziel: Anbieter gedämmter Wohn- und Arbeitsmodule (auch Container-Bauweise und Bausätze in Teilen) in Ungarn, Polen und über Alibaba finden und nach den Grundbestimmungen vergleichen.
Prüfkriterien: Maße und Gewicht des größten und schwersten Teils (Zufahrt: über 15 % Steigung, bis 2,6 m Breite ohne Genehmigung), Eignung für −20 °C, Sanitär vorbereitet (Spültoilette, Dusche, Warmwasser), Lieferform, Montageaufwand, Lieferzeit, Preis und Lieferbedingung, Gewährleistung, Bewertungen.
Ausgabe: Tabelle mit Herkunft | Anbieter | Modell | Fläche | Teile und Gewicht | Wintertauglichkeit | Sanitär | Lieferzeit | Preis | Lieferbedingung | passt zu GB1 ja/nein/offen | Quelle.'''),
        alt['lieferant'],
        AP(N, 'AP-C2', 'Import in die Ukraine: Importeur und Verzollung', 'open',
           'vor der Bestellung', 'Rechtsform der Node-Gesellschaft (O11); Angebot mit Warennummer und Ursprung', 'Lieferung',
           ['GB8', 'GB9', 'GB11'], 'führt aus: Projektleitung mit Zollbroker · prüft: Steuerberater, Anwälte',
           'Klarheit, wer importiert (Node-Gesellschaft oder Importdienstleister), welche Abgaben anfallen und welche Unterlagen nötig sind; Angebot eines Zollbrokers',
           text='Zu klären: Einfuhr aus der EU (Ungarn, Polen) mit Ursprungsnachweis gegenüber Einfuhr aus einem Drittland (China über Alibaba). Warennummer für vorgefertigte Gebäude, Zoll, Einfuhrumsatzsteuer; alle Sätze zu bestätigen.',
           vorlagen=[('Fragen an einen Zollbroker', '''Betreff: Anfrage Verzollung vorgefertigtes Wohnmodul, Lieferung nach Werchowyna

Guten Tag,

wir planen die Einfuhr eines vorgefertigten Wohnmoduls (Bausatz in Teilen) nach Bereschnyzja, Gemeinde Werchowyna. Herkunft: [Ungarn / Polen / China]. Bitte nennen Sie uns:
1. Wer als Importeur auftreten kann (unsere ukrainische Gesellschaft oder Sie als Dienstleister) und was wir dafür brauchen.
2. Warennummer, Zollsatz, Einfuhrumsatzsteuer und weitere Abgaben; Präferenz bei Ursprung in der EU.
3. Benötigte Unterlagen (Rechnung, Packliste, Frachtbrief, Ursprungsnachweis, Zertifikate).
4. Ihr Honorar und die Dauer der Abfertigung; Zollstelle in der Nähe.

Mit freundlichen Grüßen
[Projektleitung]''')],
           auftrag='''Ziel: Für die Einfuhr eines vorgefertigten Wohnmoduls in die Ukraine klären: Warennummer, Zollsatz, Einfuhrumsatzsteuer, Präferenz bei EU-Ursprung, Unterlagen, wer Importeur sein kann; Zollbroker in der Oblast Iwano-Frankiwsk oder an den Grenzübergängen zu Ungarn und Polen.
Ausgabe: Tabelle Frage | Antwort EU-Ursprung | Antwort Drittland | Quelle; dazu Liste Zollbroker mit Ort, Leistungen, Kontakt, Quelle.'''),
        AP(N, 'AP-C3', 'Logistik bis zum Fuß der Zufahrt, Übergabe an das kleine Fahrzeug', 'open',
           'mit der Bestellung; Termin rückwärts vom Montagebeginn (AP-C4)', 'Maße und Gewichte aus dem Angebot (AP-C1); Umschlagplatz unten', 'Montage',
           ['GB1', 'GB4', 'GB11'], 'führt aus: Projektleitung · entscheidet: Geschäftsführung',
           'Angebot einer Spedition bis zum Fuß der Zufahrt; Plan für Umschlag und letzte Meile mit Fahrzeug, Hebegerät und Personen', anr='A081',
           vorlagen=[('Anfrage an eine Spedition', '''Betreff: Transportanfrage Bausatz Wohnmodul nach Bereschnyzja (Werchowyna)

Guten Tag,

bitte senden Sie uns ein Angebot für den Transport von [Anzahl] Packstücken, größtes Teil [L × B × H], schwerstes Teil [Gewicht], gesamt [Gewicht], von [Abholort] nach Bereschnyzja, Gemeinde Werchowyna, bis zum Fuß der Zufahrt. Die letzten 200 m schaffen nur kleine Fahrzeuge; dort wird umgeladen.
Bitte nennen Sie: Fahrzeug, Preis, Dauer, Zollabwicklung (falls angeboten), Versicherung, Abladen mit Kran oder Stapler.

Mit freundlichen Grüßen
[Projektleitung]''')],
           auftrag='''Ziel: Speditionen finden, die von Ungarn, Polen und aus einem Drittland in die Oblast Iwano-Frankiwsk liefern, möglichst mit Zollabwicklung und Abladen per Kran; dazu lokale Anbieter für die letzte Meile (Traktor, Allrad-Transporter, Hebegerät) im Raum Werchowyna.
Ausgabe: Tabelle Anbieter | Strecke | Fahrzeuge | Zoll | Kran | Kontakt | Quelle.'''),
        alt['zufahrt'],
        AP(N, 'AP-C4', 'Bestellzeitpunkte rückwärts vom Montagebeginn', 'open',
           'sobald Angebote mit Lieferzeiten vorliegen', 'Lieferzeiten (AP-C1), Zollabwicklung (AP-C2), Transportdauer (AP-C3), Frostgrenze (GB4)', 'Bestellung',
           ['GB4', 'GB8'], 'rechnet: planende KI · entscheidet: Geschäftsführung',
           'Tabelle je Posten: spätester Bestelltag = Montagebeginn minus Lieferzeit, Zoll, Transport und Puffer. Bis Angebote vorliegen, sind alle Vorläufe offen.',
           anr='alle Positionen mit Phase 0'),
    ])

    D = G('ab-d', 'D · Bau Phase 0', [
        AP(N, 'AP-D1', 'Bäume fällen, Baufläche und Trasse roden, Holz einlagern', 'open',
           'nach Fällgenehmigung und Lage (O01); Holz braucht etwa ein Jahr zum Trocknen', 'Fällgenehmigung, Motorsägenkurs, Schutzausrüstung', 'Entwässerung, Fundament; Brennholz für den zweiten Winter',
           ['GB2', 'GB3', 'GB9'], 'führt aus: Team (Eigenleistung) · entscheidet: Geschäftsführung',
           'Gerodete Fläche, gestapeltes Holz im Lager, Stundenbuch', anr='A007, A035–A047'),
        AP(N, 'AP-D2', 'Entwässerungsgraben und Stützkonstruktion', 'open',
           'nach Bauplanung (AP-A4)', 'Planung durch Fachexperten', 'Fundament',
           ['GB2', 'GB4'], 'plant: Fachexperte Bau · führt aus: Firma oder Team · nimmt ab: Fachexperte',
           'Hangwasser wird abgeleitet; Stützbauwerk nach Statik', anr='A004, A006, A008'),
        AP(N, 'AP-D3', 'Fundament für das Objekt Phase 0', 'open',
           'nach Entwässerung (AP-D2), ohne Frost (GB4)', 'Bemessung durch Fachexperten; Lasten aus dem Angebot (AP-C1)', 'Montage',
           ['GB2', 'GB4'], 'plant und nimmt ab: Fachexperte Bau', 'Fundament nach Empfehlung des Gutachters', anr='A005'),
        AP(N, 'AP-D4', 'Leitungen: Wasser, Abwasser, Strom, Internet', 'open',
           'mit Fundament; frostfrei verlegt', 'Brunnen (A049), Kläranlage (A058), Netzanschluss (AP-A3)', 'Einzug',
           ['GB5', 'GB6', 'GB7'], 'plant: Fachexperten · führt aus: Firmen · nimmt ab: Fachexperten',
           'Leitungen verlegt, Leerrohre für den Ausbau gleich mitgelegt', anr='A049–A073'),
        alt['frost'],
        alt['technik'],
        AP(N, 'AP-D5', 'Zugang über Cardano', 'open',
           'Konzept vor der Bestellung der Türen; Einbau mit der Montage', 'Datenschutzkonzept (GB10), Entscheidung zur Variante', 'Erfassung der Gemeinschaftsarbeit (D36)',
           ['GB10', 'GB11'], 'entscheidet: Geschäftsführung · führt aus: Lead Developer',
           'Variante gewählt, Schlösser und Lesegeräte bestellt, mechanischer Schlüssel als Reserve', anr='A116–A120',
           text='Varianten: (a) Chip oder Karte am Schloss, Cardano nur für die Erfassung und Anrechnung der Gemeinschaftsarbeit; (b) Zugangsrecht als Token in einer Wallet; (c) zuerst ein übliches System, Cardano später angebunden. Muss offline funktionieren.',
           auftrag='''Ziel: Lösungen für Zugangskontrolle mit Cardano-Anbindung finden: Schlösser und Lesegeräte mit offener Schnittstelle (NFC), Offline-Betrieb, bestehende Projekte für Zugang per Token oder NFT auf Cardano.
Ausgabe: Tabelle Lösung | Hardware | offline | Cardano-Anbindung | Datenschutz | Preis | Quelle.'''),
    ])

    E = G('ab-e', 'E · Abnahme und Einzug', [
        AP(N, 'AP-E1', 'Abnahmetabelle', 'open',
           'vor dem ersten Übernachten', 'Anforderungen Ast 2, Zielwerte je Funktion (OD-002)', 'G2',
           ['GB5', 'GB6', 'GB7', 'GB10', 'GB11'], 'füllen: Fachexperten · prüft und gibt frei: Projektleitung (D66)',
           'Jede kritische Funktion abgenommen',
           vorlagen=[('Abnahmetabelle', '''Funktion | Anforderung (Ast 2) | Prüfverfahren | Grenzwert | Ergebnis | Fachexperte | Datum | Freigabe Projektleitung
Wärme | H02, H03, S01 | Morgenwert nach 8 h ohne Feuer | 12 °C Schlafen, 16 °C Arbeiten | | | |
Wasser | H04, H05 | Laborbefund nach Aufbereitung | Trinkwasser nach Norm | | | |
Sanitär | H06 | Spülung, Dusche, Warmwasser, Abfluss | funktioniert bei Frost | | | |
Strom | S03, D04 | Netzausfall 6 h | Muss-Lasten laufen | | | |
Internet | D01 | 2 Videocalls 30 min | Upload ausreichend, keine Abbrüche | | | |
Brandschutz | S01 | Melder, Löscher, Ofenabstände | vollständig | | | |
Zugang | GB10 | Öffnen mit Chip und mit Schlüssel | beides geht | | | |''')]),
        alt['G2'],
    ])

    F = G('ab-f', 'F · Erster Winter und Betrieb', [
        alt['G3'],
        AP(N, 'AP-F1', 'Messreihen: Wärme, Holzfeuchte, Wasser, Strom, Internet', 'later',
           'ab Einzug, den ganzen ersten Winter', 'Messgeräte (A045 und weitere)', 'Bewertung der Hypothesen, Standards für den nächsten Node',
           ['GB11'], 'führt aus: Team · wertet aus: planende KI', 'Messwerte ersetzen Annahmen im Plan'),
        AP(N, 'AP-F2', 'KI mit Kamera, die den Normalzustand misst', 'later',
           'Leerrohr und Strom schon in Phase 0 vorsehen; Betrieb erst mit geprüftem Konzept', 'Datenschutzkonzept (GB10), Nutzen nachgewiesen (Baseline Regel 7)', '–',
           ['GB7', 'GB10', 'GB11'], 'entscheidet: Geschäftsführung · führt aus: Lead Developer',
           'Konzept: was gemessen wird, wo Kameras hängen, wo ausgewertet wird, wer Zugriff hat; dann Pilot',
           text='Gedacht für Außen- und Technikbereiche, nicht für Wohnräume: Schnee auf Antenne und Solar, Wasser am Hang, Rauch, Zustand der Zufahrt, Technikraum. Auswertung vor Ort. Prüft die Hypothese H6 (KI-Nutzen gegenüber einer einfachen Lösung).',
           auftrag='''Ziel: Lösungen für kamerabasierte Anomalieerkennung mit Auswertung vor Ort finden (Kamera plus lokaler Rechner, Software, Stromverbrauch, Betrieb bei −20 °C, Datenschutz-Einstellungen).
Ausgabe: Tabelle Lösung | Hardware | lokale Auswertung | Leistungsaufnahme | Wintertauglichkeit | Datenschutz | Preis | Quelle.'''),
        alt['G4'],
    ])

    Gp = G('ab-g', 'G · Phase 1: Kommunalgebäude und Objekte', [
        AP(N, 'AP-G1', 'Zusatzerkundung für Phase 1', 'later', 'sobald Lage und Bauart der Gebäude feststehen', 'Bauplanung Phase 1', 'Fundamente Phase 1',
           ['GB2'], 'beauftragt: Geschäftsführung · führt aus: Bohrfirma', 'Bericht für Zufahrt, Stützbauwerke und massive Gebäude', anr='A002'),
        AP(N, 'AP-G2', 'Kommunalgebäude', 'later', 'erster Bau in Phase 1 (D64)', 'Kapital, Zusatzerkundung', 'Objekte für Mieter',
           ['GB1', 'GB2', 'GB5', 'GB8'], 'entscheidet: Geschäftsführung · plant: Fachexperte Bau', 'Arbeitsplätze, Küche, Sanitär; Feuerstelle und Sauna (D34, D35)', anr='A109–A115'),
        AP(N, 'AP-G3', 'Objekte für Mieter und Team', 'later', 'nach dem Kommunalgebäude, nach Nachfrage (D50)', 'Mietinteressenten, Selbstkosten', 'Phase 2',
           ['GB1', 'GB2', 'GB8', 'GB9'], 'entscheidet: Geschäftsführung', 'Objekte bezogen, Mietverträge'),
        AP(N, 'AP-G4', 'Solar mit Speicher', 'later', 'Phase 1 (D59)', 'Lastliste, Messwerte aus dem Winter', '–',
           ['GB7'], 'entscheidet: Geschäftsführung · plant: Fachexperte Elektro', 'Anlage in Betrieb', anr='A028'),
    ])

    H = G('ab-h', 'H · Phase 2 und Projektende', [
        AP(N, 'AP-H1', 'Ausbau nach Nachfrage', 'later', 'nach Phase 1', 'Auslastung, Kapital', '–', ['GB3', 'GB8'], 'entscheidet: Geschäftsführung',
           'Weitere Objekte; die Herrenhaus-Fläche wird zuletzt bebaut'),
        AP(N, 'AP-H2', 'Hypothesen H1 bis H8 bewerten', 'later', 'nach dem ersten Winter und nach Phase 1', 'Messgrößen und Grenzen (OD-005)', 'nächster Node',
           ['GB11'], 'wertet aus: planende KI · entscheidet: Geschäftsführung', 'Go, Revise oder Stop je Hypothese'),
        AP(N, 'AP-H3', 'Übergabe an den nächsten Node', 'later', 'nach Bewertung (AP-H2)', 'Standards und Regeln aus Node001', '–', ['GB11'],
           'führt aus: planende KI · entscheidet: Geschäftsführung', 'Genome-Regeln mit Quelle, Messwert und Vertrauensniveau'),
    ])
    return [A, B, C, D, E, F, Gp, H]

def alle_ap(nodes):
    for n in nodes:
        if 'ap' in n:
            yield n
        yield from alle_ap(n.get('kids', []))

def pruefe(nodes):
    fehler = []
    for n in alle_ap(nodes):
        for k, v in n['ap'].items():
            if not v:
                fehler.append(f'{n["id"]}: Feld {k} leer')
        for g in n['ap']['gb']:
            if g not in GB_IDS:
                fehler.append(f'{n["id"]}: unbekannte Grundbestimmung {g}')
    return fehler
