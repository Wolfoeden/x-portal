'use client'

import { MotionConfig, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Building2, FolderKanban, Users, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { LogoMark } from '@/components/brand/logo'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'

const R = 150
const C = 200
const at = (degrees: number, radius = R) => {
  const rad = (degrees * Math.PI) / 180
  return [C + radius * Math.cos(rad), C + radius * Math.sin(rad)] as const
}

// Im Uhrzeigersinn: Talente bilden Teams für Projekte, Projekte füllen die Hubs, Hubs ziehen Talente an.
const nodeShapes: { angle: number; icon: LucideIcon }[] = [
  { angle: -90, icon: Users },
  { angle: 30, icon: FolderKanban },
  { angle: 150, icon: Building2 },
]

export function ChapterLoop() {
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.investors.loop
  const nodes = nodeShapes.map((shape, index) => ({ ...shape, ...copy.nodes[index] }))
  return (
    <MotionConfig reducedMotion="user">
      <section id={ids.loop} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="kreislauf-title">
        <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <ChapterLabel number="02">{copy.label}</ChapterLabel>
            <h2 id="kreislauf-title" className={`${chapterTitle} text-ink`}>
              {copy.title}
            </h2>
            <p className="max-w-[460px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
            <ol className="mt-4 flex flex-col">
              {nodes.map(({ icon: Icon, name, text }, index) => (
                <li key={name} className="flex gap-4 border-t border-line py-4">
                  <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                  <span>
                    <span className="flex items-center gap-2 text-[17px] font-medium text-ink">
                      <Icon aria-hidden size={17} strokeWidth={1.75} className="text-brand" />
                      {name}
                    </span>
                    <span className="mt-0.5 block text-[15px] text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[520px]">
            <svg viewBox="0 0 400 400" className="absolute inset-0 size-full overflow-visible">
              <motion.circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke="#d5dbd6"
                strokeWidth="1.5"
                initial={reduceMotion ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ rotate: -90, transformOrigin: '200px 200px' }}
              />
              {[-30, 90, 210].map((angle) => {
                const [x, y] = at(angle)
                return (
                  <path key={angle} d="M-5 -6 L3 0 L-5 6" fill="none" stroke="#17643b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${angle + 90})`} />
                )
              })}
              <motion.g animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }} style={{ transformOrigin: '200px 200px' }}>
                <circle cx={C} cy={C - R} r="5" fill="#17643b" />
              </motion.g>
            </svg>
            <div className="absolute left-1/2 top-1/2 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-soft">
              <LogoMark className="w-[46%] text-brand-deep" />
            </div>
            {nodes.map(({ angle, icon: Icon, name }, index) => {
              const [x, y] = at(angle)
              return (
                <motion.div
                  key={name}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.4 + index * 0.25 }}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
                  style={{ left: `${(x / 400) * 100}%`, top: `${(y / 400) * 100}%` }}
                >
                  <span className="grid size-16 place-items-center rounded-full border border-line bg-white text-brand shadow-[0_1px_2px_rgb(14_20_17/0.05),0_16px_32px_-18px_rgb(14_20_17/0.35)] sm:size-[72px]">
                    <Icon size={26} strokeWidth={1.6} />
                  </span>
                  <span className="rounded-full bg-white px-2 text-[15px] font-medium text-ink">{name}</span>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </section>
    </MotionConfig>
  )
}
