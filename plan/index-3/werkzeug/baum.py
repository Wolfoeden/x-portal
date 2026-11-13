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
KI = 'Möglichkeiten: Vorschlag KI aus dem offenen Punkt, noch keine Entscheidung (E80 gilt erst, wenn ihr eine wählt).'

hauptweg = [
    N('chance', 'O01', 'Geologie: Wo trägt der Grund, wie viele Stellplätze gehen?', 'wait',
      meta='Paul mit Nazar · Bericht bis 30.11.2026 (Vorschlag KI)',
      text='3 Schürfe bis 2,5 m, 12 Bohrpunkte bis 1,5 m. Nazar hatte den Bericht am 20.10.2026 für die folgende Woche angekündigt; er liegt nicht vor. Ob der Grund trägt, legt die Fachperson fest (E22). Davon hängen Stellplätze, Fundament, Bauweise und alle Kosten ab.',
      kids=[
          X('kein Bericht', 'Paul fragt nach dem Ergebnis.', 'Wiedervorlage 30.11.2026 (Vorschlag KI). Widersprechen sich Daten oder fehlen sie, geht ein konkreter Nachweisauftrag an Nazar (A3).'),
          X('Fall A', 'Der Grund trägt; die Stellplätze gehen wie im Entwurf unten links (E34).',
            'Als Nächstes: Plots ausmessen, Kosten mit leichtem Fundament rechnen, Bausätze anfragen (O31).', state='wait',
            kids=[N('decision', None, 'Zahl der Plots und Kaufpreis festlegen; der Verkauf im Januar bleibt.', 'wait', meta='Paul und Roman · nach O01')]),
          X('Fall B', 'Der Grund trägt nur mit aufwendigem Fundament, oder es gibt weniger Stellplätze.',
            'Als Nächstes: Kosten mit schwerem Fundament rechnen und vergleichen, ob Häuser in Teilen oder feste Häuser günstiger sind.', state='wait',
            kids=[N('decision', None, 'Bauweise endgültig: bleibt es bei Häusern in Teilen (E75)?', 'wait', meta='Paul und Roman · nach O01'),
                  N('decision', None, 'Preis je Plot neu.', 'wait', meta='Paul und Roman · nach O01'),
                  N('decision', None, 'Reichen die 5 Käufer (E78)?', 'wait', meta='Paul und Roman · nach O01')]),
          X('Fall C', 'Die Fläche ist an den geplanten Stellen ungeeignet.',
            'Als Nächstes: Nazar schlägt andere Flächen auf dem Grundstück vor; der Lageplan wird neu (2.2.2).', state='wait',
            kids=[N('decision', None, 'Neuer Platz für Stufe 1.', 'wait', meta='Paul und Roman · nach O01'),
                  N('decision', None, 'Termine Januar und März neu (O24).', 'wait', meta='Paul und Roman · nach O01')]),
      ]),
    N('decision', 'hausart', 'Welche Hausart trägt der Grund: Containerhaus, Tiny House in Teilen oder festes Haus?', 'wait',
      meta='Paul und Roman · nach O01',
      text='Die Geologie zeigt, welches Fundament und damit welche Hausart geht (Fall A oder B). Bis dahin gilt: Häuser in Teilen, oben montiert (E75).',
      see=[('#b-mb-haus', 'Varianten im Make-or-Buy')], ziel=['Z1', 'Z2']),
    N('chance', 'zufahrt', 'Kommt das Haus die Zufahrt hoch, im Sommer und im Winter (2.2.4)?', 'wait',
      meta='Roman; Paul mit Nazar · Vorschlag KI bis 15.12.2026',
      text='Die letzten etwa 200 m haben über 15 % Steigung. Bis 2,6 m Breite geht ein Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug (A3). Ein Spediteur bestätigt schriftlich, dass die Teile auf kleinem Fahrzeug hochkommen; Nazar sagt, wer im Winter räumt.',
      ziel=['Z1'], kids=[X('ja', 'Die Lieferform steht fest.', 'Damit ist klar, welche Hersteller in Frage kommen.', state='wait'),
                         X('nein', 'Kleinere Teile oder eine andere Lieferform.', 'Hausart und Hersteller werden neu bewertet (2.2.3).', state='wait')]),
    N('decision', 'lieferant', 'Wer liefert und baut: welcher Hersteller, mit oder ohne Montage?', 'wait',
      meta='Roman schickt die Anfrage, Paul entscheidet die Bestellung (E71) · nach O31',
      text='Angefragt werden Servus und Supersip, dann Unitbud (O31). Die Anfrage enthält die Raumliste aus M02 und die Maße der Zufahrt als Lieferbedingung. Wer was selbst macht, steht in 2.4.8.',
      see=[('#b-mb-eigen', 'Selbst, mit Hilfe oder extern')], ziel=['Z1', 'Z2']),
    N('decision', 'technik', 'Technik im Haus: Zugang, Server, Netzwerk. Liefert der Hersteller sie mit, oder beschaffen wir sie selbst?', 'open',
      meta='Planungspunkt neu (' + VORGABE + ') · Paul und Roman',
      text='Zum Beispiel eine Zugangskontrolle mit Chip an den Türen, Server und Netzwerktechnik. Maßstab: alles läuft immer, kein Serverausfall (E46); Projektdaten sind gesichert (S05). Die Server oben werden für personenbezogene Daten mit Deutschland verbunden; ob das zulässig ist, prüfen die Anwälte (E85, A5). IT in Deutschland soll über das Matching der BW Bank laufen (2.1.7).',
      hint=KI, ziel=['Z1', 'Z3'],
      opts=[O('A', 'Der Hersteller liefert und baut ein', 'Ein Ansprechpartner; die Anforderungen gehen in die Anfrage O31.'),
            O('B', 'Wir beschaffen selbst', 'Eigene Auswahl und eigener Einbau; die Stunden gehören in 2.4.8.'),
            O('C', 'Gemischt', 'Zugang und Leitungen vom Hersteller, Server und IT selbst.')]),
    N('step', 'O03', 'Kosten je Plot gegen Erlös je Plot, dann das Preisblatt', 'open',
      meta='KI rechnet, Paul und Roman entscheiden · nach O01 und O31',
      text='Kosten je Plot (2.1.2): Bausatz, Transport, Montage, Fundament, Anschlüsse, Anteil an Kommunalgebäude und Team-Plätzen. Preisblatt (2.1.1): Kaufpreis Tiny House, Pacht für den Grund, Monatsmiete. Ausgangspunkt sind etwa 30.000 € je Käufer (E78).',
      needs=['O01', 'O31', 'D36', 'D37', 'D38', 'D40', 'D41']),
    N('gate', 'G0', 'Können wir verkaufen?', 'wait',
      meta='bis zum Verkauf im Januar 2027 · Paul und Roman geben frei oder lassen nacharbeiten',
      text='Muss fertig sein: 2.1.1, 2.1.2, 2.1.3, 2.1.8, 2.2.1, 2.2.2, 2.2.3, 2.2.4, 2.2.6, 2.3.1, 2.3.3 als Entwurf, 2.4.1 bis 2.4.4, 2.5.4, 2.5.5, 2.5.6.',
      needs=['O05', 'O11', 'O12', 'D34', 'D35', 'D36', 'D37', 'D38']),
    N('step', 'verkauf', 'Verkauf an die Warteliste ab Januar 2027', 'wait',
      meta='Roman · Warteliste gebaut, nicht live (2.4.2)',
      text='Wer auf der Warteliste steht, kauft sein Tiny House als Token und pachtet den Grund; mieten geht auch, die Miete kommt nach dem Einzug (E47, E51, E52, E59). Vorher: Rechtsprüfung (O05, A5) und ein Testkauf mit der Verkaufstechnik (2.5.6).'),
    N('chance', 'O23', 'Belegen 5 Käufer ihr Geld bis zum Bestelltermin für März?', 'open',
      meta='Paul und Roman · vor G1',
      text='Bestellt wird, wenn 5 Käufer ihr Geld belegt haben, je etwa 30.000 € (E78). Zwei Fragen sind offen: was als Beleg gilt und was bei weniger als 5 Käufern passiert.',
      kids=[
          N('decision', None, 'Was belegt „Geld bereit“?', 'open', hint=KI, opts=[
              O('A', 'Anzahlung', 'Anzahlungen erst nach der Antwort der Anwälte (O05).'),
              O('B', 'Vertrag', 'Unterschriebener Kaufvertrag.'),
              O('C', 'Finanzierungszusage', 'Käufer können finanzieren (E50); die Zusage der Bank gilt als Beleg.')]),
          X('ja', 'Bestellen.', 'Paul entscheidet über Bestellung und Betrag (E71). Mit dem Nachweis und 100 auf der Warteliste geht die Firma in die Pre-Seed-Runde (E57, E78).'),
          X('weniger als 5', 'Was dann?', state='open', kids=[
              N('decision', None, 'Bei weniger als 5 Käufern zum Bestelltermin', 'open', hint=KI, opts=[
                  O('A', 'Einzug verschieben', 'Bestellt wird, sobald 5 Käufer belegt sind; März und Einzug rücken nach hinten (O24).'),
                  O('B', 'Kleiner anfangen', 'Mit weniger Häusern bestellen, wie in E41; die Kosten je Plot werden neu gerechnet (2.1.2).'),
                  O('C', 'Nicht bestellen', 'Es wird nicht bestellt.')])]),
      ]),
    N('gate', 'G1', 'Ist genug Geld da, ist bestellt?', 'wait', meta='Januar 2027',
      text='5 Käufer haben ihr Geld belegt (O23); Geldfluss 2.1.3 bestätigt; Häuser als Bausatz bestellt mit Lieferung im März; Leitungen geplant (2.2.7); kritische Fehlerarten bewertet (2.3.7); Prüfsituation T00 vor der Bestellung (2.4.9).',
      needs=['O17', 'O23']),
    N('chance', 'frost', 'Ist der Boden im März frostfrei?', 'wait', meta='frühestens März 2027 (E55)', kids=[
        X('ja', 'Hausteile hoch und oben montieren.', 'Sie kommen auf kleinem Fahrzeug hoch und werden oben montiert (E75), auf dem Fundament, das Nazar festlegt (2.2.8).'),
        X('nein', 'Warten, bis der Boden frei ist.', 'Baubeginn erst ohne Frost (E21, E55).'),
        X('Wetter, Straße', 'Anderes Einsatzfenster nötig.', 'Einsatzplan aktualisieren, G2 neu vorlegen; Nazar (A6).'),
        X('neue Information', 'Container, Kapital oder Budget ändern sich.', 'Auswirkung rechnen, dann G1 und G2 neu; Roman koordiniert, Paul prüft (A6).'),
    ]),
    N('gate', 'G2', 'Darf eingezogen werden?', 'wait', meta='ab März 2027, sobald frostfrei',
      text='Nazar oder eine Fachperson bestätigt Heizung, Wasser, Strom und Brandschutz schriftlich (E53). Muss fertig sein: 2.2.8, 2.3.2, 2.3.3 abgenommen, 2.4.6, 2.4.9 mit T00, T01, T05, T06 und dem Fachnachweis aus T02.',
      kids=[X('abgenommen', 'Einzug.', 'Die Werbung nennt „Einzug ab Frühjahr 2027“ (E55).'),
            X('nicht abgenommen', 'Nacharbeiten und neu vorlegen.', 'Die Abnahmeliste ist noch auszuarbeiten (2.3.3).')]),
    N('gate', 'G3', 'Hält es im Winter?', 'wait', meta='vor dem ersten Frost 2027',
      text='Heizung nach Heizlast, frostfreie Wasserleitung, Toilette und Batterie im Warmen, Generator draußen; Nazar legt fest und nimmt ab (E38). Dazu Betrieb oben (2.4.5) und Absprachen mit Notfallplan (2.4.7).'),
    N('gate', 'G4', 'Haben die Leute oben Geld verdient?', 'wait', meta='erster Winter 2027/28',
      text='Messung bei Frost im ersten Winter (2.3.5); Ziele Z1 bis Z3 gemessen; die nächste Stufe wird entschieden (E01, E53).',
      kids=[N('end', 'ende', '2–3 Leute wohnen und arbeiten ganzjährig oben und verdienen dort Geld.', None,
              text='Ausgelegt für das Team plus die ersten 5 Käufer (E79). Danach bekommen Pitch, Website, DT Agentur, Plattform, weitere Nodes und Chain eigene Pläne (E69): Agenten über Masumi (2.6.4), Kapital über die Chain (2.6.5), Schema für den nächsten Node (2.6.6).')]),
]

