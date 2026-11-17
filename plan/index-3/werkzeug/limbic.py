"""Limbic Map für Node001 (Index 3.0, beim Maslow-Teil im Zielbild).

Sternbild „X-Portal Node001“, gelegt von der Projektleitung am 17.11.2026 im Artefakt „Limbic Sternbild“
(https://claude.ai/artifact/1eTvbSo16JXhi8rvjU85RF). Die Wortlage folgt der Limbic Map® von H.-G. Häusel,
© Gruppe Nymphenburg Consult AG, nachgezeichnet nach der Vorlage (1.123 × 651 px) und am Raster geprüft.
Pol und Feld werden wie im Tool aus der Lage des Worts bestimmt.
"""
import html as _h
import math

WORDS = [
    ('Extravaganz',366,94),('Impulsivität',567,87),('Rebellion',718,88),('Kreativität',291,145),('Risikofreude',519,141),('Mut',688,126),('Sieg',800,124),
    ('Kampf',812,162),('Macht',893,160),('Individualismus',418,177),('Spontaneität',564,181),('Autonomie',700,195),('Ruhm',840,203),('Elite',952,194),
    ('Abwechslung',397,221),('Freiheit',768,220),('Status',882,229),('Durchsetzung',958,216),('Kunst',215,216),('Spaß',152,236),('Neugier',300,257),
    ('Humor',215,291),('Stolz',842,254),('Leistung',992,255),('Ehre',831,279),('Effizienz',942,279),('Leichtigkeit',357,320),('Fleiß',875,315),
    ('Ehrgeiz',978,319),('Fantasie',211,353),('Funktionalität',782,342),('Hartnäckigkeit',988,345),('Genuss',115,378),('Offenheit',310,378),
    ('Toleranz',418,367),('Logik',869,374),('Präzision',992,378),('Ordnung',771,386),('Träumen',182,422),('Poesie',306,418),('Flexibilität',424,412),
    ('Gerechtigkeit',744,412),('Disziplin',925,411),('Moral',807,437),('Pflicht',875,430),('Herzlichkeit',402,452),('Freundschaft',516,444),
    ('Gehorsamkeit',688,449),('Sinnlichkeit',246,468),('Hygiene',801,464),('Askese',906,465),('Vertrauen',374,486),('Familie',527,480),('Treue',602,485),
    ('Sauberkeit',683,483),('Sparsamkeit',851,496),('Geselligkeit',310,508),('Geborgenheit',595,522),('Verlässlichkeit',707,509),('Heimat',473,522),
    ('Natur',360,547),('Gesundheit',682,537),('Qualität',762,540),('Nostalgie',453,561),('Sicherheit',558,564),('Tradition',662,559),
]
FIELDS = [('Jagd', 590, 123, 48, 31, 0), ('Raufen', 703, 138, 56, 37, 0), ('Sexualität männlich', 568, 202, 268, 38, -1.5),
          ('Spiel', 191, 255, 52, 40, 0), ('Fürsorge', 378, 525, 62, 42, 0), ('Bindung', 550, 505, 56, 43, 0), ('Sexualität weiblich', 401, 352, 205, 36, -69)]
C = (556, 318)
ENDS = {'stim': (205, 183), 'dom': (920, 183), 'bal': (556, 588)}
POLE = {'stim': 'Stimulanz', 'dom': 'Dominanz', 'bal': 'Balance'}
FARBE = {'stim': '#e8833a', 'dom': '#d6402e', 'bal': '#3c8c43'}

STERNBILD = {'name': 'X-Portal Node001', 'datum': '17.11.2026', 'von': 'Projektleitung',
             'order': ['Gesundheit', 'Sicherheit', 'Effizienz', 'Natur', 'Freiheit']}  # Freiheit ergänzt am 17.11.2026, verbindlich

# Brücke zu Maslow und M02 (Vorschlag KI) und wie die Website es sagt (Stand 17.11.2026).
BRUECKE = {
    'Gesundheit': ('Grundbedürfnisse', 'H05 Waschen und duschen, H07 Essen, H08 Gute Luft; Trinkwasseraufbereitung (D61), Sanitär ab Phase 0 (D62)', '„Gesund essen“: Gemüse aus den Hochbeeten, Trinkwasser aus eigener Aufbereitung'),
    'Sicherheit': ('Sicherheit', 'S04 Privatheit; Versorgung bei Störung (Ast 3): Generator (D59), Wasservorrat 10 Tage (D61), Ofen mit Holzlager (D60), Starlink (D63); Notfallplan', '„Autarke Siedlung“: Kennzahl „Autark“, Szene „Ruhig schlafen“, FAQ zu Stromausfall und Schnee (Vorgabe Projektleitung 17.11.)'),
    'Effizienz': ('Wertschätzung und Leistung', 'D01 Gleichzeitige Nutzung, D03 Licht, D05 Wärme und Luft am Platz; Internet (D63)', '„Moderne Arbeitsplätze“, schnelles Internet, sichere IT-Umgebung nach DSGVO und ISMS (Vorgabe Projektleitung 17.11.)'),
    'Freiheit': ('Selbstverwirklichung', 'Arbeitsort frei wählbar: remote, vor Ort oder beides (Whitepaper 04 „Mitarbeiten ohne Ortsbindung“); frei in Arbeit und Tagesablauf (Spielregeln, D36, D38); kommen und länger bleiben (Rollen am Ort)', 'FAQ „Kann ich bei XPORTAL auch arbeiten, ohne vor Ort zu sein?“, „remote von überall“, „Workation oder länger bleiben“; Whitelist: „von Grund auf, Abschnitt für Abschnitt … gestaltet mit“ (Vorgabe Projektleitung 17.11.)'),
    'Natur': ('Grundbedürfnisse und Erholung', 'M02-23 Gemüsegarten, M02-14 Gemeinsamer Weg, Lage am Hang (1.016–1.077 m)', '„Morgen am Hang“, „Draußen sein“; Titel „Ein Tag in der Natur“'),
}

