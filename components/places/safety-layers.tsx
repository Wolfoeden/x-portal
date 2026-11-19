import type { CSSProperties } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { NodeSymbol } from '@/components/diagrams/node-symbol'
import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

export function SafetyLayers({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.safety
  return (
    <section id={IDS[locale].safety} aria-labelledby="schutz-title" className="diagram-section protection-section">
      <Container>
        <header className="diagram-heading">
          <div><p className="diagram-kicker">{copy.label}</p><h2 id="schutz-title">{copy.title}</h2></div>
          <p className="diagram-body">{copy.text}</p>
        </header>
        <div className="safety-system" role="radiogroup" aria-labelledby="schutz-title">
          <div className="dial-base" aria-hidden="true">
            <svg viewBox="0 0 320 320">
              <path d="M160 7v306M7 160h306" className="dial-axis" />
              <g transform="translate(136 138)"><NodeSymbol /></g>
            </svg>
          </div>
          {copy.layers.map((layer, i) => {
            const id = `safety-${layer.id}`
            const r = 140 - i * 24
            return (
              <div className="safety-option" key={id} style={{ '--row': i + 1 } as CSSProperties}>
                <label className="safety-item" htmlFor={id}>
                  <input type="radio" name="protection-layer" id={id} defaultChecked={i === 0} aria-describedby={`${id}-info`} />
                  <span className="safety-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span>{layer.title}</span><ArrowDownRight size={18} aria-hidden />
                </label>
                <label className="dial-ring" htmlFor={id} aria-hidden="true">
                  <svg viewBox="0 0 320 320" fill="none">
                    <circle cx="160" cy="160" r={r} className="ring-band" />
                    <circle cx="160" cy="160" r={r} className="ring-line" vectorEffect="non-scaling-stroke" />
                    <circle cx="160" cy={160 - r} r="4" className="ring-port" />
                    <circle cx="160" cy="160" r={r} className="ring-hit" strokeWidth="23" />
                  </svg>
                </label>
                <div className="safety-detail" id={`${id}-info`}><strong>{layer.title}</strong><p>{layer.text}</p></div>
              </div>
            )
          })}
        </div>
        <a className="safety-note" href={`#${IDS[locale].faq}`}>{copy.faqNote}</a>
      </Container>
    </section>
  )
}
