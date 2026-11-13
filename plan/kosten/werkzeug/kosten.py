#!/usr/bin/env python3
"""Vor dem Investment: was mit rund 10.000 € Eigenkapital geht.

Liest das Kostenregister (quellen/Kosten_Gesamtregister_2026-11-13.xlsx, erstellt von der Projektleitung mit GPT; Teilschätzung,
keine Angebote) und ordnet jede gerechnete Zeile nach Phase, Maslow-Stufe und Geldquelle ein.
Alle Beträge sind ASSUMPTION: Internet-Richtwerte, viele aus dem Raum Kyjiw. Nichts wird geglättet.
Zeilen mit „Annahme KI“ stehen nicht im Register und sind eigene, grobe Spannen bis ein Angebot vorliegt.

Aufruf (aus plan/kosten):  python3 werkzeug/kosten.py .
Schreibt kosten.json, vor-dem-investment.body.html, vor-dem-investment.md, vor-dem-investment.csv.
"""
import csv, html, io, json, re, sys
from pathlib import Path
import openpyxl

STAND = '13.11.2026'
KURS = 50.3379  # UAH je EUR, NBU 13.11.2026 laut Register
RICHTWERT_EUR = 10000
RESERVE = 0.15
STUNDENSATZ_UAH = round(30000 / 168)  # aus Register B007: 30.000 UAH im Monat für eine Betriebsrolle
ENT = 'https://claude.ai/artifact/MqsCPAFG4HDgGTPERowpyP'
MASLOW = {1: 'Grundbedürfnisse', 2: 'Sicherheit', 3: 'Arbeit und Verbindung', 4: 'Gemeinschaft', 5: 'Entwicklung'}
M_BEREICH = {'Grundstück und Gründung': 2, 'Grundstück': 2, 'Planung': 2, 'Objekt Phase 0': 1, 'Strom': 2, 'Wärme und Holz': 1, 'Wärme': 1, 'Wasser': 1,
             'Sanitär und Abwasser': 1, 'Abwasser': 1, 'Internet und IT': 3, 'Küche und Essen': 1, 'Zufahrt, Schnee und Transport': 3, 'Transport': 3,
             'Mobilität': 3, 'Werkzeug und Wartung': 2, 'Sicherheit und Notfall': 2, 'Sicherheit': 2, 'Gemeinschaft in Phase 1': 4, 'Erfassung und Zugang': 5, 'Betrieb': 1}
M_ID = {'A012': 3, 'A013': 3, 'A010': 2, 'B016': 3, 'B007': 3, 'A082': 3, 'B008-F': 3, 'B008-E': 2, 'A065': 1, 'A108': 1}