parallel = [
    N('step', 'O05', 'Anwälte in Deutschland und der Ukraine finden und die Prüfaufträge stellen', 'open', meta='Paul und Roman · vor G0',
      text='Prüfaufträge in A5: Token mit Pacht als Anlageprodukt, Werbung, Warteliste, Datenverbindung zwischen den Servern oben und in Deutschland, UG als Pauls Tochter, Hausbesitz und Pacht für Ausländer, Steuern, Einnahmen in USDM über Masumi.',
      kids=[N('decision', 'O22', 'Mieter als Investition darstellen (W07)?', 'wait', meta='Anwalt, dann Paul und Roman · nach O05', text='Bis zur Antwort des Anwalts nur im Pitch.'),
            N('step', None, 'Verhältnis zu Pauls Unternehmen (2.5.2)', 'wait', meta='Anwalt Deutschland · nach O05', text='Wie „Pauls Tochterunternehmen ist Romans Unternehmen“ rechtlich geht (E61).')]),
    N('step', 'O12', 'Vorbereitungsbudget: wie viel Geld ist vor dem ersten Verkauf da?', 'open', meta='Paul entscheidet (E71) · vor G0',
      text='Vor dem ersten Verkauf kosten Nazar, Anwälte und die Verkaufstechnik Geld; Eigenleistung zählt nicht als Geld (2.1.6). Die 3.500 € aus dem Ausführungsplan sind ein Diskussionsvorschlag, kein Budget (3.2).'),
    N('step', 'texte', 'Texte von Warteliste und Website prüfen lassen (2.5.4)', 'open', meta='Roman · Termin festlegen',
      text='Der Jurist (Max H.) oder ein Anwalt sieht die Texte, auch die Aussage „Daten in der EU“ gegen die Server oben (E85). Veröffentlicht wird erst nach seinem Blick (3.2).'),
    N('step', 'O31', 'Angebote für Häuser in Teilen einholen', 'open', meta='KI bereitet vor, Roman schickt nach Freigabe',
      text='Zuerst Servus (Iwano-Frankiwsk) und Supersip (Chmelnyzkyj), dann Unitbud. Teilegewicht, Montageaufwand und Winterwerte nennt kein Anbieter öffentlich.',
      kids=[N('decision', 'haus', 'Welches Haus (2.2.3)?', 'wait', meta='Roman, Paul · nach O31',
              text='Angebot mit Preis, Lieferform, schwerstem Teil und Montageaufwand; Kriterium leichter Transport (E72, E75). Ein 40-Fuß-Containergerippe bleibt als Option untersucht.')]),
    N('step', 'O04', 'Erster bezahlter Auftrag mit Testkarte', 'open', meta='Roman und Paul · bis Januar 2027 (E77)',
      text='Der erste Auftrag braucht keinen Berg; er ist der schnellste Weg aus dem Huhn-Ei-Problem (2.6). Testkarte nach M09: Problem, Annahme, Zielgruppe, Test, Erfolgsschwelle, Zeit- und Euro-Rahmen.',
      kids=[N('decision', 'preis', 'Preismodell für Agenten (2.6.2)', 'open', meta='KI rechnet die Kosten, Paul und Roman entscheiden',
              text='Projekte werden verkauft, ihr Preis ist offen (E83).', opts=[
                  O('A', 'Abo'), O('B', 'Einmalzahlung mit Betreuung und Instandhaltung'),
                  O('C', 'Nach Nutzung', 'Passt zum Verkauf je Aufruf über Masumi (E56).')])]),
    N('decision', 'O11', 'Sitz der UG (W09)', 'open', meta='Paul und Roman · vor 2.1.5',
      text='Heute tritt Romans Einzelunternehmen auf, mit Sitz in Kaufbeuren; die UG wird gegründet (E61). Start-up BW verlangt Baden-Württemberg (O11).', hint=KI,
      opts=[O('A', 'Sitz in Baden-Württemberg', 'Pre-Seed aus Start-up BW bleibt möglich (2.1.5, 2.5.8).'),
            O('B', 'Sitz in Kaufbeuren', 'Wie das Einzelunternehmen; Start-up BW setzt Baden-Württemberg voraus.')]),
]

def D(did, title, ctx, opts, feeds):
    return N('decision', did, title, 'open', text=ctx, opts=[O(*o) for o in opts], feeds=feeds, page=True)

seite = [
    N('group', 'g-zielbild', 'Zielbild und Alltag', kids=[
        D('D34', 'Feuerstelle sowie Restaurant und Bar aus dem Zielbild: wann?',
          'Stufe 1 ist nur Team plus 5 Käufer (E69, E79). Gastronomie braucht Gäste, Personal, Hygiene und eigene Nachweise (M02-25 bis M02-27); die Feuerstelle braucht nur Brandschutz und einen Platz mit wenig Wind (M02-21, M02-22).',
          [('A', 'Beides später', 'Stufe 1 ohne Feuerstelle und Gastronomie; beides bekommt nach Stufe 1 einen eigenen Plan.'),
           ('B', 'Feuerstelle jetzt, Gastronomie später', 'Feuerstelle mit Grill am Kommunalgebäude in Stufe 1, mit Prüfauftrag Brandschutz. Restaurant und Bar bekommen nach Stufe 1 einen eigenen Plan.'),
           ('C', 'Beides in Stufe 1', 'Dann braucht der Plan Gästezahl, Personal, Hygiene, Wasser und Kosten dafür, vor G0.')],
          ['2.3.1', '2.1.2', 'G0', 'T03 in 2.4.9']),
        D('D35', 'Sauna: eigene oder im Ort?',
          'Zum Alltag oben gehören Sauna und Wellness (E81). Eine eigene Sauna braucht Holz oder Strom, Wasser und Brandschutz und geht in die Kosten je Plot (2.1.2).',
          [('A', 'Eigene Sauna in Stufe 1', 'Am Kommunalgebäude, geplant mit Kosten, Strom- oder Holzbedarf und Brandschutz, vor G0.'),
           ('B', 'Erst im Ort, eigene später', 'Am Anfang eine Sauna in der Umgebung (2.4.6); die eigene kommt in einer späteren Stufe.'),
           ('C', 'Keine Sauna', 'Gesundheit oben heißt Laufen, Wandern und Yoga (M02-45).')],
          ['2.1.2', '2.3.1']),
    ]),
    N('group', 'g-leistungen', 'Geld und Leistungen oben (2.1.8, O32)', kids=[
        D('D36', 'Essen oben: wie wird es bezahlt?',
          'Gegessen wird gemeinsam oder privat (E81). Offen ist, ob Essen inklusive ist, bezahlt wird oder gegen Mitarbeit geht.',
          [('A', 'Inklusive in einer Monatspauschale', 'Gemeinsames Essen ist in einer monatlichen Pauschale enthalten; privat kocht jede und jeder auf eigene Kosten.'),
           ('B', 'Selbst bezahlt', 'Jede Mahlzeit oder jeder Einkauf wird bezahlt, gemeinsam oder privat.'),
           ('C', 'Gegen Mitarbeit', 'Wer in Küche oder Garten mitarbeitet, isst gemeinsam ohne Zahlung; die Stunden werden erfasst (2.4.9).')],
          ['2.1.8', '2.1.2', 'O03']),
        D('D37', 'Wie wird das Team oben bezahlt?',
          'Das Team baut Agenten und liefert die Projekte (E70). Das geht in 2.1.8 und in das Vertrags- und Rollenmodell (2.5.5).',
          [('A', 'Honorar je Projekt', 'Die UG zahlt je Projekt ein Honorar; Wohnen und Essen zahlen die Leute selbst.'),
           ('B', 'Anteil am Umsatz', 'Jede Person bekommt einen festen Anteil am Umsatz der Projekte und Agenten, an denen sie arbeitet.'),
           ('C', 'Wohnen und Essen frei, dazu Anteil', 'Wohnen und Essen oben sind frei; dazu kommt ein kleinerer Anteil am Projektumsatz.')],
          ['2.1.8', '2.5.5', '2.4.1']),
        D('D38', 'Wie zahlen Käufer für Leistungen oben?',
          'Käufer zahlen ihr Haus (E50) und pachten den Grund (E52). Offen ist, wie sie Strom, Wasser, Internet, Sauna und Coworking bezahlen.',
          [('A', 'Monatliche Pauschale', 'Eine feste Nebenkostenpauschale im Monat für alle Leistungen oben.'),
           ('B', 'Nach Verbrauch', 'Strom und Wasser nach Zähler, Sauna und Coworking je Nutzung.'),
           ('C', 'In Kaufpreis oder Pacht', 'Die Leistungen stecken im Kaufpreis oder in der Pacht; es gibt keine eigene Abrechnung.')],
          ['2.1.8', '2.1.1', 'O03']),
    ]),
    N('group', 'g-papier', 'Papierrechnung (E84)', kids=[
        D('D39', 'Wofür stehen die rund 12 Mio. €?',
          'E84 rechnet auf dem Papier rund 12 Mio. €; E65 nennt 12,5 Mio. € als Hochrechnung der Kosten; nach E57 braucht der Ort keinen Investor.',
          [('A', 'Erlös auf dem Papier', 'Die 12 Mio. € sind der mögliche Erlös aus Plots auf 2 ha. Sie zeigen, dass die Kosten von 12,5 Mio. € in der Größenordnung gedeckt wären; E57 bleibt.'),
           ('B', 'Bewertung für die Firma', 'Die Rechnung begründet im Pitch den Wert, auf den die Firma Pre-Seed und Kapital aufnimmt. Der Ort trägt sich weiter aus Käufergeld.'),
           ('C', 'Invest in den Ort', 'Für den Ausbau über Stufe 1 hinaus darf ein Investor in den Ort kommen; dann gilt E57 nur für Stufe 1.')],
          ['Business Case', 'O06', 'O30']),
        D('D40', 'Was kaufen Käufer für 30.000 €?',
          'E78 nennt etwa 30.000 € je Käufer, E84 30.000 € je Plot. Verkauft wird das Haus, den Grund pachten die Käufer (E52, E59); E50 spricht von Plots als Token.',
          [('A', 'Das Haus', '30.000 € sind der Preis des Hauses in Teilen; der Grund wird extra gepachtet.'),
           ('B', 'Haus und Plot als Token', '30.000 € umfassen das Haus und den Token auf den Plot; Pacht kommt dazu, wenn der Grund nicht verkauft wird.'),
           ('C', 'Alles für den Einzug', '30.000 € decken Haus, Anschluss und Anteil am Kommunalgebäude; Pacht und Leistungen laufen monatlich (2.1.8).')],
          ['2.1.1', 'O03', 'Business Case']),
        D('D41', 'Was sind die 45 m² je Haus?',
          'E84 rechnet mit 45 m² je Haus. Der Container aus E39 hat 6 × 2,5 m, also 15 m²; 2.2.3 fragt Preise für 15–30 m² an.',
          [('A', 'Haus mit Terrasse und Abstand', '45 m² ist die Fläche, die ein Haus samt Terrasse, Bike-Unterstand und Abstand braucht.'),
           ('B', 'Ein größeres Haus', 'Die Häuser in Teilen werden größer als der Container, etwa 45 m² Wohnfläche; die Herstelleranfrage (O31) wird angepasst.'),
           ('C', 'Nur ein Rechenwert', '45 m² ist ein grober Wert für die Papierrechnung; Größe und Fläche legt erst die Geologie mit dem Lageplan fest (O01).')],
          ['O31', '2.2.3', 'Business Case']),
    ]),
]

def pair(title):
    return N('decision', None, title, 'open', opts=[O('A', 'Die jüngere gilt'), O('B', 'Die ältere gilt')])

