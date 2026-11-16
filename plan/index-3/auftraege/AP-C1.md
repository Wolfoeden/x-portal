# Auftrag AP-C1: Objekt Phase 0: Anbieter aus Ungarn, Polen und über Alibaba vergleichen

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: nach der Bauplanung (AP-A4); bestellen spätestens Lieferzeit plus Zoll plus Transport vor dem Montagebeginn (AP-C4)
- Voraussetzung: Basis of Design
- Ergebnis wird gebraucht für: Bestellung, Logistik, Zoll
- Grundbestimmungen: GB1, GB2, GB4, GB5, GB8

  - GB1 Weg nach oben: Letzte etwa 200 m mit über 15 % Steigung, unbefestigt. Bis 2,6 m Breite Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug. In Phase 0 kommt alles auf kleinem Fahrzeug hoch, keine Befestigung am Anfang. Im Winter muss geräumt werden.
  - GB2 Boden und Hang: Rutsch- und Fließprozesse; Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Streifen- und Stützfundament, hangseitige Stützkonstruktion und Entwässerungsgraben; Zusatzerkundung für Zufahrt, Stützbauwerke und massive Gebäude.
  - GB4 Frost und Termine: Gebaut wird nur ohne Frost. Termine sind Ziele und gelten erst nach den Gates.
  - GB5 Sanitär: Spültoilette (Klopapier spülbar), Dusche, Warmwasser und Abwasser ab Phase 0 fest eingebaut.
  - GB8 Geld und Freigabe: Eigenkapital bis zur fertigen Bauplanung, danach Investoren. Bestellt wird nur mit Freigabe der Geschäftsführung und Geld auf dem Konto.

## Auftrag

Ziel: Anbieter gedämmter Wohn- und Arbeitsmodule (auch Container-Bauweise und Bausätze in Teilen) in Ungarn, Polen und über Alibaba finden und nach den Grundbestimmungen vergleichen.
Prüfkriterien: Maße und Gewicht des größten und schwersten Teils (Zufahrt: über 15 % Steigung, bis 2,6 m Breite ohne Genehmigung), Eignung für −20 °C, Sanitär vorbereitet (Spültoilette, Dusche, Warmwasser), Lieferform, Montageaufwand, Lieferzeit, Preis und Lieferbedingung, Gewährleistung, Bewertungen.
Ausgabe: Tabelle mit Herkunft | Anbieter | Modell | Fläche | Teile und Gewicht | Wintertauglichkeit | Sanitär | Lieferzeit | Preis | Lieferbedingung | passt zu GB1 ja/nein/offen | Quelle.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Anfrage an Anbieter (Deutsch, für Ungarn und Polen)

```text
Betreff: Angebotsanfrage – gedämmtes Wohn- und Arbeitsmodul, Karpaten (Ukraine), Lieferung in Teilen

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
[Projektleitung, X-PORTAL]
```

## Unterlage: Request for quotation (English, for Alibaba and others)

```text
Subject: Request for quotation – insulated living/working module, Carpathians (Ukraine), delivery in parts

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
[Projektleitung, X-PORTAL]
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
