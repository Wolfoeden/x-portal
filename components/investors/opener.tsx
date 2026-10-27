'use client'

import Link from 'next/link'
import { MotionConfig, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowDown, ArrowRight, Lock } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { EUROPE_DOTS, projectLonLat } from '@/lib/map/europe'
import { useLocale } from '@/components/i18n/locale-provider'

// Beispielhafte Orte, an denen KI-Freelancer arbeiten. Keine Kundenliste, nur das Bild eines europäischen Netzes.
const CITIES: [number, number][] = [
  [-9.14, 38.72], [-3.7, 40.42], [2.17, 41.39], [2.35, 48.86], [-6.26, 53.35], [4.9, 52.37], [13.4, 52.52],
  [11.58, 48.14], [9.19, 45.46], [16.37, 48.21], [14.42, 50.08], [21.01, 52.23], [18.07, 59.33], [26.1, 44.43], [24.94, 60.17],
]
const [HUB_X, HUB_Y] = projectLonLat(31, 49)
// Ausschnitt ohne den hohen Norden, damit die Karte neben den Text passt.
const VIEW = { y: 250, width: 1000, height: 870 }
const leftOf = (x: number) => `${(x / VIEW.width) * 100}%`
const topOf = (y: number) => `${((y - VIEW.y) / VIEW.height) * 100}%`

function arc(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const bend = 0.22
  // Kontrollpunkt senkrecht zur Strecke, immer nach oben gewölbt.
  const sign = dx >= 0 ? -1 : 1
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + sign * dy * bend).toFixed(1)} ${(my - sign * dx * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function InvestorOpener() {
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.investors.opener
  const points = CITIES.map(([lon, lat]) => projectLonLat(lon, lat))

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative overflow-hidden bg-brand-deep text-white" aria-labelledby="investoren-title">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,#1b5c39_0%,transparent_60%)]" />
        <Container className="relative grid min-h-[calc(100svh-4rem)] grid-cols-[minmax(0,1fr)] content-center gap-10 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6 lg:py-10">
          <div className="relative z-10 flex flex-col">
            <p className="text-[14px] text-[#bfd8c8]">{copy.label}</p>
            <h1 id="investoren-title" className="mt-5 text-[clamp(3.25rem,7.2vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em]">
              {copy.words.map((word, index) => (
                <motion.span
                  key={word}
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.1 + index * 0.12 }}
                  className={`block ${index === 0 ? 'text-[#7fa58f]' : index === 1 ? 'text-[#a9c8b5]' : 'text-white'}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <p className="mt-7 max-w-[440px] text-[18px] leading-relaxed text-[#cfe2d6]">
              {copy.text}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={`#${ids.deck}`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {copy.deck}
                <ArrowRight aria-hidden size={17} strokeWidth={2} />
              </Link>
              <Link
                href={`#${ids.roadmap}`}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {copy.roadmap}
                <ArrowDown aria-hidden size={16} strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="relative -mx-5 sm:mx-0 lg:-mr-[10%] lg:-mt-6">
            <svg viewBox={`0 ${VIEW.y} ${VIEW.width} ${VIEW.height}`} className="h-auto w-full" role="img" aria-label={copy.mapLabel}>
              <motion.path d={EUROPE_DOTS} fill="#bfd8c8" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 1.2 }} />
              {points.map(([x, y], index) => (
                <motion.path
                  key={`arc-${index}`}
                  d={arc(x, y, HUB_X, HUB_Y)}
                  fill="none"
                  stroke="#bfd8c8"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.38 }}
                  transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay: 0.9 + index * 0.09 }}
                />
              ))}
              {points.map(([x, y], index) => (
                <motion.circle
                  key={`city-${index}`}
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#e8f2ec"
                  initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 + index * 0.06 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ))}
              <circle cx={HUB_X} cy={HUB_Y} r="22" fill="none" stroke="#fff" strokeWidth="2.5" className="hub-pulse" />
              <circle cx={HUB_X} cy={HUB_Y} r="12" fill="#fff" />
            </svg>
            <div className="pointer-events-none absolute rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)]" style={{ left: `calc(${leftOf(HUB_X)} - 200px)`, top: `calc(${topOf(HUB_Y)} + 30px)` }}>
              <p className="text-[15px] font-medium">{copy.hubName}</p>
              <p className="text-[13px] text-muted">{copy.hubStatus}</p>
            </div>
            {/* Ohne Ortsangabe: Der Standort der Datenbank wird bewusst nicht genannt, nur die EU. */}
            <div className="pointer-events-none absolute left-[6%] top-[4%] inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur">
              <Lock aria-hidden size={12} strokeWidth={2} />
              {copy.dataSite}
            </div>
          </div>

          <dl className="relative z-10 grid grid-cols-[minmax(0,1fr)] gap-6 border-t border-white/15 pt-6 sm:grid-cols-3 lg:col-span-2">
            {copy.figures.map((figure) => (
              <div key={figure.value}>
                <dt className="text-[clamp(1.75rem,2.6vw,2.25rem)] font-medium tracking-[-0.03em] tabular-nums">{figure.value}</dt>
                <dd className="mt-1 max-w-[260px] text-[14px] text-[#bfd8c8]">{figure.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </MotionConfig>
  )
}