imPlan = [
    N('decision', 'O16', 'Drei ältere Entscheidungen passen nicht ganz zu jüngeren', 'open', meta='Paul und Roman', hint=KI, container=True, kids=[
        pair('E02 gegen E55: gebaut wird im Sommer, oder die Container kommen ab März?'),
        pair('E41 gegen E23: stufenweise mit weniger Leuten, oder 2–3 Personen von Anfang an?'),
        pair('E10 gegen E51: die Grundstücksdaten reichen, oder die Plots werden ausgemessen?'),
    ]),
    N('chance', 'O17', 'Krise: der Krieg verschärft sich, die Auffahrt ist gesperrt oder etwas fällt länger aus', 'open', meta='Paul und Roman · vor G1', kids=[
        X('sofort', 'Notfallplan zuerst.', 'Schutzmaßnahmen folgen sofort dem Notfallplan (2.4.7); er geht jeder anderen Regel vor (A6). Im Notfall ist man in unter 2 Stunden unten (E26).'),
        N('decision', None, 'Ab wann wird abgebrochen?', 'open', text='Noch ohne Entwürfe.'),
    ]),
    N('decision', 'O18', 'Methodenpilot nach Methodenbewertung 06: macht ihr ihn, und in welchem Umfang?', 'open', meta='Paul und Roman',
      text='Vier Wochen mit dem Pilotfall Geologie-Eingang. Vor Beginn ein Aufwandrahmen in Stunden und Euro; gemessen werden Durchlaufzeit, Nachweise, Rückfragen und Nacharbeit.', hint=KI,
      opts=[O('A', 'Ja, vier Wochen mit dem Pilotfall Geologie-Eingang'), O('B', 'Nein, nicht in Stufe 1')]),
    N('decision', 'O25', 'E-Bikes: wie viele, wo geladen wird, wer zahlt (2.3.6)', 'open', meta='Paul entscheidet (E71), KI bereitet vor · vor 2.3.1',
      text='Damit niemand Benzin holen muss (E73). Die Last geht in 2.3.1, die Kosten in 2.1.2.'),
    N('decision', 'versorgung', 'Wasser, Heizung, Abwasser, Toilette und Küche: welche Lösung (2.3.2)?', 'wait',
      meta='Paul mit Nazar, Roman für Toilette und Küche · nach O01 · Vorschlag KI bis 15.01.2027',
      text='Entschieden sind Strom aus dem Netz mit Batterie oder Generator und Solar (E35) und ein eigener Internetanschluss mit Starlink als Reserve (E49).'),
    N('group', 'g-rollen', 'Rollen und Betrieb oben', kids=[
        N('decision', None, 'Team oben: wer, wie viele, welcher Platz, wer zahlt (2.4.1)', 'open', meta='Paul und Roman · Vorschlag KI bis 15.12.2026'),
        N('decision', None, 'Betrieb oben: wer Holz, Wasser, Schnee und Wartung übernimmt (2.4.5)', 'open', meta='Paul und Roman · nach 2.4.1'),
        N('decision', None, 'Wer macht was selbst: Planung, Transport, Fundament, Aufstellen, Anschlüsse, Innenausbau (2.4.8)', 'open', meta='Paul und Roman, KI bereitet vor'),
        N('decision', 'O13', 'Pauls Vollzeit: ab wann, und bis dahin wie viele Stunden je Woche (2.1.4)?', 'open', meta='Paul',
          text='Ist Paul Vollzeit dabei, sind seine 8.000 € netto im Monat unabdingbar; sie stehen nicht im Mittelpunkt des Plans (E67).'),
    ]),
]

entschieden_rows = re.findall(r'<tr><td>([^<]+)</td><td>(.*?)</td><td>(.*?)</td></tr>', page[page.find('id="k5-entscheidungen-kurz"'):page.find('id="k8-anhang')], re.S)
entschieden = []
for thema, was, quelle in entschieden_rows:
    plain = lambda s: html.unescape(re.sub(r'<[^>]+>', '', s)).strip()
    entschieden.append(N('decision', None, plain(thema), 'done', text=f'{plain(was)} ({plain(quelle)})'))


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
    N('req', None, 'Sauna und Wellness', 'untested', meta='M02-46 · aus E81; wo sie hinkommt, fragt D35', tags=['Raum', 'Versorgung'], ber='Raum, Versorgung', dom='b-M02-46'),
    N('req', None, 'Feuerstelle: Brandschutz und ein Platz mit wenig Wind', 'untested', meta='M02-21, M02-22 · offen über D34', tags=['Raum'], ber='Raum', dom='b-M02-21'),
    N('req', None, 'Gastronomie: Gäste, Personal, Hygiene, eigene Nachweise', 'later', meta='M02-25 bis M02-27 · offen über D34', tags=['Service', 'Versorgung'], ber='Service, Versorgung', dom='b-M02-25'),
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
        lvl('Ausbau', 'Lasten für das Team plus die ersten 5 Käufer, dazu das Laden der E-Bikes.', 'Neu rechnen nach der Geologie (O29); E-Bikes in 2.3.6 (E73).', 'wait'),
        lvl('Autarkie', 'Stufe 0 Netz plus Reserve, Stufe 1 zum Beispiel Solar plus Speicher.', 'Vorschlag aus der Methodenbewertung (M06). Die nächste Stufe kommt erst nach bestandenem Test.', 'open'),
        lvl('fehlt', 'Netzkapazität und Anschlussrecht.', 'Anschluss beim Nachbarn möglich, laut Eigentümer (A4); Nazar klärt (A3).', 'open')]),
    res('b-res-waerme', 'Wärme', [
        lvl('Grundbetrieb', 'Lösung offen (2.3.2).', 'Heizlast je Modul bei −20 °C rechnen (H02). Annahme: mindestens 12 °C im Schlafbereich und 16 °C im Arbeitsbereich nach 8 Stunden ohne Feuer; am Arbeitsplatz mindestens 20 °C (H03).', 'open'),
        lvl('Störung', 'Der Ofen ist über Nacht aus.', 'Winter-Arbeitstag 06:30; Rauch- und CO-Melder, Generator nur draußen (S01).', 'untested'),
        lvl('Ausbau', 'Je weiteres Haus eine eigene Heizlast.', 'Person A soll nachts nicht mehrere Öfen versorgen (Matrix, Folgen für den Plan).', 'wait'),
        lvl('Autarkie', 'Holz aus der Umgebung.', 'Was es vor Ort gibt, mit Preis und Winterzugang (E15, 2.4.6).', 'open')]),
    res('b-res-wasser', 'Wasser', [
        lvl('Grundbetrieb', 'Quellen auf oder bei dem Gelände, 50 l je Person und Tag.', 'Für 3 Personen 150 l am Tag (E26, H05).', 'rule'),
        lvl('Störung', 'Pumpe steht oder Auffahrt 10 Tage gesperrt.', 'Trinkwasser-Notvorrat 60 l für 3 Personen (H04); für 10 Tage Sperre 1.500 l (H05, Annahme).', 'untested'),
        lvl('Ausbau', '120 l je Person und Tag.', 'Für 3 Personen 360 l am Tag und 3.600 l für 10 Tage (H05, nach E26). Tank, Boiler und Leitung werden für den Ausbau vorbereitet, gebaut wird zuerst die Anfangsstufe (H05).', 'wait'),
        lvl('fehlt', 'Schüttung im Februar, Laborwerte, Abwasser.', 'O27; genehmigungsfähiges Abwasserkonzept (O28).', 'open')]),
    res('b-res-netz', 'Internet', [
        lvl('Grundbetrieb', 'Eigener Anschluss (E49).', 'Zwei Videocalls gleichzeitig: mindestens etwa 8 Mbit/s Upload in 95 % der Minuten (D01, Annahme).', 'rule'),
        lvl('Störung', 'Starlink als Reserve, auch bei Schnee; Mobilfunk gibt es oben nicht (E49).', 'Ist zusätzlich die Auffahrt frei: Ausweicharbeitsplatz unten (A03, M02-39).', 'untested'),
        lvl('Ausbau', 'Bandbreite für das Team plus die ersten 5 Käufer.', 'Neu rechnen (O29).', 'wait'),
        lvl('fehlt', 'Anbieter oben und gemessene Bandbreite.', 'A4.', 'open')]),
    res('b-res-essen', 'Essen', [
        lvl('Grundbetrieb', 'Kochen für drei Personen mit Kühlung, gemeinsam oder privat.', 'H07, E81; Küche im Kommunalgebäude (E74, 2.4.4); Kühlschrank im Mittel 40 W in der Lastliste (S03).', 'open'),
        lvl('Herkunft', 'Gemüsegarten, Höfe in der Umgebung, Lieferung über die Zufahrt.', 'Garten am Kommunalgebäude (E74); Milch und Käse vor Ort prüfen (E15, 2.4.6); Person A holt Lieferungen unten an der Auffahrt (Sommer-Arbeitstag).', 'open'),
        lvl('Störung', 'Auffahrt gesperrt: keine Lieferung.', 'Vorrat für 10 Tage nach BBK (H07, M02-08); Notfallplan 2.4.7.', 'untested'),
        lvl('Ausbau', 'Essen für das Team plus die ersten 5 Käufer.', 'Wer zahlt, fragt D36.', 'wait'),
        lvl('fehlt', 'Was der Garten wann liefert; Anbieter mit Preis, Entfernung und Winterzugang; Lieferweg im Winter.', '2.4.6, 2.2.4, 2.4.7.', 'open')]),
    res('b-res-digital', 'Daten und digitale Arbeit', [
        lvl('Grundbetrieb', 'Projektdaten gesichert, Zugang zu OneDrive und x-portal.eu geschützt.', 'S05; die KI arbeitet DSGVO-konform auf OneDrive (E12, 2.5.7).', 'open'),
        lvl('Störung', 'Eine Datei wiederherstellen; kein Serverausfall.', 'S05, E46.', 'untested'),
        lvl('Ausbau', 'Server oben für personenbezogene Daten mit Deutschland verbunden.', 'Ob das zulässig ist, prüfen die Anwälte (E85, A5).', 'wait')]),
]
ausbau = N('group', 'g-ausbau', 'Ausbaupfad: von drei Personen bis zum nächsten Node', label='dt-spine', text='Jede Stufe beginnt erst, wenn die vorige ihren Test bestanden hat (M06).', kids=[
    N('step', 'b-aus-1', 'Drei Personen: das Team oben', 'wait', text='2–3 Leute wohnen und arbeiten ganzjährig oben (E01, E23); Grundbetrieb aller Ressourcen.', ziel=['Z1'], dom='b-aus-1'),
    N('chance', None, 'Test: Nutzungstest und erster Winter', 'untested', text='T00 bis T06 (2.4.9) und die Messung bei Frost (2.3.5).'),
    N('step', 'b-aus-2', 'Team plus die ersten 5 Käufer', 'wait', text='Strom, Wasser und Wärme sind im ersten Winter schon dafür ausgelegt, sobald die Geologie so viele Häuser zulässt (E79).', ziel=['Z1', 'Z2'], dom='b-aus-2'),
    N('step', 'b-aus-3', 'Das Grundstück voll', 'wait', text='So viele Plots, wie die Geologie erlaubt; bei großem Andrang auf der Warteliste mehr (E51).', ziel=['Z2'], dom='b-aus-3'),
    N('end', None, 'Der nächste Node mit demselben Schema', None, text='Schema, Planung, Nutzbarkeit und Sinn sind wiederholbar; Geologie und Gelände sind an jedem Ort neu (E11, 2.6.6).', ziel=['Z4']),
    X('Rückfall', 'Nur eine Person oben.', 'Vorschlag aus der Matrix (S06, 03.11.2026), nicht entschieden: Gibt es bis 31.12.2026 kein bezahltes Projekt, gilt nur die Stufe „1 Person“. E77 nennt als Termin für den ersten Auftrag Januar 2027.', state='open'),
])

# ---------- Make-or-Buy (M05) ----------
def V(letter, title, *facts, state=None):
    return O(letter, title, facts=list(facts), state=state)

