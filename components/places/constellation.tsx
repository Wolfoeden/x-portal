import type { CSSProperties } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Balance on the left, dominance on the right. The lower arms divide fantasy from adventure.
const stars: Record<string, [number, number]> = {
  health: [18, 37], security: [41, 20], efficiency: [78, 33], nature: [28, 68], freedom: [77, 68],
}
const edges = [['nature', 'health'], ['health', 'security'], ['security', 'efficiency'], ['nature', 'security'], ['security', 'freedom'], ['freedom', 'efficiency']]

export function Constellation({ locale }: { locale: Locale }) {
  const { stars: copy } = getDictionary(locale).places
  return (
    <section id={IDS[locale].stars} aria-labelledby="sternbild-title" className="diagram-section constellation-section">
      <Container>
        <div className="star-system" role="radiogroup" aria-labelledby="sternbild-title">
          <header className="star-heading">
            <p className="diagram-kicker">{copy.label}</p>
            <h2 id="sternbild-title">{copy.title}</h2>
            <p>{copy.hint}</p>
          </header>
          <div className="star-plane">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <g className="celestial-grid">
                <path d="M-8 80 Q45 66 110 83 M-8 53 Q46 36 110 50 M-8 23 Q46 5 110 20 M17 -6 Q46 44 28 104 M54 -5 Q67 53 60 105 M86 -5 Q90 39 91 100" />
              </g>
              <g className="sky-grain" fill="currentColor">
                {[[7,18],[13,76],[23,9],[33,47],[37,82],[51,13],[55,74],[64,52],[70,9],[82,82],[87,18],[92,48]].map(([x,y]) => <circle key={x} cx={x} cy={y} r=".16" />)}
              </g>
              <g className="star-lines">
                {edges.map(([from, to]) => (
                  <line key={from + to} x1={stars[from][0]} y1={stars[from][1]} x2={stars[to][0]} y2={stars[to][1]} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
            </svg>
            <div className="star-poles"><span>{copy.balance}</span><span>{copy.dominance}</span></div>
          </div>
          {copy.values.map((value, i) => {
            const [x, y] = stars[value.id]
            return (
              <div key={value.id} className="star-option" style={{ '--x': `${x}%`, '--y': `${y}%` } as CSSProperties}>
                <label className="star-target" data-label={y < 50 ? 'above' : 'below'}>
                  <input type="radio" name="constellation-value" defaultChecked={i === 0} aria-describedby={`star-detail-${value.id}`} />
                  <span className="star-light" aria-hidden="true" /><span className="star-name">{value.name}</span>
                </label>
                <div className="star-detail" id={`star-detail-${value.id}`}>
                  <p className="star-field">{value.pole} · {value.field}</p>
                  <h3>{value.name}</h3><p>{value.text}</p>
                </div>
              </div>
            )
          })}
          <a className="diagram-cta star-cta" href={`#${IDS[locale].waitlist}`}>{copy.cta}<ArrowDownRight size={17} aria-hidden /></a>
          <p className="star-note">{copy.note}</p>
        </div>
      </Container>
    </section>
  )
}
