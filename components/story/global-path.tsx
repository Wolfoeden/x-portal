import { NodeSymbol } from '@/components/diagrams/node-symbol'
import { UsersRound, Waypoints } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

function StationDrawing({ stage }: { stage: number }) {
  return (
    <svg className="goal-drawing" viewBox="0 0 160 90" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      {stage === 0 && <>
        <path d="m22 58 58 27 58-27-58-27Z" className="goal-ground" />
        <path d="m41 58 39 18 39-18" className="goal-guide" />
        <g transform="translate(47 9) scale(1.38)"><NodeSymbol /></g>
      </>}
      {stage === 1 && <>
        <path d="m35 61 52-37 42 34-94 3" className="goal-link" strokeDasharray="3 4" />
        <g transform="translate(15 40) scale(.84)"><NodeSymbol /></g>
        <g transform="translate(67 6) scale(.84)" className="goal-future"><NodeSymbol /></g>
        <g transform="translate(108 39) scale(.84)" className="goal-future"><NodeSymbol /></g>
      </>}
      {stage === 2 && <>
        <ellipse cx="78" cy="55" rx="65" ry="23" className="goal-guide" />
        <ellipse cx="78" cy="55" rx="43" ry="15" className="goal-guide" />
        <g transform="translate(55 23)"><NodeSymbol /></g>
        {[[26, 46], [125, 42], [89, 74]].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`} fill="white">
            <circle cy="-6" r="4" /><path d="M-7 6a7 7 0 0 1 14 0v2H-7Z" />
          </g>
        ))}
      </>}
    </svg>
  )
}

export function GlobalPath({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).home.goals
  return (
    <section id={IDS[locale].goals} aria-labelledby="ziele-title" className="diagram-section goals-section">
      <Container>
        <header className="diagram-heading">
          <div><p className="diagram-kicker">{copy.label}</p><h2 id="ziele-title">{copy.title}</h2></div>
          <p className="diagram-body">{copy.note}</p>
        </header>
        <ol className="goal-path" data-goal-path="">
          {copy.steps.map((step, i) => (
            <li key={step.rank}>
              <StationDrawing stage={i} />
              <span className="goal-mobile-symbol" aria-hidden="true">
                {i === 0 && <svg viewBox="0 0 48 44"><NodeSymbol /></svg>}
                {i === 1 && <Waypoints strokeWidth={1.5} />}
                {i === 2 && <UsersRound strokeWidth={1.5} />}
              </span>
              <div className="goal-rail" aria-hidden="true"><i /></div>
              <div className="goal-description">
                <div className="goal-rank"><span>{step.rank}</span>{i === 0 && <span>{copy.known} · {copy.now}</span>}{i === 1 && <span>{copy.open}</span>}</div>
                <h3>{step.title}</h3><p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
