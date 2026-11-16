# Auftrag AP-C3: Logistik bis zum Fuß der Zufahrt, Übergabe an das kleine Fahrzeug

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: mit der Bestellung; Termin rückwärts vom Montagebeginn (AP-C4)
- Voraussetzung: Maße und Gewichte aus dem Angebot (AP-C1); Umschlagplatz unten
- Ergebnis wird gebraucht für: Montage
- Grundbestimmungen: GB1, GB4, GB11

  - GB1 Weg nach oben: Letzte etwa 200 m mit über 15 % Steigung, unbefestigt. Bis 2,6 m Breite Transport ohne Genehmigung, über 3,5 m nur mit Begleitfahrzeug. In Phase 0 kommt alles auf kleinem Fahrzeug hoch, keine Befestigung am Anfang. Im Winter muss geräumt werden.
  - GB4 Frost und Termine: Gebaut wird nur ohne Frost. Termine sind Ziele und gelten erst nach den Gates.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Speditionen finden, die von Ungarn, Polen und aus einem Drittland in die Oblast Iwano-Frankiwsk liefern, möglichst mit Zollabwicklung und Abladen per Kran; dazu lokale Anbieter für die letzte Meile (Traktor, Allrad-Transporter, Hebegerät) im Raum Werchowyna.
Ausgabe: Tabelle Anbieter | Strecke | Fahrzeuge | Zoll | Kran | Kontakt | Quelle.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Anfrage an eine Spedition

```text
Betreff: Transportanfrage Bausatz Wohnmodul nach Bereschnyzja (Werchowyna)

Guten Tag,

bitte senden Sie uns ein Angebot für den Transport von [Anzahl] Packstücken, größtes Teil [L × B × H], schwerstes Teil [Gewicht], gesamt [Gewicht], von [Abholort] nach Bereschnyzja, Gemeinde Werchowyna, bis zum Fuß der Zufahrt. Die letzten 200 m schaffen nur kleine Fahrzeuge; dort wird umgeladen.
Bitte nennen Sie: Fahrzeug, Preis, Dauer, Zollabwicklung (falls angeboten), Versicherung, Abladen mit Kran oder Stapler.

Mit freundlichen Grüßen
[Projektleitung]
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
