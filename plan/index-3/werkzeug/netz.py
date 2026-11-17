"""Ablauf als Netz für das Cockpit im Index 3.0 (Stand 17.11.2026).

Jeder Knoten: id, Abschnitt (A–H), Art, Bahn (Rolle), Vorgänger, Dauer in Tagen mit Quelle oder None (= offen), Kurztitel.
Dauern werden nicht erfunden: Ohne Quelle steht None; das Team trägt Dauern und Ergebnisse im Cockpit ein.
Die Bestellkette (K-…) rechnet mit der Lieferzeit des gewählten Angebots und den Werten für Zoll, Transport und Puffer.
"""
import html, json

BAHNEN = [('GF', 'Geschäftsführung'), ('PL', 'Projektleitung'), ('FX', 'Fachexperten'), ('KI', 'KI'), ('TE', 'Team vor Ort'), ('EX', 'Extern: Anbieter, Labor, Behörden, Spedition')]
ABSCHNITTE = [('A', 'Vor dem Investment'), ('B', 'Kapital'), ('C', 'Beschaffung und Transport'), ('D', 'Bau Phase 0'), ('E', 'Abnahme und Einzug'),
              ('F', 'Erster Winter'), ('G', 'Phase 1'), ('H', 'Phase 2 und Ende')]
ARTEN = {'aufgabe': 'Aufgabe', 'entscheidung': 'Entscheidung', 'gate': 'Gate', 'bestellung': 'Bestellung', 'lieferung': 'Lieferung', 'ereignis': 'Ereignis', 'ende': 'Ende'}
GATE0 = (0, 'Gate: Beschluss, keine eigene Dauer')
EVENT0 = (0, 'Ereignis, keine eigene Dauer')

