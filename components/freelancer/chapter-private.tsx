'use client'

import { motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowRight, BadgeCheck, CalendarDays, FileText, Lock, Mail, Phone } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useDraft } from '@/components/freelancer/draft-context'
import { ProfileCard } from '@/components/freelancer/profile-card'
import { useLocale } from '@/components/i18n/locale-provider'

const rowIcons = [Mail, Phone, FileText, CalendarDays]

export function ChapterPrivate() {
  const { shown } = useDraft()
  const { dict, ids } = useLocale()
  const copy = dict.freelancer.private
  const reduceMotion = useReducedMotion()

  return (
    <section id={ids.private} className="scroll-mt-16 bg-surface py-28 md:py-40" aria-labelledby="privat-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div className="relative order-2 mx-auto w-full max-w-[520px] pt-16 lg:order-1 lg:pt-24">
          {/* Hinten: was nur XPORTAL sieht. Vorn: was Unternehmen sehen. */}
          <motion.div
            initial={reduceMotion ? false : { x: 0, y: 40, rotate: 0 }}
            whileInView={{ x: 28, y: 0, rotate: 2.5 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
            className="absolute inset-x-6 top-0 rounded-[26px] bg-ink p-5 pb-28 text-white sm:p-6 sm:pb-32"
          >
            <p className="flex items-center gap-2 text-[13px] text-white/60">
              <Lock aria-hidden size={13} strokeWidth={2} />
              {copy.privateOnly}
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {copy.rows.map((label, index) => {
                const Icon = rowIcons[index]
                return (
                  <li key={label} className="flex items-center gap-2 text-[14px] text-white/85">
                    <Icon aria-hidden size={15} strokeWidth={1.75} className="text-white/50" />
                    {label}
                  </li>
                )
              })}
            </ul>
          </motion.div>
          <div className="relative">
            <p className="mb-2 ml-3 inline-flex rounded-full bg-white px-3 py-1 text-[12.5px] font-medium text-ink shadow-[0_1px_2px_rgb(14_20_17/0.08)]">{copy.companiesSee}</p>
            <ProfileCard draft={shown} />
          </div>
        </div>

        <div className="order-1 flex flex-col gap-5 lg:order-2">
          <ChapterLabel number="03">{copy.label}</ChapterLabel>
          <h2 id="privat-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[14px]">
            <span className="rounded-full border border-line-strong bg-white px-3 py-1.5 text-muted">{copy.selfReported}</span>
            <ArrowRight aria-hidden size={16} strokeWidth={1.75} className="text-faint" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 font-medium text-white">
              <BadgeCheck aria-hidden size={15} strokeWidth={2} />
              {copy.verified}
            </span>
          </div>
          <p className="max-w-[440px] text-[14.5px] leading-relaxed text-muted">{copy.verifyText}</p>
        </div>
      </Container>
    </section>
  )
}
