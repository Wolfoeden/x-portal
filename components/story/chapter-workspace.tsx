'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { Check, FileSignature, Lock, Mail } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { DiscordLogo, SlackLogo } from '@/components/brand/channel-logos'
import { useStory } from '@/components/story/story-context'
import { ChapterLabel, TalentAvatar, chapterTitle, memberBadge } from '@/components/story/talent-avatar'
import { kindOf, reviewerOf, roleOf, talentOf, teamMix, type Scenario } from '@/lib/demo/scenarios'
import { useLocale } from '@/components/i18n/locale-provider'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { fill } from '@/lib/i18n/format'

type Channel = 'discord' | 'slack' | 'email'
type LogEntry = { step: number; actor: string; text: string; channel?: Channel }

/** Das Protokoll eines Beispielprojekts: wer was in welchem Schritt getan hat. Kanäle bekommen nur einen Hinweis. */
function logEntries(scenario: Scenario, dict: Dictionary): LogEntry[] {
  const log = dict.home.workspace.log
  const agents = scenario.team.filter((member) => kindOf(member) === 'agent')
  const delivering = scenario.team.find((member) => kindOf(member) === 'freelancer') ?? scenario.team.find((member) => kindOf(member) === 'client')
  const entries: LogEntry[] = [
    { step: 0, actor: 'XPORTAL', text: log.brief },
    { step: 1, actor: 'XPORTAL', text: fill(log.team, { mix: teamMix(scenario.team, dict.common.mix) }), channel: 'discord' },
  ]
  if (scenario.team.some((member) => kindOf(member) === 'client')) entries.push({ step: 1, actor: dict.choices.yourTeam, text: log.client })
  for (const agent of agents) entries.push({ step: 1, actor: talentOf(agent).name, text: fill(log.agent, { name: reviewerOf(agent, scenario.team, dict.choices.ownTeam) }) })
  if (delivering && scenario.deliveries[0]) {
    entries.push({ step: 2, actor: talentOf(delivering).name, text: fill(log.delivered, { item: scenario.deliveries[0] }), channel: 'slack' })
  }
  for (const agent of agents) entries.push({ step: 2, actor: reviewerOf(agent, scenario.team), text: fill(log.reviewed, { agent: talentOf(agent).name }) })
  entries.push({ step: 3, actor: 'XPORTAL', text: log.acceptance, channel: 'email' })
  entries.push({ step: 3, actor: log.you, text: log.accepted })
  entries.push({ step: 4, actor: 'XPORTAL', text: log.invoice })
  return entries
}

function ChannelMark({ channel }: { channel: Channel }) {
  if (channel === 'discord') return <DiscordLogo className="size-[15px]" />
  if (channel === 'slack') return <SlackLogo className="size-[13px]" />
  return <Mail aria-hidden size={14} strokeWidth={1.75} className="text-ink" />
}

