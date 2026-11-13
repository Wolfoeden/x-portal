#!/usr/bin/env python3
"""Anschaffungsliste Node001: Objekte und Gegenstände, über deren Anschaffung zu entscheiden ist.

Grundlage sind die Antworten vom 13.11.2026 auf der Entscheidungsseite (Wahl UND Kommentar; wo der Kommentar die Wahl
ändert, gilt der Kommentar) und die Geologie-Zusammenfassung XPB-N001-GEO-SUM-001 (KI-erstellt, NICHT GEPRÜFT).
Die Liste nennt bewusst keine neuen Preise: die Projektleitung recherchiert. Früher gefundene Internetpreise stehen nur als Hinweis.

Aufruf (aus plan/anschaffungen):  python3 werkzeug/liste.py .
Schreibt anschaffungen.body.html (Artefakt), anschaffungen.md, anschaffungen.json, anschaffungen.csv.
Recherche-Einträge stehen in der Datenbank des Artefakts, Sammlung `recherche`, ein Dokument je Position (A001 …)
mit anbieter, preis, link, notiz, stand, von, am.
"""
import csv, html, io, json, re, sys
from pathlib import Path

STAND = '13.11.2026'
ENT = 'https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP'
SGMM = 'https://claude.ai/artifact/EYuUZwYARAk6bVpmPDyq9G'
ART = {'K': 'kaufen', 'M': 'mieten', 'S': 'selbst machen', 'D': 'Dienstleistung', 'KM': 'kaufen oder mieten', 'KS': 'kaufen oder selbst machen', 'KD': 'kaufen mit Einbau', 'A': 'Antrag'}

