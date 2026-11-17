#!/usr/bin/env python3
"""Technik der Company: Infrastruktur im Betrieb, laufende Kosten, Nachweise, digitale Erlösquellen (Stand 17.11.2026).

Eine Quelle für Index (Ast 9, Cockpit), Whitepaper und Deck. Beträge nur mit Quelle; Unbekanntes bleibt None (= offen).
Nach außen (Whitepaper, Deck) ohne Beträge (Wahl vom 14.11.2026).
Aufruf (aus plan/technik): python3 werkzeug/technik.py .
"""
import json, sys
from pathlib import Path

STAND = '2026-11-17'
QP = 'Angabe der Projektleitung vom 17.11.2026'

# (id, Bereich, Werkzeug, Zweck, Betrag €, Einheit, Quelle, Nachweis für Investoren, Hinweis)
# Einheit: 'Monat', 'Jahr', 'Nutzer und Monat', 'Transaktion'
STACK = [
 ('IT01', 'KI', 'ChatGPT', 'KI-Arbeitsplatz: Recherche, Texte, Code, Agenten', 90.0, 'Monat', QP, 'Abo-Rechnung; Nutzung in Projekten', ''),
 ('IT02', 'KI', 'Claude', 'KI-Arbeitsplatz: Planung, Code, Auswertung', 90.0, 'Monat', QP, 'Abo-Rechnung; Repository mit Commits', ''),
 ('IT03', 'Web', 'Website-Hosting', 'Website und Plattform x-portal.eu', 10.0, 'Monat', QP, 'Live-URL; Hosting-Rechnung', ''),
 ('IT04', 'Daten', 'Supabase', 'Datenbank und Backend der Plattform', 25.0, 'Monat', QP, 'Projekt-Dashboard: Tabellen, Nutzer, Abfragen', ''),
 ('IT05', 'Blockchain', 'Cardano-Transaktionen', 'Nachweise und Zahlungen on-chain; Grundlage für Zugang und Erfassung (AP-D5, AP-F4)', 0.02, 'Transaktion', QP + ': 0,16 ADA, umgerechnet etwa 2 Cent', 'Transaktions-Hashes, öffentlich im Explorer prüfbar', 'ADA-Kurs schwankt; Anzahl je Monat offen'),
 ('IT06', 'Marketing', 'X Premium mit Grok-Bot', 'Marketing und Reichweite auf X; Grok-Bot im Abo enthalten', 30.0, 'Monat', QP, 'Profil, Reichweitenzahlen, Abo-Beleg', ''),
 ('IT07', 'Büro', 'Microsoft 365 Business Premium', 'E-Mail, Teams, OneDrive, Office, Sicherheit und Geräteverwaltung', None, 'Nutzer und Monat', 'Listenpreis etwa 20–22 € netto je Nutzer und Monat im Jahresabo (Händlerlisten 08/2026; Microsoft-Seite am 17.11.2026 nicht erreichbar); Betrag aus der Rechnung übernehmen', 'Rechnung; Mandant mit Nutzern', 'Nutzerzahl offen'),
 ('IT08', 'Web', 'Domain', 'x-portal.eu', 40.0, 'Jahr', QP, 'Registrierung', ''),
 ('IT09', 'Plattform', 'Plattform x-portal.eu', 'KI-Matching und Freelancer-Profile; läuft auf IT03 und IT04', None, 'Monat', 'eigene Entwicklung; Kosten stecken in IT03 und IT04', 'Live-URL, Nutzerzahlen, Repository', ''),
]
M365_SPANNE = (20.0, 22.0)

