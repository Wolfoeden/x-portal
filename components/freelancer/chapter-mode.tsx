'use client'

import { useState } from 'react'
import { LayoutGroup, motion } from 'motion/react'
import Link from 'next/link'
import { ArrowRight, FlaskConical, Lock } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, TalentAvatar, chapterTitle } from '@/components/story/talent-avatar'
import { useDraft } from '@/components/freelancer/draft-context'
import { ProfileAvatar } from '@/components/freelancer/profile-card'
import type { WorkMode } from '@/lib/freelancer/profile'
import { talentById } from '@/lib/demo/scenarios'
import { useLocale } from '@/components/i18n/locale-provider'
import { pagePath } from '@/lib/i18n/routes'

const onSiteTeam = ['mara', 'tobias']
const remoteTeam = ['noah', 'ben']

export function ChapterMode() {
  const { shown, own, setDraft } = useDraft()
  const { dict, ids, locale } = useLocale()
  const copy = dict.freelancer.mode
  const zones = dict.home.europe
  const [localMode, setLocalMode] = useState<WorkMode>(shown.mode ?? 'both')
  const mode = own && shown.mode ? shown.mode : localMode

  const choose = (value: WorkMode) => {
    setLocalMode(value)
    if (own) setDraft((current) => ({ ...current, mode: value }))
  }

  // Ein Profil wandert zwischen den Zonen; bei „Beides“ steht es zusätzlich rechts.
  const you = (layoutId: string) => (
    <motion.span layoutId={layoutId} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="flex items-center gap-3">
      <ProfileAvatar draft={shown} size={56} className="ring-4 ring-white" />
      <span>
        <span className="block text-[16px] font-medium text-ink">{shown.name}</span>
        <span className="block text-[13px] text-brand-ink">{copy.you}</span>
      </span>
    </motion.span>
  )

  return (
    <section id={ids.workplace} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="arbeitsort-title">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[720px] flex-col gap-5">
            <ChapterLabel number="04">{copy.label}</ChapterLabel>
            <h2 id="arbeitsort-title" className={`${chapterTitle} text-ink`}>
              {copy.title}
            </h2>
            <p className="max-w-[480px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
          </div>
          <div role="radiogroup" aria-label={copy.label} className="inline-flex w-fit rounded-full bg-surface p-1">
            {dict.freelancer.workModes.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={mode === item.id}
                onClick={() => choose(item.id)}
                className={`relative h-10 rounded-full px-4 text-[14.5px] font-medium transition-colors ${mode === item.id ? 'text-white' : 'text-muted hover:text-ink'}`}
              >
                {mode === item.id ? <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 320, damping: 30 }} /> : null}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <LayoutGroup>
          <div className="relative grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
            <div className="flex min-h-[300px] flex-col justify-between rounded-[28px] bg-brand-soft p-7 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] font-medium text-brand-ink">{zones.onSiteZone}</p>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-brand-ink">
                  <Lock aria-hidden size={13} strokeWidth={2} />
                  {zones.access}
                </span>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                {mode !== 'remote' ? you('you') : null}
                {onSiteTeam.map((id) => (
                  <TalentAvatar key={id} talent={talentById.get(id)!} size={44} className="opacity-70 ring-4 ring-white" />
                ))}
              </div>
            </div>

            <div className="flex min-h-[300px] flex-col justify-between rounded-[28px] border border-line bg-white p-7 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] font-medium text-ink">{zones.remoteZone}</p>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-muted">
                  <FlaskConical aria-hidden size={13} strokeWidth={2} />
                  {zones.synthetic}
                </span>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                {mode !== 'onsite' ? you(mode === 'remote' ? 'you' : 'you-also') : null}
                {remoteTeam.map((id) => (
                  <TalentAvatar key={id} talent={talentById.get(id)!} size={44} className="opacity-60" />
                ))}
              </div>
            </div>
          </div>
        </LayoutGroup>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
          {copy.hubNote}
          <Link href={pagePath('places', locale)} className="inline-flex items-center gap-1.5 font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
            {copy.hubLink}
            <ArrowRight aria-hidden size={14} strokeWidth={2} />
          </Link>
        </p>
      </Container>
    </section>
  )
}