def _ang(x, y):
    return math.degrees(math.atan2(y - C[1], x - C[0]))
def _norm(a):
    return a % 360
A = {k: _ang(*v) for k, v in ENDS.items()}
def pole(x, y):
    a = _ang(x, y)
    d = lambda k: min(abs(_norm(a) - _norm(A[k])), 360 - abs(_norm(a) - _norm(A[k])))
    return min(['stim', 'dom', 'bal'], key=d)
def feld(x, y):
    a, s, d, b = _norm(_ang(x, y)), _norm(A['stim']), _norm(A['dom']), _norm(A['bal'])
    if s <= a <= d: return 'Abenteuer & Thrill'
    if b < a < s: return 'Fantasie & Genuss'
    return 'Disziplin & Kontrolle'

LAGE = {t: (x, y) for t, x, y in WORDS}

def schwerpunkt():
    z = {}
    for t in STERNBILD['order']:
        k = pole(*LAGE[t]); z[k] = z.get(k, 0) + 1
    return ', '.join(f'{n} × {POLE[k]}' for k, n in sorted(z.items(), key=lambda kv: -kv[1]))

def svg():
    e = _h.escape
    o = ['<svg class="lm-map" viewBox="0 0 1123 651" role="img" aria-label="Limbic Map mit dem Sternbild ' + e(STERNBILD['name']) + ': ' + e(', '.join(STERNBILD['order'])) + '">']
    o.append('<ellipse cx="563" cy="330" rx="522" ry="303" class="lm-ring"/>')
    o += [f'<line x1="{C[0]}" y1="{C[1]}" x2="{x}" y2="{y}" class="lm-y"/>' for x, y in ENDS.values()]
    o += [f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" transform="rotate({r} {x} {y})" class="lm-cl"/>' for _, x, y, rx, ry, r in FIELDS]
    for t, x, y, w in (('Stimulanz', 10, 104, 190), ('Dominanz', 922, 104, 190), ('Balance', 462, 582, 190)):
        k = {'Stimulanz': 'stim', 'Dominanz': 'dom', 'Balance': 'bal'}[t]
        o.append(f'<rect x="{x}" y="{y}" width="{w}" height="58" rx="9" fill="{FARBE[k]}"/><text x="{x + w / 2}" y="{y + 31}" class="lm-badge">{t}</text>')
    for t, x, y, r in (('Abenteuer Thrill', 552, 28, 0), ('Fantasie Genuss', 148, 488, 37), ('Disziplin Kontrolle', 944, 500, -37)):
        o.append(f'<text x="{x}" y="{y}" transform="rotate({r} {x} {y})" class="lm-ringt">{t}</text>')
    gew = STERNBILD['order']
    o += [f'<text x="{x}" y="{y}" class="lm-w">{e(t)}</text>' for t, x, y in WORDS if t not in gew]
    pts = [(LAGE[t][0], LAGE[t][1] - 15) for t in gew]
    o.append('<polyline class="lm-l" points="' + ' '.join(f'{x},{y}' for x, y in pts) + '"/>')
    star = 'M0,-11 C1.5,-2.7 2.7,-1.5 11,0 C2.7,1.5 1.5,2.7 0,11 C-1.5,2.7 -2.7,1.5 -11,0 C-2.7,-1.5 -1.5,-2.7 0,-11 Z'
    for i, t in enumerate(gew, 1):
        x, y = LAGE[t]
        o.append(f'<g transform="translate({x} {y - 15})"><path d="{star}" class="lm-s"/><text x="10" y="-11" class="lm-n">{i}</text></g>')
        o.append(f'<text x="{x}" y="{y + 4}" class="lm-on">{e(t)}</text>')
    o.append('<text x="1112" y="646" class="lm-copy">nach der Limbic Map® · © Gruppe Nymphenburg Consult AG / H.-G. Häusel</text></svg>')
    return ''.join(o)

CSS = """<style>
.dt-limbic { background:var(--surface); border:1px solid var(--line); padding:12px 14px; margin:12px 0 4px }
.dt-limbic h4 { margin:0 0 4px; font-size:14.5px; color:var(--ink) } .dt-limbic > p { margin:0 0 8px; font-size:13px; color:var(--muted) }
.dt-limbic .lm-wrap { overflow-x:auto; border:1px solid var(--line); background:#fff; margin:8px 0 }
.lm-map { display:block; width:100%; min-width:640px; height:auto }
.lm-ring { fill:none; stroke:#cfd5d2; stroke-width:24 } .lm-y { stroke:#cfd5d2; stroke-width:7; stroke-linecap:round } .lm-cl { fill:#e3e8e5 }
.lm-badge { fill:#fff; font-weight:700; font-size:25px; text-anchor:middle; dominant-baseline:middle }
.lm-ringt { fill:#8c9590; font-weight:700; font-size:24px; text-anchor:middle; dominant-baseline:middle }
.lm-w { fill:#a7b0ab; font-size:14px; font-weight:600; text-anchor:middle; dominant-baseline:middle }
.lm-on { fill:#17201b; font-size:19px; font-weight:700; text-anchor:middle; dominant-baseline:middle; paint-order:stroke; stroke:#fff; stroke-width:6px; stroke-linejoin:round }
.lm-l { fill:none; stroke:#c99a12; stroke-width:3; stroke-linejoin:round; stroke-linecap:round }
.lm-s { fill:#c99a12 } .lm-n { fill:#c99a12; font-size:14px; font-weight:700; paint-order:stroke; stroke:#fff; stroke-width:4px; stroke-linejoin:round } .lm-copy { fill:#8c9590; font-size:10px; text-anchor:end }
.dt-limbic .lm-tw { overflow-x:auto }
.dt-limbic table { width:100%; min-width:720px; table-layout:fixed; border-collapse:collapse; font-size:13px; margin:6px 0 }
.dt-limbic col.c1 { width:4% } .dt-limbic col.c2 { width:13% } .dt-limbic col.c3 { width:13% } .dt-limbic col.c4 { width:14% } .dt-limbic col.c5 { width:30% } .dt-limbic col.c6 { width:26% }
.dt-limbic th, .dt-limbic td { overflow-wrap:break-word; hyphens:auto; text-align:left; vertical-align:top; border-top:1px solid var(--line); padding:6px 8px 6px 0 }
.dt-limbic th { font-weight:600; color:var(--muted); white-space:normal; overflow-wrap:normal } .dt-limbic .lm-dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:6px }
</style>"""

def html():
    e = _h.escape
    rows = []
    for i, t in enumerate(STERNBILD['order'], 1):
        x, y = LAGE[t]; k = pole(x, y); m, plan, web = BRUECKE[t]
        rows.append(f'<tr><td>{i}</td><td><b><span class="lm-dot" style="background:{FARBE[k]}"></span>{e(t)}</b></td><td>{POLE[k]} · {feld(x, y)}</td>'
                    f'<td>{e(m)}</td><td>{e(plan)}</td><td>{e(web)}</td></tr>')
    s = STERNBILD
    return (CSS + f'<div class="dt-limbic" id="u-limbic"><h4>Limbic Map für Node001: Sternbild „{s["name"]}“ · verbindlich</h4>'
            f'<p>Auswahl der {s["von"]} vom {s["datum"]} im Artefakt <a href="https://claude.ai/artifact/1eTvbSo16JXhi8rvjU85RF" target="_blank" rel="noreferrer">Limbic Sternbild</a>. '
            f'Schwerpunkt: {schwerpunkt()}. <b>Verbindlich für die Planung (Vorgabe der {s["von"]} vom {s["datum"]}):</b> Kommunikation zu Node001 greift diese {len(s["order"])} Begriffe auf: '
            f'{", ".join(s["order"])}. Stimulanz-Begriffe wie Abenteuer, Neugier oder Ausflug treten zurück; Freiheit steht für freie Wahl von Arbeitsort und Aufenthaltsdauer. '
            'Danach richten sich das Wording der Website (Seite Orte, Node001 auf Startseite und Investorenseite) und die <a href="#b-rollen">Rollen am Ort</a>.</p>'
            f'<div class="lm-wrap">{svg()}</div>'
            '<div class="lm-tw"><table><colgroup><col class="c1"><col class="c2"><col class="c3"><col class="c4"><col class="c5"><col class="c6"></colgroup><thead><tr><th>Nr</th><th>Begriff</th><th>Pol · Feld</th><th>Maslow-Bezug (Vorschlag KI)</th><th>Anforderungen und Entscheidungen im Plan</th><th>So sagt es die Website</th></tr></thead><tbody>'
            + ''.join(rows) + '</tbody></table></div>'
            '<p class="note">Pol und Feld folgen der Lage des Worts auf der Karte, wie im Tool. Die Karte folgt der Limbic Map® von H.-G. Häusel, © Gruppe Nymphenburg Consult AG.</p></div>')

if __name__ == '__main__':
    for t in STERNBILD['order']:
        print(t, POLE[pole(*LAGE[t])], feld(*LAGE[t]))
    print('Schwerpunkt:', schwerpunkt())
