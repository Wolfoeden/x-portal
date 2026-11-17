import { EUROPE_RELIEF } from '@/lib/map/europe-relief'
import { projectLonLat } from '@/lib/map/europe'

/**
 * Punktkarte Europas als Wabenrelief in Draufsicht: eine geschlossene Fläche feiner Sechsecke, beleuchtet wie eine Reliefkarte.
 * Farbe nach Höhe (Tiefland dunkelgrün, Hochgebirge hell), Licht von Nordwest: Lichthänge hell, Schattenhänge dunkel.
 * density teilt jeden Datenpunkt in density × density Waben; ihre Höhe wird aus den Nachbarpunkten gemittelt,
 * an der Küste fallen Waben weg, die zum Meer zeigen. So wird das Raster feiner, ohne neue Höhendaten.
 * Die Waben stehen still; nur beim ersten Zeigen werden die Reihen von Norden nach Süden eingeblendet (animate).
 * Nur die Wabe unter dem gezeigten Ort (focus) ist grün. Reine SVG-Gruppe ohne Client-Code; sie gehört in ein <svg> mit EUROPE_VIEWBOX.
 */

type Cell = { x: number; y: number; h: number; e: number; light: number }

const STEP = 19.44 // Punktabstand der Höhendaten
const FILL = 0.575 // Radius einer Wabe im Verhältnis zum Abstand: die Waben schließen bis auf eine haarfeine Fuge
const SQUASH = 1 // Draufsicht: die Fläche schließt, die Berge zeigt das Licht
const BASE = 0 // Sockel: auch flaches Land steht als dünne Wabe auf der Karte
const MAX_HEIGHT = 0 // Höhe für 2.800 m und mehr, in Karteneinheiten
const FLAT = 150 // bis zu dieser Höhe bleibt nur der Sockel
const LEVELS = [0, 250, 600, 1000, 1500, 2200] // Höhenstufen in Metern
const DENSITY = 2 // Standard: vier Waben je Datenpunkt

const SOURCE = EUROPE_RELIEF.split(';').map((row) => {
  const [x, y, e] = row.split(',').map(Number)
  return { x, y, e }
})
const GRID = new Map(SOURCE.map((point) => [`${Math.round(point.x / STEP)},${Math.round(point.y / STEP)}`, point.e]))
const at = (col: number, row: number, fallback: number) => GRID.get(`${col},${row}`) ?? fallback

// Schummerung wie auf einer Reliefkarte: Licht von Nordwest, 45° hoch. Gelände überhöht, damit Hänge sichtbar werden.
const EXAGGERATE = 0.05 // je Meter Höhenunterschied auf einen Punktabstand
const LIGHT = (() => {
  const v = [-1, -1, 1.4]
  const n = Math.hypot(...v)
  return v.map((c) => c / n)
})()
const FLAT_LIGHT = LIGHT[2]
/** Helligkeit eines Datenpunkts, 0 (Schattenhang) bis 1 (Lichthang), 0,5 auf ebenem Land. */
function lightAt(col: number, row: number, e: number) {
  const dzdx = ((at(col + 1, row, e) - at(col - 1, row, e)) / 2) * EXAGGERATE / STEP * 19.44
  const dzdy = ((at(col, row + 1, e) - at(col, row - 1, e)) / 2) * EXAGGERATE / STEP * 19.44
  const n = Math.hypot(dzdx, dzdy, 1)
  const dot = (-dzdx * LIGHT[0] - dzdy * LIGHT[1] + LIGHT[2]) / n
  // Im Flachland kaum Schatten, sonst rauscht die Fläche; ab etwa 700 m volle Schummerung.
  const weight = Math.min(1, Math.max(0, (e - 120) / 600))
  return Math.max(0, Math.min(1, 0.5 + (dot - FLAT_LIGHT) * 2.4 * weight))
}

const heightOf = (e: number) => BASE + MAX_HEIGHT * Math.max(0, Math.min(e, 2800) - FLAT) / (2800 - FLAT)

const cache = new Map<number, Cell[]>()

