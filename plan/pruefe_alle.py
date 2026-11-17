"""Prüft den fertigen Text aller Seiten auf alten Stand (Vorgabe vom 17.11.2026).

Aufruf: python3 plan/pruefe_alle.py [Datei …]   ohne Datei: alle bekannten Seiten.
Ausgenommen sind Kommentare und Antworten im Wortlaut (dt „Kommentar …“, „Antwort …“),
Elemente mit class="bisher" oder class="zitat" und die Abschnitte „Bisher:“ auf der Entscheidungsseite.
Bricht mit Exit-Code 1 ab, wenn etwas gefunden wird.
"""
import html
import re
import sys
from pathlib import Path

PLAN = Path(__file__).resolve().parent
SEITEN = {
    'Index 3.0': PLAN / 'index-3' / 'index-3.body.html',
    'Vor dem Investment': PLAN / 'kosten' / 'vor-dem-investment.body.html',
    'Entscheidungsseite': PLAN / 'entscheidungen' / 'entscheidungsseite.html',
    'Whitepaper': PLAN / 'whitepaper' / 'x-portal-whitepaper.body.html',
    'SGMM': PLAN / 'sgmm' / 'sgmm.body.html',
    'Anschaffungen': PLAN / 'anschaffungen' / 'anschaffungen.body.html',
}

# alter Stand: Wort -> Grund
ALT = {
    r'Käufer': 'kein Verkauf, nur Mieter (D45, D46, D48; Kommentar 17.11.)',
    r'\bPlots?\b': 'kein Verkauf von Plots (D45)',
    r'Papierrechnung': 'Business Case ist Whitelist, Chargen, Mieterlöse (Kommentar 17.11.)',
    r'Verkauf ab Januar|Verkaufsstart': 'kein Verkauf (D45, D50)',
    r'Pre-Seed': 'Kapital nach D46, D47',
    r'Tiny House': 'Wohneinheit statt Tiny House (Kommentar 17.11.)',
    r'\bObjekte?n?\b|\bObjekts\b|[Aa]rbeitsobjekt|Übergangsobjekt': 'Begriff ist Wohneinheit (Kommentar SGMM 17.11.2026)',
    r'Mission[^.;]{0,40}(offen|harmonisier)|Ob eine Mission bleibt': 'Mission steht im Index (Kommentar SGMM 17.11.2026)',
    r'zweiter Anschluss nach dem Vergleich': 'Starlink als Reserve, lokaler Anbieter (Kommentar Index 17.11.2026)',
    r'\bPaul\b|\bRoman\b|\bNazar\b': 'Rollen statt Namen',
    r'Fachperson': 'Fachexperte',
    r'Lage von Phase 0 im Detailplan|Wo im Detailplan steht (das Objekt|die Wohneinheit) Phase 0': 'Lage steht voraussichtlich fest (Antwort 17.11.2026, markierter Bereich)',
    r'Grundwasser ist Trinkwasser|direkt trinkbar|ohne Aufbereitung trinkbar': 'Rohwasser ohne Trinkwasserqualität, Trinkwasseraufbereitung nötig (D61, 17.11.2026)',
    r'(?<![Kk]eine )E-Bike(?:s|-Unterstand)?[^.;()]{0,40}Phase 0': 'keine E-Bikes in Phase 0 (D65)',
    r'Geologie[^.;]{0,60}nicht geprüft': 'Fachprüfung liegt vor (15.11.2026)',
    r'Warteliste für Node001': 'Whitelist noch nicht vorhanden (Kommentar 12.11.)',
    r'A00[123] (Fachprüfung|Zusatzerkundung|Vermessung)|läuft Fachprüfung|KI-Zusammenfassung, nicht geprüft|nicht geprüft und nicht freigegeben|wird mit dem Original abgeglichen|mit dem Original abzugleichen': 'Fachprüfung, Zusatzerkundung, Vermessung liegen vor (Kommentar 15.11.), kein offener Posten',
}

# Vom Nutzer so gewählt (14.11.2026: im Team-Abschnitt von Whitepaper und Deck Namen plus Berater getrennt)
ERLAUBT = [r'Roman Dering', r'Pavel J\.']