# Bereich: (Titel, Vorbemerkung, D-Karten, Rolle entscheidet, Rolle nimmt ab, Positionen)
# Position: (Gegenstand, Phase, Art, wofür, was recherchieren, wovon die Menge abhängt, Hinweis)
B = [
 ('Grundstück und Gründung', 'Aus der Geologie-Zusammenfassung (nicht geprüft, keine Fachfreigabe): Hang mit Rutsch- und Fließprozessen, Grundwasseraustritte an den Bohrpunkten 6, 7 und 11. Empfohlen sind Streifen- und Stützfundament, ein hangseitiger Entwässerungsgraben und Zusatzerkundungen. Alles hier plant ein Fachexperte.',
  ['D54', 'D55', 'D56'], 'Geschäftsführung nach Vorschlag Fachexperte Geotechnik', 'Fachexperte Geotechnik', [
  ('Fachprüfung des Geologieberichts', '0', 'D', 'Die KI-Zusammenfassung ist nicht geprüft; vor jeder Planung braucht es Abgleich mit dem Original und Freigabe.', 'Geotechniker oder Prüfingenieur in der Region; Umfang, Dauer, Honorar', 'einmal', ''),
  ('Zusatzerkundung für Zufahrt, Stützkonstruktion und Hauptgebäude', '0', 'D', 'Der Bericht verlangt weitere Untersuchungen, wenn bis zur Schicht IGE-4 gegründet wird oder sich Gebäude ändern.', 'Bohrfirma, Zahl und Tiefe der Bohrungen', 'Zahl der Gebäude und Stützbauwerke', ''),
  ('Vermessung und Absteckung', '0', 'D', 'Lage von Objekt Phase 0, Leitungen und Wegen festlegen.', 'Vermesser vor Ort; digitales Geländemodell für die 3D-Planung', 'einmal, später je Bauabschnitt', ''),
  ('Hangseitiger Entwässerungsgraben mit Rinnen oder Sammelbehälter', '0', 'D', 'Oberflächenwasser geordnet ableiten (Empfehlung Gutachter).', 'Bauweise, Länge, Material, Firma mit Kleinbagger', 'Länge des Hangs oberhalb der Baufläche', ''),
  ('Fundament für Objekt Phase 0', '0', 'D', 'Leichte eingeschossige Gebäude können laut Bericht auf IGE-3 gründen; hangseitig als Stütze bemessen.', 'Punkt-, Streifen- oder Schraubfundament; was ein Fachexperte für den Standort zulässt', 'Größe und Gewicht des Objekts', ''),
  ('Stützkonstruktion am Hang', '0–1', 'D', 'Hangseitiger Fundamentbereich als Stützkonstruktion (Empfehlung Gutachter).', 'Gabionen, Betonwinkel oder Holz; Statik; Firma', 'Geländeschnitt an der Baufläche', ''),
  ('Baumfällung und Rodung der Baufläche', '0', 'KD', 'Bäume auf dem Grundstück müssen gefällt werden (Kommentar D60); das Holz wird Brennholz.', 'Fällgenehmigung in der Ukraine; Fällfirma oder selbst; Abtransport der Stämme', 'Zahl der Bäume auf Baufläche und Trasse', ''),
  ('Kleinbagger mit Fahrer', '0', 'M', 'Gräben für Entwässerung, Wasser, Abwasser und Strom.', 'Miete je Tag mit Fahrer; ob er die Zufahrt schafft', 'Meter Graben', ''),
 ]),
 ('Objekt Phase 0', 'Kommentar D55: ein Objekt für Team und Bauarbeiter unterhalb der Herrenhaus-Fläche, mit skalierbarer Infrastruktur für Wasser, Strom und Internet. Die Bauart ist offen (D56: Holz, Beton, Glas, Metall; eine Bau-KI bewertet).',
  ['D55', 'D56', 'D45'], 'Geschäftsführung', 'Fachexperte Bau', [
  ('Wohn- und Arbeitsobjekt für Team und Bauarbeiter', '0', 'KM', 'Schlafen, arbeiten, Sanitär; ganzjährig bewohnbar bei −20 °C.', 'Bauarten vergleichen: Wohncontainer, Modul, Holzrahmen; Dämmung, Maße, schwerstes Teil, Lieferzeit, Rückkauf oder Miete', 'Zahl der Personen (Team plus Bauarbeiter)', 'Früher gefunden: gedämmter Wohncontainer ab 444.000 UAH (Listenpreis, nicht bestätigt)'),
  ('Planung der Objekte mit Bau-KI und 3D-Modell', '0', 'D', 'Kommentar D56 und D57: Bau-KI plant und bewertet; 3D-Modelle für die Gesamtplanung in Phase 1.', 'Welche Software oder welcher Dienst; welche Eingangsdaten (Geländemodell, Geologie)', 'einmal', ''),
  ('Betten und Matratzen', '0', 'K', 'Schlafplatz je Person.', 'Maße passend zum Objekt', 'je Person', ''),
  ('Schreibtische und Arbeitsstühle', '0', 'K', 'Bezahlte digitale Arbeit oben.', 'Ergonomie, zerlegbar für den Transport', 'je Arbeitsplatz', ''),
  ('Bildschirme', '0', 'K', 'Arbeitsplatz.', 'Stromverbrauch, Größe', 'je Arbeitsplatz', ''),
  ('Schränke und Regale', '0', 'K', 'Kleidung, Vorrat, Werkzeug.', 'zerlegbar', 'je Person und Raum', ''),
  ('LED-Beleuchtung innen und außen', '0', 'K', 'Licht im Objekt und auf den Wegen zu Holzlager und Technik.', 'Außenleuchten frostfest; Bewegungsmelder', 'Räume und Wegemeter', ''),
  ('Bettwäsche, Decken, Schlafsäcke für den Winter', '0', 'K', 'Reserve, falls die Heizung ausfällt.', 'Komfortbereich bis −20 °C', 'je Person', ''),
  ('Waschmaschine', '0', 'K', 'Wäsche oben waschen.', 'Wasser- und Stromverbrauch; Frostschutz', '1', ''),
 ]),
 ('Strom', 'Kommentar D59: Netzanschluss beantragen, Generator als Reserve; Solar mit Speicher ab Phase 1.',
  ['D59'], 'Geschäftsführung', 'Fachexperte Elektro', [
  ('Netzanschluss', '0', 'A', 'Hauptversorgung.', 'Zuständiger Netzbetreiber; Leistung in kW; Frist; Entfernung zur nächsten Leitung', 'Lastliste Phase 0 und Ausbau', 'Früher gefunden: etwa 2.927 UAH je kW, ohne Leitung'),
  ('Leitung vom Netz zum Grundstück (Erdkabel oder Freileitung)', '0', 'D', 'Verbindung vom Anschlusspunkt bis zum Objekt.', 'Wer baut; Kabelquerschnitt für den Ausbau', 'Meter bis zum Anschlusspunkt', ''),
  ('Zählerschrank und Hauptverteilung', '0', 'KD', 'Skalierbare Verteilung für spätere Häuser.', 'Reserveplätze für Phase 1; Überspannungsschutz', '1', ''),
  ('Unterverteilung, Sicherungen, FI-Schutzschalter', '0', 'KD', 'Sicherheit im Objekt.', 'Normen vor Ort', 'je Objekt', ''),
  ('Erdung und Blitzschutz', '0', 'D', 'Schutz von Personen und Technik am Hang.', 'Erder bei felsigem Untergrund', 'je Objekt', ''),
  ('Generator', '0', 'K', 'Reserve bei Netzausfall.', 'Leistung nach Lastliste; Inverter ja oder nein; Winterstart; Lautstärke', '1', 'Früher gefunden: 3 kW für 18.749–32.599 UAH'),
  ('Umschalter Netz/Generator', '0', 'KD', 'Sicher umschalten, ohne ins Netz zurückzuspeisen.', 'manuell oder automatisch', '1', ''),
  ('Kraftstoffkanister und Lagerort', '0', 'K', 'Kraftstoff für mehrere Tage.', 'zulässige Lagermenge; Abstand zum Objekt', 'Tage Reserve × Verbrauch', ''),
  ('Außenkabel und Steckdosen im Außenbereich', '0', 'K', 'Baustrom und Technik draußen.', 'Schutzart, Kältefestigkeit', 'Meter', ''),
  ('USV für Internet und Server', '0', 'K', 'Überbrückt die Umschaltzeit.', 'Laufzeit bei der Last von Router, Starlink, Server', '1', ''),
  ('Solaranlage mit Speicher', '1', 'KD', 'Ab Phase 1 (D59).', 'Ertrag im Winter am Nordosthang; Größe; Montageort', 'Lastliste Phase 1', 'Früher gefunden: 4,8 kWp mit 4,8 kWh für 189.900 UAH'),
 ]),
 ('Wärme und Holz', 'Kommentar D60: Mix. Ofen als eine Möglichkeit, mit Plan zum Überwintern; Bäume am Grundstück müssen gefällt werden und sind nass; Lagerung von Holz in jedem Fall, ob gekauft oder selbst gemacht.',
  ['D60'], 'Geschäftsführung', 'Fachexperte Heizung und Schornstein', [
  ('Heizlastberechnung für das Objekt', '0', 'D', 'Ohne Heizlast keine Ofengröße.', 'Wer rechnet; Auslegung −20 °C', 'einmal je Objekt', ''),
  ('Holzofen mit Kochplatte', '0', 'K', 'Wärme und Reserve zum Kochen.', 'Leistung passend zur Heizlast; raumluftunabhängig; Speichermasse', 'je beheizter Einheit', 'Früher gefunden: 6.000–13.000 UAH'),
  ('Schornstein, Rauchrohr, Dachdurchführung', '0', 'KD', 'Sicherer Abzug.', 'System passend zur Bauart; Abnahme', 'je Ofen', ''),
  ('Hitzeschutz für Boden und Wand', '0', 'K', 'Brandschutz am Ofen.', 'Abstände laut Hersteller', 'je Ofen', ''),
  ('Zweite Wärmequelle', '0', 'K', 'Frostschutz, wenn niemand nachlegt.', 'elektrisch, Gas oder Diesel; Verbrauch', 'je Einheit', ''),
  ('Brennholz trocken für den ersten Winter', '0', 'K', 'Das eigene Holz ist nass und im ersten Winter nicht brennbar.', 'Lieferant vor Ort; Holzart; Preis je m³ mit Lieferung nach oben', 'm³ je Ofen und Winter (Annahme 3–6)', 'Früher gefunden: 3.700–4.500 UAH je m³ in Kyjiw'),
  ('Holzlager überdacht und belüftet', '0', 'KS', 'Trocknen und Lagern, gekauft wie selbst gemacht (D60).', 'Größe für zwei Winter; Bauweise; Standort mit Wind', 'm³ Holz', ''),
  ('Motorsäge', '0', 'K', 'Eigene Bäume aufarbeiten.', 'Benzin oder Akku; Schwertlänge; Service vor Ort', '1–2', 'Früher gefunden: 6.519–7.310 UAH'),
  ('Schutzausrüstung für die Motorsäge', '0', 'K', 'Schnittschutzhose, Helm mit Visier und Gehörschutz, Handschuhe, Stiefel.', 'Schutzklasse', 'je Person an der Säge', ''),
  ('Motorsägenkurs', '0', 'D', 'Sicherheit und Haftung.', 'Anbieter; Anerkennung', 'je Person an der Säge', ''),
  ('Kettenöl, Kraftstoffgemisch, Ersatzketten, Feile', '0', 'K', 'Betrieb der Säge.', 'Verbrauch', 'laufend', ''),
  ('Spaltaxt und Spalthammer', '0', 'K', 'Holz spalten.', 'Gewicht, Stiellänge', '2', 'Früher gefunden: 3.599–4.398 UAH'),
  ('Spaltkeile', '0', 'K', 'Dicke Stücke.', 'Material', '2–3', ''),
  ('Holzspalter', '0–1', 'KM', 'Bei großen Mengen Eigenholz.', 'elektrisch oder Benzin; Spaltkraft; mieten möglich', '1', ''),
  ('Sägebock und Hackklotz', '0', 'KS', 'Sicher sägen und spalten.', '', '1', ''),
  ('Bügelsäge', '0', 'K', 'Kleine Schnitte ohne Motorsäge.', '', '1', ''),
  ('Holzfeuchtemesser', '0', 'K', 'Nur trockenes Holz verbrennen (unter 20 %).', '', '1', ''),
  ('Schubkarre oder Holzschlitten', '0', 'K', 'Holz vom Lager zum Objekt, auch bei Schnee.', '', '1–2', ''),
  ('Ascheeimer aus Metall mit Deckel', '0', 'K', 'Asche sicher entsorgen.', '', 'je Ofen', ''),
 ]),
 ('Wasser', 'Kommentar D61: Grundwasser ist verfügbar, aber kein Trinkwasser; es muss aufbereitet werden. Anfangsstufe bauen, Ausbau vorbereiten.',
  ['D61'], 'Geschäftsführung', 'Fachexperte Wasser, Labor', [
  ('Wasseranalyse im Labor', '0', 'D', 'Bestimmt, welche Aufbereitung nötig ist.', 'Akkreditiertes Labor; Parameter (Keime, Eisen, Mangan, Härte, Nitrat)', 'je Entnahmestelle, wiederholt', ''),
  ('Brunnen oder Quellfassung', '0', 'D', 'Wasser gewinnen; im Plan ist ein Bohrbrunnen eingezeichnet.', 'Bohrfirma; Tiefe; Genehmigung; Schüttung im Winter', '1', ''),
  ('Pumpe', '0', 'K', 'Wasser fördern.', 'Förderhöhe und Menge; Trockenlaufschutz', '1 plus Reserve', ''),
  ('Druckbehälter und Druckschalter', '0', 'K', 'Gleichmäßiger Druck für Dusche und Spülung.', 'Größe', '1', ''),
  ('Wassertank', '0', 'K', 'Vorrat für Sperre und Ausfall.', 'Größe für 10 Tage; frostfreier Standort; Bodenlast', 'Personen × Liter × Tage', 'Früher gefunden: 1.000 l für 7.000–13.000 UAH'),
  ('Trinkwasseraufbereitung', '0', 'KD', 'Aus Grundwasser Trinkwasser machen (D61).', 'Stufen nach Laborwerten: Sedimentfilter, Aktivkohle, Enteisenung, UV oder Umkehrosmose; Wartung', '1 Anlage, skalierbar', ''),
  ('Ersatzfilter und UV-Lampe', '0', 'K', 'Betrieb der Aufbereitung.', 'Wechselintervall', 'laufend', ''),
  ('Wasserleitung frostfrei verlegt', '0', 'D', 'Vom Brunnen zum Objekt, ohne Heizkabel.', 'Frosttiefe am Standort; Rohrmaterial; Dimension für den Ausbau', 'Meter', ''),
  ('Trinkwasserkanister als Notvorrat', '0', 'K', 'Reserve, wenn Pumpe oder Aufbereitung ausfällt.', '', 'Personen × Tage', ''),
 ]),
 ('Sanitär und Abwasser', 'Kommentar D62: Toilette, Abwasser, Duschen, Warmwasser von vornherein planen und mit der Infrastruktur einbauen; Spülung, bei der man Klopapier spülen kann; ab Phase 0 verfügbar.',
  ['D62'], 'Geschäftsführung', 'Fachexperte Sanitär, Behörde', [
  ('Abwasserplanung und Genehmigung', '0', 'D', 'Der Gutachter verlangt Schutz von Oberflächen- und Grundwasser vor Abwasser.', 'Zuständige Behörde; was am Hang mit Grundwasseraustritten zulässig ist', 'einmal', ''),
  ('Kleinkläranlage oder Mehrkammergrube mit Versickerung', '0', 'KD', 'Abwasser aus Toilette, Dusche, Küche; im Plan sind lokale Klärbauwerke eingezeichnet.', 'Typ; Größe für den Ausbau; Betrieb im Winter; Entleerung über die Zufahrt', 'Personen jetzt und später', ''),
  ('Abwasserleitungen frostfrei mit Gefälle', '0', 'D', 'Vom Objekt zur Anlage.', 'Rohr für Papier geeignet (Durchmesser, Gefälle)', 'Meter', ''),
  ('Spültoilette mit Spülkasten', '0', 'K', 'Klopapier spülbar (D62).', 'Wasserspar-Spülung', 'je Sanitäreinheit', ''),
  ('Dusche mit Armatur', '0', 'K', 'Warm duschen im Objekt.', 'Sparbrause', 'je Sanitäreinheit', ''),
  ('Waschbecken mit Armatur', '0', 'K', 'Hände und Zähne.', '', 'je Sanitäreinheit', ''),
  ('Warmwasserbereiter', '0', 'K', 'Warmwasser ab Phase 0.', 'Elektroboiler, Holz oder Kombi; Größe; Stromlast', 'Personen', 'Früher gefunden: 80 l für 4.399–5.387 UAH'),
  ('Lüftung im Sanitärraum', '0', 'K', 'Feuchte und Schimmel vermeiden.', '', 'je Sanitärraum', ''),
  ('Entleerung der Anlage (Saugwagen)', '0', 'D', 'Schlamm abfahren.', 'Ob ein Saugwagen die Zufahrt schafft', 'nach Anlagentyp', ''),
 ]),
 ('Internet und IT', 'Kommentar D63: Bandbreite, Router und Anbieter prüfen und vergleichen.',
  ['D63', 'D47'], 'Geschäftsführung', 'Rolle IT', [
  ('Internetanschluss (Glasfaser oder Richtfunk)', '0', 'A', 'Hauptleitung für zwei Videocalls gleichzeitig plus Arbeit.', 'Anbieter in Werchowyna; Bandbreite Up und Down; Vertragslaufzeit; Bau der Leitung', '1', ''),
  ('Starlink mit Abo', '0', 'K', 'Reserve; kein Mobilfunk oben.', 'Tarif für die Adresse; Schneeheizung der Antenne', '1', 'Früher gefunden: Mini 20.820–25.900 UAH, etwa 2.950 UAH im Monat'),
  ('Antennenmast und Halterung', '0', 'K', 'Freie Sicht, schneefrei.', '', '1', ''),
  ('Router mit zwei Zugängen und automatischer Umschaltung', '0', 'K', 'Wechsel zwischen Haupt- und Reserveleitung.', 'Dual-WAN, VPN', '1', ''),
  ('WLAN-Zugangspunkte', '0', 'K', 'Abdeckung in Objekt und später im Gelände.', 'Außengeräte frostfest', 'Fläche', ''),
  ('Netzwerkkabel, Switch, Leerrohre', '0', 'K', 'Skalierbares Netz für Phase 1.', 'Leerrohre gleich mit in die Gräben', 'Meter', ''),
  ('Server oder NAS mit Festplatten', '0', 'K', 'Daten lokal; Verbindung mit Servern in Deutschland (D47: nur bei VC-Funding).', 'Datenschutz für personenbezogene Daten', '1', 'Früher gefunden: NAS etwa 404–415 € ohne Platten'),
  ('Datensicherung außer Haus', '0', 'D', 'Schutz vor Verlust.', 'Standort der Daten', '1', ''),
 ]),
 ('Küche und Essen', 'D36: Essen gegen Mitarbeit; gemeinschaftliche Arbeit wird gefördert und erfasst.',
  ['D36'], 'Rolle Betrieb', 'Rolle Betrieb', [
  ('Kühlschrank mit Gefrierfach', '0', 'K', 'Lebensmittel.', 'Verbrauch', '1', ''),
  ('Kochfeld oder Herd', '0', 'K', 'Kochen, zusätzlich zur Ofenplatte.', 'Strom oder Gas; Last', '1', ''),
  ('Spüle mit Armatur', '0', 'K', 'Küche.', '', '1', ''),
  ('Töpfe, Pfannen, Geschirr, Besteck', '0', 'K', 'Grundausstattung.', '', 'Personen', ''),
  ('Vorratsregal und dichte Behälter', '0', 'K', 'Vorrat für eine Sperre der Zufahrt, sicher vor Mäusen.', '', 'Personen × Tage', ''),
  ('Esstisch und Stühle', '0', 'K', 'Gemeinsam essen.', '', 'Personen', ''),
  ('Wasserkocher und Kaffeemaschine', '0', 'K', 'Alltag.', '', '1', ''),
 ]),
 ('Zufahrt, Schnee und Transport', 'Kommentar D57: in Phase 0 voraussichtlich kleines Fahrzeug, keine Befestigung am Anfang; die Gesamtplanung folgt in Phase 1.',
  ['D57'], 'Geschäftsführung', 'Fachexperte Bau', [
  ('Transport nach oben mit kleinem Fahrzeug', '0', 'D', 'Material und Objekt hochbringen.', 'Wer vor Ort Traktor oder Allrad-Transporter mit Anhänger hat; Nutzlast; Preis je Fahrt', 'Tonnen und Fahrten', ''),
  ('Räumvertrag für die Zufahrt im Winter', '0', 'D', 'Zufahrt passierbar halten.', 'Bauer mit Traktor; Preis je Einsatz; Reaktionszeit', 'Schneetage', ''),
  ('Schneeschaufeln und Schneeschieber', '0', 'K', 'Wege am Objekt.', '', 'je Person', 'Früher gefunden: 270–427 UAH'),
  ('Schneefräse', '0', 'K', 'Falls Handräumen nicht reicht.', 'Räumbreite; Lagerung', '0–1', ''),
  ('Streugut mit Lagerkiste', '0', 'K', 'Glätte auf Wegen und Treppen.', 'Splitt oder Sand lokal', 'Wegemeter', ''),
  ('Eispickel und Dachschneeschieber', '0', 'K', 'Eis und Dachlast.', '', '1', ''),
  ('Wegebeleuchtung und Handlauf', '0', 'KS', 'Sichere Wege zu Holzlager und Technik im Dunkeln.', '', 'Wegemeter', ''),
  ('Befestigung und Entwässerung der Zufahrt', '1', 'D', 'Gesamtplanung in Phase 1 (D57).', 'Aufbau nach Geologie; Kosten je Meter', 'Meter Zufahrt', ''),
 ]),
 ('Mobilität', 'D65: gemeinsames Fahrzeug; Kommentar: E-Bikes für Phase 0 ausschließen.',
  ['D65'], 'Geschäftsführung', 'Rolle Betrieb', [
  ('Gemeinsames geländegängiges Fahrzeug', '0', 'K', 'Einkauf, Notfall, kleine Lasten.', 'Allrad-Pkw, Pick-up, Quad oder Traktor; gebraucht; Zulassung und Versicherung in der Ukraine', '1', ''),
  ('Winterreifen und Schneeketten', '0', 'K', 'Zufahrt im Winter.', '', '1 Satz', ''),
  ('Anhänger', '0', 'K', 'Holz und Material.', 'Nutzlast', '0–1', ''),
  ('Abschleppseil, Starthilfe, Wagenheber', '0', 'K', 'Selbsthilfe.', '', '1 Satz', ''),
 ]),
 ('Werkzeug und Wartung', 'D66: Zielwerte je Funktion; Wartung braucht Werkzeug und Ersatzteile oben.',
  ['D66'], 'Rolle Betrieb', 'Rolle Betrieb', [
  ('Werkzeugkoffer', '0', 'K', 'Schrauben, Zangen, Schlüssel, Säge, Hammer.', '', '1', ''),
  ('Akkuschrauber und Bohrhammer', '0', 'K', 'Montage.', 'ein Akkusystem für alles', '1', ''),
  ('Leiter', '0', 'K', 'Dach, Antenne, Schornstein.', 'Länge', '1', ''),
  ('Stirnlampen und Taschenlampen', '0', 'K', 'Arbeiten im Dunkeln und bei Stromausfall.', '', 'je Person', ''),
  ('Spaten, Schaufel, Hacke, Rechen', '0', 'K', 'Gräben, Garten, Wege.', '', '1 Satz', ''),
  ('Ersatzteile: Sicherungen, Dichtungen, Schläuche, Pumpe', '0', 'K', 'Schnelle Reparatur ohne Fahrt ins Tal.', 'aus den Herstellerlisten der gekauften Geräte', '1 Satz', ''),
  ('Messgeräte: Multimeter, Spannungsprüfer, Thermometer', '0', 'K', 'Fehler finden.', '', '1 Satz', ''),
 ]),
 ('Sicherheit und Notfall', 'D66: Abnahme vor dem ersten Übernachten. Der Notfallplan nennt Rettungsweg und Rettungszeit.',
  ['D66'], 'Geschäftsführung', 'Fachexperte Brandschutz', [
  ('Rauchmelder', '0', 'K', 'Brand früh erkennen.', '', 'je Raum', ''),
  ('CO-Melder', '0', 'K', 'Pflicht bei Ofen und Generator.', '', 'je Raum mit Ofen', 'Früher gefunden: 580–4.249 UAH'),
  ('Feuerlöscher', '0', 'K', 'Erster Löschangriff.', 'Typ und Größe; Prüffrist', 'je Objekt und Technikraum', ''),
  ('Löschdecke', '0', 'K', 'Küche.', '', '1', ''),
  ('Erste-Hilfe-Ausrüstung', '0', 'K', 'Verletzungen, auch Schnittwunden von der Säge.', 'Inhalt für abgelegene Orte', 'je Objekt und Fahrzeug', ''),
  ('Erste-Hilfe-Kurs', '0', 'D', 'Rettung dauert oben länger.', 'Kurs für abgelegene Orte', 'je Person', ''),
  ('Notfallkommunikation', '0', 'K', 'Hilfe rufen ohne Mobilfunk und bei Internetausfall.', 'Satelliten-Notrufgerät oder Funk', '1', ''),
  ('Versicherungen', '0', 'D', 'Haftung, Unfall, Objekt.', 'Was in der Ukraine für Ausländer und Baustellen möglich ist', 'einmal', ''),
  ('Notvorrat: Lebensmittel, Wasser, Kerzen, Batterien', '0', 'K', 'Sperre der Zufahrt.', '', 'Personen × Tage', ''),
 ]),
 ('Gemeinschaft in Phase 1', 'D64: Kommunalgebäude zuerst. D34: Feuerstelle in Phase 1; Kommentar: Bewohner sind am Bau der Bergkapelle als Gruppenprojekt beteiligt, Projektowner ist Mutter Dering. D35: eigene Sauna in Phase 1.',
  ['D64', 'D34', 'D35', 'D36'], 'Geschäftsführung', 'Fachexperte Bau', [
  ('Kommunalgebäude', '1', 'D', 'Arbeitsplätze, Küche, Sanitär; erster Bau in Phase 1.', 'Bauart nach Bau-KI; Größe; Kostenrahmen', '1', ''),
  ('Ausstattung Kommunalküche', '1', 'K', 'Gemeinsam kochen.', '', 'Personen Phase 1', ''),
  ('Feuerstelle mit Grill', '1', 'KS', 'Treffpunkt.', 'Brandschutz, windarmer Platz', '1', ''),
  ('Sauna', '1', 'KS', 'Gesundheit und Gemeinschaft.', 'Holz- oder Elektroofen; Bausatz oder Eigenbau; Brandschutz; Wasser', '1', ''),
  ('Gemüsegarten: Hochbeete, Erde, Gerätehaus, Kompost', '1', 'KS', 'Autarkie und Gemeinschaftsarbeit.', 'Was auf 1.000 m Höhe wächst', 'Fläche', ''),
  ('Gewächshaus', '1', 'K', 'Längere Saison.', 'Schneelast', '0–1', ''),
  ('Bergkapelle (Gruppenprojekt)', '1', 'S', 'Kommentar D34; im Plan ist eine Kapelle eingezeichnet.', 'Entwurf, Material, Genehmigung; Ansprechperson ist die Projektownerin', '1', ''),
 ]),
 ('Erfassung und Zugang', 'Kommentare D36 und D38: Aufgaben wie Schneeschippen, Pflanzenpflege, Kapellenaufbau und Kehrwoche mit geringem Aufwand erfassen, voraussichtlich Access Control über Cardano-Technik; erbrachte Leistungen werden von der Pauschale abgezogen.',
  ['D36', 'D38', 'D37'], 'Geschäftsführung', 'Rolle IT', [
  ('Zugangssystem für Türen (Chip oder Karte)', '0', 'K', 'Zugang und Nachweis, wer wo war.', 'Schloss mit offener Schnittstelle; Betrieb bei Stromausfall; mechanischer Schlüssel', 'je Tür', ''),
  ('Lesegeräte an Arbeitsorten (Garten, Holzlager, Kapelle)', '1', 'K', 'Gemeinschaftsarbeit mit einem Tippen erfassen.', 'wetterfest; offline-fähig', 'je Ort', ''),
  ('Chips oder Karten je Person', '0', 'K', 'Identität.', 'NFC-Standard passend zur Cardano-Lösung', 'je Person', ''),
  ('Software für Aufgaben und Abrechnung', '0', 'KS', 'Stunden erfassen, mit der Pauschale verrechnen.', 'Kaufen oder selbst bauen; Anbindung an Cardano', '1', ''),
  ('Zähler für Strom und Wasser je Einheit', '1', 'K', 'Verbrauch je Einheit messen, als Grundlage für Selbstkosten (D49).', 'fernauslesbar', 'je Einheit', ''),
 ]),
]

