import type { CSSProperties } from 'react'
import { EUROPE_RELIEF } from '@/lib/map/europe-relief'
import { projectLonLat } from '@/lib/map/europe'

/**
 * Punktkarte Europas als Höhenblöcke: Jeder Punkt steht als kleiner Block auf der Karte, so hoch wie das Gelände.
 * Alpen, Karpaten und Skandinavien ragen heraus, Ebenen bleiben flach. Um den gezeigten Punkt (focus) leuchten die Blöcke grün.
 * Hohe Blöcke (ab 900 m) bewegen sich leicht auf und ab (move), reine CSS-Animation, bei reduzierter Bewegung still.
 * Reine SVG-Gruppe ohne Client-Code; sie gehört in ein <svg> mit EUROPE_VIEWBOX.
 */

type Cell = { x: number; y: number; h: number; e: number }

const SIZE = 8.2 // Kantenlänge eines Punkts wie in EUROPE_DOTS
const MAX_HEIGHT = 52 // Blockhöhe für 2.800 m und mehr, in Karteneinheiten (ein Punktabstand ist 19,4)
const FLAT = 150 // bis zu dieser Höhe bleibt der Block flach
const LEVELS = [0, 250, 600, 1000, 1500, 2200] // Höhenstufen in Metern

const CELLS: Cell[] = EUROPE_RELIEF.split(';').map((row) => {
  const [x, y, e] = row.split(',').map(Number)
  return { x, y, e, h: MAX_HEIGHT * Math.pow(Math.max(0, Math.min(e, 2800) - FLAT) / (2800 - FLAT), 1.15) }
})

const level = (e: number) => LEVELS.reduce((found, limit, index) => (e >= limit ? index : found), 0)

/** Nächster Kartenpunkt zu einem Ort, mit seiner Blockhöhe. Für Markierungen, die oben auf dem Block sitzen. */
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
  return { x: best.x, y: best.y, top: best.y - best.h, elevation: best.e }
}

const TONES = {
  dark: {
    top: ['#bfd8c8', '#bfd8c8', '#cfe3d6', '#dcebe1', '#eaf4ed', '#ffffff'],
    topOpacity: [0.22, 0.32, 0.46, 0.62, 0.8, 0.95],
    side: '#2f6a49',
    sideOpacity: [0.9, 0.9, 0.92, 0.94, 0.96, 1],
    focusTop: '#8fd9ab',
    focusSide: '#3f8a5f',
  },
  light: {
    top: ['#c9d0cb', '#b4c3b9', '#9fb6a7', '#7f9e8a', '#5f8570', '#3f6b52'],
    topOpacity: [0.7, 0.8, 0.85, 0.9, 0.95, 1],
    side: '#5f6762',
    sideOpacity: [0.2, 0.25, 0.3, 0.35, 0.4, 0.45],
    focusTop: '#17643b',
    focusSide: '#0f4d2c',
  },
} as const

type Group = { key: string; fill: string; opacity: number; d: string }
type Mover = { key: string; x: number; top: number; h: number; side: string; sideOpacity: number; fill: string; opacity: number; style: CSSProperties }

const MOVE_FROM = 900 // ab dieser Höhe (m) bewegt sich ein Block leicht auf und ab

/** Leichte Bewegung hoher Blöcke: Hub in Karteneinheiten, Takt und Versatz aus der Lage, damit eine ruhige Welle über die Gebirge läuft. */
function motion(cell: Cell): CSSProperties {
  const lift = 2 + (5 * (Math.min(cell.e, 2800) - MOVE_FROM)) / (2800 - MOVE_FROM)
  const period = 3.6 + ((cell.x * 7 + cell.y * 3) % 17) / 10
  const delay = -((cell.x / 1000) * 6 + (cell.y / 1129) * 2)
  return {
    '--grow': ((cell.h + lift) / cell.h).toFixed(3),
    '--lift': `${(-lift).toFixed(2)}px`,
    '--period': `${period.toFixed(2)}s`,
    '--delay': `${delay.toFixed(2)}s`,
  } as CSSProperties
}

function buildRows(focus: [number, number] | undefined, radius: number, tone: keyof typeof TONES, move: boolean) {
  const colors = TONES[tone]
  const [fx, fy] = focus ? projectLonLat(focus[0], focus[1]) : [Infinity, Infinity]
  const rows = new Map<number, Cell[]>()
  for (const cell of CELLS) {
    const key = Math.round(cell.y)
    rows.set(key, [...(rows.get(key) ?? []), cell])
  }
  // Von Norden nach Süden zeichnen: Blöcke weiter südlich stehen vorn und verdecken den Fuß der nördlichen.
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, cells]) => {
      const sides = new Map<string, Group>()
      const tops = new Map<string, Group>()
      const movers: Mover[] = []
      for (const cell of cells) {
        const stage = level(cell.e)
        const near = Math.hypot(cell.x - fx, cell.y - fy) < radius
        const id = `${near ? 'f' : 'n'}${stage}`
        const left = cell.x - SIZE / 2
        const top = cell.y - SIZE / 2 - cell.h
        if (move && cell.e >= MOVE_FROM && cell.h >= 2) {
          movers.push({
            key: `m${cell.x}`,
            x: left,
            top,
            h: cell.h,
            side: near ? colors.focusSide : colors.side,
            sideOpacity: colors.sideOpacity[stage],
            fill: near ? colors.focusTop : colors.top[stage],
            opacity: near ? Math.min(1, colors.topOpacity[stage] + 0.35) : colors.topOpacity[stage],
            style: motion(cell),
          })
          continue
        }
        if (cell.h >= 0.8) {
          const side = sides.get(id) ?? { key: `s${id}`, fill: near ? colors.focusSide : colors.side, opacity: colors.sideOpacity[stage], d: '' }
          side.d += `M${left.toFixed(1)} ${(top + SIZE).toFixed(1)}h${SIZE}v${cell.h.toFixed(1)}h-${SIZE}z`
          sides.set(id, side)
        }
        const face = tops.get(id) ?? { key: `t${id}`, fill: near ? colors.focusTop : colors.top[stage], opacity: near ? Math.min(1, colors.topOpacity[stage] + 0.35) : colors.topOpacity[stage], d: '' }
        face.d += `M${left.toFixed(1)} ${top.toFixed(1)}h${SIZE}v${SIZE}h-${SIZE}z`
        tops.set(id, face)
      }
      return { key, groups: [...sides.values(), ...tops.values()], movers }
    })
}

export function ReliefLayer({ focus, radius = 110, tone = 'dark', animate = true, move = true }: { focus?: [number, number]; radius?: number; tone?: keyof typeof TONES; animate?: boolean; move?: boolean }) {
  const rows = buildRows(focus, radius, tone, move)
  return (
    <g aria-hidden>
      {rows.map((row, index) => (
        <g key={row.key} className={animate ? 'relief-row' : undefined} style={animate ? { animationDelay: `${index * 18}ms` } : undefined}>
          {row.groups.map((group) => (
            <path key={group.key} d={group.d} fill={group.fill} opacity={group.opacity} />
          ))}
          {row.movers.map((block) => (
            <g key={block.key} style={block.style}>
              <rect className="relief-side" x={block.x} y={(block.top + SIZE).toFixed(1)} width={SIZE} height={block.h.toFixed(1)} fill={block.side} opacity={block.sideOpacity} />
              <rect className="relief-top" x={block.x} y={block.top.toFixed(1)} width={SIZE} height={SIZE} fill={block.fill} opacity={block.opacity} />
            </g>
          ))}
        </g>
      ))}
    </g>
  )
}