function StepBody({ step, scenario, budgetChanged, query, dict }: { step: number; scenario: Scenario; budgetChanged: boolean; query: string | null; dict: Dictionary }) {
  const copy = dict.home.workspace
  if (step === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[18px] leading-snug text-ink">{fill(dict.common.quote, { text: query ?? scenario.sentence })}</p>
        <div className="flex flex-wrap gap-2">
          {scenario.requirements.map((item) => (
            <span key={item.label} className="rounded-full bg-surface px-3 py-1.5 text-[13px] text-body">
              {item.label}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-faint">{copy.briefNote}</p>
      </div>
    )
  }
  if (step === 1) {
    return (
      <div className="flex flex-col gap-3">
        {scenario.team.map((member) => {
          const talent = talentOf(member)
          const badge = memberBadge(member, dict)
          return (
            <div key={member.id} className="flex items-center gap-3">
              <TalentAvatar talent={talent} size={36} />
              <p className="min-w-0 flex-1 truncate text-[15px] text-ink">
                <span className="font-medium">{talent.name}</span>
                <span className="text-faint"> · {roleOf(member, dict.talentRoles)}</span>
              </p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${badge.className}`}>{badge.label}</span>
            </div>
          )
        })}
        <p className="text-[13px] leading-snug text-faint">
          {copy.teamNote}{' '}
          {fill(copy.parties, {
            list: [copy.partyClient, teamMix(scenario.team.filter((member) => kindOf(member) !== 'client'), dict.common.mix), copy.partyLead].filter(Boolean).join(' · '),
          })}
        </p>
      </div>
    )
  }
  if (step === 2) {
    return (
      <ul className="flex flex-col gap-3">
        {scenario.deliveries.map((item) => (
          <li key={item} className="flex items-center gap-3 text-[16px] text-ink">
            <span className="grid size-6 place-items-center rounded-full bg-brand text-white">
              <Check aria-hidden size={14} strokeWidth={2.5} />
            </span>
            {item}
          </li>
        ))}
        <li className="text-[13px] text-faint">{copy.deliveryNote}</li>
      </ul>
    )
  }
  if (step === 3) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[18px] text-ink">{copy.acceptanceTitle}</p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-10 items-center rounded-full bg-brand px-4 text-[14px] font-medium text-white">{copy.acceptDigital}</span>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong px-4 text-[14px] font-medium text-ink">
            <FileSignature aria-hidden size={15} strokeWidth={1.75} />
            {copy.acceptPdf}
          </span>
        </div>
        <p className="text-[13px] text-faint">{copy.acceptanceNote}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-faint">{copy.paymentLabel}</p>
      <p className="text-[40px] font-medium leading-none tracking-[-0.03em] text-ink tabular-nums">{scenario.budget}</p>
      <p className="text-[15px] text-muted">
        {copy.paymentNote}
        {budgetChanged ? ` ${dict.choices.budgetNote}` : null}
      </p>
    </div>
  )
}

export function ChapterWorkspace() {
  const { scenario, base, query } = useStory()
  const { dict, ids } = useLocale()
  const copy = dict.home.workspace
  const steps = copy.steps
  const reduceMotion = useReducedMotion()
  const trackRef = useRef<HTMLElement>(null)
  const [scrolledStep, setScrolledStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (value) => setScrolledStep(Math.max(0, Math.min(4, Math.floor(value * 5.4)))))
  const step = reduceMotion ? 4 : scrolledStep
  // Die letzten vier Einträge; neue kommen unten dazu.
  const entries = logEntries(scenario, dict).filter((entry) => entry.step <= step)
  const recent = entries.slice(-4)
  const latest = entries.at(-1)

  return (
    <section ref={trackRef} id={ids.platform} aria-labelledby="workspace-title" className={reduceMotion ? 'py-28' : 'relative h-[320vh]'}>
      <div className={reduceMotion ? '' : 'sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden'}>
        <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <ChapterLabel number="03">{copy.label}</ChapterLabel>
            <h2 id="workspace-title" className={`${chapterTitle} text-ink`}>
              {copy.title}
            </h2>
            <p className="max-w-[420px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
            <ol className="mt-4 hidden flex-col gap-1 lg:flex">
              {steps.map((label, index) => {
                const done = index < step
                const now = index === step
                return (
                  <li key={label} className={`flex items-center gap-3 py-1.5 text-[17px] transition-colors duration-300 ${now ? 'text-ink' : done ? 'text-brand-ink' : 'text-[#a3aaa5]'}`}>
                    <span
                      className={`grid size-7 place-items-center rounded-full text-[12px] font-semibold transition-colors duration-300 ${
                        now ? 'bg-ink text-white' : done ? 'bg-brand-soft text-brand-ink' : 'border border-line-strong'
                      }`}
                    >
                      {done ? <Check aria-hidden size={14} strokeWidth={2.5} /> : index + 1}
                    </span>
                    {label}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.3)] lg:grid lg:grid-cols-[minmax(0,1fr)_250px]">
              <div className="p-5 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[14px] text-faint">{fill(copy.project, { title: scenario.title })}</p>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[12px] text-muted">
                    <Lock aria-hidden size={12} strokeWidth={2} />
                    {copy.location}
                  </span>
                </div>
                <ol className="mt-4 flex gap-1.5">
                  {steps.map((label, index) => (
                    <li key={label} className="min-w-0 flex-1">
                      <span className={`block h-1.5 rounded-full transition-colors duration-500 ${index <= step ? 'bg-brand' : 'bg-surface-2'}`} />
                      <span className={`mt-2 block truncate text-[12px] ${index === step ? 'font-medium text-ink' : 'text-faint'}`}>{label}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 min-h-[230px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${scenario.id}-${step}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.28 }}
                    >
                      <StepBody step={step} scenario={scenario} budgetChanged={scenario.budget !== base.budget} query={query} dict={dict} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <aside aria-label={copy.log.title} className="hidden flex-col gap-3 border-l border-line bg-surface/60 p-4 lg:flex">
                <p className="px-1 text-[12.5px] text-faint">{copy.log.title}</p>
                <ol className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {recent.map((entry) => (
                      <motion.li
                        key={`${scenario.id}-${entry.step}-${entry.actor}-${entry.text}`}
                        layout={!reduceMotion}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                        className="flex items-start gap-2.5 rounded-2xl border border-line bg-white p-2.5 shadow-[0_1px_2px_rgb(14_20_17/0.04)]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">{entry.actor}</span>
                          <span className="block text-[12.5px] leading-snug text-muted">{entry.text}</span>
                        </span>
                        {entry.channel ? (
                          <span className="grid size-6 shrink-0 place-items-center rounded-[8px] border border-line bg-white">
                            <ChannelMark channel={entry.channel} />
                          </span>
                        ) : null}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ol>
                <p className="mt-auto px-1 text-[12px] leading-snug text-faint">{copy.log.note}</p>
              </aside>
            </div>

            {latest ? (
              <p className="mt-4 truncate text-[13px] text-body lg:hidden">
                <span className="text-faint">{copy.log.title} · </span>
                <span className="font-medium text-ink">{latest.actor}</span> {latest.text}
              </p>
            ) : null}
            <p className="mt-2 flex items-center gap-2.5 text-[13px] text-muted lg:hidden">
              <SlackLogo className="size-4" />
              <DiscordLogo className="size-[17px]" />
              <Mail aria-hidden size={16} strokeWidth={1.75} className="text-ink" />
              {copy.mobileNote}
            </p>
          </div>
        </Container>
      </div>
    </section>
  )
}
