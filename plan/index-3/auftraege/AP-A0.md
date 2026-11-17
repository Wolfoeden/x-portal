# Auftrag AP-A0: Strecke ablaufen und messen: einspurige, teils enge Straße bis zum Grundstück

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: jetzt; vor jeder Anfrage an Anbieter und Spediteure
- Voraussetzung: Maßband, Neigungsmesser, Kamera mit GPS
- Ergebnis wird gebraucht für: Auswahl der Wohneinheit (hausart, AP-C1), Logistik (AP-C3), Bestellung
- Grundbestimmungen: GB1, GB11

  - GB1 Weg nach oben: transportierbar: Die Straße ist einfach, einspurig und teils eng; die letzten etwa 200 m haben über 15 % Steigung und sind unbefestigt. Jede Wohneinheit muss sich in Teilen auf kleinem Fahrzeug hochbringen lassen; Maße und Gewicht des größten Teils sind das erste Prüfkriterium. Bis 2,6 m Breite Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug. Breite, Engstellen und Ausweichstellen sind bis zur Messung (AP-A0) offen; die Route und acht kritische Messpunkte MP01 bis MP08 stehen in AP-A0. Im Winter muss geräumt werden.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Die Vor-Ort-Messung der Strecke vorbereiten. Route: https://maps.app.goo.gl/MVxhHzmvbfyLqY89A
Eingang: Route, Messpunkte MP01 bis MP08 (Unterlage in AP-A0), Satellitenbilder und Straßenansichten, soweit vorhanden.
Vorgehen: Je Messpunkt die Koordinaten bestimmen, Bildausschnitte sammeln, sichtbare Engstellen, Brücken, Durchlässe und Ausweichstellen markieren; auf der Karte geschätzte Breiten nur als Schätzung mit Quelle kennzeichnen. Weitere kritische Stellen, die in der Liste fehlen, als MP09 ff. vorschlagen.
Ausgabe: Tabelle Punkt | Koordinaten | Beobachtung | Schätzung (falls vorhanden) mit Quelle | was vor Ort zu messen ist | Priorität.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Messpunkte MP01 bis MP08

```text
Messpunkte für die Strecke (aus der Karten- und Satellitenansicht, ChatGPT, 17.11.2026; nicht vor Ort geprüft)
Route: https://maps.app.goo.gl/MVxhHzmvbfyLqY89A (von der Auffahrt bis zum Grundstück; letzter Abzweig laut Karte nach etwa 9,1 km)

Punkt | Stelle und Beobachtung | Vor Ort messen und prüfen | Priorität | Breite m | Kurvenradius m | Steigung % | Hindernisse | Untergrund | Fotos
MP01 | Abzweig von der größeren Straße am Start in eine Nebenstraße | Einfahrtwinkel, nutzbare Breite, Platz zum Ausschwenken langer Fahrzeuge, Hindernisse beidseitig, Platz für Gegenverkehr | hoch | | | | | |
MP02 | Kurviger Talabschnitt bei „Dolyna Kokhannya Kotedzhi“ und „Vidpochynkova Sadyba Horyanka“, an Bebauung vorbei | schmalste Stellen, Zäune, Gebäude, Masten, Äste, Ausweichstellen; tragen und sind befahrbar die Randbereiche? | mittel | | | | | |
MP03 | Abschnitt am Gewässer, unter anderem westlich „royal place“, mehrere Kurven hintereinander | Kurveninnen- und -außenseite, Abstand zu Böschung und Gewässer, nutzbare Breite; Durchlässe und kleine Brücken mit Tragfähigkeit gesondert aufnehmen | hoch | | | | | |
MP04 | Kehren zwischen „Vedmezhyek“ und „Komora“, enge Richtungsänderung nördlich „Vedmezhyek“ | beide Kurvenäste und die Fläche dazwischen: Innen- und Außenbegrenzung, freie Fläche für Überhang, Hindernisse, Steigung, Untergrund; Schleppkurve eines langen Fahrzeugs | sehr hoch | | | | | |
MP05 | Kurvenbereich bei „Sadyba Yo Mo Yo“ Richtung „Hutsul’ska Hoydalka“, mehrere Richtungswechsel | jede Kurve einzeln: Breite vor, in und nach der Kurve, Hindernisse, Steigung, Übergänge; muss ein langes Fahrzeug auf Gegenseite oder Rand ausweichen? | hoch | | | | | |
MP06 | Letzter Abzweig nach links (etwa 9,1 km) und die Kehren danach | Abzweig gesondert, dann jede Kehre mit der Nachbarkurve; Platz zum Rangieren zwischen den Kurven; Fahrzeugneigung beim Durchfahren | sehr hoch | | | | | |
MP07 | Ende der Kartenroute bis zum Grundstück: Karte zeigt nur eine gestrichelte Verbindung | tatsächlicher Weg vom Ende der Kartenroute bis zum Abladeplatz: Breite, Boden, Steigung, Hindernisse, Rangierfläche (die gestrichelte Linie belegt weder einen Weg noch sein Fehlen) | sehr hoch | | | | | |
MP08 | Ablade- und Aufstellbereich: blau markierter Bereich an der Kehre der Zufahrt (GB3, Knoten „lage“) | Zufahrt für Transportfahrzeug und gegebenenfalls Kran, Stellfläche, Boden, Neigung, Hindernisse darüber (Leitungen, Äste); Abladeplatz vor Ort festlegen | sehr hoch | | | | | |

Gemessen wird für zwei Fahrzeuge: das Fahrzeug der Spedition (wie weit kommt es, wo ist der Umschlagplatz?) und das kleine Fahrzeug für die letzte Strecke (D57).
Ergebnis: Umschlagplatz; bis wohin welches Fahrzeug kommt; größtes Teil (L × B × H) und schwerstes Teil, das bis zum Abladeplatz kommt; Jahreszeit.
```

## Unterlage: Streckenprotokoll zwischen den Messpunkten

```text
Abschnitt | von (GPS) | bis (GPS) | Länge m | schmalste Breite m | Kurvenradius m | Steigung % | Untergrund | Ausweichstelle ja/nein | Wendestelle ja/nein | Brücke, Lastgrenze t | Foto-Nr. | Bemerkung
1 | | | | | | | | | | | |
2 | | | | | | | | | | | |
Ergebnis: größtes Teil (L × B × H) und schwerstes Teil, das bis zum Grundstück kommt; Fahrzeug, das es bringt; Jahreszeit.
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