KURS = 'Preise aus dem Internet, bei 50 UAH/EUR (E20), ohne Montage, Transport und Anschluss, sofern nicht anders genannt.'
makebuy = [
    N('decision', 'mb-zeitraum', 'Betrachtungszeitraum für alle Vergleiche', 'open', hint=KI,
      text='Vollkosten sind nur vergleichbar, wenn jede Variante über denselben Zeitraum gerechnet wird (M05). Festgelegt ist er nicht.',
      opts=[O('A', 'Bis zum Ende von Stufe 1, Winter 2027/28'), O('B', 'Über die Nutzungsdauer der Häuser', 'Die Häuser bleiben stehen (E59).')]),
    N('decision', 'mb-haus', 'Haus für die Drei-Personen-Lösung (2.2.3)', 'open', ziel=['Z1', 'Z2'],
      text='Bauweise entschieden: Häuser in Teilen, oben montiert (E75). Mindestbedingungen aus M02: H01, H02, H06, H08, S04, D02, D03. Kippt bei: Transport (bis 2,6 m Breite ohne Genehmigung, über 3,5 m mit Begleitfahrzeug, A3), Gründung (Geologie Fall A oder B), Termin (Lieferung bis März) und Energiepreis (Heizlast). Test: Winter-Arbeitstag und Störungstag.',
      opts=[V('A', 'Bausatz in Teilen', ('Kosten', 'fehlt; Anfrage an Servus, Supersip, dann Unitbud (O31)'), ('Transport', 'kleines Fahrzeug; Teilegewicht nennt kein Anbieter (A3)'), ('Eigenleistung', 'Montage oben (2.4.8)'), ('Termin', 'Unitbud etwa zwei Monate bis fertig (A3)'), state='done'),
            V('B', 'Fertiger Wohncontainer, zum Beispiel BlokModul BK1', ('Kosten', 'ab 444.000 UAH, rund 8.900 € je Container ohne Heizung (E39, A2); Listenpreis nicht bestätigt (O31)'), ('Transport', 'verlangt 3,6 m Wegbreite und 4,5 m Durchfahrtshöhe; die letzten 200 m haben über 15 % Steigung (A3)'), ('Stand', 'durch E75 präzisiert: in Teilen statt im Ganzen')),
            V('C', '40-Fuß-Containergerippe', ('Kosten', 'fehlt'), ('Stand', 'als Option untersucht (2.2.3)')),
            V('D', 'Feste Häuser', ('Stand', 'kommt in Frage, wenn der Grund nur mit aufwendigem Fundament trägt (Fall B, O01)')),
            V('E', 'Das erste Haus selbst bauen', ('Kosten', 'Romans Schätzung: höchstens 10.000–15.000 € ohne Wasser und Strom'), ('Quelle', 'Kommentar zu D11 auf der Entscheidungsseite, 03.11.2026'), ('Stand', 'Idee, nicht entschieden'))]),
    N('decision', 'mb-strom', 'Strom: Größen und Kosten (2.3.2)', 'open', ziel=['Z1'],
      text='Entschieden ist das Prinzip: Netz mit Batterie oder Generator, dazu Solar (E35). Mindestbedingungen: S03, D04. Kippt bei: Netzkapazität, Energiepreis, Lasten im Ausbau (O29). Test: Störungstag.',
      opts=[V('A', 'Netzanschluss', ('Kosten', '2.927 UAH je kW, für 10–15 kW 29.270–43.905 UAH, rund 590–880 €, ohne Leitung zum Haus (A4)'), ('Kippt bei', 'Netzkapazität und Anschlussrecht offen')),
            V('B', 'Solar-Inselanlage 4,8 kWp mit 4,8-kWh-Batterie', ('Kosten', '189.900 UAH, rund 3.800 € ohne Montage (A4)'), ('Kippt bei', 'reicht im Winter nicht zum Heizen; die Batterie reicht nach S03 nicht sicher')),
            V('C', 'Generator als Reserve', ('Kosten', 'fehlt'), ('Betrieb', 'Kraftstoff für 3 Tage, steht draußen (S03, Annahme)'))]),
    N('decision', 'mb-waerme', 'Wärme: Ofen je Haus oder zentral (2.3.2)', 'open', ziel=['Z1'],
      text='Mindestbedingungen: H02, H03, S01, H08. Annahme: grob 1,5–3 kW Heizlast je gut gedämmtem Modul bei −20 °C (H02). Test: Winter-Arbeitstag.',
      opts=[V('A', 'Holzofen mit Kochplatte je Haus', ('Kosten', '6.000–13.000 UAH, rund 120–260 € je Ofen, ohne Schornstein und Montage (A4)'), ('Kippt bei', 'Öfen haben meist 6–10 kW; zu groß gedrosselt schwelen sie und bilden CO (H02)'), ('Eigenleistung', 'Holz machen und nachlegen, Person A')),
            V('B', 'Zentrale Wärmequelle', ('Kosten', 'fehlt'), ('Grund', 'Person A soll nachts nicht mehrere Öfen versorgen')),
            V('C', 'Ofen plus zweite Wärmequelle', ('Stand', 'ob nötig, entscheidet der Morgenwert aus H02'), ('Kosten', 'fehlt'))]),
    N('decision', 'mb-wasser', 'Wasser: wie groß wird der Speicher (2.3.2)', 'open', ziel=['Z1'],
      text='Mindestbedingungen: H04, H05. Kippt bei: Quellschüttung im Februar und Laborwerten (O27). Ausbaupfad: zuerst die Anfangsstufe, Tank, Boiler und Leitung für den Ausbau vorbereitet (H05).',
      opts=[V('A', 'Tank 1.000 l', ('Kosten', '7.000–13.000 UAH, rund 140–260 €, ohne Quellfassung, Leitung und Filter (A4)'), ('Reicht', 'knapp 7 Tage in der Anfangsstufe, knapp 3 Tage im Ausbau (H05)'), ('Kippt bei', '1.000 l wiegen 1 t; die Bodenlast prüft eine Fachperson')),
            V('B', 'Speicher für 10 Tage Sperre', ('Menge', '1.500 l in der Anfangsstufe, 3.600 l im Ausbau (H05, Annahme)'), ('Kosten', 'fehlt'))]),
    N('decision', 'mb-toilette', 'Toilette: Übergang oder dauerhaft (2.3.2)', 'open', ziel=['Z1'], text='Mindestbedingung: H06.',
      opts=[V('A', 'Campingtoilette als Übergang', ('Kosten', '1.600–3.700 UAH, rund 30–75 € (A4)')),
            V('B', 'Trenntoilette', ('Kosten', 'in der Ukraine noch kein Preis (A4)')),
            V('C', 'Toilette mit Abwasser', ('Stand', 'ein genehmigungsfähiges Abwasserkonzept fehlt (O28)'))]),
    N('decision', 'mb-netz', 'Internet: Anschluss und Reserve', 'done', ziel=['Z1', 'Z3'], text='Entschieden (E49). Mindestbedingungen: D01, Z02, A01. Test: D01 über beide Anschlüsse, Starlink bei Schnee.',
      opts=[V('A', 'Eigener Anschluss', ('Kosten', 'fehlt; Anbieter oben und Bandbreite fehlen (A4)'), state='done'),
            V('B', 'Starlink Mini als Reserve', ('Kosten', '20.820–25.900 UAH, rund 420–520 €, dazu etwa 2.950 UAH, rund 59 € im Monat (A4)'), state='done')]),
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
    ('Z1', 'Node001', '2–3 Leute wohnen und arbeiten ganzjährig oben', 'Personen, die den ersten Winter oben gewohnt und gearbeitet haben', '2–3 Personen; ausgelegt für Team plus 5 Käufer (E01, E79)', False,
     'Einzug ab Frühjahr 2027 (E55); ganzjährig nach dem Winter 2027/28', 'Roman oben; Paul mit Nazar für den Bau', 'G2, G3, G4; monatlicher Strategieabgleich (3.3)', 'Zeit: Einzug erst ohne Frost (E21). Kapital: der Ort trägt sich aus Käufergeld (E57)', '1 und 3'),
    ('Z2', 'Node001', 'Das Grundstück voll bekommen', 'Verkaufte oder vermietete Plots von der Zahl, die die Geologie erlaubt', 'Zahl der Plots nach O01, Paul mit Nazar. Schwelle zum Bestellen: 5 Käufer mit belegtem Geld, 100 auf der Warteliste (E78)', True,
     'Verkauf ab Januar 2027 (E52)', 'Roman (Verkauf), Paul (Grundstück)', 'G0, G1', 'Kapital: bestellt wird erst mit dem Geld der 5 Käufer (E78); weniger als 5 entscheidet O23', '1 und 2'),
    ('Z3', 'Node001', 'Erster bezahlter Umsatz', 'Bezahlte Rechnungen je Monat in €, getrennt von Interesse und Marge', 'Monatswert festlegen; erster Auftrag bis Januar 2027 (E77). Planwert der Matrix (S06, 03.11.2026): mindestens Pauls 8.000 € netto plus laufende Kosten oben', True,
     'bis Januar 2027, dann monatlich', 'Roman und Paul', 'monatlich (3.3)', 'Vorschlag S06, nicht entschieden: ohne bezahltes Projekt bis 31.12.2026 nur Stufe „1 Person“', '1'),
    ('Z4', 'Node001', 'Schema für den nächsten Node', 'Ein geänderter Standortparameter macht betroffene Anforderungen, Varianten und Beschlüsse auffindbar (2.6.6)', 'Probe vor G1; zweite Standortkonfiguration nach Stufe 1', False,
     'Probe vor G1, Rest nach Stufe 1', 'Paul', 'nach Stufe 1', '–', '2'),
    ('X1', 'X-PORTAL-System', 'Firma und Plattform: Pre-Seed für Plattform und Lieferteam', 'Klärungsauftrag', 'Bekannt: Node001 ist „der erste von zehn Nodes“ (E63); Pre-Seed nach dem Nachweis aus Z2 (E57, E78)', True,
     'nach Stufe 1 (E69)', 'Paul: Gesellschaft, Geld, Nodes (E62)', 'quartalsweise (3.3)', 'Kapital: Pre-Seed nur für die Firma, nicht für den Ort (E57); Kapital über die Chain erst mit Umsatz (E30)', '1 und 2'),
    ('X2', 'X-PORTAL-System', 'Paul in Vollzeit', 'Ab wann Paul Vollzeit dabei ist', 'O13. Bekannt: dann 8.000 € netto im Monat, unabdingbar (E67)', True,
     'festlegen', 'Paul', 'monatlich (3.3)', 'Geld: Pauls Lebensunterhalt zuerst (E05)', '1'),
    ('X3', 'X-PORTAL-System', 'DT Agentur: Umsatz aus Projekten über x-portal.eu', 'Bezahlter Umsatz, Interesse und Marge getrennt (M09)', 'Heute kein Umsatz, keine dauerhaften Nutzer (E08); der erste Auftrag zählt in Z3', True,
     'nach Stufe 1 (E69)', 'Roman und Paul', 'monatlich (3.3)', '–', '1'),
]

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

personen = N('step', 'b-personen', 'Für wen: drei Teammitglieder oben', 'open', dom='b-personen',
    text='Roman vor Ort: ist von Anfang an oben (E24), führt Produkt und Projekt (E62) und koordiniert den Betrieb. Zwei weitere Teammitglieder bauen Agenten und liefern die Projekte aus Deutschland, auch Cybersecurity und Blockchain (E70). Käuferinnen und Käufer wohnen in ihrem eigenen Haus und sind frei: Sie können mitmachen, müssen aber nicht (E63). Sie stehen deshalb in keinem Tagesablauf.')

spielregeln = N('step', 'b-spielregeln', 'Spielregeln oben: ein einfaches Leben aus Arbeit und Erholung', 'open', dom='b-spielregeln', ziel=['Z1'],
    meta=VORGABE,
    text='Wer oben ist, soll sich nur auf Arbeit und Erholung konzentrieren müssen. Versorgung, Technik und Betrieb laufen im Hintergrund; deshalb sind Grundbedürfnisse und Sicherheit nach Maslow geklärt, bevor jemand oben arbeitet (E53).',
    facts=[('Arbeitszeit', 'Kernzeit 9 bis 14 Uhr als Gleitzeit. Wer Kunden in einer anderen Zeitzone hat, verlegt sie, zum Beispiel auf den Abend.'),
           ('Pflicht', 'Jour fixe am Morgen und gemeinsame Aktivitäten wie Sport.'),
           ('Angebot', 'Zusammen arbeiten steht offen, ist aber keine Voraussetzung.'),
           ('Frei', 'Wellness, Sauna und Entspannung teilt sich jede und jeder selbst ein.'),
           ('Geteilt', 'Betriebsarbeiten wie Holz hacken, Wasser und Schnee übernimmt das Team im Wechsel, nach einem Plan (2.4.5).'),
           ('Käufer', 'frei; sie können bei allem mitmachen.')])

