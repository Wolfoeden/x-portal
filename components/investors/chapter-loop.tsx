'use client'

import { MotionConfig, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { House, Network, NotebookPen, Sprout, Undo2, Users, Workflow, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { LogoMark, Wordmark } from '@/components/brand/logo'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'

/**
 * Zielmodell als Kreislauf: Menschen verbinden → Wert schaffen → Nodes entwickeln → leben und arbeiten
 * → lernen und verbessern → weitere Nodes aufbauen, und am nächsten Standort von vorn. In der Mitte XPORTAL.
 * Ab md als Kreis mit Bögen und Pfeilen, darunter als nummerierte Liste. Texte im Wörterbuch.
 */

const ICONS: LucideIcon[] = [Users, Workflow, House, Sprout, NotebookPen, Network]
const C = 500 // Mitte der Zeichenfläche 1000 × 1000
const RING = 330 // Radius des Kreises mit den Bögen
const SPOT = 375 // Radius, auf dem die Stationen stehen
const GAP = 22 // so viel Grad bleiben um jede Station frei

const polar = (degrees: number, radius: number) => {
  const rad = (degrees * Math.PI) / 180
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)] as const
}
// Sechs Stationen im Uhrzeigersinn, oben beginnend.
const ANGLES = [-90, -30, 30, 90, 150, 210]

function arcPath(from: number, to: number) {
  const [x1, y1] = polar(from, RING)
  const [x2, y2] = polar(to, RING)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${RING} ${RING} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export function ChapterLoop() {
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.investors.loop
  const steps = copy.steps.map((step, index) => ({ ...step, icon: ICONS[index], angle: ANGLES[index] }))

  return (
    <MotionConfig reducedMotion="user">
      <section id={ids.loop} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="kreislauf-title">
        <Container className="flex flex-col gap-14 md:gap-10">
          <div className="flex max-w-[860px] flex-col gap-5">
            <ChapterLabel number="02">{copy.label}</ChapterLabel>
            <h2 id="kreislauf-title" className={`${chapterTitle} text-ink`}>
              {copy.title}
            </h2>
            <p className="max-w-[640px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
          </div>

          {/* Ab md: der Kreis. Die Liste darunter ist für Screenreader und schmale Bildschirme. */}
          <div role="img" aria-label={copy.diagramLabel} className="relative mx-auto hidden aspect-square w-full max-w-[920px] md:block">
            <svg viewBox="0 0 1000 1000" aria-hidden className="absolute inset-0 size-full overflow-visible">
              <defs>
                <marker id="loop-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                  <path d="M1 1 L8 5 L1 9" fill="none" stroke="#17643b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {ANGLES.map((angle, index) => (
                <motion.path
                  key={angle}
                  d={arcPath(angle + GAP, angle + 60 - GAP)}
                  fill="none"
                  stroke="#c9d7ce"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#loop-arrow)"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.25 + index * 0.18 }}
                />
              ))}
              {/* Ein Punkt läuft langsam den Kreis entlang: der Kreislauf ist nie fertig. */}
              <motion.g animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }} style={{ transformOrigin: '500px 500px' }}>
                <circle cx={C} cy={C - RING} r="5" fill="#17643b" />
              </motion.g>
            </svg>

            {/* Mitte: XPORTAL in der CI, darunter die drei Bausteine. */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute left-1/2 top-1/2 flex w-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 text-center"
            >
              <span className="grid size-[72px] place-items-center rounded-full bg-brand-soft">
                <LogoMark className="w-[44px] text-brand-deep" />
              </span>
              <Wordmark className="h-auto w-full max-w-[210px] text-brand-deep" title="XPORTAL" />
              <p className="text-[15px] text-muted">{copy.centerLine}</p>
              <span aria-hidden className="flex items-center gap-0">
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="flex items-center">
                    {dot > 0 ? <span className="h-px w-7 bg-line-strong" /> : null}
                    <span className="size-2.5 rounded-full bg-brand" />
                  </span>
                ))}
              </span>
              <p className="text-[14px] text-faint">{copy.centerNote}</p>
            </motion.div>

            {steps.map(({ icon: Icon, title, text, angle }, index) => {
              const [x, y] = polar(angle, SPOT)
              return (
                <motion.div
                  key={title}
                  aria-hidden
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.18 }}
                  className="absolute flex w-[25%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
                  style={{ left: `${x / 10}%`, top: `${y / 10}%` }}
                >
                  <span className="flex items-center gap-2.5 text-brand">
                    <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="text-[clamp(1.05rem,1.6vw,1.375rem)] font-medium leading-tight tracking-[-0.015em] text-ink">{title}</span>
                  <span className="text-[clamp(0.85rem,1.15vw,1rem)] leading-relaxed text-muted">{text}</span>
                </motion.div>
              )
            })}
          </div>

          {/* Schmale Bildschirme und Screenreader: dieselben sechs Schritte als Liste. */}
          <ol className="flex flex-col md:sr-only">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-4 border-t border-line py-4">
                <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                <span>
                  <span className="flex items-center gap-2 text-[17px] font-medium text-ink">
                    <Icon aria-hidden size={17} strokeWidth={1.75} className="text-brand" />
                    {title}
                  </span>
                  <span className="mt-0.5 block text-[15px] text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mx-auto flex max-w-[760px] items-start gap-3 text-[16px] leading-relaxed text-ink md:text-center">
            <Undo2 aria-hidden size={18} strokeWidth={1.75} className="mt-1 shrink-0 text-brand" />
            {copy.closing}
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:mt-6 md:grid-cols-2">
            <article className="rounded-[28px] border border-line p-7 md:p-8">
              <h3 className="text-[20px] font-medium tracking-[-0.015em] text-ink">{copy.flowsTitle}</h3>
              <ul className="mt-4 flex flex-col">
                {copy.flows.map((flow) => (
                  <li key={flow} className="border-t border-line py-3 text-[15px] leading-relaxed text-muted">
                    {flow}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-[28px] bg-brand-deep p-7 text-white md:p-8">
              <h3 className="text-[20px] font-medium tracking-[-0.015em]">{copy.scaleTitle}</h3>
              <p className="mt-4 text-[16px] leading-relaxed text-[#cfe2d6]">{copy.scale}</p>
            </article>
          </div>
        </Container>
      </section>
    </MotionConfig>
  )
}
