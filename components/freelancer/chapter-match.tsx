'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Building2, Check, Clock, Mail, Plus } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { useDraft } from '@/components/freelancer/draft-context'
import { ProfileAvatar, matchFor } from '@/components/freelancer/profile-card'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

export function ChapterMatch() {
  const { shown, own, setDraft } = useDraft()
  const { dict, ids } = useLocale()
  const copy = dict.freelancer.match
  const { role, scenario, needs, met } = matchFor(shown, dict)
  const reduceMotion = useReducedMotion()
  const listRef = useRef<HTMLUListElement>(null)
  const inView = useInView(listRef, { once: true, amount: 0.5 })
  const [ticked, setTicked] = useState(0)

  // Die Anforderungen haken sich nacheinander ab, sobald die Liste im Bild ist.
  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setTicked(needs.length + 1)
      return
    }
    if (ticked > needs.length) return
    const timer = setTimeout(() => setTicked((value) => value + 1), ticked === 0 ? 500 : 380)
    return () => clearTimeout(timer)
  }, [inView, ticked, needs.length, reduceMotion])

  return (
    <section id={ids.requests} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="anfragen-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="02">{copy.label}</ChapterLabel>
          <h2 id="anfragen-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <div className="relative mx-auto flex w-full max-w-[600px] flex-col gap-4">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            className="mr-10 self-start rounded-[22px] rounded-bl-md bg-surface px-5 py-4 sm:mr-24"
          >
            <p className="flex items-center gap-1.5 text-[12.5px] text-faint">
              <Building2 aria-hidden size={13} strokeWidth={1.75} />
              {copy.requestLabel}
            </p>
            <p className="mt-1 text-[17px] leading-snug text-ink">{fill(dict.common.quote, { text: scenario.sentence })}</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.15 }}
            className="rounded-[26px] border border-line bg-white p-5 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.35)] sm:p-7"
          >
            <div className="flex items-center gap-3.5">
              <ProfileAvatar draft={shown} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-medium text-ink">{shown.name}</p>
                <p className="truncate text-[14px] text-muted">{role.label}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[12.5px] font-medium tabular-nums text-brand-ink">
                {fill(copy.metBadge, { met, total: needs.length })}
              </span>
            </div>

            <ul ref={listRef} className="mt-5 flex flex-col">
              {needs.map((need, index) => {
                const visible = ticked > index
                return (
                  <li key={need.skill} className="flex items-center gap-3 border-t border-line py-3">
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                        visible ? (need.met ? 'scale-100 bg-brand text-white' : 'scale-100 bg-amber-soft text-amber-ink') : 'scale-75 border border-line-strong'
                      }`}
                    >
                      {visible ? need.met ? <Check aria-hidden size={14} strokeWidth={2.5} /> : <Plus aria-hidden size={14} strokeWidth={2.5} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] text-ink">{need.label}</span>
                      <span className={`block text-[13px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'} ${need.met ? 'text-brand-ink' : 'text-amber-ink'}`}>
                        {need.met ? fill(copy.yourProfile, { skill: need.skill }) : copy.missing}
                      </span>
                    </span>
                    {visible && !need.met && own ? (
                      <button
                        type="button"
                        onClick={() => setDraft((value) => ({ ...value, skills: value.skills.includes(need.skill) ? value.skills : [...value.skills, need.skill] }))}
                        className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/40"
                      >
                        {copy.add}
                      </button>
                    ) : null}
                  </li>
                )
              })}
              <li className="flex items-center gap-3 border-t border-line py-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                    ticked > needs.length ? 'scale-100 bg-amber-soft text-amber-ink' : 'scale-75 border border-line-strong'
                  }`}
                >
                  {ticked > needs.length ? <Clock aria-hidden size={13} strokeWidth={2.25} /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15.5px] text-ink">{role.match.open}</span>
                  <span className={`block text-[13px] text-amber-ink transition-opacity duration-300 ${ticked > needs.length ? 'opacity-100' : 'opacity-0'}`}>{copy.discuss}</span>
                </span>
              </li>
            </ul>

            <p
              className={`mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-[13.5px] font-medium text-white transition-all duration-500 ${
                ticked > needs.length ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <Mail aria-hidden size={15} strokeWidth={1.75} />
              {copy.intro}
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
