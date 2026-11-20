"""Build the lazy SVG for the site atlas (Python standard library).

Usage: python scripts/map/europe-atlas.py regions.geojson land.geojson public/orte/europa-waben.svg
Inputs: Natural Earth, public domain, ne_110m_geography_regions_polys and ne_110m_land.
Projection: spherical Lambert azimuthal equal-area. The public town reference in hubs.ts
is the projection origin and the origin of the printed sheet, never a cadastral location.
"""
import json
import math
import re
import sys
from pathlib import Path

WIDTH, HEIGHT = 720, 480
ORIGIN_X, ORIGIN_Y = 400, 300
PADDING = 20


def polygons(feature):
    geometry = feature["geometry"]
    return geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]


def main(regions_file, land_file, output):
    location = (Path(__file__).resolve().parents[2] / "lib/map/hubs.ts").read_text(encoding="utf-8")
    origin = re.search(r"HUB_01: \[number, number\] = \[([\d.]+), ([\d.]+)\]", location)
    lon0, lat0 = map(lambda n: math.radians(float(n)), origin.groups())

    def project(lon, lat):
        lon, lat = math.radians(lon) - lon0, math.radians(lat)
        k = math.sqrt(2 / (1 + math.sin(lat0)*math.sin(lat) + math.cos(lat0)*math.cos(lat)*math.cos(lon)))
        return (k * math.cos(lat)*math.sin(lon),
                -k * (math.cos(lat0)*math.sin(lat) - math.sin(lat0)*math.cos(lat)*math.cos(lon)))

    regions = json.loads(Path(regions_file).read_text(encoding="utf-8"))["features"]
    mainland = next(f for f in regions if f["properties"]["NAME"] == "EUROPE")
    shapes = list(polygons(mainland))
    # The named continental feature omits offshore islands. The land layer supplies
    # Britain, Ireland, Iceland and the Mediterranean islands, without overseas territories.
    land = json.loads(Path(land_file).read_text(encoding="utf-8"))["features"]
    for feature in land:
        for poly in polygons(feature):
            if all(-26 < x < 42 and 34 < y < 72 for x, y in poly[0]):
                shapes.append(poly)

    projected = [[[project(x, y) for x, y in ring] for ring in poly] for poly in shapes]
    xs, ys = zip(*(pt for poly in projected for ring in poly for pt in ring))
    scale = min((ORIGIN_X-PADDING)/-min(xs), (WIDTH-ORIGIN_X-PADDING)/max(xs),
                (ORIGIN_Y-PADDING)/-min(ys), (HEIGHT-ORIGIN_Y-PADDING)/max(ys))

    def path_for(points, close=False):
        kept = []
        for x, y in points:
            point = x * scale, y * scale
            if not kept or math.dist(kept[-1], point) >= 1.25:
                kept.append(point)
        if len(kept) < (3 if close else 2):
            return ""
        return "M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in kept) + ("Z" if close else "")

    # Draw each polygon separately so overlapping island sources cannot cancel one another.
    land_paths = "".join('<path d="' + "".join(path_for(r, True) for r in p) + '"/>' for p in projected)
    parallels = [[project(lon, lat) for lon in range(-35, 80, 2)] for lat in range(35, 76, 10)]
    meridians = [[project(lon, lat) for lat in range(30, 78)] for lon in range(-30, 81, 15)]
    grid = "".join(path_for(curve) for curve in parallels + meridians)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-{ORIGIN_X} -{ORIGIN_Y} {WIDTH} {HEIGHT}">
<defs><pattern id="land" width="5.6" height="9.7" patternUnits="userSpaceOnUse"><path fill="#5f6762" d="m2.8 .2 2 1.15v2.3l-2 1.15-2-1.15v-2.3ZM0 5.05l2 1.15v2.3l-2 1.15-2-1.15V6.2Zm5.6 0 2 1.15v2.3l-2 1.15-2-1.15V6.2Z"/></pattern></defs>
<path d="{grid}" fill="none" stroke="#d5dbd6" stroke-width=".7"/>
<g fill="url(#land)" fill-rule="evenodd">{land_paths}</g></svg>'''
    Path(output).write_text(svg + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(*sys.argv[1:])