# (id, Erlösquelle, Erlösstufe (Whitepaper), Reifegrad, Stand, Nachweis, nächster Schritt)
ERLOESE = [
 ('ER-K', 'Kundenprojekte über die DT Agentur (Deutschland, Österreich, Schweiz)', '01 · Heute', 'läuft', 'Kundenprojekte heute (D51)', 'Rechnungen, Referenzen', 'erster bezahlter Auftrag mit Testkarte (2.6.1)'),
 ('ER-I', 'ISMS-App: Zertifizierungen, unter anderem für Startups', '02 · Technologielösungen', 'Pilot mit Kunden', QP, 'Pilotkunden, Nutzung der App, Kundenstimme', 'Pilot auswerten, Preismodell, Referenz (AP-A11)'),
 ('ER-A', 'KI-Agenten', '02 · Technologielösungen', 'in Entwicklung', 'Teilergebnis 2.6.4: Verkauf über Masumi später', 'Repository, erste Nutzung', 'Preismodell (2.6.2)'),
 ('ER-P', 'Plattform x-portal.eu mit KI-Matching', 'Plattform', 'läuft, Erlösmodell offen', 'Whitepaper „Vorhanden“', 'Live-URL, Profile, Matches', 'Erlösmodell festlegen'),
 ('ER-S', 'Staking oder Stake-Pool auf Cardano', 'Blockchain', 'Stand offen', QP + ' (Antwort auf die Frage nach Einnahmen über die Blockchain)', 'Stake-Pool-ID oder Staking-Adresse, öffentlich prüfbar', 'Rechts- und Steuerprüfung (AP-A12)'),
 ('ER-N', 'Miete und Services am Node001', '03 · Node001', 'vor dem Bau', 'D45, D48, D50', 'Whitelist, später Mietverträge und Mieterlöse (AP-F3)', 'Whitelist einrichten (AP-A8)'),
]

def monat(betrag, einheit):
    return betrag if einheit == 'Monat' else (betrag / 12 if einheit == 'Jahr' else None)

def build():
    fix = sum(monat(b, e) for _, _, _, _, b, e, *_ in STACK if b is not None and monat(b, e) is not None)
    stack = [dict(id=i, bereich=br, werkzeug=w, zweck=z, betrag=b, einheit=e, quelle=q, nachweis=n, hinweis=h, je_monat=(round(monat(b, e), 2) if b is not None and monat(b, e) is not None else None))
             for i, br, w, z, b, e, q, n, h in STACK]
    erl = [dict(id=i, quelle=q, stufe=s, reife=r, stand=st, nachweis=n, naechstes=x) for i, q, s, r, st, n, x in ERLOESE]
    return dict(stand=STAND, fix_je_monat_ohne_m365=round(fix, 2), m365_spanne_je_nutzer=M365_SPANNE, stack=stack, erloese=erl)

def pruefe(D):
    f = []
    for t in D['stack']:
        if t['betrag'] is not None and not t['quelle']: f.append(f"{t['id']}: Betrag ohne Quelle")
    soll = sum(t['je_monat'] for t in D['stack'] if t['je_monat'] is not None)
    if abs(soll - D['fix_je_monat_ohne_m365']) > 0.01: f.append('Summe stimmt nicht')
    return f

def md(D):
    L = [f"# Technik der Company, Stand {D['stand']}", '', f"Feste Kosten je Monat ohne Microsoft 365: {D['fix_je_monat_ohne_m365']:.2f} €. Microsoft 365 Business Premium: etwa {M365_SPANNE[0]:.0f}–{M365_SPANNE[1]:.0f} € je Nutzer und Monat (Nutzerzahl offen). Cardano: je Transaktion.", '',
         '| Nr | Bereich | Werkzeug | Zweck | Betrag | Einheit | Quelle | Nachweis |', '|---|---|---|---|---|---|---|---|']
    L += [f"| {t['id']} | {t['bereich']} | {t['werkzeug']} | {t['zweck']} | {'' if t['betrag'] is None else str(t['betrag']).replace('.', ',') + ' €'} | {t['einheit']} | {t['quelle']} | {t['nachweis']} |" for t in D['stack']]
    L += ['', '## Erlösquellen', '', '| Nr | Quelle | Stufe | Reifegrad | Nachweis | Nächster Schritt |', '|---|---|---|---|---|---|']
    L += [f"| {e['id']} | {e['quelle']} | {e['stufe']} | {e['reife']} | {e['nachweis']} | {e['naechstes']} |" for e in D['erloese']]
    return '\n'.join(L) + '\n'

if __name__ == '__main__':
    base = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    D = build(); f = pruefe(D); assert not f, f
    (base / 'technik.json').write_text(json.dumps(D, ensure_ascii=False, indent=1))
    (base / 'technik.md').write_text(md(D))
    print('ok', D['fix_je_monat_ohne_m365'], '€/Monat ohne M365')
