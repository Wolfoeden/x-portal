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
    r'Tiny House': 'Objekt statt Tiny House',
    r'\bPaul\b|\bRoman\b|\bNazar\b': 'Rollen statt Namen',
    r'Fachperson': 'Fachexperte',
    r'Lage von Phase 0 im Detailplan|Wo im Detailplan steht das Objekt Phase 0': 'Lage steht voraussichtlich fest (Antwort 17.11.2026, markierter Bereich)',
    r'Grundwasser ist Trinkwasser|direkt trinkbar|ohne Aufbereitung trinkbar': 'Rohwasser ohne Trinkwasserqualität, Trinkwasseraufbereitung nötig (D61, 17.11.2026)',
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

def main(args):
    ziele = {Path(a).name: Path(a) for a in args} if args else SEITEN
    fehler = [f for n, p in ziele.items() for f in pruefe(n, p)]
    for f in fehler:
        print(f)
    print(f'{len(fehler)} Stellen mit altem Stand' if fehler else 'keine Stellen mit altem Stand')
    return 1 if fehler else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
