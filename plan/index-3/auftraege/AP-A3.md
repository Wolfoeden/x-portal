# Auftrag AP-A3: Netzanschluss: wer ist zuständig, was kostet er, wie lange dauert er

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: jetzt, wegen der Bearbeitungszeit; die Frist selbst ist offen
- Voraussetzung: Lastliste Phase 0 und Ausbau vom Fachexperten Elektro; Katasternummer; Eigentumsnachweis
- Ergebnis wird gebraucht für: Strom in Phase 0, Größe des Generators, Leitung zum Grundstück
- Grundbestimmungen: GB7, GB8, GB11

  - GB7 Strom: Netzanschluss mit Generator als Reserve; Solar mit Speicher ab Phase 1.
  - GB8 Geld und Freigabe: So viel wie möglich mit Eigenkapital. Bis zu welchem Punkt, und ab wann Investoren dazukommen, ist offen: D69 und D71, Seite „Vor dem Investment“. Bestellt wird in Chargen, nur mit Freigabe der Geschäftsführung und Geld auf dem Konto. Kein Verkauf; Erlöse kommen aus Miete.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Für das Kataster 2620885502:02:001:0013 (Bereschnyzja, Gemeinde Werchowyna, Oblast Iwano-Frankiwsk) den zuständigen Verteilnetzbetreiber, das Antragsverfahren, die aktuelle Gebühr je kW für Standard- und Einzelanschluss, die Fristen und die nötigen Unterlagen ermitteln.
Ausgabe: Tabelle mit Punkt | Ergebnis | Quelle | Abrufdatum; dazu Kontaktdaten der zuständigen Stelle.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Anfrage an den Netzbetreiber (Deutsch; Ukrainisch durch die ausführende KI, geprüft)

```text
Betreff: Anfrage Netzanschluss, Grundstück Bereschnyzja, Kataster 2620885502:02:001:0013

Guten Tag,

für das Grundstück in Bereschnyzja, Ortsteil Hrun (Gemeinde Werchowyna), Kataster 2620885502:02:001:0013, planen wir einen Netzanschluss. Bitte teilen Sie uns mit:
1. Ob Sie zuständig sind, und wenn nicht, wer.
2. Nächster Anschlusspunkt und verfügbare Leistung.
3. Antragsweg (Standardanschluss oder Einzelanschluss), benötigte Unterlagen, Gebühr je kW und Kosten der Leitung bis zur Grundstücksgrenze.
4. Bearbeitungs- und Bauzeit.
Geplante Leistung: [Wert vom Fachexperten Elektro] kW in der ersten Stufe, Erweiterung auf [Wert] kW vorgesehen.

Mit freundlichen Grüßen
[Geschäftsführung, Node-Gesellschaft bzw. Eigentümer]
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
