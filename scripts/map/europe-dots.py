"""Erzeugt die Punktkarte Europas aus Natural Earth (gemeinfrei).

Aufruf: python europe-dots.py <ne_50m_land.geojson> <Ausgabe.ts>
Ergebnis: Rasterpunkte über Land, als kompakter SVG-Pfad, dazu die Projektion für Markierungen.
"""

import json
import math
import sys

LON_MIN, LON_MAX = -11.0, 42.0
LAT_MIN, LAT_MAX = 35.0, 71.0
STEP = 0.62  # Grad zwischen zwei Punkten in Nord-Süd-Richtung
WIDTH = 1000.0


def project(lon, lat):
    # Einfache, ruhige Projektion: Länge mit dem Kosinus der Kartenmitte gestaucht.
    k = math.cos(math.radians((LAT_MIN + LAT_MAX) / 2))
    x = (lon - LON_MIN) * k
    y = (LAT_MAX - lat)
    scale = WIDTH / ((LON_MAX - LON_MIN) * k)
    return x * scale, y * scale


def inside(lon, lat, ring):
    hit = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            hit = not hit
        j = i
    return hit


def main(src, out):
    data = json.load(open(src, encoding='utf-8'))
    polygons = []
    for feature in data['features']:
        geom = feature['geometry']
        parts = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
        for poly in parts:
            outer = poly[0]
            xs = [p[0] for p in outer]
            ys = [p[1] for p in outer]
            if max(xs) < LON_MIN or min(xs) > LON_MAX or max(ys) < LAT_MIN or min(ys) > LAT_MAX:
                continue
            polygons.append((min(xs), min(ys), max(xs), max(ys), poly))

    k = math.cos(math.radians((LAT_MIN + LAT_MAX) / 2))
    lon_step = STEP / k
    dots = []
    lat = LAT_MAX
    while lat >= LAT_MIN:
        lon = LON_MIN
        while lon <= LON_MAX:
            for x0, y0, x1, y1, poly in polygons:
                if x0 <= lon <= x1 and y0 <= lat <= y1 and inside(lon, lat, poly[0]) and not any(inside(lon, lat, hole) for hole in poly[1:]):
                    dots.append(project(lon, lat))
                    break
            lon += lon_step
        lat -= STEP

    size = WIDTH / ((LON_MAX - LON_MIN) * k) * STEP * 0.42
    d = ''.join(f'M{x - size / 2:.1f} {y - size / 2:.1f}h{size:.1f}v{size:.1f}h-{size:.1f}z' for x, y in dots)
    height = project(LON_MIN, LAT_MIN)[1]
    ts = (
        '// Erzeugt aus Natural Earth 1:50m (gemeinfrei) mit scripts/map/europe-dots.py. Nicht von Hand ändern.\n'
        f'export const EUROPE_VIEWBOX = \'0 0 {WIDTH:.0f} {height:.0f}\'\n'
        f'export const EUROPE_DOTS = \'{d}\'\n'
        f'export const MAP = {{ lonMin: {LON_MIN}, lonMax: {LON_MAX}, latMin: {LAT_MIN}, latMax: {LAT_MAX}, width: {WIDTH:.0f}, height: {height:.0f} }}\n\n'
        'export function projectLonLat(lon: number, lat: number): [number, number] {\n'
        '  const k = Math.cos((((MAP.latMin + MAP.latMax) / 2) * Math.PI) / 180)\n'
        '  const scale = MAP.width / ((MAP.lonMax - MAP.lonMin) * k)\n'
        '  return [(lon - MAP.lonMin) * k * scale, (MAP.latMax - lat) * scale]\n'
        '}\n'
    )
    open(out, 'w', encoding='utf-8').write(ts)
    print('dots', len(dots), 'height', round(height), 'bytes', len(ts))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