def text(s):
    for x in ERLAUBT:
        s = re.sub(x, ' ', s)
    s = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', s, flags=re.S)
    s = re.sub(r'<div><dt>(Kommentar|Antwort)[^<]*</dt><dd>.*?</dd></div>', ' ', s, flags=re.S)
    s = re.sub(r'<(td|dd|p|span|div|li|blockquote|details)[^>]*class="[^"]*\b(bisher|zitat)\b[^"]*"[^>]*>.*?</\1>', ' ', s, flags=re.S)
    # Entscheidungsseite: Historie und, bei beantworteten Karten, Frage und Möglichkeiten vom 13.11. im Wortlaut
    s = re.sub(r'<details class="fr">.*?</details>', ' ', s, flags=re.S)
    s = re.sub(r'<article class="dec".*?</article>', lambda m: re.sub(r'<p class="why">.*?</p>|<ol class="opts">.*?</ol>|<blockquote>.*?</blockquote>', ' ', m.group(0), flags=re.S) if 'class="st13"' in m.group(0) else m.group(0), s, flags=re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))

def pruefe(name, path):
    if not path.exists():
        return [f'{name}: Datei fehlt ({path})']
    return pruefe_text(name, path.read_text())

def pruefe_text(name, s):
    t = text(s)
    out = []
    for w, grund in ALT.items():
        for m in re.finditer(w, t):
            out.append(f'{name}: „{m.group(0)}“ ({grund}) … {t[max(0, m.start() - 60):m.end() + 40].strip()} …')
    return out

# Website (Wunsch vom 17.11.2026: Investoren und Orte nach dem Plan). Geprüft werden nur die Texte in Anführungszeichen,
# nicht Kommentare und Schlüssel. Namen sind auf der Website erlaubt (Zitat auf der Seite Orte, Team).
WEBSITE = {'Website de': PLAN.parent / 'lib' / 'i18n' / 'de.ts', 'Website en': PLAN.parent / 'lib' / 'i18n' / 'en.ts'}
ALT_WEB = {
    r'\b[Kk]auf(en|s|t|e)?\b|\bKäufer|\b[Vv]erkauf(t|en)?\b(?! wird nichts)(?!smodell ist abgewählt)': 'nur Miete, kein Verkauf (D45, D48; Kommentar 17.11.)',
    r'Tiny House|\bObjekte?\b|\bModule?\b|Wohnmodul': 'Begriff ist Wohneinheit (Kommentar 17.11.)',
    r'Pre-Seed|Käuferzahlung': 'Kapital nach D46, D47',
    r'zehn Nodes|01 von 10|01 → 10|Ziel zehn': '„zehn Nodes“ gestrichen (Abgleich W10)',
    r'Grenze zu Ungarn': 'Ort: Karpaten, Westukraine (Antwort 17.11.)',
    r'Restaurant|\bBar\b': 'Gastronomie später (D34)',
    r'Batterie': 'Strom nach D59',
    r'1\.010|1\.075|1,010|1,075': 'Höhe 1.016–1.077 m (Geologiebericht)',
    r'Gemeinschaftshaus': 'Kommunalgebäude (D64)',
    r'\b[Bb]uy(ing|er)?\b|\b[Pp]urchase|[Tt]iny house|[Pp]re-seed|ten nodes|Hungarian border|border with Hungary|\b[Rr]estaurant|\b[Ff]or sale\b(?<!nothing for sale)|living modules?|\bmodules?\b': 'englisch: nur Miete, Begriffe nach Plan',
}
# Ausnahmen: verneinte Aussagen, die genau das Richtige sagen.
OK_WEB = [r'Verkauft wird nichts', r'verkaufen keine', r'[Kk]ein Verkauf', r'verkaufen sie nicht', r'do not sell them', r'Kann ich auch kaufen\?', r'Nothing is sold', r'nothing is sold', r'do not sell', r'Can I also buy\?', r'nothing for sale', r'Lösungen mehrfach verkaufen', r'Sell or run solutions']

def pruefe_website(name, path):
    s = path.read_text()
    s = re.sub(r'^\s*//.*$', ' ', s, flags=re.M)
    texte = ' | '.join(m.group(1) for m in re.finditer(r"'((?:[^'\\]|\\.)*)'", s))
    for x in OK_WEB:
        texte = re.sub(x, ' ', texte)
    out = []
    for w, grund in ALT_WEB.items():
        for m in re.finditer(w, texte):
            out.append(f'{name}: „{m.group(0)}“ ({grund}) … {texte[max(0, m.start() - 60):m.end() + 40].strip()} …')
    return out

def main(args):
    ziele = {Path(a).name: Path(a) for a in args} if args else SEITEN
    fehler = [f for n, p in ziele.items() for f in pruefe(n, p)]
    if not args:
        fehler += [f for n, p in WEBSITE.items() if p.exists() for f in pruefe_website(n, p)]
    for f in fehler:
        print(f)
    print(f'{len(fehler)} Stellen mit altem Stand' if fehler else 'keine Stellen mit altem Stand')
    return 1 if fehler else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
