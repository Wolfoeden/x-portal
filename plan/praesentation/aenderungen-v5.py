"""Deck v5 (17.11.2026): Textersetzungen gegenüber v4. Technik der Company im Betrieb und ISMS-App im Pilot; ohne Beträge.
Aufruf (aus plan/praesentation): python3 aenderungen-v5.py
"""
from pptx import Presentation

ERSATZ = {
    5: {'Wiederkehrende Aufgaben als wiederverwendbare Lösungen: zuerst KI, später Robotik, Drohnen, Mechanik.':
            'Wiederverwendbare Lösungen: zuerst KI, später Robotik, Drohnen, Mechanik. Im Pilot: ISMS-App für Zertifizierungen.'},
    8: {'Reference Architecture v0.4 als Arbeitsbaseline': 'Technik im Betrieb: KI, Datenbank, Web, M365, Cardano'},
}

p = Presentation('X-PORTAL_Investor_Deck_2026-11_v4.pptx')
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
p.save('X-PORTAL_Investor_Deck_2026-11_v5.pptx')
print('ok', treffer, 'Ersetzungen')
