"""Deck v6 (17.11.2026): Begriff „Wohneinheit“ statt „Objekt“ (Kommentar auf der SGMM-Seite vom 17.11.2026: „wir nennen es WOHNEINHEITEN“).
Aufruf (aus plan/praesentation): python3 aenderungen-v6.py
"""
from pptx import Presentation

ERSATZ = {
    7: {'Bauphasen: ein Übergangsobjekt zuerst, danach Objekte': 'Bauphasen: eine Wohneinheit zuerst, dann weitere',
        'Objekt als Übergang': 'Wohneinheit als Übergang',
        'Objekte & Kommunalgebäude': 'Wohneinheiten & Kommunalgebäude',
        'Zuerst das Kommunalgebäude, dann Wohn- und Arbeitsobjekte für Mieter und Team.': 'Zuerst das Kommunalgebäude, dann Wohneinheiten mit Arbeitsplatz für Mieter und Team, zur Miete.',
        'Weitere Objekte, bis das Grundstück genutzt ist. Die Fläche für das Hauptgebäude wird zuletzt bebaut.': 'Weitere Wohneinheiten, bis das Grundstück genutzt ist. Die Fläche für das Hauptgebäude wird zuletzt bebaut.'},
    8: {'Baukosten, Selbstkosten je Objekt, Struktur der Node-Gesellschaft': 'Baukosten, Selbstkosten je Wohneinheit, Struktur der Node-Gesellschaft'},
    13: {'Enge, einspurige Zufahrt vermessen; Objekte in Teilen': 'Enge, einspurige Zufahrt vermessen; Wohneinheiten in Teilen'},
}

p = Presentation('X-PORTAL_Investor_Deck_2026-11_v5.pptx')
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
rest = [(n, pa.text) for n, s in enumerate(p.slides, 1) for sh in s.shapes if sh.has_text_frame for pa in sh.text_frame.paragraphs if 'objekt' in pa.text.lower()]
assert not rest, rest
p.save('X-PORTAL_Investor_Deck_2026-11_v6.pptx')
print('ok', treffer, 'Ersetzungen')