# Paket vor dem Investment. (ID, Titel, Stufe, Variante, Quelle der Zahl, niedrig UAH, hoch UAH, Stunden Eigenleistung, welches Risiko wegfällt, Hinweis)
# Variante: K = Kern, O = Optimum (zusätzlich), E = erweitert (über dem Richtwert). Zahl None = aus Register übernehmen.
A, Bs, C = 'A · Nachweise auf Papier', 'B · Eigenanteil am Grundstück', 'C · Nachfrage und Umsatz'
PAKET = [
 ('A001', 'Fachprüfung des Geologieberichts', A, 'K', 'Register: 3.000 UAH „Beratung ab“; hoch = Annahme KI', 3000, 15000, 4, 'Boden: Die KI-Zusammenfassung ist nicht geprüft. Ohne Freigabe ist jede Gründung und jeder Preis angreifbar.', ''),
 ('A002', 'Zusatzerkundung (3 Bohrungen à 8 m)', A, 'K', 'Register', None, None, 4, 'Boden: Gründungshorizont für Objekt und Stützbauwerk.', 'Preis für anderen Standort; Hang ungeklärt.'),
 ('A003', 'Vermessung mit Geländemodell', A, 'K', 'Register: 2.500 UAH für kleine Fläche in Kyjiw; hoch = Annahme KI für 2 ha am Hang', 2500, 25000, 4, 'Planung: Grundlage für 3D-Modell, Leitungen und Kosten.', 'Der Registerwert ist auffällig niedrig.'),
 ('A048', 'Wasseranalyse im Labor', A, 'K', 'Register', None, None, 3, 'Wasser: bestimmt die Aufbereitung (5.625 bis über 45.000 UAH Unterschied).', ''),
 ('A010', 'Objekt-Skizze und Bau-KI-Planung', A, 'K', 'Register', None, None, 40, 'Kosten: Basis of Design für Objekt Phase 0 und Phase 1.', 'Register deckt nur eine Architektur-Skizze.'),
 ('A029', 'Heizlastberechnung', A, 'K', 'Register', None, None, 2, 'Wärme: Ofengröße und Holzmenge.', ''),
 ('A057', 'Abwasserplanung', A, 'K', 'Register', None, None, 4, 'Recht und Umwelt: Zulässigkeit am Hang mit Grundwasseraustritten.', ''),
 ('X01', 'Rechtsprüfung: ukrainische Gesellschaft, Miete, Holding', A, 'K', 'Annahme KI, Angebot nötig', 50000, 150000, 10, 'Recht: Struktur, in die ein Investor einsteigen kann (D44, D48).', 'Nicht im Register.'),
 ('X02', 'Drei schriftliche Angebote je großem Posten', A, 'K', 'kostet nur Zeit', 0, 0, 40, 'Kosten: macht aus Internet-Richtwerten ein belastbares Kostenband (Objekt, Brunnen, Kläranlage, Fundament, Netz).', ''),
 ('A018', 'Netzanschluss beantragen', A, 'O', 'Früherer Richtwert 2.927 UAH je kW, 10–15 kW; im Register offen', 29270, 43905, 6, 'Strom: lange Frist; mit Bescheid ist Leistung und Preis belegt.', 'Leitung zum Grundstück kommt dazu (Register A019: 12.600–17.400 UAH für 30 m).'),
 ('A036', 'Motorsäge', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A037', 'Schutzausrüstung für die Säge', Bs, 'K', 'Register', None, None, 0, 'Sicherheit und Haftung bei der Eigenleistung.', 'Register: nur Jacke und Hose; Helm, Handschuhe, Stiefel fehlen.'),
 ('A038', 'Motorsägenkurs', Bs, 'K', 'Register', None, None, 16, 'Sicherheit und Haftung.', ''),
 ('A040', 'Spaltaxt', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A041', 'Spaltkeile', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A044', 'Bügelsäge', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A045', 'Holzfeuchtemesser', Bs, 'K', 'Register', None, None, 0, 'Wärme: Messreihe zeigt, wann das eigene Holz brennbar ist.', ''),
 ('A046', 'Schubkarre', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A093', 'Werkzeugset mit Akkuschrauber', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A096', 'Stirnlampen', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A104', 'Erste-Hilfe-Ausrüstung', Bs, 'K', 'Register', None, None, 0, 'Sicherheit bei Arbeit mit der Säge.', ''),
 ('A105', 'Erste-Hilfe-Kurs', Bs, 'K', 'Register', None, None, 16, '', ''),
 ('A102', 'Feuerlöscher', Bs, 'K', 'Register', None, None, 0, '', ''),
 ('A007', 'Baufläche und Trasse roden, Holz aufarbeiten', Bs, 'K', 'Eigenleistung; hoch = Register (Fällfirma für schwierige Bäume)', 0, 4800, 80, 'Zeit: geschlagenes Holz braucht etwa ein Jahr zum Trocknen. Was jetzt liegt, heizt den zweiten Winter.', 'Fällgenehmigung vorher klären.'),
 ('A035', 'Holzlager bauen', Bs, 'K', 'Register (fertiger Holzständer); Eigenbau aus eigenem Holz kann günstiger sein', None, None, 24, 'Wärme: trockenes Holz für Phase 0.', ''),
 ('X03', 'Absteckung und Messreihen (Quellschüttung, Wetter, Schnee)', Bs, 'K', 'kostet nur Zeit', 0, 0, 30, 'Wasser und Klima: Winterwerte, die sonst ein Jahr fehlen.', ''),
 ('A004', 'Hangseitiger Entwässerungsgraben, 20 m', Bs, 'O', 'Register', None, None, 40, 'Boden: schützt die Baufläche vor Hangwasser; Empfehlung des Gutachters.', 'Erst nach Freigabe durch den Fachexperten. Mit Eigenleistung sinkt der Betrag.'),
 ('A049', 'Brunnen bohren, 20–40 m', Bs, 'E', 'Register', None, None, 8, 'Wasser: beweist Menge und Qualität am Ort. Größtes offenes Risiko nach dem Boden.', 'Tiefe unbekannt; Pumpe und Leitung kommen später dazu.'),
 ('X04', 'Mieter-Interessenten sammeln', C, 'K', 'kostet nur Zeit', 0, 0, 60, 'Nachfrage: belegt, dass jemand oben wohnen und zahlen will (D50).', ''),
 ('X05', 'Erster bezahlter Kundenauftrag der Agentur', C, 'K', 'bringt Umsatz', 0, 0, 0, 'Umsatz: zeigt, dass die Company Geld verdient.', ''),
 ('X06', 'Selbstkostenrechnung je Objekt', C, 'K', 'kostet nur Zeit', 0, 0, 20, 'Wirtschaftlichkeit: Miete und Pauschale aus echten Kosten (D49).', ''),
 ('X07', 'Investorenunterlagen mit geprüften Zahlen', C, 'K', 'kostet nur Zeit', 0, 0, 40, 'Vertrauen: Whitepaper und Deck ohne offene Kernfragen.', ''),
]
NICHT = ['Reisen und Unterkunft vor Ort während der Vor-Phase', 'Honorar des Architekten für Beratung', 'Gebühren für Fällgenehmigung und Anträge', 'Gründungskosten der ukrainischen Gesellschaft', 'Versicherung für die Eigenleistung']

e = html.escape
def n(x): return f'{round(x):,}'.replace(',', '.')
def eur(x): return n(x / KURS)
def span(lo, hi, cur='UAH'):
    f = eur if cur == 'EUR' else n
    return f(lo) if round(lo) == round(hi) else f'{f(lo)}–{f(hi)}'

def read(base):
    wb = openpyxl.load_workbook(base / 'quellen/Kosten_Gesamtregister_2026-11-13.xlsx', data_only=True)
    kal = []
    for r in wb['Kalkulation'].iter_rows(min_row=2, values_only=True):
        if not r[0]: continue
        per = r[8] if isinstance(r[8], (int, float)) else 1
        lo, hi = r[4] * r[6] * per, r[5] * r[7] * per
        kal.append(dict(id=str(r[0]), bereich=r[1], position=r[2], art=r[3], niedrig=lo, hoch=hi, annahme=r[9] or '', quelle=r[10] or ''))
    reg = []
    for r in wb['Gesamtregister'].iter_rows(min_row=2, values_only=True):
        if r[0]: reg.append(dict(id=str(r[0]), bereich=r[1], phase=str(r[2]), position=r[3], preisvergleich=r[7] or '', status=r[10] or ''))
    ub = {str(r[0]): r[1:3] for r in wb['Überblick'].iter_rows(values_only=True) if r[0]}
    return kal, reg, ub

def build(base):
    kal, reg, ub = read(base)
    inv_lo = sum(k['niedrig'] for k in kal if k['art'] == 'Investition'); inv_hi = sum(k['hoch'] for k in kal if k['art'] == 'Investition')
    bet_lo = sum(k['niedrig'] for k in kal if k['art'] == 'Betrieb'); bet_hi = sum(k['hoch'] for k in kal if k['art'] == 'Betrieb')
    for name, got in [('Einmaliger Aufbau', (inv_lo, inv_hi)), ('Betrieb: zwölf Monate', (bet_lo, bet_hi))]:
        assert all(abs(a - b) < 1 for a, b in zip(ub[name], got)), (name, ub[name], got)
    kid = {k['id']: k for k in kal}; phase = {r['id']: r['phase'] for r in reg}
    P = []
    for i, t, stufe, var, q, lo, hi, h, risiko, hinw in PAKET:
        if lo is None: lo, hi = kid[i]['niedrig'], kid[i]['hoch']
        P.append(dict(id=i, titel=t, stufe=stufe, variante=var, quelle=q, niedrig=lo, hoch=hi, stunden=h, risiko=risiko, hinweis=hinw, im_register=i in kid))
    def tot(vs):
        lo = sum(p['niedrig'] for p in P if p['variante'] in vs); hi = sum(p['hoch'] for p in P if p['variante'] in vs)
        return dict(niedrig=lo, hoch=hi, hoch_mit_reserve=hi * (1 + RESERVE), stunden=sum(p['stunden'] for p in P if p['variante'] in vs))
    V = {'Kern': tot('K'), 'Optimum': tot('KO'), 'Erweitert': tot('KOE')}
    # Rest für Investoren: Register minus die Zeilen, die das Paket schon enthält
    inpak = {p['id'] for p in P if p['im_register'] and p['variante'] in 'KOE'}
    ask_inv = (sum(k['niedrig'] for k in kal if k['art'] == 'Investition' and k['id'] not in inpak), sum(k['hoch'] for k in kal if k['art'] == 'Investition' and k['id'] not in inpak))
    # Matrix Maslow × Phase (nur gerechnete Zeilen)
    M = {}
    for k in kal:
        m = M_ID.get(k['id'], M_BEREICH[k['bereich']])
        ph = 'Vor-Phase' if k['id'] in inpak else ('Betrieb 12 Monate' if k['art'] == 'Betrieb' else 'Phase ' + phase.get(k['id'].split('-')[0], '0')[0])
        c = M.setdefault((m, ph), [0, 0, 0]); c[0] += k['niedrig']; c[1] += k['hoch']; c[2] += 1
        k['maslow'] = m; k['phase_neu'] = ph
    offen = [r for r in reg if 'offen' in r['status']]
    return dict(stand=STAND, kurs=KURS, richtwert_eur=RICHTWERT_EUR, reserve=RESERVE, stundensatz_uah=STUNDENSATZ_UAH, paket=P, varianten=V,
                register=dict(einmalig=(inv_lo, inv_hi), betrieb=(bet_lo, bet_hi), zeilen=len(kal), positionen=len(reg), offen=len(offen)),
                investor_ask=dict(einmalig=ask_inv, betrieb=(bet_lo, bet_hi)), matrix={f'{m}|{ph}': v for (m, ph), v in M.items()},
                kalkulation=kal, offene_positionen=[dict(id=r['id'], position=r['position'], phase=r['phase'], preisvergleich=r['preisvergleich']) for r in offen], nicht_enthalten=NICHT)

CSS = '''/* Entscheidungsvorlage: oben die Antwort in drei Zahlen, darunter die Posten je Stufe; Farben und Schrift wie die übrigen Plan-Seiten. */
:root { --bg:#f3f5f1; --paper:#fff; --ink:#10201a; --body:#33423b; --muted:#66756d; --line:#d9dfd8; --forest:#1d5a3c; --forest-bg:#e2efe6; --amber:#8a5a00; --amber-bg:#f6ecd4; --slate:#2c5378; --slate-bg:#e2ebf4;
  --display:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif; --text:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif; --mono:'IBM Plex Mono',ui-monospace,Menlo,monospace }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark } }
:root[data-theme="dark"] { --bg:#0e1512; --paper:#151e1a; --ink:#eef3ef; --body:#c9d3cd; --muted:#93a199; --line:#28352f; --forest:#8fd0a9; --forest-bg:#173226; --amber:#f0c873; --amber-bg:#372c14; --slate:#9cc3f0; --slate-bg:#172638; color-scheme:dark }
* { box-sizing:border-box }
body { background:var(--bg); color:var(--body); font-family:var(--text); font-size:16px; line-height:1.55; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); padding-block:28px 72px }
.w { max-width:1040px; margin:0 auto; display:flex; flex-direction:column; gap:40px }
header, section { display:flex; flex-direction:column; gap:14px }
h1 { font-family:var(--display); font-size:clamp(28px,5vw,44px); line-height:1.08; letter-spacing:-.02em; color:var(--ink); margin:0; text-wrap:balance }
h2 { font-family:var(--display); font-size:clamp(21px,3vw,26px); color:var(--ink); margin:0; text-wrap:balance } h3 { font-family:var(--display); font-size:17px; color:var(--ink); margin:0 }
p { margin:0; max-width:76ch } a { color:var(--forest) } ul { margin:0; padding-left:20px; max-width:76ch } li { margin:3px 0 }
.eyebrow { font-family:var(--mono); font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--forest) }
.lead { font-size:18px; color:var(--ink) } .note { font-size:13.5px; color:var(--muted) }
.vars { display:grid; gap:10px; grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr)) }
.var { background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:16px 18px; display:flex; flex-direction:column; gap:6px; min-width:0 }
.var.pick { border:2px solid var(--forest) } .var .big { font-family:var(--display); font-size:30px; font-weight:600; color:var(--ink); font-variant-numeric:tabular-nums; line-height:1.1 }
.var .lab { font-family:var(--mono); font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--forest) } .var p { font-size:14.5px }
.rule { border-left:4px solid var(--forest); background:var(--forest-bg); color:var(--ink); padding:12px 16px; border-radius:0 6px 6px 0; max-width:none }
.warn { border-left:4px solid var(--amber); background:var(--amber-bg); color:var(--ink); padding:12px 16px; border-radius:0 6px 6px 0; max-width:none }
.tw { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--paper) }
table { border-collapse:collapse; width:100%; font-size:14.5px; font-variant-numeric:tabular-nums }
th, td { text-align:left; vertical-align:top; padding:8px 11px; border-top:1px solid var(--line) } thead th { border-top:0; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); font-weight:500 }
td.id { font-family:var(--mono); font-size:12.5px; color:var(--forest); white-space:nowrap } td.num, th.num { text-align:right; white-space:nowrap } td small { color:var(--muted); display:block }
.tag { font-family:var(--mono); font-size:11px; padding:1px 7px; border-radius:999px; white-space:nowrap; background:var(--forest-bg); color:var(--forest) } .tag.o { background:var(--slate-bg); color:var(--slate) } .tag.e { background:var(--amber-bg); color:var(--amber) }
tr.sum td { font-weight:600; color:var(--ink); background:var(--bg) }
footer { font-size:13px; color:var(--muted); border-top:1px solid var(--line); padding-top:12px }
'''

def page(D):
    V, P = D['varianten'], D['paket']
    def vbox(name, lab, text, pick=False):
        v = V[name]
        return (f'<div class="var{" pick" if pick else ""}"><span class="lab">{lab}</span><span class="big">{eur(v["niedrig"])}–{eur(v["hoch"])} €</span>'
                f'<p>{text}</p><p class="note">Mit {round(RESERVE*100)} % Reserve auf den hohen Wert: {eur(v["hoch_mit_reserve"])} €. Eigenleistung: {v["stunden"]} Stunden.</p></div>')
    o = [f'''<title>Node001 vor dem Investment</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>{CSS}</style>
<div class="w">
<header><p class="eyebrow">Node001 Beregniza · Vor dem Investment · Stand {STAND}</p>
<h1>Was rund 10.000 € Eigenkapital vor dem Investment leisten</h1>
<p class="lead">Mit dem Richtwert von {n(RICHTWERT_EUR)} € lassen sich die Risiken klären, die ein Investor sonst einpreist: Boden, Wasser, Strom, Recht, Kosten und Nachfrage. Dazu kommt ein sichtbarer Eigenanteil am Grundstück. Gebaut wird damit noch nichts.</p>
<p class="note">Alle Beträge stammen aus dem Kostenregister vom 13.11.2026 (Teilschätzung mit Internet-Richtwerten, viele aus dem Raum Kyjiw, keine Angebote) und sind Annahmen. Kurs {str(KURS).replace(".", ",")} UAH je EUR. Entschieden wird auf der <a href="{ENT}">Entscheidungsseite</a>, Karten D69 bis D72.</p></header>
<section><h2>Drei Varianten</h2><div class="vars">
{vbox('Kern', 'Kern', 'Alle Nachweise auf Papier, Werkzeug und Kurse für die Eigenleistung, Holz schlagen und einlagern, Interessenten und Unterlagen.')}
{vbox('Optimum', 'Optimum · Vorschlag KI', 'Kern, dazu Netzanschluss beantragen und den Entwässerungsgraben bauen. Bleibt auch im hohen Fall nahe am Richtwert.', True)}
{vbox('Erweitert', 'Erweitert', 'Optimum, dazu den Brunnen bohren. Beweist Wasser am Ort, liegt im hohen Fall über dem Richtwert.')}
</div>
<p class="rule">Für Investoren zählen geprüfte Nachweise mehr als ausgegebenes Geld. Deshalb kommt Stufe A zuerst. Der Brunnen ist der Posten, über den ihr bei 12.000–15.000 € entscheidet: Er beseitigt das größte Risiko nach dem Boden, seine Tiefe ist aber unbekannt.</p>
<p class="warn">Nicht in diesen Summen, weil im Register kein Wert steht: {e("; ".join(NICHT))}. Diese Posten gehören vor dem Start geklärt.</p></section>''']
    for stufe, intro in [(A, 'Ergebnis: ein Kostenband aus Angeboten statt aus Internetpreisen, eine geprüfte Gründung und eine Struktur, in die ein Investor einsteigen kann.'),
                         (Bs, 'Ergebnis: vorbereitete Fläche, trocknendes Holz, Messreihen über den Winter. Überwiegend Stunden statt Geld.'),
                         (C, 'Ergebnis: belegte Nachfrage und Umsatz. Kostet Zeit, kein Geld.')]:
        o.append(f'<section><h2>Stufe {e(stufe)}</h2><p>{intro}</p><div class="tw"><table><thead><tr><th>Nr</th><th>Posten</th><th>Variante</th><th class="num">UAH</th><th class="num">€</th><th class="num">Stunden</th><th>Welches Risiko wegfällt</th></tr></thead><tbody>')
        rows = [p for p in P if p['stufe'] == stufe]
        for p in rows:
            tg = {'K': '<span class="tag">Kern</span>', 'O': '<span class="tag o">Optimum</span>', 'E': '<span class="tag e">Erweitert</span>'}[p['variante']]
            o.append(f'<tr><td class="id">{p["id"]}</td><td><b>{e(p["titel"])}</b><small>{e(p["quelle"])}{". " + e(p["hinweis"]) if p["hinweis"] else ""}</small></td><td>{tg}</td><td class="num">{span(p["niedrig"], p["hoch"])}</td><td class="num">{span(p["niedrig"], p["hoch"], "EUR")}</td><td class="num">{p["stunden"] or "–"}</td><td>{e(p["risiko"])}</td></tr>')
        lo, hi, h = sum(p['niedrig'] for p in rows), sum(p['hoch'] for p in rows), sum(p['stunden'] for p in rows)
        o.append(f'<tr class="sum"><td></td><td>Summe Stufe, alle Varianten</td><td></td><td class="num">{span(lo, hi)}</td><td class="num">{span(lo, hi, "EUR")}</td><td class="num">{h}</td><td></td></tr></tbody></table></div></section>')
    v = V['Optimum']
    o.append(f'''<section><h2>Eigenleistung</h2>
<p>Im Optimum stecken {v["stunden"]} Stunden eigene Arbeit. Bewertet mit {STUNDENSATZ_UAH} UAH je Stunde (aus dem Register: 30.000 UAH im Monat für eine Betriebsrolle) sind das {n(v["stunden"] * STUNDENSATZ_UAH)} UAH oder {eur(v["stunden"] * STUNDENSATZ_UAH)} €. Mit einem deutschen Stundensatz wäre der Wert ein Vielfaches.</p>
<ul><li>Stunden, Fotos und Ergebnisse laufend festhalten: Datum, Rolle, Tätigkeit, Dauer. Das ist der Beleg gegenüber Investoren.</li><li>Ob und mit welchem Satz Eigenleistung als Einlage zählt, prüft ein Steuerberater. Die Zahl oben ist eine Annahme.</li><li>Der größere Hebel ist nicht der Stundenwert, sondern das beseitigte Risiko: Ein geprüfter Boden und ein Kostenband aus Angeboten senken den Abschlag, den ein Investor verlangt.</li></ul></section>''')
    R, K = D['register'], D['investor_ask']
    o.append(f'''<section><h2>Was danach mit Investoren finanziert wird</h2>
<p>Das Register rechnet für eine kleine Phase 0 (ein Modul mit 18 m², zwei Personen) einmalig {span(*R["einmalig"])} UAH und für zwölf Monate Betrieb {span(*R["betrieb"])} UAH. Nach Abzug der Posten aus dem Paket bleiben:</p>
<div class="tw"><table><thead><tr><th>Block</th><th class="num">UAH</th><th class="num">€</th><th>Hinweis</th></tr></thead><tbody>
<tr><td><b>Einmaliger Aufbau Phase 0</b></td><td class="num">{span(*K["einmalig"])}</td><td class="num">{span(*K["einmalig"], "EUR")}</td><td>Objekt, Fundament, Brunnenausbau, Kläranlage, Strom, Internet, Fahrzeug</td></tr>
<tr><td><b>Betrieb zwölf Monate</b></td><td class="num">{span(*K["betrieb"])}</td><td class="num">{span(*K["betrieb"], "EUR")}</td><td>eine bezahlte Rolle, Essen, Strom, Kraftstoff, Internet</td></tr>
</tbody></table></div>
<p class="warn">Das ist eine Teilsumme, kein Kapitalbedarf. {R["offen"]} von {R["positionen"]} Positionen haben keinen Betrag, darunter Netzanschluss, Gelände, Arbeitgeberabgaben und Reserven. Phase 1 (Wohn- und Arbeitsobjekte, Kommunalgebäude) ist nicht gerechnet. Der Betrag für das Investorengespräch entsteht erst aus den Angeboten der Stufe A.</p></section>''')
    phs = ['Vor-Phase', 'Phase 0', 'Phase 1', 'Betrieb 12 Monate']
    o.append('<section><h2>Nach Maslow und Phase</h2><p>Die gerechneten Zeilen des Registers, geordnet nach Bedürfnisstufe. Leere Felder heißen: nichts gerechnet, nicht: kostet nichts.</p><div class="tw"><table><thead><tr><th>Stufe</th>' + ''.join(f'<th class="num">{p} · €</th>' for p in phs) + '</tr></thead><tbody>')
    for m, name in MASLOW.items():
        o.append(f'<tr><td><b>{m} · {name}</b></td>' + ''.join((lambda c: f'<td class="num">{span(c[0], c[1], "EUR")}<small>{c[2]} Zeilen</small></td>' if c else '<td class="num">–</td>')(D['matrix'].get(f'{m}|{p}')) for p in phs) + '</tr>')
    o.append('</tbody></table></div><p class="note">Gemeinschaft und Entwicklung (Stufen 4 und 5) haben im Register noch keine Beträge: Kommunalgebäude, Garten, Kapelle, Sauna und Erfassung sind offen.</p></section>')
    o.append(f'<footer>Erzeugt aus plan/kosten/werkzeug/kosten.py im Repo Wolfoeden/x-portal, Stand {STAND}. Quelle der Zahlen: Kostenregister der Projektleitung vom 13.11.2026. Keine Anlageberatung, kein Angebot.</footer></div>')
    return '\n'.join(o)

def md(D):
    V = D['varianten']; L = [f'# Node001 vor dem Investment, Stand {STAND}', '', f'Richtwert Eigenkapital {n(RICHTWERT_EUR)} €. Alle Beträge sind Annahmen aus dem Kostenregister (Teilschätzung, keine Angebote). Kurs {KURS} UAH/EUR.', '', '| Variante | € niedrig–hoch | € hoch mit Reserve | Stunden Eigenleistung |', '|---|---|---|---|']
    L += [f'| {k} | {eur(v["niedrig"])}–{eur(v["hoch"])} | {eur(v["hoch_mit_reserve"])} | {v["stunden"]} |' for k, v in V.items()]
    L += ['', '| Nr | Posten | Stufe | Variante | UAH | Stunden | Risiko, das wegfällt | Quelle |', '|---|---|---|---|---|---|---|---|']
    L += [f'| {p["id"]} | {p["titel"]} | {p["stufe"][0]} | {dict(K="Kern", O="Optimum", E="Erweitert")[p["variante"]]} | {span(p["niedrig"], p["hoch"])} | {p["stunden"]} | {p["risiko"]} | {p["quelle"]} |' for p in D['paket']]
    K = D['investor_ask']
    L += ['', f'Nicht enthalten: {"; ".join(NICHT)}.', '', f'Danach mit Investoren (Teilsumme): einmalig {span(*K["einmalig"])} UAH, Betrieb zwölf Monate {span(*K["betrieb"])} UAH. {D["register"]["offen"]} von {D["register"]["positionen"]} Positionen ohne Betrag.']
    return '\n'.join(L) + '\n'

if __name__ == '__main__':
    base = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    D = build(base)
    (base / 'kosten.json').write_text(json.dumps(D, ensure_ascii=False, indent=1))
    (base / 'vor-dem-investment.body.html').write_text(page(D))
    (base / 'vor-dem-investment.md').write_text(md(D))
    buf = io.StringIO(); w = csv.writer(buf, delimiter=';')
    w.writerow(['Nr', 'Posten', 'Stufe', 'Variante', 'UAH niedrig', 'UAH hoch', 'Stunden', 'Risiko', 'Quelle', 'Hinweis'])
    for p in D['paket']: w.writerow([p['id'], p['titel'], p['stufe'], p['variante'], round(p['niedrig']), round(p['hoch']), p['stunden'], p['risiko'], p['quelle'], p['hinweis']])
    (base / 'vor-dem-investment.csv').write_text('﻿' + buf.getvalue())
    for k, v in D['varianten'].items(): print(k, eur(v['niedrig']), '–', eur(v['hoch']), '€; mit Reserve', eur(v['hoch_mit_reserve']), '€;', v['stunden'], 'h')
    print('Investor Ask einmalig', span(*D['investor_ask']['einmalig'], 'EUR'), '€; Betrieb', span(*D['investor_ask']['betrieb'], 'EUR'), '€')
