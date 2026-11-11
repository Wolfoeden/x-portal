import { EUROPE_RELIEF } from '@/lib/map/europe-relief'
import { projectLonLat } from '@/lib/map/europe'

/**
 * Punktkarte Europas als Waben: Jeder Punkt steht als sechseckiges Prisma in schräger Aufsicht, so hoch wie das Gelände.
 * Deckfläche hell, linke Wand mittel, rechte Wand dunkel; jede zweite Reihe ist um einen halben Abstand versetzt, so schließen die Waben an.
 * Die Waben stehen still; nur beim ersten Zeigen werden die Reihen von Norden nach Süden eingeblendet (animate).
 * Um den gezeigten Punkt (focus) leuchten sie grün. Reine SVG-Gruppe ohne Client-Code; sie gehört in ein <svg> mit EUROPE_VIEWBOX.
 */

type Cell = { x: number; y: number; h: number; e: number }

const STEP = 19.4 // Punktabstand der Karte
const R = 7.6 // Radius einer Wabe; der Rest bis zum Punktabstand bleibt als feine Fuge
const SQUASH = 0.55 // Neigung: so flach erscheint die Deckfläche
const BASE = 1.2 // Sockel: auch flaches Land steht als dünne Wabe auf der Karte
const MAX_HEIGHT = 30 // Höhe für 2.800 m und mehr, in Karteneinheiten
const FLAT = 150 // bis zu dieser Höhe bleibt nur der Sockel
const LEVELS = [0, 250, 600, 1000, 1500, 2200] // Höhenstufen in Metern

const CELLS: Cell[] = EUROPE_RELIEF.split(';').map((row) => {
  const [x, y, e] = row.split(',').map(Number)
  // Jede zweite Reihe um einen halben Abstand nach rechts, damit die Waben ineinandergreifen.
  const shift = Math.round(y / STEP) % 2 ? STEP / 2 : 0
  return { x: x + shift, y, e, h: BASE + MAX_HEIGHT * Math.pow(Math.max(0, Math.min(e, 2800) - FLAT) / (2800 - FLAT), 1) }
})

const level = (e: number) => LEVELS.reduce((found, limit, index) => (e >= limit ? index : found), 0)

/** Nächster Kartenpunkt zu einem Ort, mit der Mitte seiner Deckfläche. Für Markierungen, die oben auf der Wabe sitzen. */
export function reliefPoint(lon: number, lat: number, size = 1) {
  const [px, py] = projectLonLat(lon, lat)
  let best = CELLS[0]
  let distance = Infinity
  for (const cell of CELLS) {
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

const f = (n: number) => n.toFixed(1)
// Ecken der Deckfläche relativ zur Mitte: 0 rechts unten, 1 unten, 2 links unten, 3 links oben, 4 oben, 5 rechts oben.
// size verkleinert Waben und Höhen, wenn die Karte groß gezeigt wird (Hero der Investorenseite); der Punktabstand bleibt.
const corners = (size: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = Math.PI / 6 + (i * Math.PI) / 3
    return [R * size * Math.cos(angle), R * size * SQUASH * Math.sin(angle)] as const
  })

function buildRows(focus: [number, number] | undefined, radius: number, tone: keyof typeof TONES, size: number) {
  const CORNERS = corners(size)
  const colors = TONES[tone]
  const [fx, fy] = focus ? projectLonLat(focus[0], focus[1]) : [Infinity, Infinity]
  const rows = new Map<number, Cell[]>()
  for (const cell of CELLS) {
    const key = Math.round(cell.y)
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
        const at = (i: number, dy = 0) => `${f(cell.x + CORNERS[i][0])} ${f(top + CORNERS[i][1] + dy)}`
        const left = lefts.get(id) ?? { key: `l${id}`, fill: near ? colors.focusFront : colors.front, opacity: colors.sideOpacity[stage], d: '' }
        left.d += `M${at(1)}L${at(2)}L${at(2, h)}L${at(1, h)}z`
        lefts.set(id, left)
        const right = rights.get(id) ?? { key: `r${id}`, fill: near ? colors.focusRight : colors.right, opacity: colors.sideOpacity[stage], d: '' }
        right.d += `M${at(0)}L${at(1)}L${at(1, h)}L${at(0, h)}z`
        rights.set(id, right)
        const face = tops.get(id) ?? { key: `t${id}`, fill: near ? colors.focusTop : colors.top[stage], opacity: near ? Math.min(1, colors.topOpacity[stage] + 0.35) : colors.topOpacity[stage], d: '' }
        face.d += `M${at(0)}L${at(1)}L${at(2)}L${at(3)}L${at(4)}L${at(5)}z`
        tops.set(id, face)
      }
      return { key, groups: [...lefts.values(), ...rights.values(), ...tops.values()] }
    })
}

export function ReliefLayer({ focus, radius = 110, tone = 'dark', animate = true, size = 1 }: { focus?: [number, number]; radius?: number; tone?: keyof typeof TONES; animate?: boolean; size?: number }) {
  const rows = buildRows(focus, radius, tone, size)
  return (
    <g aria-hidden>
      {rows.map((row, index) => (
        <g key={row.key} className={animate ? 'relief-row' : undefined} style={animate ? { animationDelay: `${index * 22}ms` } : undefined}>
          {row.groups.map((group) => (
            <path key={group.key} d={group.d} fill={group.fill} opacity={group.opacity} />
          ))}
        </g>
      ))}
    </g>
  )
}