/** Waben für eine Dichte: je Datenpunkt density × density Waben, Höhe aus dem Punkt und seinen Nachbarn gemittelt. */
function cellsFor(density: number): Cell[] {
  const found = cache.get(density)
  if (found) return found
  const sub = STEP / density
  const cells: Cell[] = []
  for (const point of SOURCE) {
    const col = Math.round(point.x / STEP)
    const row = Math.round(point.y / STEP)
    const light = lightAt(col, row, point.e)
    for (let a = 0; a < density; a++) {
      for (let b = 0; b < density; b++) {
        // Lage der Wabe im Datenpunkt, von −0,5 bis 0,5
        const u = (b + 0.5) / density - 0.5
        const v = (a + 0.5) / density - 0.5
        const nx = GRID.get(`${col + Math.sign(u)},${row}`)
        const ny = GRID.get(`${col},${row + Math.sign(v)}`)
        // Zum Meer hin (beide Nachbarn fehlen) bleibt die Wabe weg: die Küste wird feiner.
        if (density > 1 && nx === undefined && ny === undefined) continue
        const wx = Math.abs(u)
        const wy = Math.abs(v)
        const e = point.e * (1 - wx - wy) + (nx ?? point.e) * wx + (ny ?? point.e) * wy
        const y = point.y + v * STEP
        const subRow = Math.round(y / sub)
        const x = point.x + u * STEP + (subRow % 2 ? sub / 2 : 0)
        cells.push({ x, y, e, h: heightOf(e), light })
      }
    }
  }
  cache.set(density, cells)
  return cells
}

const level = (e: number) => LEVELS.reduce((found, limit, index) => (e >= limit ? index : found), 0)

/** Nächste Wabe zu einem Ort, mit der Mitte ihrer Deckfläche. Für Markierungen, die oben auf der Wabe sitzen. */
export function reliefPoint(lon: number, lat: number, size = 1, density = DENSITY) {
  const [px, py] = projectLonLat(lon, lat)
  const cells = cellsFor(density)
  let best = cells[0]
  let distance = Infinity
  for (const cell of cells) {
    const d = (cell.x - px) ** 2 + (cell.y - py) ** 2
    if (d < distance) {
      distance = d
      best = cell
    }
  }
  return { x: best.x, y: best.y, top: best.y - best.h * size, elevation: best.e }
}

// Farben je Ton: Tiefland, Hochgebirge (fast weiß), Seitenwand. Die Deckfläche mischt Höhe und Licht.
const TONES = {
  dark: { low: [29, 82, 54], high: [200, 233, 213], wall: [14, 52, 33], focus: '#8fd9ab' },
  light: { low: [214, 223, 217], high: [63, 107, 82], wall: [150, 160, 154], focus: '#17643b' },
} as const