leben = N('group', 'g-m-leben', 'Einfaches Leben: Arbeit und Erholung (neu)', text='Aus den Spielregeln; diese Zeilen fehlen noch in M02 und brauchen dort Prüfverfahren und Abnahme.', kids=[
    N('req', None, 'Kernzeit 9–14 Uhr, verlegbar bei Zeitverschiebung', 'untested', meta=VORGABE, tags=['Service', 'Digital'], ber='Service, Digital', dom='b-r-L01',
      facts=[('Prüfverfahren', 'festlegen; zum Beispiel ein Kundencall am Abend über den Hauptanschluss (D01)'), ('Abnahme', 'Roman')]),
    N('req', None, 'Jour fixe und gemeinsamer Sport sind Pflicht', 'untested', meta=VORGABE + ' · Jour fixe ist M02-44', tags=['Service'], ber='Service', dom='b-r-L02'),
    N('req', None, 'Betriebsarbeit im Team geteilt, nach Plan', 'untested', meta=VORGABE + ' · Plan in 2.4.5, Absprache A02', tags=['Service'], ber='Service', dom='b-r-L03'),
    N('req', None, 'Wellness, Sauna und Entspannung frei einteilen', 'untested', meta=VORGABE + ' · Sauna M02-46, offen über D35', tags=['Raum', 'Service'], ber='Raum, Service', dom='b-r-L04'),
    N('req', None, 'Nichts im Hintergrund muss man selbst lösen: Essen, Strom, Wasser, Internet laufen', 'untested', meta='aus E46 und E54', tags=['Versorgung', 'Service'], ber='Versorgung, Service', dom='b-r-L05'),
])

anforderungen = [personen, spielregeln, leben] + stufen + [neuer, szenarien]

imPlan.append(N('group', 'g-aufteilung', 'Aufteilung: X-PORTAL, DT Agentur, Grundstücke', text='X-PORTAL ist die Dachfirma: Sie bebaut und verwaltet die Grundstücke, verwaltet die Freelancer, ordnet sie Projekten zu und baut eigene Projekte wie KI-Agenten, Blockchain und Finance Engineering. Die DT Agentur übernimmt die Projekte aus Deutschland (' + VORGABE + ').', kids=[
    N('decision', 'aufteilung', 'Was gehört zu X-PORTAL, was zur DT Agentur: Arbeit, Verträge, Geld, Rechte (2.5.3)?', 'open', meta='Roman und Paul · Vorschlag KI bis 20.11.2026', ziel=['X1', 'X2']),
    N('decision', 'rechnung', 'Wer stellt welche Rechnung: Hauskauf, Pacht, Miete, Projekte, Agenten?', 'open', meta='Paul und Roman · vor G0', text='Davon hängen Verträge (2.5.5), Steuern (A5) und der Geldfluss (2.1.3) ab.', ziel=['X1', 'X2', 'X3']),
    N('decision', 'grund', 'Grundstücke: wer ist Eigentümer, wer baut, wer verpachtet an die Käufer, wer stellt den Betrieb?', 'open', meta='Paul mit den Anwälten · vor G0', text='Bekannt: ein SPV je Grundstück, später tokenisiert (E17); das eigene und höchstens ein weiteres Grundstück (E18); Node001 steht auf Pauls Namen. Offen: wie Romans Unternehmen zu Pauls steht (2.5.2) und wo die UG sitzt (O11).', ziel=['X3']),
]))
imPlan.append(N('group', 'g-kapital', 'Kapitalentscheidungen', kids=[
    N('decision', 'krypto', 'Häuser über die Blockchain verkaufen: etwa 30.000 € je Käufer, bezugsfähig im Frühjahr 2027?', 'open', meta='Paul und Roman · vor dem Verkauf im Januar 2027 (G0)', ziel=['Z2'],
      text='Im Entscheidungslog steht: Kaufen und mieten über die Blockchain, das Tiny House tokenisiert, den Grund pachten die Käufer (E52, E59); Einzug ab Frühjahr 2027 (E55). Nach dem Deck vom 11.2026 ist das Produkt- und Preismodell eine ASSUMPTION, die validiert wird („Miete bzw. geeignetes Eigentums-/Nutzungsmodell“); Investorenunterlagen enthalten kein öffentliches Angebot von Wertpapieren, Vermögensanlagen oder Kryptowerten. Damit es trägt, muss vorher feststehen:',
      facts=[('Recht Deutschland', 'Ist der Token mit Pacht ein Anlageprodukt mit Prospekt- oder Whitepaper-Pflicht, und was darf die Werbung versprechen (A5)?'),
             ('Recht Ukraine', 'Dürfen Ausländer ein Haus auf fremdem Grund besitzen und den Grund pachten; ist der Container ein Gebäude (A5)?'),
             ('Zahlung an den Lieferanten', 'Nimmt der Hersteller Zahlung in USD-Stablecoin über die Blockchain, oder muss in UAH oder EUR getauscht werden, und braucht der Umtausch eine Erlaubnis (A5)?'),
             ('Was die 30.000 € kaufen', 'offen über D40: nur das Haus, Haus und Plot als Token, oder alles für den Einzug'),
             ('Geld bereit', 'was als Beleg gilt und was bei weniger als 5 Käufern passiert (O23)'),
             ('Technik', 'ein Testkauf läuft durch: Token, Pachtvertrag, Zahlung (2.5.6)'),
             ('Bezugsfähig', 'Lieferzeit bis März (O31) und schriftliche Abnahme vor dem Einzug (E53)')]),
    N('decision', 'preseed', 'Zwei Investment Cases: X-PORTAL Company und Node001. Welche Struktur, welcher Kapitalbedarf, welcher Investor Ask?', 'open', meta='Paul · vor externem Versand des Decks', ziel=['X1', 'X3'],
      text='Deck 11.2026: Company (Plattform, Lieferteam, wiederverwendbare KI-Lösungen, Architektur) mit Pre-Seed oder Equity-ähnlicher Finanzierung; Node001 als eigenständiger Project-/Asset-Case, Struktur nach Kosten-, Rechts- und Nachfrageprüfung. Beide wirtschaftlich und rechtlich getrennt. Vor Versand fehlen: Founder-, Ownership- und Governance-Darstellung, Produkt- und Revenue Model Node001, parametrischer Business Case mit Kapitalbedarf, Investmentstruktur, Investor Ask mit Meilensteinen. Im Log steht bisher: eine Runde nur für die Firma, nicht für den Ort (E57). Offen ist alles Weitere: wer investiert (VC, Start-up BW, andere), welche Belege die Runde braucht (O21), welcher Sitz dafür nötig ist (O11) und wofür das Geld verwendet wird. Der Nachweis aus 5 Käufern und 100 auf der Warteliste ist Romans Ausgangspunkt (E78).'),
]))
imPlan.insert(0, N('group', 'g-od', 'Offene Architekturentscheidungen der Reference Architecture v0.4 (OD-001 bis OD-008)', text='Aus Abschnitt 16 der Baseline, mit dem Gate, vor dem sie fallen müssen, und den Stellen im Plan, die dazu schon etwas sagen.', kids=[
    N('decision', None, 'OD-001 · Systemgrenze X-PORTAL Organisation ↔ Node-Betrieb', 'open', meta='DECISION REQUIRED · vor Node001 Governance Design', text='Im Plan: Aufteilung X-PORTAL, DT Agentur, Grundstücke (X1 bis X3, 2.5.3, 2.5.5).', dom='b-OD-001'),
    N('decision', None, 'OD-002 · Kritische Funktionen und Ziel-Autarkie-/Autonomiewerte für Node001', 'open', meta='OPEN · vor Basis of Design', text='Im Plan: Versorgung je Ressource mit Grundbetrieb, Störung, Ausbau (Ast 3); Werte sind Annahmen, keine geprüft (E22).', see=[('#b-ressourcen', 'Ast 3 Versorgung')], dom='b-OD-002'),
    N('decision', None, 'OD-003 · Human Roles v1.0 und priorisierte Needs', 'open', meta='IN WORK · vor Service Architecture Freeze', text='Im Plan: drei Teammitglieder und Käufer (Ast 2). Die Infografik nennt acht Rollen: Siedler, digitale Nomaden, Gäste, Remote-Siedler, Mitarbeitende, Betreiber, Partner, Investoren. Die Zuordnung fehlt (Abgleich W08).', see=[('#b-anforderungen', 'Ast 2 Alltag')], dom='b-OD-003'),
    N('decision', None, 'OD-004 · System Model / Datenmodell v0.1', 'open', meta='OPEN · vor Digital-Twin-Implementierung', text='Im Plan bisher „digitaler Zwilling der Organisation“ (2.6.6, M07); nach der Baseline ist das ein System Model, kein Digital Twin.', dom='b-OD-004'),
    N('decision', None, 'OD-005 · Node001 PoC-KPIs und Go/Revise/Stop-Grenzen', 'open', meta='OPEN · vor Investitionsfreigabe', text='Jede Hypothese H1 bis H8 braucht Messgröße, Datengrundlage, Zielwert, Prüfzeitpunkt und Go/Revise/Stop-Kriterium. Im Plan: Zielblatt Z1 bis Z4 und Gates G0 bis G4; Zielwerte fehlen großenteils.', see=[('#b-zielblatt', 'Zielblatt')], dom='b-OD-005'),
    N('decision', None, 'OD-006 · Genome Invariants v0.1', 'open', meta='IN WORK · vor Node001 Architecture Freeze', text='Im Plan: Z4 und 2.6.6; wiederholbar sind Schema, Planung, Nutzbarkeit und Sinn (E11).', dom='b-OD-006'),
    N('decision', None, 'OD-007 · Safety/Security/Privacy/Legal Baseline Node001', 'open', meta='OPEN · vor Technologie- und Betriebsfreigabe', text='Im Plan: Prüfaufträge an die Anwälte (A5), Abnahmen (E53), Zugang und Server (Technik im Haus), Datenverbindung Ukraine–Deutschland (E85).', see=[('#b-technik', 'Technik im Haus')], dom='b-OD-007'),
    N('decision', None, 'OD-008 · Parametrischer Business Case und Architektur-Sensitivitäten', 'open', meta='OPEN · parallel zur Node001 System Architecture', text='Im Plan: Make-or-Buy (Ast 4), Kosten je Plot (2.1.2), Geldfluss (2.1.3). Die Papierrechnung über 12 Mio. € (E84) ist kein Business Case (Abgleich W05).', see=[('#b-makebuy', 'Ast 4 Make-or-Buy')], dom='b-OD-008'),
]))
imPlan.append(N('decision', 'gleitzeit', 'Gleitzeit: wie wird die Kernzeit 9–14 Uhr verlegt, und wer ist für Betrieb und Notfall erreichbar?', 'open',
    meta='Planungspunkt neu (' + VORGABE + ') · Paul und Roman',
    text='Kunden in anderen Zeitzonen verschieben Arbeit auf den Abend. Offen ist, wie die Verlegung angemeldet wird und wer in dieser Zeit für Betrieb und Notfall da ist (2.4.5, 2.4.7).', ziel=['Z1', 'Z3']))

