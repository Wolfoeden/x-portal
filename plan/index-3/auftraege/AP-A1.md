# Auftrag AP-A1: Geologie: deutsche Zusammenfassung mit dem ukrainischen Original abgleichen

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: jetzt
- Voraussetzung: Originalbericht 34.11/26 (16 Seiten) und Zusammenfassung XPB-N001-GEO-SUM-001 liegen vor
- Ergebnis wird gebraucht für: Fundament, Lage von Phase 0, Angebote
- Grundbestimmungen: GB2, GB11

  - GB2 Boden und Hang: Rutsch- und Fließprozesse; Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Streifen- und Stützfundament, hangseitige Stützkonstruktion und Entwässerungsgraben; Zusatzerkundung für Zufahrt, Stützbauwerke und massive Gebäude.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Die deutsche KI-Zusammenfassung des Geologieberichts Satz für Satz mit dem ukrainischen Original abgleichen.
Eingang: Originalbericht (PDF, Ukrainisch), Zusammenfassung XPB-N001-GEO-SUM-001 (PDF, Deutsch).
Vorgehen: Für jede Zahl und jede Empfehlung der Zusammenfassung die Fundstelle im Original (Seite, Absatz) angeben und den Originalwortlaut zitieren; Übersetzung prüfen.
Ausgabe: Tabelle mit den Spalten Aussage Zusammenfassung | Fundstelle Original | Originalwortlaut | stimmt / weicht ab / fehlt | Hinweis.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
