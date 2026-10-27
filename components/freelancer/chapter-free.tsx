'use client'

import { motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'

export function ChapterFree() {
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.freelancer.free
  return (
    <section id={ids.costs} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="kosten-title">
      <Container className="flex flex-col gap-14">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="05">{copy.label}</ChapterLabel>
          <h2 id="kosten-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[480px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>
        <dl className="grid grid-cols-[minmax(0,1fr)] gap-10 md:grid-cols-2 md:gap-8">
          {copy.figures.map((figure, index) => (
            <div key={figure.value} className="border-t border-ink pt-6">
              {/* Beobachtet wird die Zeile, nicht die Zahl: die liegt anfangs unter der Kante und wäre nie „im Bild“. */}
              <motion.dt initial={reduceMotion ? false : 'hidden'} whileInView="shown" viewport={{ once: true, amount: 0.6 }} className="overflow-hidden">
                <motion.span
                  variants={{ hidden: { y: '100%' }, shown: { y: 0 } }}
                  transition={{ type: 'spring', stiffness: 110, damping: 20, delay: index * 0.15 }}
                  className="block text-[clamp(6rem,15vw,12.5rem)] font-medium leading-[0.9] tracking-[-0.06em] text-ink tabular-nums"
                >
                  {figure.value}
                </motion.span>
              </motion.dt>
              <dd className="mt-4 text-[18px] text-muted">{figure.text}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