# ---------- Grundlage: Endprodukt und Ziele ----------
ZB = [
    ('Z1', 'Node001', '2–3 Leute wohnen und arbeiten ganzjährig oben', 'Personen, die den ersten Winter oben gewohnt und gearbeitet haben', '2–3 Personen; ausgelegt für Team plus 5 Käufer (E79)', False,
     'Einzug ab Frühjahr 2027 (E55), ganzjährig nach dem ersten Winter 2027/28', 'Roman oben; Paul mit Nazar für den Bau · Review G2, G3, G4', 'Zeit: Einzug erst ohne Frost (E21). Kapital: der Ort trägt sich aus Käufergeld (E57)', '1 und 3', 'E01, E23, E24; prüft H1, H2, H3'),
    ('Z2', 'Node001', 'Das Grundstück voll bekommen', 'Verkaufte oder vermietete Plots von der Zahl, die die Geologie erlaubt', 'Zahl der Plots nach O01, Paul mit Nazar. Schwelle zum Bestellen: 5 Käufer mit belegtem Geld, 100 auf der Warteliste (E78)', True,
     'Verkauf ab Januar 2027 (E52)', 'Roman (Verkauf), Paul (Grundstück) · Review G0, G1', 'Kapital: bestellt wird erst mit dem Geld der 5 Käufer (E78); weniger als 5 entscheidet O23', '1 und 2', 'E46, E51; prüft H4'),
    ('Z3', 'Node001', 'Erster bezahlter Umsatz', 'Bezahlte Rechnungen je Monat in €, getrennt von Interesse und Marge', 'Monatswert festlegen. Planwert der Matrix (S06, 03.11.2026): mindestens Pauls 8.000 € netto plus laufende Kosten oben', True,
     'bis zum Verkaufsstart im Januar 2027 (E77), dann monatlich', 'Roman und Paul · Review monatlich (3.3)', 'Vorschlag S06, nicht entschieden: ohne bezahltes Projekt bis 31.12.2026 nur Stufe „1 Person“', '1', 'E07, E08, E31, E77; prüft H4, H6'),
    ('Z4', 'Node001', 'Genome: wiederverwendbares Systemwissen für den nächsten Node', 'Systemlogik und validierte Standards getrennt von den Werten dieses Grundstücks; ein geänderter Standortparameter macht betroffene Anforderungen, Varianten und Beschlüsse auffindbar (2.6.6)', 'Probe vor G1; zweite Standortkonfiguration nach Stufe 1', False,
     'nach Stufe 1, Probe vor G1; belastbar erst mit Node002', 'Paul · Review nach Stufe 1', '–', '2', 'E11; prüft H7, H8'),
    ('X1', 'Aufteilung: X-PORTAL, DT Agentur, Grundstücke', 'X-PORTAL Organisation (Company)', 'festlegen, je Aufgabe', 'Systemgrenze Organisation ↔ Node-Betrieb (OD-001, DECISION REQUIRED) und was genau zur Organisation gehört (2.5.3). Aufgaben laut Vorgabe: Grundstücke bebauen und verwalten; Freelancer verwalten und Projekten zuordnen; eigene Projekte bauen, etwa KI-Agenten, Blockchain und Finance Engineering', True,
     'Aufteilung vor G0, eigene Ziele nach Stufe 1 (E69)', 'Paul (Gesellschaft, Geld, Nodes) und Roman (Produkt, Projekt) (E62)', 'heute tritt Romans Einzelunternehmen auf, die UG wird gegründet; Sitz offen (E61, O11)', '1 und 2', 'Vorgabe 05.11.2026; E17, E62, E63, E70'),
    ('X2', 'Aufteilung: X-PORTAL, DT Agentur, Grundstücke', 'DT Agentur: übernimmt die Projekte aus Deutschland', 'Bezahlter Umsatz, Interesse und Marge getrennt (M09)', 'Welche Projekte, welche Verträge und welches Geld bei der DT Agentur liegen und was an X-PORTAL geht (2.5.3). Heute kein Umsatz, keine dauerhaften Nutzer (E08)', True,
     'erster Auftrag bis Januar 2027 (E77)', 'Roman und Paul', '–', '1', 'Vorgabe 05.11.2026; E07, E08, E31'),
    ('X3', 'Aufteilung: X-PORTAL, DT Agentur, Grundstücke', 'Grundstücke: wem sie gehören, wer baut und verpachtet', 'festlegen', 'Wer Eigentümer ist, wer baut, wer an die Käufer verpachtet und wer den Betrieb stellt (2.5.5); wie Pauls Unternehmen dazu steht (2.5.2). Bekannt: das eigene und höchstens ein weiteres Grundstück, die übrigen von Dritten (E18); ein SPV je Grundstück, später tokenisiert (E17); Node001 steht auf Pauls Namen', True,
     'vor dem Verkauf im Januar 2027 (G0)', 'Paul (Grundstücke, E62); Anwälte (O05)', 'Kapital: der Ort trägt sich aus Käufergeld (E57)', '1 und 2', 'E17, E18, E52, E57, E62'),
]

GRUNDLAGE = """<h4 class="dt-h4">Wofür X-PORTAL steht (Reference Architecture v0.4)</h4>
<p><b>Vision:</b> „X-PORTAL entwickelt menschenzentrierte, weitgehend versorgungsautarke, operativ autonome, resiliente und wirtschaftlich tragfähige Lebens-, Arbeits- und Aufenthaltsumgebungen, in denen Mensch, physische Welt, Services, Organisation und Technologie als integriertes, lernendes Gesamtsystem zusammenwirken.“</p>
<p><b>Kerndefinition:</b> X-PORTAL definiert keinen Baukasten fertiger Lösungen, sondern einen kontrollierten Mechanismus, mit dem standortspezifische Lösungen entwickelt, betrieben, gemessen, verbessert und, soweit Evidenz es rechtfertigt, reproduziert werden. Node001 Beregniza ist die erste reale Umgebung, in der dieser Mechanismus validiert wird.</p>
<p><b>Globalziele aus dem Entscheidungslog, in dieser Rangfolge (E29):</b> 1. wirtschaftliche Tragfähigkeit und Resilienz; 2. internationale Skalierung; 3. gesellschaftlicher Nutzen. Die Baseline führt sie als Prinzipien und als Hypothesen H1 bis H8.</p>
<p><b>Entscheidungsgrundsatz:</b> Systementscheidungen werden an ihrer Wirkung auf Menschen bewertet (XP-SYS-001) und an CAPEX, OPEX und Lebenszyklus (XP-SYS-004). Menschenwürde, Sicherheit und gesetzliche Anforderungen sind verbindliche Grenzen.</p>
<p class="note">Die frühere Vision und die Mission aus E28 sind Historie; die Baseline v0.4 nennt keine Mission. Ob eine Mission bleibt, ist OPEN (Abgleich W01).</p>
<h4 class="dt-h4">Endprodukt Stufe 1</h4>
<p class="dt-endp">2–3 Leute wohnen und arbeiten ganzjährig oben und verdienen dort Geld (E01, E23, E24). Der Betrieb trägt sich selbst, X-PORTAL stellt die Basis (E54).</p>
<h4 class="dt-h4">Grundmodell eines Node (E72–E74)</h4>
<ul class="dt-gm">
<li><b>Leichter Transport:</b> Die Häuser sollen mit wenig Gerät hochkommen; darum kommen sie in Teilen und werden oben montiert (E75; 2.2.3). Ob ein kleines Fahrzeug die Teile hochbringt, prüft 2.2.4.</li>
<li><b>Kommunal und gemeinschaftlich:</b> Ein Kommunalgebäude ist der gemeinsame Ort zum Arbeiten, mit Küche und Sanitär (E40, E74; 2.4.4).</li>
<li><b>Privatsphäre:</b> Jede Person hat ihr eigenes Zuhause. Container sind nur der Anfang: In Phase 0 wohnen Team und Bauarbeiter je Person in einem eigenen Container (E40) auf der Fläche des späteren Herrenhauses (E44, E45). Ab Phase 1 wohnen Käufer und Team in richtigen Holzhäusern wie auf dem Titelbild (Vorgabe 12.11.2026; CHANGE REQUEST zu E59, Abgleich W19; <a href="https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G#bauphasen">Bauphasen</a>). Community und Gesellschaft sind vorausgesetzt.</li>
<li><b>Weitgehend versorgungsautark:</b> Strom, Wasser und Wärme wachsen Schritt für Schritt (2.3); Zielwerte je kritischer Funktion sind OPEN (OD-002). Mobilität läuft mit elektrischen Bikes statt Benzin, das Netz oben wird dafür ausgebaut (2.3.6). Der Gemüsegarten am Kommunalgebäude steht für die weitere Autarkie (E74).</li>
</ul>"""

