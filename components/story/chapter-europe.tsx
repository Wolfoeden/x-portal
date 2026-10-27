'use client'

import { motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Cloud, Database, FlaskConical, Lock, MessageSquareOff, ScrollText, Server } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useStory } from '@/components/story/story-context'
import { useMediaQuery } from '@/lib/use-media-query'
import { ChapterLabel, TalentAvatar, chapterTitle } from '@/components/story/talent-avatar'
import { kindOf, roleOf, talentOf } from '@/lib/demo/scenarios'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

const factIcons = [Database, ScrollText, MessageSquareOff]

export function ChapterEurope() {
  const { scenario, choices } = useStory()
  const { dict, ids } = useLocale()
  const copy = dict.home.europe
  const reduceMotion = useReducedMotion()
  // Gestapelt auf dem Handy: dort gleiten die Zonen nicht auseinander.
  const sideBySide = useMediaQuery('(min-width: 768px)', true)
  // Die Zonen gelten für externe Freelancer; Ihr Team und die Agenten arbeiten nach Ihren Regeln.
  const freelancers = scenario.team.filter((member) => kindOf(member) === 'freelancer')
  const onSite = freelancers.filter((member) => talentOf(member).onSite)
  const remote = freelancers.filter((member) => !talentOf(member).onSite)
  const model = scenario.ai ? choices.model : null
  const facts = [
    ...copy.facts.map((text, index) => ({ text, Icon: factIcons[index] })),
    ...(model === 'own' ? [{ text: copy.modelOwn, Icon: Server }] : []),
    ...(model === 'ours' ? [{ text: copy.modelOurs, Icon: Server }] : []),
    ...(model === 'claude' || model === 'openai' ? [{ text: fill(copy.modelCloud, { provider: dict.choices.model.options[model].provider }), Icon: Cloud }] : []),
  ]

  const zone = (side: 'left' | 'right') => ({
    initial: reduceMotion || !sideBySide ? false : { x: 0 },
    whileInView: { x: sideBySide ? (side === 'left' ? -10 : 10) : 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { type: 'spring' as const, stiffness: 90, damping: 18, delay: 0.25 },
  })

  return (
    <section id={ids.data} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="daten-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="04">{copy.label}</ChapterLabel>
          <h2 id="daten-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[460px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <div className="relative grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 md:gap-0">
          <motion.div {...zone('left')} className="flex min-h-[300px] flex-col justify-between rounded-[28px] bg-brand-soft p-7 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] font-medium text-brand-ink">{copy.onSiteZone}</p>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-brand-ink">
                <Lock aria-hidden size={13} strokeWidth={2} />
                {copy.access}
              </span>
            </div>
            <ul className="mt-10 flex flex-wrap gap-5">
              {!onSite.length ? <li className="text-[14px] text-brand-ink/70">{copy.emptyZone}</li> : null}
              {onSite.map((member) => {
                const talent = talentOf(member)
                return (
                  <li key={member.id} className="flex items-center gap-3">
                    <TalentAvatar talent={talent} size={52} className="ring-4 ring-white" />
                    <span>
                      <span className="block text-[16px] font-medium text-ink">{talent.name}</span>
                      <span className="block text-[13.5px] text-brand-ink/80">{roleOf(member, dict.talentRoles)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.div>

          <motion.div {...zone('right')} className="flex min-h-[300px] flex-col justify-between rounded-[28px] border border-line bg-white p-7 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] font-medium text-ink">{copy.remoteZone}</p>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-muted">
                <FlaskConical aria-hidden size={13} strokeWidth={2} />
                {copy.synthetic}
              </span>
            </div>
            <ul className="mt-10 flex flex-wrap gap-5">
              {!remote.length ? <li className="text-[14px] text-faint">{copy.emptyZone}</li> : null}
              {remote.map((member) => {
                const talent = talentOf(member)
                return (
                  <li key={member.id} className="flex items-center gap-3">
                    <TalentAvatar talent={talent} size={52} />
                    <span>
                      <span className="block text-[16px] font-medium text-ink">{talent.name}</span>
                      <span className="block text-[13.5px] text-muted">{roleOf(member, dict.talentRoles)}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          {facts.map(({ text, Icon }) => (
            <li key={text} className="inline-flex items-center gap-2 text-[15px] text-body">
              <Icon aria-hidden size={17} strokeWidth={1.75} className="shrink-0 text-brand" />
              {text}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