e = html.escape
def load_answers(base):
    a = {}
    for f in sorted((base / '../entscheidungen/antworten-2026-11-13/wahl').glob('D*.json')):
        d = json.loads(f.read_text()); a[f.stem] = d.get('data', d)
    return a
def rows():
    out, n = [], 0
    for bi, (titel, vor, ds, r1, r2, pos) in enumerate(B, 1):
        for g, ph, art, wof, rech, menge, hinw in pos:
            n += 1
            out.append(dict(nr=f'A{n:03d}', bereich=titel, gegenstand=g, phase=ph, art=ART[art], wofuer=wof, recherche=rech, menge=menge, entscheidungen=ds, entscheidet=r1, nimmt_ab=r2, hinweis=hinw))
    return out

CSS = '''/* Arbeitsliste zum Abhaken: eine Zeile je Gegenstand, Recherchefelder direkt in der Zeile, Farben und Schrift wie SGMM-Seite. */
:root { --bg:#f3f5f1; --paper:#fff; --ink:#10201a; --body:#33423b; --muted:#66756d; --line:#d9dfd8; --forest:#1d5a3c; --forest-bg:#e2efe6; --amber:#8a5a00; --amber-bg:#f6ecd4; --slate:#2c5378; --slate-bg:#e2ebf4;
  --display:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif; --text:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark } }
:root[data-theme="dark"] { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark }
* { box-sizing:border-box }
body { background:var(--bg); color:var(--body); font-family:var(--text); font-size:15.5px; line-height:1.5; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:24px 72px }
.w { max-width:1000px; margin:0 auto; display:flex; flex-direction:column; gap:28px }
header, section { display:flex; flex-direction:column; gap:12px }
h1 { font-family:var(--display); font-size:clamp(28px,5vw,42px); line-height:1.08; letter-spacing:-.02em; color:var(--ink); margin:0; text-wrap:balance }
h2 { font-family:var(--display); font-size:22px; color:var(--ink); margin:0; display:flex; gap:10px; align-items:baseline; flex-wrap:wrap }
h2 small { font-family:var(--mono); font-size:12px; color:var(--muted); font-weight:400 }
p { margin:0; max-width:78ch } a { color:var(--forest) }
.eyebrow { font-family:var(--mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--forest) }
.note { font-size:13.5px; color:var(--muted) } .vor { font-size:14.5px }
.bar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; position:sticky; top:env(safe-area-inset-top, 0px); background:var(--bg); padding-block:8px; z-index:5; border-bottom:1px solid var(--line) }
.bar button, .bar select, .bar input { font:inherit; font-size:14px; border:1px solid var(--line); background:var(--paper); color:var(--ink); border-radius:6px; padding:5px 10px }
.bar button[aria-pressed="true"] { background:var(--forest); color:var(--paper); border-color:var(--forest) }
.bar input { flex:1 1 160px; min-width:0 } .bar .cnt { font-family:var(--mono); font-size:12.5px; color:var(--muted); margin-left:auto }
.it { background:var(--paper); border:1px solid var(--line); border-radius:6px }
.it > summary { list-style:none; cursor:pointer; padding:10px 14px; display:grid; grid-template-columns:52px minmax(0,1fr) auto; gap:4px 10px; align-items:baseline }
.it > summary::-webkit-details-marker { display:none }
.it .nr { font-family:var(--mono); font-size:12.5px; color:var(--forest) } .it b { color:var(--ink); font-weight:600 }
.it .tags { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end }
.tag { font-family:var(--mono); font-size:11px; padding:1px 7px; border-radius:999px; background:var(--slate-bg); color:var(--slate); white-space:nowrap }
.tag.p0 { background:var(--forest-bg); color:var(--forest) } .tag.st { background:var(--amber-bg); color:var(--amber) } .tag.st[data-s="fertig"] { background:var(--forest-bg); color:var(--forest) }
.it .q { grid-column:2 / -1; font-size:14px; color:var(--body) }
.bd { padding:0 14px 14px; display:flex; flex-direction:column; gap:10px; border-top:1px dashed var(--line); padding-top:10px }
dl { margin:0; display:grid; grid-template-columns:130px minmax(0,1fr); gap:4px 10px; font-size:14px } dt { font-family:var(--mono); font-size:11.5px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); padding-top:2px } dd { margin:0 }
.form { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr)); gap:8px }
.form label { display:flex; flex-direction:column; gap:3px; font-size:12px; color:var(--muted) } .form .wide { grid-column:1 / -1 }
.form input, .form textarea, .form select { font:inherit; font-size:14px; border:1px solid var(--line); background:var(--bg); color:var(--ink); border-radius:6px; padding:6px 8px; width:100%; min-width:0 }
:focus-visible { outline:2px solid var(--forest); outline-offset:2px }
.who { font-size:12px; color:var(--muted) }
blockquote { margin:0; padding:6px 12px; border-left:3px solid var(--line); font-size:13.5px; color:var(--body) } blockquote span { font-family:var(--mono); font-size:11.5px; color:var(--forest); margin-right:6px }
@media (max-width:560px) { .it > summary { grid-template-columns:46px minmax(0,1fr) } .it .tags { grid-column:2; justify-content:flex-start } dl { grid-template-columns:1fr } }
footer { font-size:13px; color:var(--muted); border-top:1px solid var(--line); padding-top:12px }
'''
JS = '''
(async function(){
  var status=document.getElementById('status'), items=[].slice.call(document.querySelectorAll('.it')), state={}, db=null, user=null, me=null;
  var fPhase='', fOpen=false, fText='';
  function apply(){
    var shown=0, done=0;
    items.forEach(function(it){ var s=state[it.id]||{}, st=s.stand||'offen';
      var ok=(!fPhase||it.dataset.phase.indexOf(fPhase)===0)&&(!fOpen||st!=='fertig')&&(!fText||it.textContent.toLowerCase().indexOf(fText)>=0);
      it.hidden=!ok; if(ok) shown++; if(st==='fertig') done++; });
    document.querySelectorAll('section[data-b]').forEach(function(sec){ sec.hidden=!sec.querySelector('.it:not([hidden])'); });
    document.getElementById('cnt').textContent=shown+' von '+items.length+' · '+done+' fertig recherchiert';
  }
  function render(){
    items.forEach(function(it){ var s=state[it.id]||{};
      ['anbieter','preis','link','notiz','stand'].forEach(function(k){ var el=it.querySelector('[data-k="'+k+'"]'); if(el&&document.activeElement!==el) el.value=s[k]||(k==='stand'?'offen':''); });
      var t=it.querySelector('.tag.st'), st=s.stand||'offen'; t.textContent=st; t.dataset.s=st;
      it.querySelector('.who').textContent=s.am?('Zuletzt geändert '+new Date(s.am).toLocaleString('de-DE')):''; });
    apply();
  }
  document.querySelectorAll('[data-phase-btn]').forEach(function(b){ b.addEventListener('click',function(){ fPhase=b.dataset.phaseBtn; document.querySelectorAll('[data-phase-btn]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));}); apply(); }); });
  document.getElementById('open').addEventListener('click',function(ev){ fOpen=!fOpen; ev.currentTarget.setAttribute('aria-pressed',String(fOpen)); apply(); });
  document.getElementById('such').addEventListener('input',function(ev){ fText=ev.target.value.trim().toLowerCase(); apply(); });
  apply();
  var timer=setTimeout(function(){ if(!db) status.textContent='Speichern ist hier nicht verfügbar. Öffne die Seite auf claude.ai, um Recherche einzutragen.'; },10000);
  try{ db=await (window.claude&&window.claude.use?window.claude.use('db'):null); user=await (window.claude&&window.claude.use?window.claude.use('user'):null); }catch(err){ db=null; }
  var fields=[].slice.call(document.querySelectorAll('[data-k]'));
  if(!db){ clearTimeout(timer); status.textContent='Speichern ist hier nicht verfügbar. Öffne die Seite auf claude.ai, um Recherche einzutragen.'; fields.forEach(function(f){f.disabled=true;}); return; }
  try{ me=user?await user.id():null; }catch(err){ me=null; }
  db.collection('recherche').onSnapshot(function(snap){ clearTimeout(timer); state={}; snap.docs.forEach(function(d){ state[d.id]=d.data()||{}; }); status.textContent='Einträge werden gespeichert und sind für alle sichtbar, die diese Seite öffnen dürfen.'; render(); },
    function(err){ clearTimeout(timer); status.textContent='Laden fehlgeschlagen: '+(err&&err.message||'unbekannt'); });
  var busy={};
  fields.forEach(function(f){ f.addEventListener('change',async function(){ var id=f.closest('.it').id, patch={}; patch[f.dataset.k]=f.value.trim(); patch.von=me; patch.am=new Date().toISOString();
    while(busy[id]) await busy[id];
    busy[id]=db.doc('recherche/'+id).set(Object.assign({},state[id]||{},patch)).catch(function(err){ status.textContent='Speichern ging nicht: '+(err&&err.message||'unbekannt'); }).then(function(){ busy[id]=null; });
    state[id]=Object.assign({},state[id]||{},patch); }); });
})();
'''