def zielblatt_html():
    head = '<tr><th>Nr</th><th style="min-width:150px">Ziel</th><th>Messgröße</th><th>Zielwert oder Klärungsauftrag</th><th>Termin</th><th>Wer · Review</th><th>Grenze</th><th>Globalziel</th><th>Quelle</th></tr>'
    rows, last = '', None
    for zid, ebene, ziel, mess, wert, klaer, zeit, wer, grenze, auf, quelle in ZB:
        if ebene != last:
            rows += f'<tr class="dt-zgrp"><th colspan="9">{html.escape(ebene)}{' · eigene Ziele nach Stufe 1 (E69); jetzt zu klären, wer was macht' if ebene.startswith('Aufteilung') else ''}</th></tr>'
            last = ebene
        pill = '<span class="dt-bpill st-open">Klärungsauftrag</span> ' if klaer else ''
        rows += (f'<tr id="zb-{zid}"><td class="mono">{zid}</td><td><b>{linkify(ziel)}</b></td><td>{linkify(mess)}</td><td>{pill}{linkify(wert)}</td>'
                 f'<td>{linkify(zeit)}</td><td>{linkify(wer)}</td><td>{linkify(grenze)}</td><td>{linkify(auf)}</td><td>{linkify(quelle)}</td></tr>')
    zb = f'<div class="tablewrap"><table class="dt-ztab"><thead>{head}</thead><tbody>{rows}</tbody></table></div>'
    grenzen = [
        ('Zeit', 'Alle Termine sind Ziele, keine Zusagen; Baubeginn 2027 nur nach technischen, wirtschaftlichen und finanziellen Gates (Deck)', '–', 'Investment-Readiness-Gate'),
        ('Zeit', 'Verkauf ab Januar 2027 (E51): ASSUMPTION, Produkt- und Preismodell wird validiert', 'G0 nicht frei: Termine neu (O24)', 'Terminkette rückwärts (O24)'),
        ('Zeit', 'Aufstellen frühestens März 2027, nur ohne Frost (E21, E55)', 'Boden gefroren: warten (E55)', 'Lieferzeit der Hersteller (O31)'),
        ('Zeit', 'Einzug ab Frühjahr 2027, winterfest vor dem ersten Frost 2027 (E38, E55, G3)', 'nicht winterfest: kein Winter oben', 'Abbruchregel bei Krise (O17)'),
        ('Kapital', 'Zwei getrennte Investment Cases: X-PORTAL Company und Node001 (Deck 11.2026). Node001 muss aus realer Nutzung tragfähig werden; spätere IP- oder Genome-Erlöse sind kein Teil des Base Case', 'weniger als 5 Käufer zum Bestelltermin: O23', 'DECISION REQUIRED: E57 („der Ort braucht keinen Investor“) widerspricht (Abgleich W03); Kostenband und Kapitalbedarf (OD-008)'),
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
        ('Gesellschaftlicher Nutzen', 'Sichere, menschenzentrierte Orte über geprüfte Anforderungen nach Maslow und Sinnen; Wirkung auf die Region nach dem ersten Winter an echten Erfahrungen beurteilt.', 'Z1, Ast 2'),
    ]
    nu = ''.join(f'<tr><td><b>{a}</b></td><td>{linkify(b)}</td><td>{linkify(c)}</td></tr>' for a, b, c in nutzen)
    nt = f'<div class="tablewrap"><table><thead><tr><th>Globalziel, in dieser Rangfolge (E29)</th><th>Was Node001 dafür liefert</th><th>gemessen über</th></tr></thead><tbody>{nu}</tbody></table></div>'
    return (linkify_html(GRUNDLAGE)
            + f'<h4 class="dt-h4" id="b-zielblatt-tab">Ziele (Zielblatt nach M01)</h4><p>Ziel, Messgröße, Zielwert oder Klärungsauftrag, Zeithorizont, Verantwortung und Review. Jeder Ast darunter nennt unter „Dient“, auf welche Zeile er einzahlt.</p>{zb}'
            + '<p class="note">Ausgelegt wird der erste Winter für das Team (die 2–3 Leute aus E01 und E23) plus die ersten 5 Käufer, sobald die Geologie zeigt, dass so viele Häuser Platz haben (E79). Diese Ziele gelten für Node001 Stufe 1; für Stufe 1 zählt nur der Umsatz, mit dem die Leute oben Geld verdienen (Z3). Eigene Ziele für Paul, die DT Agentur, die Plattform und das ganze X-PORTAL-System kommen nach Stufe 1 dazu, ebenso das organisationsweite Modell M07 (E69); bis dahin stehen sie oben als Klärungsauftrag.</p>'
            + f'<h4 class="dt-h4" id="b-grenzen">Grenzen von Stufe 1, die entscheiden</h4><p>Zeitlich: Einzug ab Frühjahr 2027 und der erste Winter (E55). Beim Geld trägt sich der Ort aus dem Käufergeld (E57); die Obergrenze in Euro ergibt die Rechnung 2.1.3. Wirksam wird eine Grenze, wenn feststeht, was passiert, sobald sie reißt.</p>{gt}'
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
    'G0': ('KI stellt die Nachweise der Liste zusammen (E13)', 'je Teilergebnis die genannte Fachperson (E22)', 'Paul und Roman (3.1, 3.2)', 'Vorbereitungsbudget (O12)', 'bis zum Verkauf im Januar 2027', 'nicht frei: nacharbeiten und neu vorlegen'),
    'G1': ('KI rechnet den Geldfluss (2.1.3)', 'Anwälte zum Beleg „Geld bereit“ (O23, O05)', 'Gate: Paul und Roman; Bestellung und Betrag: Paul (E71)', 'Geld der 5 Käufer (E78); nur Geld auf dem Konto (3.2)', 'für die Bestellung März 2027', 'neue Information zu Container, Kapital oder Budget: G1 und G2 neu (A6)'),
    'G2': ('KI stellt Abnahmen und Prüfsituationen zusammen', 'Nazar oder eine Fachperson, schriftlich (E53)', 'Paul und Roman nach der Fachprüfung (A6)', 'im Beschluss genannt (A6)', 'für den Abschnitt, im Beschluss genannt (A6)', 'Wetter oder Straße: Einsatzplan neu, G2 neu (A6)'),
    'G3': ('KI stellt die Winterliste zusammen (E38)', 'Nazar (E38)', 'Paul und Roman', 'festlegen', 'erster Winter 2027/28', 'vor dem ersten Frost'),
    'G4': ('KI misst Z1 bis Z3', '–', 'Paul und Roman', '–', 'Stufe 1', 'Entscheidung über die nächste Stufe'),
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
        pruef = 'Anwälte (O05, A5)' if nid in LEGAL or 'Mieter' in title or 'Geld bereit' in title else 'Fachperson (E22), über Nazar (E27)' if tech else 'KI rechnet, Paul prüft (2.1.3)' if geld else '–'
        frei = 'Paul und Roman; Bestellung und Betrag: Paul (E71)' if tech or geld else 'Paul und Roman gemeinsam (3.2)'
        budget = 'festlegen; Obergrenze aus 2.1.3' if tech or geld else '–'
        m = re.search(r'(nach [^·]+|vor [^·]+|bis [^·]+)$', meta.strip())
        wv = m.group(1).strip() if m else 'Montagsrunde (3.3)'
        if wv.startswith('bis') and 'Vorschlag' not in wv:
            wv = 'spätestens ' + wv[4:]
        v = ('KI bereitet vor (E13)', pruef, frei, budget, 'für Stufe 1, bis ihr sie ändert', wv)
    keys = ('Vorbereitung', 'Fachliche Prüfung', 'Freigabe', 'Budgetgrenze', 'Gültigkeit', 'Wiedervorlage')
    return '<details class="dt-bb"><summary>Beschlussblatt (M03)</summary>' + facts_html(list(zip(keys, v))) + '</details>'

tree = [
    N('group', 'b-zielblatt', 'Grundlage: Endprodukt und Ziele', raw='ZIELBLATT', label='root'),
    N('group', 'b-hauptweg', '1 · Der Weg ab jetzt: Geologie, Haus, Zufahrt, Lieferant, Technik, dann bis zum ersten Winter', kids=hauptweg, label='dt-spine',
      text='In dieser Reihenfolge wird jetzt gearbeitet. Zuerst die Geologie: Sie zeigt, welche Hausart geht. Dann, ob das Haus die Zufahrt hochkommt, wer es liefert und baut, und wer Zugang, Server und Netzwerk stellt. Danach Kosten, Preis, Verkauf und die Gates bis zum ersten Winter.'),
    N('group', 'b-anforderungen', '2 · Alltag oben: prüfbare Anforderungen nach Maslow und Sinnen (M02)', kids=anforderungen, label='m02',
      text='Pauls Maslow- und Sinneskonzept als Anforderungen an Raum, Service, Versorgung und Digitales, jede mit Prüfverfahren und Abnahme. Stand: die 29 Zeilen vom 03.11.2026 (Artefakt „Node001 Anforderungen Mensch“) und die Spielregeln vom 05.11.2026; die M02 im Repo hat inzwischen 46 Zeilen, keine ist geprüft. Technische Werte legt eine Fachperson fest (E22).'),
    N('group', 'b-ressourcen', '3 · Versorgung je Ressource: Grundbetrieb, Störung, Ausbau (M06)', kids=versorgung + [ausbau],
      text='Je Ressource drei Zustände: normaler Betrieb, Störung und Ausbau auf das Team plus die ersten 5 Käufer (E79). Daraus folgt, was an Technik geplant werden muss.'),
    N('group', 'b-makebuy', '4 · Make-or-Buy: Varianten mit Kosten, Sensitivität und Test (M05)', kids=makebuy,
      text='Verglichen wird die betriebsfähige Drei-Personen-Lösung mit Ausbaupfad. Zuerst die Mindestbedingungen aus M02, dann Varianten mit gleichem Leistungsumfang über denselben Zeitraum mit Euro-Vollkosten und Betriebskosten, dann Nutzwert und kritische Annahmen. Sensitivität: ab welcher Änderung bei Transport, Gründung, Energiepreis oder Termin eine andere Variante besser ist. ' + KURS + ' Keine Variante ist bisher vollständig gerechnet.'),
    N('group', 'b-parallel', '5 · Parallel, ohne auf die Geologie zu warten', kids=parallel),
    N('group', 'b-seite', '6 · Offen auf der Entscheidungsseite: D34 bis D41', kids=seite, page=True,
      text='Für diese acht gibt es dort noch keine Stimme (Stand 04.11.2026). Wählt dort; der Baum zeigt die Möglichkeiten und was davon abhängt.'),
    N('group', 'b-plan', '7 · Offen im Plan, noch ohne Karte auf der Entscheidungsseite', kids=imPlan,
      text='Die offenen Architekturentscheidungen der Baseline, dazu Kapitel 4 (Art E), die Teilergebnisse, die nur ihr entscheidet, und die Planungspunkte vom 05.11.2026.'),
    N('group', 'b-entschieden', f'8 · Früher entschieden (seit 13.11. zurückgenommen): 84 im Log, nach Thema', kids=entschieden, opened=False,
      text='Je Thema ein Satz, mit den Entscheidungen dahinter. Die vollständige Liste steht unten unter „Entscheidungen E01–E85“.'),
]

ZIEL = {'O01': ['Z1', 'Z2'], 'O03': ['Z2'], 'G0': ['Z2'], 'verkauf': ['Z2'], 'O23': ['Z2'], 'G1': ['Z2'], 'frost': ['Z1'], 'G2': ['Z1'],
        'G3': ['Z1'], 'G4': ['Z1', 'Z3'], 'O05': ['Z2'], 'O12': ['Z2'], 'texte': ['Z2'], 'O31': ['Z1', 'Z2'], 'O04': ['Z3', 'X2'], 'preis': ['Z3'],
        'O11': ['X1'], 'D34': ['Z1'], 'D35': ['Z1'], 'D36': ['Z1'], 'D37': ['Z1', 'Z3'], 'D38': ['Z2'], 'D39': ['X1'], 'D40': ['Z2'], 'D41': ['Z2'],
        'O13': [], 'O17': ['Z1'], 'O25': ['Z1'], 'versorgung': ['Z1'], 'O16': [], 'O18': []}

def set_ziel(nodes):
    for n in nodes:
        if n.get('id') in ZIEL and not n.get('ziel'):
            n['ziel'] = ZIEL[n['id']]
        set_ziel(n.get('kids', []))
set_ziel(tree)

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

STATE = {'open': 'offen', 'wait': 'wartet', 'done': 'früher entschieden', 'rule': 'Regel steht', 'run': 'in Arbeit', 'later': 'später', 'untested': 'nicht geprüft'}
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

blockers = [('O01', 'Geologie', 'Paul · wartet auf Nazar'), ('O31', 'Angebote Häuser in Teilen', 'Roman · offen'),
            ('O03', 'Kosten je Plot', 'KI · nach O01 und O31'), ('O04', 'Erster bezahlter Auftrag', 'Roman und Paul · bis Januar 2027'),
            ('O05', 'Anwälte und Prüfaufträge', 'Paul und Roman · vor G0')]

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
    ('W03', 'Kapital für Node001', '„Kein Investor“ (E04); der Ort trägt sich aus Käufergeld, Pre-Seed nur für die Firma (E57)', 'Zwei getrennte Investment Cases; Node001 als eigener Project-/Asset-Case mit Kapital für Infrastruktur und ersten Bauabschnitt', 'Grenzentabelle und Planungspunkt zeigen beide Cases. E57 muss im Log geändert werden.', 'DECISION REQUIRED', 'CHANGE REQUEST'),
    ('W04', 'Produkt- und Preismodell', 'Hausverkauf als Token über die Blockchain, Grund pachten, etwa 30.000 € je Plot, Verkauf ab Januar 2027 (E50, E52, E78)', '„Miete bzw. geeignetes Eigentums-/Nutzungsmodell“, Produktmix und Preis werden validiert; kein öffentliches Angebot von Kryptowerten', 'Im Baum als ASSUMPTION geführt; Preis, Token und Januar sind keine Aussagen für Investoren.', 'ASSUMPTION', 'CHANGE REQUEST'),
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
    ('W19', 'Container oder Häuser', 'Die Container sind die Tiny Houses der Käufer und bleiben stehen; E44 (Übergang) gilt nicht mehr (E59, D21 B)', 'Vorgabe 12.11.2026 und Titelbild von Whitepaper und Deck: Container nur als Übergang für Team und Bauarbeiter auf der Herrenhaus-Fläche, danach richtige Holzhäuser für Käufer und Team', 'Endprodukt angepasst. E59, E39 und E40 brauchen Änderungen im Log (CR-01 bis CR-03 auf der SGMM-Seite); E75 bleibt für Holzhäuser in Teilen, prüfen (CR-04).', 'DECISION REQUIRED', 'CHANGE REQUEST'),
    ('W20', 'Preis je Haus', 'Etwa 30.000 € je Käufer, bezugsfertig im Frühjahr (E78, E84 mit 45 m² je Haus)', 'Richtwert Rohbau 22.000–40.000 UAH je m², für 45 m² rund 19.800–36.000 € ohne Innenausbau, Transport und Anschlüsse (ASSUMPTION, SGMM-Seite F12)', 'Preis und Hausgröße gehören in den parametrischen Business Case (OD-008); bis dahin keine Preisaussage nach außen (CR-05).', 'DECISION REQUIRED', 'CHANGE REQUEST'),
]
PILL = {'OPEN': 'st-open', 'DECISION REQUIRED': 'st-open', 'ASSUMPTION': 'st-untested', 'IN WORK': 'st-run', 'DOCUMENTED': 'st-done', 'VERIFIED': 'st-done'}
def abgleich_html():
    rows = ''.join(f'<tr id="ab-{n}"><td class="mono">{n}</td><td><b>{html.escape(t)}</b></td><td>{linkify(a)}</td><td>{linkify(b)}</td><td>{linkify(c)}</td>'
                   f'<td><span class="dt-bpill {PILL[st]}">{st}</span></td><td>{html.escape(done)}</td></tr>' for n, t, a, b, c, st, done in ABGLEICH)
    return ('<div class="tablewrap"><table class="dt-ztab"><thead><tr><th>Nr</th><th>Thema</th><th>Bisher im Index</th><th>Baseline v0.4 und Deck 11.2026</th><th>Was jetzt gilt</th><th>Status</th><th>Im Index</th></tr></thead><tbody>'
            + rows + '</tbody></table></div>')