# (id, Abschnitt, Art, Bahn, Vorgänger, Dauer, Kurztitel)
NETZ = [
 ('O01', 'A', 'ereignis', 'EX', [], EVENT0, 'Geologiebericht liegt vor'),
 ('lage', 'A', 'entscheidung', 'GF', ['O01'], None, 'Lage Phase 0 festlegen'),
 ('AP-A0', 'A', 'aufgabe', 'PL', [], None, 'Strecke messen MP01–MP08'),
 ('AP-A1', 'A', 'aufgabe', 'GF', [], None, 'Nachweise in den Plan legen'),
 ('AP-A2', 'A', 'aufgabe', 'PL', [], None, 'Rohwasseranalyse im Labor'),
 ('AP-A3', 'A', 'aufgabe', 'PL', [], None, 'Netzanschluss anfragen'),
 ('AP-A8', 'A', 'aufgabe', 'PL', [], None, 'Whitelist einrichten'),
 ('mieter', 'A', 'aufgabe', 'PL', ['AP-A8'], None, 'Mietinteressenten gewinnen'),
 ('AP-A6', 'A', 'aufgabe', 'GF', [], None, 'Token: Rechtsprüfung'),
 ('AP-A4', 'A', 'aufgabe', 'FX', ['lage', 'AP-A0', 'AP-A1'], None, 'Bauplanung mit Bau-KI'),
 ('hausart', 'A', 'entscheidung', 'GF', ['AP-A4'], None, 'Bauart der Objekte'),
 ('AP-A5', 'A', 'aufgabe', 'PL', ['AP-A4', 'hausart'], None, 'Angebote große Posten'),
 ('O03', 'A', 'aufgabe', 'KI', ['AP-A5'], None, 'Selbstkosten je Objekt'),
 ('AP-A9', 'A', 'aufgabe', 'KI', ['AP-A5'], None, 'Zahlen neu rechnen (D53)'),
 ('AP-A7', 'A', 'aufgabe', 'KI', ['O03', 'AP-A9', 'AP-A6'], None, 'Investorenunterlagen'),
 ('G0', 'B', 'gate', 'GF', ['O03', 'AP-A8'], GATE0, 'G0 Können wir vermieten?'),
 ('AP-B1', 'B', 'aufgabe', 'GF', ['AP-A7', 'G0'], None, 'Investorengespräche'),
 ('O23', 'B', 'entscheidung', 'GF', ['AP-B1'], None, 'Steigen Investoren ein?'),
 ('AP-B2', 'B', 'aufgabe', 'GF', ['AP-A6'], None, 'Token-Crowdfunding vorbereiten'),
 ('AP-C1', 'C', 'aufgabe', 'PL', ['AP-A0', 'AP-A4'], None, 'Anbieter vergleichen (HU, PL, Alibaba)'),
 ('lieferant', 'C', 'entscheidung', 'GF', ['AP-C1'], None, 'Angebot wählen'),
 ('AP-C2', 'C', 'aufgabe', 'PL', ['lieferant'], None, 'Importeur und Verzollung klären'),
 ('AP-C3', 'C', 'aufgabe', 'PL', ['lieferant', 'AP-A0'], None, 'Spedition und Umschlagplatz'),
 ('AP-C5', 'C', 'aufgabe', 'GF', ['lieferant', 'AP-A0'], None, 'Charge 1 festlegen'),
 ('AP-C6', 'C', 'aufgabe', 'GF', ['AP-A0'], None, 'Geländefahrzeug beschaffen'),
 ('AP-C4', 'C', 'aufgabe', 'KI', ['lieferant'], None, 'Bestellzeitpunkte rechnen'),
 ('G1', 'C', 'gate', 'GF', ['O23', 'AP-C5'], GATE0, 'G1 Geld für Charge 1 da?'),
 ('K-BESTELLEN', 'C', 'bestellung', 'GF', ['G1', 'AP-C2', 'AP-C3', 'AP-C4'], EVENT0, 'Objekte bestellen'),
 ('K-LIEFERUNG', 'C', 'lieferung', 'EX', ['K-BESTELLEN'], 'lieferzeit', 'Lieferzeit Anbieter'),
 ('K-ZOLL', 'C', 'aufgabe', 'EX', ['K-LIEFERUNG'], 'zoll', 'Verzollung'),
 ('K-TRANSPORT', 'C', 'aufgabe', 'EX', ['K-ZOLL'], 'transport', 'Transport, Umschlag, Puffer'),
 ('zufahrt', 'C', 'ereignis', 'PL', [], EVENT0, 'Zufahrt Phase 0 entschieden'),
 ('AP-D1', 'D', 'aufgabe', 'TE', ['lage'], None, 'Fällen, roden, Holz einlagern'),
 ('AP-D2', 'D', 'aufgabe', 'FX', ['AP-A4', 'AP-D1'], None, 'Entwässerung und Stütze'),
 ('AP-D3', 'D', 'aufgabe', 'FX', ['AP-D2'], None, 'Fundament'),
 ('AP-D4', 'D', 'aufgabe', 'FX', ['AP-D3', 'AP-A2', 'AP-A3'], None, 'Leitungen und Kläranlage'),
 ('frost', 'D', 'ereignis', 'EX', [], EVENT0, 'Boden frostfrei'),
 ('technik', 'D', 'entscheidung', 'GF', ['hausart'], None, 'Technik im Objekt'),
 ('AP-D5', 'D', 'aufgabe', 'PL', ['technik'], None, 'Zugang über Cardano'),
 ('K-MONTAGE', 'D', 'ereignis', 'TE', ['K-TRANSPORT', 'AP-D3', 'frost'], EVENT0, 'Montagebeginn'),
 ('AP-E1', 'E', 'aufgabe', 'FX', ['K-MONTAGE', 'AP-D4', 'AP-D5'], None, 'Abnahmetabelle'),
 ('G2', 'E', 'gate', 'PL', ['AP-E1'], GATE0, 'G2 Darf eingezogen werden?'),
 ('AP-E2', 'E', 'aufgabe', 'GF', ['G2', 'AP-A8'], None, 'Mietvertrag und Einzug'),
 ('G3', 'F', 'gate', 'GF', ['G2'], GATE0, 'G3 Hält es im Winter?'),
 ('AP-F1', 'F', 'aufgabe', 'TE', ['G2'], None, 'Messreihen'),
 ('AP-F2', 'F', 'aufgabe', 'PL', ['G2'], None, 'Kamera-KI Normalzustand'),
 ('AP-F3', 'F', 'aufgabe', 'KI', ['AP-E2'], None, 'Mieterlöse berichten'),
 ('AP-F4', 'F', 'aufgabe', 'TE', ['G2', 'AP-D5'], None, 'Gemeinschaftsarbeit, Anreize'),
 ('G4', 'F', 'gate', 'GF', ['G3', 'AP-F1', 'AP-F3'], GATE0, 'G4 Geld verdient oben?'),
 ('ende', 'F', 'ende', 'GF', ['G4'], EVENT0, 'Stufe 1 erreicht'),
 ('AP-G2', 'G', 'aufgabe', 'FX', ['G4'], None, 'Kommunalgebäude'),
 ('AP-G3', 'G', 'aufgabe', 'GF', ['AP-F3'], None, 'Nachbestellen nach Whitelist'),
 ('AP-G4', 'G', 'aufgabe', 'FX', ['G4'], None, 'Solar mit Speicher'),
 ('AP-G5', 'G', 'aufgabe', 'TE', ['AP-G2'], None, 'Bergkapelle (Gruppenprojekt)'),
 ('AP-H1', 'H', 'aufgabe', 'GF', ['AP-G2', 'AP-G3'], None, 'Ausbau nach Nachfrage'),
 ('AP-H2', 'H', 'aufgabe', 'KI', ['G4'], None, 'Hypothesen bewerten'),
 ('AP-H3', 'H', 'aufgabe', 'KI', ['AP-H2'], None, 'Übergabe an nächsten Node'),
]
NEUE_KNOTEN = {'K-BESTELLEN', 'K-LIEFERUNG', 'K-ZOLL', 'K-TRANSPORT', 'K-MONTAGE'}
PARAM = {'lieferzeit': 'Lieferzeit aus dem gewählten Angebot (AP-C1)', 'zoll': 'Tage für Verzollung (Wert im Cockpit)', 'transport': 'Tage für Transport, Umschlag und Puffer (Werte im Cockpit)'}