def build(R, ans):
    o = [f'''<title>Node001 Anschaffungen</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="w">
<header><p class="eyebrow">Node001 Beregniza · Anschaffungen · Stand {STAND}</p>
<h1>Was angeschafft werden muss</h1>
<p>{len(R)} Objekte und Gegenstände, über deren Anschaffung zu entscheiden ist. Grundlage sind die Antworten vom 13.11. auf der <a href="{ENT}">Entscheidungsseite</a>, mit ihren Kommentaren. Die Liste nennt keine neuen Preise: Recherche bitte je Zeile eintragen (aufklappen).</p>
<p class="note">Mengen stehen als „wovon die Menge abhängt“, bis Personenzahl und Lastliste feststehen. Positionen aus der Geologie beruhen auf einer nicht geprüften KI-Zusammenfassung des Berichts. „Früher gefunden“ sind Internetpreise aus der Suche vom 12.11., nur als Anhalt. Funktionsketten: <a href="{SGMM}">SGMM-Seite</a>.</p>
<p class="note" id="status">Lädt …</p></header>
<div class="bar" role="group" aria-label="Filter"><button type="button" data-phase-btn="" aria-pressed="true">Alle Phasen</button><button type="button" data-phase-btn="0" aria-pressed="false">Phase 0</button><button type="button" data-phase-btn="1" aria-pressed="false">Phase 1</button><button type="button" id="open" aria-pressed="false">Nur offene</button><input id="such" type="search" placeholder="Suchen, z. B. Pumpe" aria-label="Suchen"><span class="cnt" id="cnt"></span></div>''']
    by = {}
    for r in R: by.setdefault(r['bereich'], []).append(r)
    for bi, (titel, vor, ds, r1, r2, _) in enumerate(B, 1):
        o.append(f'<section data-b="{bi}"><h2>{e(titel)} <small>{len(by[titel])} Positionen</small></h2><p class="vor">{e(vor)}</p>')
        kom = ''.join(f'<blockquote><span>{d} · {e(ans[d].get("wahl") or "ohne Wahl")}</span>{e(ans[d]["kommentar"])}</blockquote>' for d in ds if d in ans and ans[d].get('kommentar'))
        if kom: o.append(f'<details><summary class="note">Kommentare aus den Entscheidungen im Wortlaut</summary>{kom}</details>')
        for r in by[titel]:
            i = r['nr']; p0 = ' p0' if r['phase'].startswith('0') else ''
            o.append(f'''<details class="it" id="{i}" data-phase="{r["phase"]}"><summary><span class="nr">{i}</span><b>{e(r["gegenstand"])}</b><span class="tags"><span class="tag{p0}">Phase {r["phase"]}</span><span class="tag">{e(r["art"])}</span><span class="tag st" data-s="offen">offen</span></span><span class="q">{e(r["wofuer"])}</span></summary>
<div class="bd"><dl><dt>Recherchieren</dt><dd>{e(r["recherche"]) or "Anbieter und Preis"}</dd><dt>Menge hängt ab von</dt><dd>{e(r["menge"])}</dd><dt>Entscheidet</dt><dd>{e(r["entscheidet"])}</dd><dt>Nimmt ab</dt><dd>{e(r["nimmt_ab"])}</dd><dt>Aus</dt><dd>{", ".join(r["entscheidungen"])}</dd>{f"<dt>Hinweis</dt><dd>{e(r['hinweis'])}</dd>" if r["hinweis"] else ""}</dl>
<div class="form"><label>Anbieter<input id="{i}-anbieter" data-k="anbieter" maxlength="200"></label><label>Preis<input id="{i}-preis" data-k="preis" maxlength="80" placeholder="z. B. 12.000 UAH"></label><label>Stand<select id="{i}-stand" data-k="stand"><option>offen</option><option>in Arbeit</option><option>fertig</option></select></label>
<label class="wide">Link<input id="{i}-link" data-k="link" maxlength="500" inputmode="url"></label><label class="wide">Notiz<textarea id="{i}-notiz" data-k="notiz" rows="2" maxlength="2000"></textarea></label></div><p class="who"></p></div></details>''')
        o.append('</section>')
    o.append(f'<footer>Erzeugt aus plan/anschaffungen/werkzeug/liste.py im Repo Wolfoeden/x-portal, Stand {STAND}. Kein Angebot, keine Bestellung; bestellt wird erst nach Freigabe.</footer></div>\n<script>{JS}</script>')
    return '\n'.join(o)