HYP = [('H1', 'Human Value', 'Z1; Anforderungen nach Maslow und Sinnen (Ast 2), Nutzungstest 2.4.9'), ('H2', 'Autarkie & Resilienz', 'Z1; Versorgung je Ressource (Ast 3), Störungstag'),
       ('H3', 'Operational Viability', 'Z1; Betrieb oben 2.4.5, Abnahmen (E53)'), ('H4', 'Economic Viability', 'Z2, Z3; Kosten je Plot 2.1.2, Geldfluss 2.1.3, OD-008'),
       ('H5', 'Digital Value', 'OD-004; Technik im Haus'), ('H6', 'AI Value', 'Z3; eigene Agenten (E56), Preismodell 2.6.2'),
       ('H7', 'Learning Capability', 'Routine 3.3, Entscheidungslog'), ('H8', 'Replicability', 'Z4 Genome, 2.6.6; Beweis erst mit Node002')]
ra_section = ('<section id="ra"><h2>Reference Architecture v0.4: der Bezugsrahmen</h2>'
    '<p class="lede2">Seit dem 12.11.2026 ist die Reference Architecture v0.4-WB1 die gemeinsame Arbeitsreferenz für Menschen und KI. Alles Frühere in diesem Index, auch das Entscheidungslog E01 bis E85, ist Evidenz und Historie und gilt nur, soweit es der Baseline nicht widerspricht (KI-Regel 1). Widersprüche stehen im Abgleich und sind nicht stillschweigend geglättet (KI-Regel 8).</p>'
    '<p>Die Managementarchitektur nach dem St. Galler Modell, die Bauphasen (Container zuerst, dann Holzhäuser) und die Funktionsketten bis zum Werkzeug mit Internetpreisen stehen auf der <a href="https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G">SGMM-Seite</a> (Repo: <code>plan/sgmm/</code>). Für Werkzeug, Preis und Zeitaufwand zu Ast 3 (Versorgung) und Ast 4 (Make-or-Buy) gilt die SGMM-Seite.</p>'
    '<h3 id="ra-abgleich">Abgleich: Widersprüche zwischen Index und Baseline</h3>'
    f'<p>{len(ABGLEICH)} Punkte. „angepasst“: der Index sagt jetzt, was die Baseline sagt. „CHANGE REQUEST“: die Entscheidung im Log muss von Paul und Roman geändert werden. „markiert“: der alte Stand bleibt als Historie stehen und ist gekennzeichnet. „offen“: Widerspruch in den neuen Unterlagen selbst.</p>'
    + abgleich_html()
    + '<h3 id="ra-hyp">PoC-Hypothesen H1 bis H8 und wo der Plan sie prüft</h3><div class="tablewrap"><table><thead><tr><th>ID</th><th>Hypothese</th><th>Im Plan</th><th>Messgröße, Zielwert, Go/Revise/Stop</th></tr></thead><tbody>'
    + ''.join(f'<tr><td class="mono">{a}</td><td><b>{b}</b></td><td>{linkify(c)}</td><td><span class="dt-bpill st-open">OPEN</span> OD-005</td></tr>' for a, b, c in HYP)
    + '</tbody></table></div>'
    + '<h3 id="ra-text">Die Baseline im Wortlaut</h3>' + md_html(RA_MD) + '</section>\n')

NOETIG_SEC = '<section id="noetig"><h2>Was ist nötig: vor dem Investment, Phase 0, Phase 1</h2>\n<p class="lede2">Stand 13.11.2026, nach den neuen Entscheidungen mit Kommentaren und dem Kostenregister der Projektleitung. Gegliedert nach Maslow: zuerst muss das Untere stehen. Dieser Abschnitt geht dem Baum darunter vor, wo beide sich widersprechen.</p>\n<p><b>Was seit 13.11. gilt:</b> kein Immobilienverkauf im klassischen Sinn, zuerst Mieter; Selbstkostenpreis je Objekt; Eigenkapital bis zur fertigen Bauplanung, Infrastruktur und Objekte mit Investoren; X-PORTAL als Holding für Lizenzen und Marken, Agentur für Projekte im DACH-Raum, Node001 in einer ukrainischen Gesellschaft; Rollen statt Namen. Äste des Baums, die auf Käufern, Preis je Plot oder Token beruhen, sind überholt und stehen nur noch als Historie da.</p>\n<div class="tablewrap"><table><thead><tr><th>Maslow-Stufe</th><th>Vor dem Investment (Eigenkapital, Eigenleistung)</th><th>Phase 0 (ein Objekt für Team und Bauarbeiter)</th><th>Phase 1 (Objekte und Kommunalgebäude)</th></tr></thead><tbody><tr><td><b>1 · Grundbedürfnisse</b></td><td>Geprüfte Wärme- und Wasserplanung, Wasseranalyse, Holz schlagen und einlagern</td><td>Objekt mit Schlafplatz, Ofen und zweite Wärmequelle, Brunnen mit Aufbereitung, Spültoilette, Dusche, Warmwasser, Kläranlage, Küche</td><td>Wohnobjekte für Mieter und Team</td></tr><tr><td><b>2 · Sicherheit</b></td><td>Geologie-Fachprüfung, Zusatzerkundung, Rechtsprüfung der Struktur, Entwässerungsgraben, Erste Hilfe und Schutzausrüstung</td><td>Fundament und Stützkonstruktion, Netzanschluss mit Generator, Melder, Löscher, Notfallkommunikation, Versicherung</td><td>Solar mit Speicher, befestigte Zufahrt</td></tr><tr><td><b>3 · Arbeit und Verbindung</b></td><td>Angebot Internet, Antrag Netzanschluss, erster bezahlter Auftrag</td><td>Internet mit Reserve, Arbeitsplätze, kleines Fahrzeug, Räumvertrag</td><td>Arbeitsobjekte, Arbeitsplätze im Kommunalgebäude</td></tr><tr><td><b>4 · Gemeinschaft</b></td><td>Mieter-Interessenten sammeln</td><td>Gemeinsame Arbeit nach Plan (Holz, Schnee, Küche)</td><td>Kommunalgebäude zuerst, Garten, Feuerstelle, Sauna, Bergkapelle als Gruppenprojekt</td></tr><tr><td><b>5 · Entwicklung</b></td><td>Stundenbuch der Eigenleistung, Messreihen, Selbstkostenrechnung</td><td>Zugang per Chip, Erfassung der Gemeinschaftsarbeit</td><td>Zähler je Einheit, Genome-Regeln aus dem ersten Winter</td></tr></tbody></table></div>\n<h3>Gerechnete Teilsummen aus dem Kostenregister</h3>\n<div class="tablewrap"><table><thead><tr><th>Maslow-Stufe</th><th>Vor-Phase</th><th>Phase 0</th><th>Phase 1</th><th>Betrieb 12 Monate</th></tr></thead><tbody><tr><td><b>1 · Grundbedürfnisse</b></td><td>2.066–3.049 €<br><small>13 Zeilen</small></td><td>16.543–18.091 €<br><small>19 Zeilen</small></td><td>–</td><td>2.416–2.960 €<br><small>2 Zeilen</small></td></tr><tr><td><b>2 · Sicherheit</b></td><td>1.466–2.179 €<br><small>10 Zeilen</small></td><td>2.567–4.343 €<br><small>15 Zeilen</small></td><td>–</td><td>335–894 €<br><small>1 Zeilen</small></td></tr><tr><td><b>3 · Arbeit und Verbindung</b></td><td>–</td><td>4.305–4.419 €<br><small>8 Zeilen</small></td><td>–</td><td>7.999–9.522 €<br><small>5 Zeilen</small></td></tr><tr><td><b>4 · Gemeinschaft</b></td><td>–</td><td>–</td><td>–</td><td>–</td></tr><tr><td><b>5 · Entwicklung</b></td><td>–</td><td>–</td><td>–</td><td>–</td></tr></tbody></table></div>\n<p>Vor dem Investment, Optimum: 4.403–8.236 € (mit Reserve bis 9.472 €), dazu rund 443 Stunden Eigenleistung. Danach mit Investoren, Teilsumme für eine kleine Phase 0: einmalig 23.415–26.852 €, zwölf Monate Betrieb 10.750–13.376 €. 69 von 137 Positionen haben keinen Betrag; Phase 1 ist nicht gerechnet. Alle Werte sind Annahmen aus Internet-Richtwerten, keine Angebote.</p>\n<p>Einzelposten: <a href="https://claude.ai/artifact/2zHiqw7dU8oHFnsZWBsh1P">Vor dem Investment</a> und <a href="https://claude.ai/artifact/Xt8ocuZNXnnwsZNfAfPsoY">Anschaffungsliste</a> (120 Positionen A001–A120); im Repo unter <code>plan/kosten/</code> und <code>plan/anschaffungen/</code>. Entschieden wird in den Karten D69–D72 der <a href="https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP">Entscheidungsseite</a>.</p></section>\n'
section = NOETIG_SEC + f'''<section id="baum"><h2>Offener Entscheidungsbaum</h2>
<p class="reset-note" style="border:1px solid #8a5a00;background:#f6ecd4;color:#161616;padding:10px 14px;margin:0 0 12px"><b>Seit 13.11.2026 sind alle Entscheidungen E01–E85 zurückgenommen.</b> Sie stehen hier nur noch als Historie („früher entschieden“). Neu entschieden wird auf der <a href="https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP">Entscheidungsseite</a> (Karten D34–D38 und D42–D68).</p>
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
<div class="dt-bstat"><b>{n_dec_open}</b><span>Entscheidungen offen</span><small>davon 8 auf der Entscheidungsseite</small></div>
<div class="dt-bstat"><b>{n_wait}</b><span>Entscheidungen warten</span><small>auf Geologie, Angebote oder Anwälte</small></div>
<div class="dt-bstat"><b>84</b><span>früher entschieden</span><small>seit 13.11. zurückgenommen</small></div>
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

toc = ('<li><a href="#ra" data-k="ra">Reference Architecture v0.4</a><ol><li><a href="#ra-abgleich" data-k="ra-abgleich">Abgleich: Widersprüche</a></li><li><a href="#ra-hyp" data-k="ra-hyp">Hypothesen H1–H8</a></li><li><a href="#ra-text" data-k="ra-text">Baseline im Wortlaut</a></li></ol></li>'
       '<li><a href="#baum" data-k="baum">Offener Entscheidungsbaum</a><ol>'
       '<li><a href="#b-zielblatt" data-k="b-zielblatt">Grundlage: Endprodukt und Ziele</a></li>'
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
body = sub_once(body, 'X-PORTAL Index 2.0 · Node001 · Stand 04.11.2026', 'X-PORTAL Index 3.0 · Node001 · Stand 12.11.2026 · Bezugsrahmen Reference Architecture v0.4-WB1')
old_lede = '<p class="lede">Oben sechs Bilder nach PRINCE2, darunter der Plan zum Arbeiten, unten zum Nachschlagen.'
body = sub_once(body, old_lede, '<p class="lede">Ganz oben die Reference Architecture v0.4 mit dem Abgleich, dann der offene Entscheidungsbaum, dann sechs Bilder nach PRINCE2, darunter der Plan zum Arbeiten, unten zum Nachschlagen.')
body = sub_once(body, '<ol class="side"><li><a href="#ueberblick" data-k="ueberblick">', '<ol class="side">' + toc + '<li><a href="#ueberblick" data-k="ueberblick">', count=2)
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
body = sub_once(body, '<main>\n', '<main>\n' + ra_section + section) if '<main>\n' in body else sub_once(body, '<main>', '<main>' + ra_section + section)
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
body = body.rstrip() + '\n' + js

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
