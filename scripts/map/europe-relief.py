"""Erzeugt die Geländehöhen zur Punktkarte Europas (lib/map/europe-relief.ts).

Aufruf: python europe-relief.py <Ausgabe.ts>
Quelle: ETOPO1 (NOAA, gemeinfrei) über die öffentliche API von opentopodata.org.
Je Kartenpunkt werden 3 × 3 Höhen in seiner Zelle gelesen. Gespeichert wird eine Mischung aus Mittel und Maximum,
damit Gebirgszüge wie Alpen und Karpaten sichtbar bleiben, auch wenn die Zelle Täler enthält. Meer zählt als 0 m.
"""

import json
import math
import re
import sys
import time
import urllib.request
from pathlib import Path

LON_MIN, LAT_MAX, LAT_MID = -11.0, 71.0, 53.0
STEP = 0.62  # wie in europe-dots.py
API = 'https://api.opentopodata.org/v1/etopo1?locations='


def cells():
    src = (Path(__file__).resolve().parents[2] / 'lib/map/europe.ts').read_text(encoding='utf-8')
    dots = re.search(r"EUROPE_DOTS = '([^']+)'", src).group(1)
    k = math.cos(math.radians(LAT_MID))
    scale = 1000 / ((42.0 - LON_MIN) * k)
    size = scale * STEP * 0.42
    for x, y in re.findall(r'M(-?[\d.]+) (-?[\d.]+)h', dots):
        cx, cy = float(x) + size / 2, float(y) + size / 2
        yield cx, cy, cx / (k * scale) + LON_MIN, LAT_MAX - cy / scale


def main(out):
    k = math.cos(math.radians(LAT_MID))
    points = list(cells())
    samples = [(i, lat + a * STEP, lon + b * STEP / k) for i, (_, _, lon, lat) in enumerate(points) for a in (-1 / 3, 0, 1 / 3) for b in (-1 / 3, 0, 1 / 3)]
    heights = {}
    for start in range(0, len(samples), 100):
        chunk = samples[start:start + 100]
        query = '|'.join(f'{lat:.4f},{lon:.4f}' for _, lat, lon in chunk)
        for _ in range(5):
            try:
                data = json.load(urllib.request.urlopen(API + query, timeout=60))
                if data.get('status') == 'OK':
                    break
            except OSError:
                pass
            time.sleep(3)
        for (i, _, _), result in zip(chunk, data['results']):
            heights.setdefault(i, []).append(max(0.0, result['elevation'] or 0.0))
        time.sleep(1.1)  # öffentliche API: höchstens eine Anfrage je Sekunde

    rows = []
    for i, (cx, cy, _, _) in enumerate(points):
        values = heights[i]
        mixed = 0.5 * sum(values) / len(values) + 0.5 * max(values)
        rows.append(f'{cx:.1f},{cy:.1f},{round(mixed)}')
    ts = (
        '// Erzeugt aus ETOPO1 (NOAA, gemeinfrei) mit scripts/map/europe-relief.py. Nicht von Hand ändern.\n'
        '// Je Punkt der Karte: Mitte x, Mitte y (Einheiten von EUROPE_VIEWBOX) und Geländehöhe in Metern.\n'
        f"export const EUROPE_RELIEF = '{';'.join(rows)}'\n"
    )
    Path(out).write_text(ts, encoding='utf-8')


if __name__ == '__main__':
    main(sys.argv[1])