if __name__ == '__main__':
    base = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    R, ans = rows(), load_answers(base)
    assert len({r['nr'] for r in R}) == len(R) and len({r['gegenstand'] for r in R}) == len(R), 'doppelt'
    for r in R: assert r['phase'] and r['wofuer'] and r['entscheidungen'], r['nr']
    page = build(R, ans); ids = re.findall(r' id="([^"]+)"', page); assert len(ids) == len(set(ids))
    (base / 'anschaffungen.body.html').write_text(page)
    (base / 'anschaffungen.json').write_text(json.dumps(dict(stand=STAND, positionen=R), ensure_ascii=False, indent=1))
    buf = io.StringIO(); w = csv.writer(buf, delimiter=';')
    w.writerow(['Nr', 'Bereich', 'Gegenstand', 'Phase', 'Art', 'Wofür', 'Recherchieren', 'Menge hängt ab von', 'Entscheidet', 'Nimmt ab', 'Aus Entscheidung', 'Hinweis', 'Anbieter', 'Preis', 'Link', 'Notiz', 'Stand'])
    for r in R: w.writerow([r['nr'], r['bereich'], r['gegenstand'], r['phase'], r['art'], r['wofuer'], r['recherche'], r['menge'], r['entscheidet'], r['nimmt_ab'], ', '.join(r['entscheidungen']), r['hinweis'], '', '', '', '', 'offen'])
    (base / 'anschaffungen.csv').write_text('﻿' + buf.getvalue())
    L = [f'# Anschaffungsliste Node001, Stand {STAND}', '', f'{len(R)} Positionen. Recherche-Einträge stehen in der Datenbank des Artefakts (Sammlung `recherche`).', '']
    for titel, vor, ds, r1, r2, _ in B:
        L += [f'## {titel}', '', vor, '', f'Entscheidet: {r1}. Nimmt ab: {r2}. Aus: {", ".join(ds)}.', '', '| Nr | Gegenstand | Phase | Art | Recherchieren | Menge hängt ab von |', '|---|---|---|---|---|---|']
        L += [f'| {r["nr"]} | {r["gegenstand"]} | {r["phase"]} | {r["art"]} | {r["recherche"]} | {r["menge"]} |' for r in R if r['bereich'] == titel] + ['']
    (base / 'anschaffungen.md').write_text('\n'.join(L))
    print('ok', len(R), 'Positionen in', len(B), 'Bereichen')
