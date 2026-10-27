'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'

// Nach der Roadmap „Von Talenten zu zehn Hubs“ von XPORTAL; Texte im Wörterbuch.
export function ChapterRoadmap() {
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.investors.roadmap
  const milestones = copy.milestones
  const trackRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 0.85', 'end 0.45'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [reached, setReached] = useState(reduceMotion ? milestones.length : 0)
  useMotionValueEvent(progress, 'change', (value) => setReached(Math.min(milestones.length, Math.floor(value * milestones.length + 0.35))))
  const shown = reduceMotion ? milestones.length : reached

  return (
    <section id={ids.roadmap} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="roadmap-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="06">{copy.label}</ChapterLabel>
          <h2 id="roadmap-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
        </div>

        <div className="relative">
          {/* Linie: am Desktop waagerecht, auf dem Handy senkrecht. */}
          <div aria-hidden className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-0.5 bg-line md:left-0 md:top-[11px] md:h-0.5 md:w-full" />
          <motion.div
            aria-hidden
            className="absolute left-[11px] top-2 h-[calc(100%-16px)] w-0.5 origin-top bg-brand md:hidden"
            style={{ scaleY: reduceMotion ? 1 : progress }}
          />
          <motion.div aria-hidden className="absolute left-0 top-[11px] hidden h-0.5 w-full origin-left bg-brand md:block" style={{ scaleX: reduceMotion ? 1 : progress }} />
          <ol ref={trackRef} className="relative grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-4 md:gap-6">
            {milestones.map((milestone, index) => {
              const on = index < shown
              return (
                <li key={milestone.title} className="flex gap-5 md:flex-col md:gap-6">
                  <span
                    className={`relative mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 md:mt-0 ${
                      on ? 'border-brand bg-brand' : 'border-line-strong bg-white'
                    }`}
                  >
                    {on && milestone.live ? <span className="size-2 rounded-full bg-white" /> : null}
                  </span>
                  <span className={`flex flex-col gap-2 transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="text-[14px] font-medium text-brand-ink">{milestone.when}</span>
                    <span className="text-[22px] font-medium leading-tight tracking-[-0.015em] text-ink">{milestone.title}</span>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[12.5px] font-medium ${milestone.live ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'}`}>
                      {milestone.status}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="rounded-[28px] bg-surface p-6 md:p-8">
          <p className="text-[13px] text-faint">{copy.parallelLabel}</p>
          <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
            {copy.parallel.map((item) => (
              <li key={item.title} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4">
                <span className="text-[16px] font-medium text-ink">{item.title}</span>
                <span className="rounded-full border border-line-strong px-2.5 py-1 text-[12.5px] text-muted">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-faint">{copy.disclaimer}</p>
      </Container>
    </section>
  )
}
