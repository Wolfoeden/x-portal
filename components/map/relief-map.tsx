import { EUROPE_RELIEF } from '@/lib/map/europe-relief'
import { projectLonLat } from '@/lib/map/europe'

/**
 * Punktkarte Europas als Gelände aus Quadern: Jeder Punkt steht als Block in schräger Aufsicht, so hoch wie das Gelände.
 * Deckfläche hell, Vorderwand mittel, rechte Seitenwand dunkel; so lesen sich Alpen, Karpaten und Skandinavien als Relief.
 * Die Blöcke stehen still; nur beim ersten Zeigen werden die Reihen von Norden nach Süden eingeblendet (animate).
 * Um den gezeigten Punkt (focus) leuchten die Blöcke grün. Reine SVG-Gruppe ohne Client-Code; sie gehört in ein <svg> mit EUROPE_VIEWBOX.
 */

type Cell = { x: number; y: number; h: number; e: number }

const SIZE = 13 // Kantenlänge der Grundfläche; der Punktabstand ist 19,4
const DEPTH = 8 // Tiefe der schrägen Aufsicht nach rechts oben
const BASE = 2.5 // Sockel: auch flaches Land steht als dünne Platte auf der Karte
const MAX_HEIGHT = 52 // Blockhöhe für 2.800 m und mehr, in Karteneinheiten
const FLAT = 150 // bis zu dieser Höhe bleibt der Block flach
const LEVELS = [0, 250, 600, 1000, 1500, 2200] // Höhenstufen in Metern

const CELLS: Cell[] = EUROPE_RELIEF.split(';').map((row) => {
  const [x, y, e] = row.split(',').map(Number)
  return { x, y, e, h: BASE + MAX_HEIGHT * Math.pow(Math.max(0, Math.min(e, 2800) - FLAT) / (2800 - FLAT), 0.9) }
})

const level = (e: number) => LEVELS.reduce((found, limit, index) => (e >= limit ? index : found), 0)

/** Nächster Kartenpunkt zu einem Ort, mit der Mitte seiner Deckfläche. Für Markierungen, die oben auf dem Block sitzen. */
export function reliefPoint(lon: number, lat: number) {
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
  return { x: best.x + DEPTH / 2, y: best.y, top: best.y + SIZE / 2 - best.h - DEPTH / 2, elevation: best.e }
}

const TONES = {
  dark: {
    top: ['#bfd8c8', '#bfd8c8', '#cfe3d6', '#dcebe1', '#eaf4ed', '#ffffff'],
    topOpacity: [0.2, 0.3, 0.46, 0.64, 0.82, 0.96],
    front: '#3d7a57',
    right: '#1f5137',
    sideOpacity: [0.85, 0.88, 0.9, 0.93, 0.96, 1],
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

function buildRows(focus: [number, number] | undefined, radius: number, tone: keyof typeof TONES) {
  const colors = TONES[tone]
  const [fx, fy] = focus ? projectLonLat(focus[0], focus[1]) : [Infinity, Infinity]
  const rows = new Map<number, Cell[]>()
  for (const cell of CELLS) {
    const key = Math.round(cell.y)
    rows.set(key, [...(rows.get(key) ?? []), cell])
  }
  // Von Norden nach Süden, je Reihe von Osten nach Westen: Was weiter vorn steht, verdeckt Fuß und Seitenwand dahinter.
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, cells]) => {
      const fronts = new Map<string, Group>()
      const rights = new Map<string, Group>()
      const tops = new Map<string, Group>()
      for (const cell of [...cells].sort((a, b) => b.x - a.x)) {
        const stage = level(cell.e)
        const near = Math.hypot(cell.x - fx, cell.y - fy) < radius
        const id = `${near ? 'f' : 'n'}${stage}`
        const x = cell.x - SIZE / 2
        const ground = cell.y + SIZE / 2 // Unterkante der Vorderwand
        const top = ground - cell.h // Oberkante der Vorderwand
        if (cell.h >= 0.8) {
          const front = fronts.get(id) ?? { key: `v${id}`, fill: near ? colors.focusFront : colors.front, opacity: colors.sideOpacity[stage], d: '' }
          front.d += `M${f(x)} ${f(top)}h${SIZE}v${f(cell.h)}h-${SIZE}z`
          fronts.set(id, front)
          const right = rights.get(id) ?? { key: `r${id}`, fill: near ? colors.focusRight : colors.right, opacity: colors.sideOpacity[stage], d: '' }
          right.d += `M${f(x + SIZE)} ${f(ground)}v${f(-cell.h)}l${DEPTH} ${-DEPTH}v${f(cell.h)}z`
          rights.set(id, right)
        }
        const face = tops.get(id) ?? { key: `t${id}`, fill: near ? colors.focusTop : colors.top[stage], opacity: near ? Math.min(1, colors.topOpacity[stage] + 0.35) : colors.topOpacity[stage], d: '' }
        face.d += `M${f(x)} ${f(top)}h${SIZE}l${DEPTH} ${-DEPTH}h-${SIZE}z`
        tops.set(id, face)
      }
      return { key, groups: [...rights.values(), ...fronts.values(), ...tops.values()] }
    })
}

export function ReliefLayer({ focus, radius = 110, tone = 'dark', animate = true }: { focus?: [number, number]; radius?: number; tone?: keyof typeof TONES; animate?: boolean }) {
  const rows = buildRows(focus, radius, tone)
  return (
    <g aria-hidden>
      {rows.map((row, index) => (
        <g key={row.key} className={animate ? 'relief-row' : undefined} style={animate ? { animationDelay: `${index * 18}ms` } : undefined}>
          {row.groups.map((group) => (
            <path key={group.key} d={group.d} fill={group.fill} opacity={group.opacity} />
          ))}
        </g>
      ))}
    </g>
  )
}