def pruefe(baum_ids, ap_ids):
    ids = [n[0] for n in NETZ]
    fehler = [f'Netz: doppelt {i}' for i in set(ids) if ids.count(i) > 1]
    s = set(ids)
    for i, ab, art, bahn, nach, dauer, titel in NETZ:
        for v in nach:
            if v not in s: fehler.append(f'Netz: {i} hat unbekannten Vorgänger {v}')
        if i not in baum_ids and i not in NEUE_KNOTEN: fehler.append(f'Netz: {i} fehlt im Baum')
        if ab not in dict(ABSCHNITTE) or bahn not in dict(BAHNEN) or art not in ARTEN: fehler.append(f'Netz: {i} hat ungültige Angaben')
        if dauer is not None and not isinstance(dauer, str) and not (isinstance(dauer, tuple) and dauer[1]): fehler.append(f'Netz: {i} Dauer ohne Quelle')
        if isinstance(dauer, str) and dauer not in PARAM: fehler.append(f'Netz: {i} unbekannter Parameter {dauer}')
    fehler += [f'Netz: Arbeitspaket {a} fehlt im Netz' for a in ap_ids if a not in s]
    # keine Kreise
    nach = {n[0]: n[4] for n in NETZ}; zustand = {}
    def besuch(i, pfad):
        if zustand.get(i) == 1: fehler.append('Netz: Kreis ' + ' → '.join(pfad + [i])); return
        if zustand.get(i) == 2: return
        zustand[i] = 1
        for v in nach.get(i, []): besuch(v, pfad + [i])
        zustand[i] = 2
    for i in nach: besuch(i, [])
    return fehler

def topo():
    nach = {n[0]: n[4] for n in NETZ}; out, seen = [], set()
    def v(i):
        if i in seen: return
        seen.add(i)
        for p in nach[i]: v(p)
        out.append(i)
    for n in NETZ: v(n[0])
    return out

def daten(titel_baum, status_baum):
    knoten = []
    for i, ab, art, bahn, nach, dauer, titel in NETZ:
        d = dict(id=i, ab=ab, art=art, bahn=bahn, nach=nach, titel=titel, lang=titel_baum.get(i, titel), baum=('b-' + i) if i in titel_baum else None,
                 erledigt_im_plan=status_baum.get(i) == 'done')
        if isinstance(dauer, tuple): d['dauer'], d['quelle'] = dauer
        elif isinstance(dauer, str): d['param'] = dauer; d['quelle'] = PARAM[dauer]
        else: d['dauer'], d['quelle'] = None, None
        knoten.append(d)
    return dict(stand='2026-11-17', bahnen=BAHNEN, abschnitte=ABSCHNITTE, arten=ARTEN, knoten=knoten, reihenfolge=topo())

# ---------- BPMN-Ansicht als SVG ----------
W, H, GAP, LANEH, HEAD, LABW = 132, 46, 18, 78, 34, 120

