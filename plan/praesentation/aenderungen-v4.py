"""Deck v4 (17.11.2026): Textersetzungen gegenüber v3 nach den Kommentaren vom 12., 15. und 17.11.2026.
Aufruf (aus plan/praesentation): python3 aenderungen-v4.py
"""
from pptx import Presentation

ERSATZ = {
    8: {'Warteliste für Node001': 'Grundstück im Besitz, mit Detailplan und Bebauungsplan',
        'Grundstück für Node001 gesichert': 'Geologiebericht mit Fachprüfung, Zusatzerkundung, Vermessung',
        'Geologischer Bericht und Reference Architecture v0.4': 'Reference Architecture v0.4 als Arbeitsbaseline',
        'Fachprüfung des Geologieberichts und Lageplan': 'Bauplanung für Phase 0, Whitelist künftiger Mieter'},
    13: {'Boden': 'Transport',
         'Fachprüfung der Geologie, Zusatzerkundung, Vermessung': 'Enge, einspurige Zufahrt vermessen; Objekte in Teilen',
         'Mietinteressenten und bezahlte Kundenprojekte': 'Whitelist künftiger Mieter, bezahlte Kundenprojekte',
         'Dazu Vorarbeit am Grundstück in Eigenleistung · Kapital danach für Infrastruktur und Objekte':
             'Geologie geprüft · danach Bau in Chargen, nachbestellt nach Whitelist · Mieterlöse als Nachweis'},
    14: {'Finanzierungslogik: Eigenkapital bis zur fertigen Bauplanung, danach Investoren für Infrastruktur und Objekte.':
             'Finanzierungslogik: so viel Eigenkapital wie möglich, dann Investoren für Infrastruktur und weitere Chargen.'},
}

p = Presentation('X-PORTAL_Investor_Deck_2026-11_v3.pptx')
treffer = 0
for nr, m in ERSATZ.items():
    for sh in p.slides[nr - 1].shapes:
        if not sh.has_text_frame:
            continue
        for para in sh.text_frame.paragraphs:
            if para.text in m and para.runs:
                para.runs[0].text = m[para.text]
                for r in para.runs[1:]:
                    r.text = ''
                treffer += 1
assert treffer == sum(len(m) for m in ERSATZ.values()), treffer
p.save('X-PORTAL_Investor_Deck_2026-11_v4.pptx')
print('ok', treffer, 'Ersetzungen')
