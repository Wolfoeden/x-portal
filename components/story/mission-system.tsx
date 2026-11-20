import type { CSSProperties } from 'react'
import { ArrowUpRight, Cpu, MapPin, Network, UserRound, Zap } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { NodeSymbol } from '@/components/diagrams/node-symbol'
import { DiagramEntrance } from '@/components/diagrams/diagram-entrance'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

const stations = [
  { id: 'human', icon: UserRound },
  { id: 'place', icon: MapPin },
  { id: 'supply', icon: Zap },
  { id: 'org', icon: Network },
  { id: 'tech', icon: Cpu },
] as const

// Equal angles around the centre. The phone layout uses a compact fan.
const network = stations.map((station, i) => {
  const angle = (i * 72 - 90) * Math.PI / 180
  return { ...station, x: 50 + 35 * Math.cos(angle), y: 45 + 33 * Math.sin(angle), mobileY: 12 + i * 19 }
})

function Wires({ mobile }: { mobile: boolean }) {
  return (
    <svg className={mobile ? 'network-wires mobile-wires' : 'network-wires wide-wires'} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {network.map(({ id, x, y, mobileY }) => {
        const d = mobile ? `M48 ${mobileY} C32 ${mobileY} 33 50 18 50` : `M${x} ${y} L50 45`
        return (
          <g key={id}>
            <path d={d} className="network-wire" vectorEffect="non-scaling-stroke" />
            <path d={d} pathLength="1" className="network-impulse" vectorEffect="non-scaling-stroke" />
          </g>
        )
      })}
    </svg>
  )
}

export function MissionSystem({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const copy = dict.home.mission
  return (
    <section id={IDS[locale].mission} aria-labelledby="mission-title" className="diagram-section mission-section">
      <Container className="mission-layout">
        <div className="mission-copy">
          <p className="diagram-kicker">{copy.label}</p>
          <h1 id="mission-title">{copy.title}</h1>
          <p className="mission-lead">{copy.lead}</p>
          <p className="diagram-body">{copy.lead2}</p>
          <details className="mission-vision">
            <summary>{copy.visionLabel}<span aria-hidden="true" /></summary>
            <div>{copy.vision.map((line) => <p key={line}>{line}</p>)}</div>
          </details>
          <a className="diagram-cta" href={`${pagePath('places', locale)}#${IDS[locale].stars}`}>{copy.toPlace}<ArrowUpRight aria-hidden size={17} /></a>
        </div>
        <figure className="mission-figure">
          <DiagramEntrance>
            <div className="node-network" role="radiogroup" aria-label={copy.diagramLabel}>
              <div className="network-plane">
                <div className="network-orbit" aria-hidden="true" />
                <Wires mobile={false} /><Wires mobile />
                <span className="network-core">
                  <svg viewBox="0 0 48 44" aria-hidden="true"><NodeSymbol /></svg>
                  {copy.center}
                </span>
              </div>
              {network.map(({ id, icon: Icon, x, y, mobileY }, i) => {
                const node = copy.nodes.find((item) => item.id === id)!
                const style = { '--x': `${x}%`, '--y': `${y}%`, '--mobile-y': `${mobileY}%` } as CSSProperties
                return (
                  <div key={id} className="network-option" style={style}>
                    <label className="network-station">
                      <input type="radio" name="mission-node" defaultChecked={i === 0} aria-describedby={`node-info-${id}`} />
                      <span className="station-port"><Icon size={22} strokeWidth={1.5} aria-hidden /></span>
                      <span className="station-name">{node.name}</span>
                    </label>
                    <div className="network-info" id={`node-info-${id}`}>
                      <Icon size={21} strokeWidth={1.5} aria-hidden />
                      <div><strong>{node.text}</strong><p>{node.detail}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </DiagramEntrance>
          <figcaption>{copy.caption}</figcaption>
        </figure>
      </Container>
    </section>
  )
}