def layout():
    reihen = topo(); pos = {}; x = LABW + 10; spalten = {}
    for ab, _ in ABSCHNITTE:
        teil = [i for i in reihen if dict((n[0], n[1]) for n in NETZ)[i] == ab]
        # Stufen innerhalb des Abschnitts: Tiefe nach Vorgängern im selben Abschnitt
        tiefe = {}
        nach = {n[0]: n[4] for n in NETZ}
        for i in teil:
            tiefe[i] = 1 + max([tiefe[p] for p in nach[i] if p in tiefe] or [-1])
        stufen = max(tiefe.values()) + 1 if tiefe else 1
        belegt = {}
        x0 = x
        for i in teil:
            bahn = dict((n[0], n[3]) for n in NETZ)[i]; t = tiefe[i]
            while (bahn, t) in belegt: t += 1
            belegt[(bahn, t)] = i; stufen = max(stufen, t + 1)
            pos[i] = (x0 + t * (W + GAP), HEAD + [b for b, _ in BAHNEN].index(bahn) * LANEH + (LANEH - H) // 2)
        spalten[ab] = (x0, x0 + stufen * (W + GAP))
        x = x0 + stufen * (W + GAP) + 14
    return pos, spalten, x

def svg():
    pos, spalten, breite = layout(); hoehe = HEAD + len(BAHNEN) * LANEH + 4
    art = {n[0]: n[2] for n in NETZ}; titel = {n[0]: n[6] for n in NETZ}
    o = [f'<svg class="bp" viewBox="0 0 {breite} {hoehe}" width="{breite}" height="{hoehe}" role="img" aria-label="Ablauf als BPMN-Diagramm mit Bahnen je Rolle und Abschnitten A bis H">',
         '<defs><marker id="bp-pf" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 8 4 0 8z" class="bp-pfs"/></marker></defs>']
    for k, (b, name) in enumerate(BAHNEN):
        y = HEAD + k * LANEH
        o.append(f'<rect x="0" y="{y}" width="{breite}" height="{LANEH}" class="bp-lane{k % 2}"/><text x="8" y="{y + LANEH / 2 + 4}" class="bp-lanet">{html.escape(name if len(name) < 18 else name.split(":")[0])}</text>')
    for ab, name in ABSCHNITTE:
        x0, x1 = spalten[ab]
        o.append(f'<line x1="{x0 - 8}" y1="0" x2="{x0 - 8}" y2="{hoehe}" class="bp-sep"/><text x="{x0}" y="22" class="bp-abt">{ab} · {html.escape(name)}</text>')
    for i, ab, a, bahn, nach, dauer, t in NETZ:
        x2, y2 = pos[i]
        for v in nach:
            x1, y1 = pos[v]
            xs, ys, xe, ye = x1 + W, y1 + H / 2, x2, y2 + H / 2
            if xe <= xs:  # rückwärts innerhalb einer Spalte: unten herum
                o.append(f'<path d="M{xs} {ys} h8 V{max(ys, ye) + H / 2 + 6} H{xe - 8} V{ye} H{xe}" class="bp-e" data-von="{v}" data-zu="{i}" marker-end="url(#bp-pf)"/>')
            else:
                mx = xe - 10
                o.append(f'<path d="M{xs} {ys} H{mx} V{ye} H{xe}" class="bp-e" data-von="{v}" data-zu="{i}" marker-end="url(#bp-pf)"/>')
    for i, ab, a, bahn, nach, dauer, t in NETZ:
        x, y = pos[i]; cx, cy = x + W / 2, y + H / 2
        if a in ('gate', 'entscheidung'):
            shape = f'<polygon points="{cx},{y - 4} {x + W},{cy} {cx},{y + H + 4} {x},{cy}" class="bp-s"/>'
        elif a in ('ereignis', 'ende'):
            shape = f'<rect x="{x}" y="{y}" width="{W}" height="{H}" rx="{H / 2}" class="bp-s"/>' + (f'<rect x="{x + 3}" y="{y + 3}" width="{W - 6}" height="{H - 6}" rx="{H / 2 - 3}" class="bp-s2"/>' if a == 'ende' else '')
        else:
            shape = f'<rect x="{x}" y="{y}" width="{W}" height="{H}" rx="6" class="bp-s"/>'
        if a == 'bestellung':
            shape += f'<path d="M{x + 6} {y + 6} h12 v9 h-12z M{x + 6} {y + 9} h12" class="bp-ic"/>'
        woerter = t.split(); z1, z2 = '', ''
        for w in woerter:
            if len(z1 + ' ' + w) <= 20 and not z2: z1 = (z1 + ' ' + w).strip()
            else: z2 = (z2 + ' ' + w).strip()
        if len(z2) > 21: z2 = z2[:20] + '…'
        txt = f'<text x="{cx}" y="{cy - (2 if z2 else -4)}" class="bp-t">{html.escape(z1)}</text>' + (f'<text x="{cx}" y="{cy + 11}" class="bp-t">{html.escape(z2)}</text>' if z2 else '')
        o.append(f'<g class="bp-n" id="bp-{i}" data-id="{i}" tabindex="0" role="button" aria-label="{html.escape(i + ": " + t)}"><title>{html.escape(i + " · " + t)}</title>{shape}{txt}</g>')
    o.append('</svg>')
    return ''.join(o)