const LIGHT_LEVELS = 7
type RGB = readonly [number, number, number]
const hex = (c: readonly number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`
const mix = (a: RGB, b: RGB, t: number) => a.map((v, i) => v + (b[i] - v) * t)
/** Farbe der Deckfläche: Höhenton aus Stufe, aufgehellt oder abgedunkelt nach Lichtstufe. */
function topColor(tone: keyof typeof TONES, stage: number, shade: number) {
  const t = TONES[tone]
  const base = mix(t.low, t.high, Math.pow(stage / (LEVELS.length - 1), 0.9))
  const f = 0.7 + (shade / (LIGHT_LEVELS - 1)) * 0.6 // 0,7 im Schatten bis 1,3 im Licht
  return hex(base.map((v) => v * f))
}

type Group = { key: string; fill: string; opacity: number; d: string }

// Zahlen kurz schreiben: eine Nachkommastelle, ohne „.0“ und ohne führende Null.
const f = (n: number) => n.toFixed(1).replace(/\.0$/, '').replace(/^(-?)0\./, '$1.')
// Relativer Schritt im Pfad; Leerzeichen nur, wo das Vorzeichen nicht trennt.
const step = (dx: number, dy: number) => `${f(dx)}${dy < 0 ? '' : ' '}${f(dy)}`
// Ecken der Deckfläche relativ zur Mitte: 0 rechts unten, 1 unten, 2 links unten, 3 links oben, 4 oben, 5 rechts oben.
// size verkleinert Waben und Höhen, wenn die Karte groß gezeigt wird (Hero der Investorenseite); der Punktabstand bleibt.
const corners = (radius: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 6 + (i * Math.PI) / 3
    return [radius * Math.cos(angle), radius * SQUASH * Math.sin(angle)] as const
  })

function buildRows(focus: [number, number] | undefined, _radius: number, tone: keyof typeof TONES, size: number, density: number) {
  const CORNERS = corners((STEP / density) * FILL * size)
  // Jede Wabe hat dieselbe Form: einmal als relative Schritte, dann je Wabe nur der Anfangspunkt.
  const d = (a: number, b: number) => step(CORNERS[b][0] - CORNERS[a][0], CORNERS[b][1] - CORNERS[a][1])
  const TOP = `l${d(0, 1)}l${d(1, 2)}l${d(2, 3)}l${d(3, 4)}l${d(4, 5)}z`
  const LEFT = [`l${d(1, 2)}v`, `l${d(2, 1)}z`]
  const RIGHT = [`l${d(0, 1)}v`, `l${d(1, 0)}z`]
  const colors = TONES[tone]
  // Nur die eine Wabe unter dem gezeigten Ort wird grün, kein Kreis drumherum.
  const target = focus ? reliefPoint(focus[0], focus[1], 1, density) : null
  const rows = new Map<number, Cell[]>()
  for (const cell of cellsFor(density)) {
    const key = Math.round(cell.y * 10)
    rows.set(key, [...(rows.get(key) ?? []), cell])
  }
  // Von Norden nach Süden: Waben weiter vorn verdecken den Fuß der Waben dahinter.
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, cells]) => {
      const lefts = new Map<string, Group>()
      const rights = new Map<string, Group>()
      const tops = new Map<string, Group>()
      for (const cell of cells) {
        const stage = level(cell.e)
        const shade = Math.round(cell.light * (LIGHT_LEVELS - 1))
        const isTarget = target !== null && cell.x === target.x && cell.y === target.y
        const id = isTarget ? 'f' : `${stage}-${shade}`
        const h = cell.h * size
        const top = cell.y - h
        const at = (i: number) => `${f(cell.x + CORNERS[i][0])} ${f(top + CORNERS[i][1])}`
        // Flache Waben ohne sichtbare Wand: nur die Deckfläche, das hält die Seite leicht.
        if (h >= 1.5) {
          const wall = hex(mix(colors.wall, TONES[tone].low, 0.25 + 0.1 * stage))
          const left = lefts.get(id) ?? { key: `l${id}`, fill: wall, opacity: 0.9, d: '' }
          left.d += `M${at(1)}${LEFT[0]}${f(h)}${LEFT[1]}`
          lefts.set(id, left)
          const right = rights.get(id) ?? { key: `r${id}`, fill: hex(colors.wall), opacity: 0.95, d: '' }
          right.d += `M${at(0)}${RIGHT[0]}${f(h)}${RIGHT[1]}`
          rights.set(id, right)
        }
        const face = tops.get(id) ?? { key: `t${id}`, fill: isTarget ? colors.focus : topColor(tone, stage, shade), opacity: 1, d: '' }
        face.d += `M${at(0)}${TOP}`
        tops.set(id, face)
      }
      return { key, groups: [...lefts.values(), ...rights.values(), ...tops.values()] }
    })
}

export function ReliefLayer({ focus, radius = 110, tone = 'dark', animate = true, size = 1, density = DENSITY }: { focus?: [number, number]; radius?: number; tone?: keyof typeof TONES; animate?: boolean; size?: number; density?: number }) {
  const rows = buildRows(focus, radius, tone, size, density)
  return (
    <g aria-hidden>
      {rows.map((row, index) => (
        <g key={row.key} className={animate ? 'relief-row' : undefined} style={animate ? { animationDelay: `${Math.round((index * 22) / density)}ms` } : undefined}>
          {row.groups.map((group) => (
            <path key={group.key} d={group.d} fill={group.fill} opacity={group.opacity} />
          ))}
        </g>
      ))}
    </g>
  )
}
