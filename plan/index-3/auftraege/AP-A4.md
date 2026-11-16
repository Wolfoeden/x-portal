# Auftrag AP-A4: Bauplanung Phase 0 mit Bau-KI und 3D-Modell (Basis of Design)

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: nach Lage (O01) und Geologie-Abgleich (AP-A1)
- Voraussetzung: Detailplan, Geologiebericht, Lastliste, Raumliste aus Ast 2
- Ergebnis wird gebraucht für: Angebote, Bestellung, Selbstkosten
- Grundbestimmungen: GB1, GB2, GB3, GB5, GB6, GB7

  - GB1 Weg nach oben: Letzte etwa 200 m mit über 15 % Steigung, unbefestigt. Bis 2,6 m Breite Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug. In Phase 0 kommt alles auf kleinem Fahrzeug hoch, keine Befestigung am Anfang. Im Winter muss geräumt werden.
  - GB2 Boden und Hang: Rutsch- und Fließprozesse; Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Streifen- und Stützfundament, hangseitige Stützkonstruktion und Entwässerungsgraben; Zusatzerkundung für Zufahrt, Stützbauwerke und massive Gebäude.
  - GB3 Lage: Phase 0: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche; Grundlage ist der Detailplan Blatt 3.
  - GB5 Sanitär: Spültoilette (Klopapier spülbar), Dusche, Warmwasser und Abwasser ab Phase 0 fest eingebaut.
  - GB6 Wasser: Grundwasser, aufbereitet zu Trinkwasser; Anfangsstufe bauen, Ausbau vorbereiten.
  - GB7 Strom: Netzanschluss mit Generator als Reserve; Solar mit Speicher ab Phase 1.

## Auftrag

Ziel: Das Eingangspaket für die Bauplanung zusammenstellen.
Eingang: Detailplan Blatt 3, Geologiebericht und Abgleich (AP-A1), Anforderungen Ast 2 (Maslow und Sinne), Grundbestimmungen GB1–GB11.
Ausgabe: Liste der Planungsvorgaben je Gewerk (Objekt, Fundament, Entwässerung, Wasser, Abwasser, Strom, Internet, Weg) mit Quelle der Vorgabe und offenen Werten, die ein Fachexperte festlegen muss.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
