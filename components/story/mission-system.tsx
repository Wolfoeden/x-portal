'use client'

import Link from 'next/link'
import { Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'
import { pagePath } from '@/lib/i18n/routes'

const NODES = [
  { id: 'human', x: 80, y: 70 },
  { id: 'place', x: 300, y: 36 },
  { id: 'supply', x: 500, y: 86 },
  { id: 'org', x: 460, y: 250 },
  { id: 'tech', x: 110, y: 236 },
] as const

const CENTER = { x: 290, y: 168 }

/** Erster Blick: die Mission, darunter das lernende System als ruhige Zeichnung. */
export function MissionSystem() {
  const { locale, dict, ids } = useLocale()
  const copy = dict.home.mission
  const names = Object.fromEntries(copy.nodes.map((node) => [node.id, node]))

  return (
    <section id={ids.mission} aria-labelledby="mission-title" className="scroll-mt-16 bg-surface text-ink">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .system-line { stroke-dasharray: 8 10; animation: system-flow 18s linear infinite }
          .system-core { transform-origin: 290px 168px; animation: system-breathe 7s ease-in-out infinite }
          @keyframes system-flow { to { stroke-dashoffset: -180 } }
          @keyframes system-breathe { 50% { transform: scale(1.04) } }
        }
      `}</style>
      <Container className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <p className="text-[13px] tracking-[0.14em] text-brand-ink uppercase">{copy.label}</p>
          <h1 id="mission-title" className="max-w-[16ch] text-[clamp(2.4rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-balance">
            {copy.title}
          </h1>
          <p className="max-w-[38rem] text-[17px] leading-relaxed text-body md:text-[18px]">{copy.lead}</p>
          <p className="max-w-[38rem] text-[17px] leading-relaxed text-body md:text-[18px]">{copy.lead2}</p>
          <div className="mt-3 flex flex-col gap-2 border-l border-brand pl-4">
            <p className="text-[12px] tracking-[0.12em] text-brand-ink uppercase">{copy.visionLabel}</p>
            {copy.vision.map((line) => (
              <p key={line} className="max-w-[36rem] text-[15px] leading-snug text-muted">
                {line}
              </p>
            ))}
          </div>
          <Link
            href={`${pagePath('places', locale)}#${ids.stars}`}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-4 py-2 text-[14px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {copy.toPlace}
          </Link>
        </div>
        <figure className="relative">
          <div className="rounded-[28px] border border-line bg-white p-5 sm:hidden">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 font-medium text-brand-ink">
              <span aria-hidden className="size-2.5 rounded-full bg-brand" />{copy.center}
            </p>
            <ul className="ml-4">
              {copy.nodes.map((node) => (
                <li key={node.id} className="relative pt-3 pl-5 before:absolute before:inset-y-0 before:left-0 before:border-l before:border-brand/40 last:before:h-6 after:absolute after:top-6 after:left-0 after:w-3 after:border-t after:border-brand/40">
                  <p className="font-medium text-ink">{node.name}</p>
                  <p className="text-sm text-muted">{node.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <svg viewBox="0 0 580 320" className="hidden h-auto w-full rounded-[28px] border border-line bg-white sm:block" role="img" aria-label={copy.diagramLabel}>
            {NODES.map((node) => (
              <line key={node.id} x1={CENTER.x} y1={CENTER.y} x2={node.x} y2={node.y} stroke="var(--color-brand)" strokeOpacity="0.55" strokeWidth="1.4" className="system-line" />
            ))}
            <g className="system-core">
              <circle cx={CENTER.x} cy={CENTER.y} r="46" fill="var(--color-brand-soft)" stroke="var(--color-brand)" strokeWidth="1.5" />
              <circle cx={CENTER.x} cy={CENTER.y} r="7" fill="var(--color-brand)" />
              <text x={CENTER.x} y={CENTER.y + 28} textAnchor="middle" fill="var(--color-brand)" fontSize="13" fontFamily="inherit">
                {copy.center}
              </text>
            </g>
            {NODES.map((node) => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="5" fill="var(--color-brand)" />
                <text x={node.x} y={node.y - 16} textAnchor="middle" fill="var(--color-ink)" fontSize="14" fontFamily="inherit">
                  {names[node.id]?.name}
                </text>
                <text x={node.x} y={node.y + 22} textAnchor="middle" fill="var(--color-muted)" fontSize="11" fontFamily="inherit">
                  {names[node.id]?.text}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="mt-3 text-[13px] text-muted">{copy.caption}</figcaption>
        </figure>
      </Container>
    </section>
  )
}
