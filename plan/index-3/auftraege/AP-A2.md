# Auftrag AP-A2: Wasseranalyse im Labor: Umfang der Trinkwasseraufbereitung festlegen

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: jetzt; Vorabprobe aus dem vorhandenen Grundwasser, Rohwasserprobe nach der Brunnenbohrung, Kontrollprobe nach Inbetriebnahme der Aufbereitung
- Voraussetzung: akkreditiertes Labor gefunden
- Ergebnis wird gebraucht für: Auslegung der Trinkwasseraufbereitung, Angebot Brunnen und Aufbereitung
- Grundbestimmungen: GB6, GB11

  - GB6 Wasser: Das Grundwasser ist Rohwasser ohne Trinkwasserqualität. Für Trinken und Kochen wird es zu Trinkwasser aufbereitet (Trinkwasseraufbereitung). Umfang und Verfahrensstufen legt der Fachexperte Wasser nach der Laboranalyse fest. Anfangsstufe bauen, Ausbau vorbereiten.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Akkreditierte Labore für Trinkwasseranalysen in der Oblast Iwano-Frankiwsk finden und vergleichen.
Ausgabe: Tabelle mit Labor | Ort | Akkreditierung | Parameterumfang | Preis | Dauer | Probenahme vor Ort möglich | Kontakt | Quelle.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Anfrage an ein Labor (Deutsch; Ukrainisch durch die ausführende KI, von einer Muttersprachlerin geprüft)

```text
Betreff: Anfrage Rohwasseranalyse (Grundwasser) zur Auslegung der Trinkwasseraufbereitung, Bereschnyzja (Werchowyna)

Guten Tag,

wir möchten Rohwasser aus Grundwasser auf einem Grundstück in Bereschnyzja, Ortsteil Hrun (Kataster 2620885502:02:001:0013) untersuchen lassen. Das Wasser ist ohne Aufbereitung nicht als Trinkwasser geeignet; mit dem Befund legen wir die Trinkwasseraufbereitung aus. Bitte nennen Sie uns:
1. Parameterumfang für Trinkwasser nach ukrainischer Norm, einschließlich Mikrobiologie (E. coli, coliforme Bakterien, Koloniezahl), Eisen, Mangan, Nitrat, Nitrit, Ammonium, Härte, pH-Wert, Trübung, Färbung und Geruch.
1a. Ob Sie später auch eine Kontrollprobe nach der Aufbereitung untersuchen.
2. Probenahme: durch Sie oder durch uns; Gefäße, Kühlung, Zeit bis zur Abgabe.
3. Preis, Dauer bis zum Bericht, Akkreditierung.

Mit freundlichen Grüßen
[Projektleitung, X-PORTAL]
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
