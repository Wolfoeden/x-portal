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
    <section id={ids.mission} aria-labelledby="mission-title" className="scroll-mt-16 bg-[#0f1016] text-white">
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
          <p className="text-[13px] tracking-[0.14em] text-[#ffca06] uppercase">{copy.label}</p>
          <h1 id="mission-title" className="max-w-[16ch] text-[clamp(2.4rem,5vw,4.4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-balance">
            {copy.title}
          </h1>
          <p className="max-w-[38rem] text-[17px] leading-relaxed text-white/80 md:text-[18px]">{copy.lead}</p>
          <p className="max-w-[38rem] text-[17px] leading-relaxed text-white/80 md:text-[18px]">{copy.lead2}</p>
          <div className="mt-3 flex flex-col gap-2 border-l border-[#ffca06]/70 pl-4">
            <p className="text-[12px] tracking-[0.12em] text-[#ffca06] uppercase">{copy.visionLabel}</p>
            {copy.vision.map((line) => (
              <p key={line} className="max-w-[36rem] text-[15px] leading-snug text-white/75">
                {line}
              </p>
            ))}
          </div>
          <Link
            href={`${pagePath('places', locale)}#${ids.stars}`}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#ffca06] px-4 py-2 text-[14px] font-medium text-[#0f1016] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffca06]"
          >
            {copy.toPlace}
          </Link>
        </div>
        <figure className="relative">
          <svg viewBox="0 0 580 320" className="h-auto w-full" role="img" aria-label={copy.diagramLabel}>
            <rect width="580" height="320" rx="28" fill="#16181f" />
            {NODES.map((node) => (
              <line key={node.id} x1={CENTER.x} y1={CENTER.y} x2={node.x} y2={node.y} stroke="#ffca06" strokeOpacity="0.55" strokeWidth="1.4" className="system-line" />
            ))}
            <g className="system-core">
              <circle cx={CENTER.x} cy={CENTER.y} r="46" fill="#ffca06" fillOpacity="0.14" stroke="#ffca06" strokeWidth="1.5" />
              <circle cx={CENTER.x} cy={CENTER.y} r="7" fill="#ffca06" />
              <text x={CENTER.x} y={CENTER.y + 28} textAnchor="middle" fill="#ffca06" fontSize="13" fontFamily="inherit">
                {copy.center}
              </text>
            </g>
            {NODES.map((node) => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="5" fill="#ffca06" />
                <text x={node.x} y={node.y - 16} textAnchor="middle" fill="white" fontSize="14" fontFamily="inherit">
                  {names[node.id]?.name}
                </text>
                <text x={node.x} y={node.y + 22} textAnchor="middle" fill="white" fillOpacity="0.62" fontSize="11" fontFamily="inherit">
                  {names[node.id]?.text}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="mt-3 text-[13px] text-white/55">{copy.caption}</figcaption>
        </figure>
      </Container>
    </section>
  )
}
