import { EUROPE_RELIEF } from '@/lib/map/europe-relief'
import { projectLonLat } from '@/lib/map/europe'

/**
 * Punktkarte Europas als feine Waben: sechseckige Prismen in schräger Aufsicht, so hoch wie das Gelände.
 * Deckfläche hell, linke Wand mittel, rechte Wand dunkel; jede zweite Reihe ist um eine halbe Wabe versetzt.
 * density teilt jeden Datenpunkt in density × density Waben; ihre Höhe wird aus den Nachbarpunkten gemittelt,
 * an der Küste fallen Waben weg, die zum Meer zeigen. So wird das Raster feiner, ohne neue Höhendaten.
 * Die Waben stehen still; nur beim ersten Zeigen werden die Reihen von Norden nach Süden eingeblendet (animate).
 * Um den gezeigten Punkt (focus) leuchten sie grün. Reine SVG-Gruppe ohne Client-Code; sie gehört in ein <svg> mit EUROPE_VIEWBOX.
 */

type Cell = { x: number; y: number; h: number; e: number }

const STEP = 19.44 // Punktabstand der Höhendaten
const R = 7.6 // Radius einer Wabe bei density 1; der Rest bis zum Abstand bleibt als feine Fuge
const SQUASH = 0.55 // Neigung: so flach erscheint die Deckfläche
const BASE = 1.2 // Sockel: auch flaches Land steht als dünne Wabe auf der Karte
const MAX_HEIGHT = 30 // Höhe für 2.800 m und mehr, in Karteneinheiten
const FLAT = 150 // bis zu dieser Höhe bleibt nur der Sockel
const LEVELS = [0, 250, 600, 1000, 1500, 2200] // Höhenstufen in Metern
const DENSITY = 2 // Standard: vier Waben je Datenpunkt

const SOURCE = EUROPE_RELIEF.split(';').map((row) => {
  const [x, y, e] = row.split(',').map(Number)
  return { x, y, e }
})
const GRID = new Map(SOURCE.map((point) => [`${Math.round(point.x / STEP)},${Math.round(point.y / STEP)}`, point.e]))
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
        cells.push({ x, y, e, h: heightOf(e) })
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

const TONES = {
  dark: {
    top: ['#bfd8c8', '#bfd8c8', '#cfe3d6', '#dcebe1', '#eaf4ed', '#ffffff'],
    topOpacity: [0.22, 0.3, 0.4, 0.52, 0.64, 0.76],
    front: '#336f4d',
    right: '#24583b',
    sideOpacity: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
    focusTop: '#8fd9ab',
    focusFront: '#4f9a6e',
    focusRight: '#2f6a49',
  },
  light: {
    top: ['#c9d0cb', '#b4c3b9', '#9fb6a7', '#7f9e8a', '#5f8570', '#3f6b52'],
    topOpacity: [0.7, 0.8, 0.85, 0.9, 0.95, 1],
    front: '#7c857f',
    right: '#5f6762',
    sideOpacity: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
    focusTop: '#17643b',
    focusFront: '#1d7a49',
    focusRight: '#0f4d2c',
  },
} as const

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

function buildRows(focus: [number, number] | undefined, radius: number, tone: keyof typeof TONES, size: number, density: number) {
  const CORNERS = corners((R * size) / density)
  // Jede Wabe hat dieselbe Form: einmal als relative Schritte, dann je Wabe nur der Anfangspunkt.
  const d = (a: number, b: number) => step(CORNERS[b][0] - CORNERS[a][0], CORNERS[b][1] - CORNERS[a][1])
  const TOP = `l${d(0, 1)}l${d(1, 2)}l${d(2, 3)}l${d(3, 4)}l${d(4, 5)}z`
  const LEFT = [`l${d(1, 2)}v`, `l${d(2, 1)}z`]
  const RIGHT = [`l${d(0, 1)}v`, `l${d(1, 0)}z`]
  const colors = TONES[tone]
  const [fx, fy] = focus ? projectLonLat(focus[0], focus[1]) : [Infinity, Infinity]
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
        const near = Math.hypot(cell.x - fx, cell.y - fy) < radius
        const id = `${near ? 'f' : 'n'}${stage}`
        const h = cell.h * size
        const top = cell.y - h
        const at = (i: number) => `${f(cell.x + CORNERS[i][0])} ${f(top + CORNERS[i][1])}`
        // Flache Waben ohne sichtbare Wand: nur die Deckfläche, das hält die Seite leicht.
        if (h >= 1.5) {
        const left = lefts.get(id) ?? { key: `l${id}`, fill: near ? colors.focusFront : colors.front, opacity: colors.sideOpacity[stage], d: '' }
        left.d += `M${at(1)}${LEFT[0]}${f(h)}${LEFT[1]}`
        lefts.set(id, left)
        const right = rights.get(id) ?? { key: `r${id}`, fill: near ? colors.focusRight : colors.right, opacity: colors.sideOpacity[stage], d: '' }
        right.d += `M${at(0)}${RIGHT[0]}${f(h)}${RIGHT[1]}`
        rights.set(id, right)
        }
        const face = tops.get(id) ?? { key: `t${id}`, fill: near ? colors.focusTop : colors.top[stage], opacity: near ? Math.min(1, colors.topOpacity[stage] + 0.35) : colors.topOpacity[stage], d: '' }
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
