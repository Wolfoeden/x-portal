import { Flame, Radio, UtilityPole, Waves } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

const symbols = { power: UtilityPole, heat: Flame, water: Waves, net: Radio } as const

export function SupplyBoard({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.supply
  return (
    <section id={IDS[locale].supply} aria-labelledby="versorgung-title" className="diagram-section supply-section">
      <Container>
        <header className="diagram-heading">
          <div><p className="diagram-kicker">{copy.label}</p><h2 id="versorgung-title">{copy.title}</h2></div>
          <div className="supply-note"><span>{copy.badge}</span><p className="diagram-body">{copy.text}</p></div>
        </header>
        <ul className="supply-grid">
          {copy.items.map((item) => {
            const Icon = symbols[item.id as keyof typeof symbols]
            return (
              <li className="supply-card" key={item.id}>
                <div className="supply-identity">
                  <span className="supply-icon"><Icon aria-hidden strokeWidth={1.5} /></span>
                  <h3>{item.title}</h3>
                </div>
                <dl className="supply-flow">
                  <div><dt>{copy.sourceLabel}</dt><dd>{item.source}</dd></div>
                  <div><dt>{copy.reserveLabel}</dt><dd>{item.reserve}</dd></div>
                </dl>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
