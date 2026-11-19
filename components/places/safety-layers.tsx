'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/** Schutzschichten von außen nach innen. Auf dem Desktop öffnet Scrollen sie, mobil stehen sie untereinander. */
export function SafetyLayers() {
  const { ids, dict } = useLocale()
  const copy = dict.places.safety
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <section ref={ref} id={ids.safety} aria-labelledby="schutz-title" className="scroll-mt-16 border-b border-line bg-[#f6f4ef] lg:h-[240vh]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <Container className="grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-0">
          <div>
            <p className="text-[13px] tracking-[0.14em] text-[#7a4d0c] uppercase">{copy.label}</p>
            <h2 id="schutz-title" className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.04em] text-[#0f1016]">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-[28rem] text-[16px] leading-relaxed text-[#3c403c]">{copy.text}</p>
            <p className="mt-4 max-w-[28rem] text-[14px] leading-snug text-[#5c615c]">{copy.faqNote}</p>
          </div>
          <ol className="flex flex-col gap-3 lg:hidden">
            {copy.layers.map((layer) => (
              <li key={layer.id} className="rounded-[22px] border border-[#0f1016]/10 bg-white p-4">
                <p className="text-[12px] tracking-[0.14em] text-[#7a4d0c] uppercase">{layer.title}</p>
                <p className="mt-1 text-[15px] leading-snug text-[#0f1016]">{layer.text}</p>
              </li>
            ))}
          </ol>
          <ol className="relative mx-auto hidden h-[520px] w-full max-w-[460px] lg:block">
            {copy.layers.map((layer, index) => (
              <Layer key={layer.id} index={index} total={copy.layers.length} title={layer.title} text={layer.text} progress={scrollYProgress} reduce={reduce} />
            ))}
          </ol>
        </Container>
      </div>
    </section>
  )
}

function Layer({
  index,
  total,
  title,
  text,
  progress,
  reduce,
}: {
  index: number
  total: number
  title: string
  text: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  reduce: boolean
}) {
  const start = index / total
  const end = (index + 0.85) / total
  const passed = useTransform(progress, [start, end], [0, 1])
  const y = useTransform(passed, [0, 1], [0, -70])
  const opacity = useTransform(passed, [0, 1], [1, index === total - 1 ? 1 : 0])
  const offset = index * 14
  return (
    <motion.li
      style={reduce ? { top: 8 + index * 92, left: 12, right: 12 } : { top: offset, left: offset, right: offset, y, opacity, zIndex: total - index }}
      className="absolute rounded-[22px] border border-[#0f1016]/10 bg-white p-4 shadow-[0_18px_40px_-28px_rgb(15_16_22/0.45)]"
    >
      <p className="text-[12px] tracking-[0.14em] text-[#7a4d0c] uppercase">{title}</p>
      <p className="mt-1 text-[15px] leading-snug text-[#0f1016]">{text}</p>
    </motion.li>
  )
}
