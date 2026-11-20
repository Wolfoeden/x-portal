import type { ReactNode } from 'react'
import { DiagramEntrance } from '@/components/diagrams/diagram-entrance'

/** The geo-referenced SVG has viewBox="-400 -300 720 480"; its origin is Verkhovyna. */
export function EuropeAtlas({ label, marker, name }: { label: string; marker?: ReactNode; name: string }) {
  return (
    <DiagramEntrance className="atlas-plate">
      <img src="/orte/europa-waben.svg" width="720" height="480" loading="lazy" decoding="async" alt={label} />
      <div className="atlas-origin" style={{ left: `${400 / 720 * 100}%`, top: `${300 / 480 * 100}%` }}>
        {marker ?? <><span className="atlas-beacon" aria-hidden="true" /><span className="atlas-name" aria-hidden="true">{name}</span></>}
      </div>
    </DiagramEntrance>
  )
}
