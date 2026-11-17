# Auftrag AP-C2: Import in die Ukraine: Importeur und Verzollung

Für die ausführende KI (kleineres Modell). Das Ergebnis prüft die planende KI, dann ein Mensch.

## Rahmen

- Wann: vor der Bestellung
- Voraussetzung: Rechtsform der Node-Gesellschaft (O11); Angebot mit Warennummer und Ursprung
- Ergebnis wird gebraucht für: Lieferung
- Grundbestimmungen: GB8, GB9, GB11

  - GB8 Geld und Freigabe: So viel wie möglich mit Eigenkapital. Bis zu welchem Punkt, und ab wann Investoren dazukommen, ist offen: D69 und D71, Seite „Vor dem Investment“. Bestellt wird in Chargen, nur mit Freigabe der Geschäftsführung und Geld auf dem Konto. Kein Verkauf; Erlöse kommen aus Miete.
  - GB9 Recht: Rechtsprüfung vor Mietvertrag, Token, Import und Fällung. Kein öffentliches Angebot, bevor die Rechtslage geklärt ist.
  - GB11 Rollen und Freigabe: Rollen statt Namen. Technische Werte legt ein Fachexperte fest. Ein Vorschlag der KI gilt erst, wenn er gewählt ist. Unterlagen werden von Hand verschickt.

## Auftrag

Ziel: Für die Einfuhr eines vorgefertigten Wohnmoduls in die Ukraine klären: Warennummer, Zollsatz, Einfuhrumsatzsteuer, Präferenz bei EU-Ursprung, Unterlagen, wer Importeur sein kann; Zollbroker in der Oblast Iwano-Frankiwsk oder an den Grenzübergängen zu Ungarn und Polen.
Ausgabe: Tabelle Frage | Antwort EU-Ursprung | Antwort Drittland | Quelle; dazu Liste Zollbroker mit Ort, Leistungen, Kontakt, Quelle.

Regeln: Jede Angabe mit Quelle (Link) und Abrufdatum. Was nicht belegt ist, als OFFEN kennzeichnen, nicht schätzen. Nichts bestellen, nichts versenden, keine Konten anlegen, keine Entscheidung treffen. Ergebnis als Markdown-Tabelle und als JSON-Liste mit denselben Feldern.

## Unterlage: Fragen an einen Zollbroker

```text
Betreff: Anfrage Verzollung vorgefertigtes Wohnmodul, Lieferung nach Werchowyna

Guten Tag,

wir planen die Einfuhr eines vorgefertigten Wohnmoduls (Bausatz in Teilen) nach Bereschnyzja, Gemeinde Werchowyna. Herkunft: [Ungarn / Polen / China]. Bitte nennen Sie uns:
1. Wer als Importeur auftreten kann (unsere ukrainische Gesellschaft oder Sie als Dienstleister) und was wir dafür brauchen.
2. Warennummer, Zollsatz, Einfuhrumsatzsteuer und weitere Abgaben; Präferenz bei Ursprung in der EU.
3. Benötigte Unterlagen (Rechnung, Packliste, Frachtbrief, Ursprungsnachweis, Zertifikate).
4. Ihr Honorar und die Dauer der Abfertigung; Zollstelle in der Nähe.

Mit freundlichen Grüßen
[Projektleitung]
```

Quelle: Index 3.0, Ast 1 (werkzeug/ablauf.py). Diese Datei wird erzeugt; Änderungen in ablauf.py vornehmen.
