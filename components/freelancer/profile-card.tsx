'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Check } from 'lucide-react'
import { toneClass } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { euro, fill } from '@/lib/i18n/format'
import { completeness, findRole, initialsOf, type Draft } from '@/lib/freelancer/profile'

const placeholder = 'text-[#b4bab6]'

export function ProfileAvatar({ draft, size, className = '' }: { draft: Draft; size: number; className?: string }) {
  const { dict } = useLocale()
  const role = findRole(dict.freelancer.roles, draft.role)
  const initials = initialsOf(draft.name)
  if (!initials) {
    return <span aria-hidden className={`block shrink-0 rounded-full border border-dashed border-line-strong ${className}`} style={{ width: size, height: size }} />
  }
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-semibold transition-colors duration-300 ${role ? toneClass[role.tone] : 'bg-surface text-body'} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {initials}
    </span>
  )
}

export function ModeBadge({ draft }: { draft: Draft }) {
  const { dict } = useLocale()
  const mode = dict.freelancer.workModes.find((item) => item.id === draft.mode)
  if (!mode) return <span aria-hidden className="h-[26px] w-16 shrink-0 rounded-full bg-surface" />
  return (
    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-medium ${mode.id === 'remote' ? 'bg-surface text-muted' : 'bg-brand-soft text-brand-ink'}`}>
      {mode.badge}
    </span>
  )
}

/** Die Profilkarte, wie Unternehmen sie sehen: ohne E-Mail und Telefon. */
export function ProfileCard({ draft, compact = false }: { draft: Draft; compact?: boolean }) {
  const { locale, dict } = useLocale()
  const copy = dict.freelancer.card
  const role = findRole(dict.freelancer.roles, draft.role)
  const availability = dict.freelancer.availability.find((item) => item.id === draft.availability)
  const percent = completeness(draft)
  const complete = percent >= 100
  const name = draft.name.trim()

  return (
    <div className={`rounded-[26px] border border-line bg-white shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.35)] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start gap-3.5 sm:gap-4">
        <ProfileAvatar draft={draft} size={compact ? 48 : 60} />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className={`truncate font-medium leading-tight tracking-[-0.015em] ${compact ? 'text-[19px]' : 'text-[22px]'} ${name ? 'text-ink' : placeholder}`}>{name || copy.namePlaceholder}</p>
          <p className={`truncate text-[15px] ${role ? 'text-muted' : placeholder}`}>{role?.label ?? copy.rolePlaceholder}</p>
        </div>
        <ModeBadge draft={draft} />
      </div>

      <dl className={`grid grid-cols-2 gap-3 rounded-2xl bg-surface ${compact ? 'mt-3 px-3.5 py-2.5' : 'mt-5 p-3.5'}`}>
        <div>
          <dt className="text-[12px] text-faint">{copy.rate}</dt>
          <dd className="text-[16px] font-medium tabular-nums text-ink">{euro(draft.rate, locale)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[12px] text-faint">{copy.available}</dt>
          <dd className={`truncate text-[16px] font-medium ${availability ? 'text-ink' : placeholder}`}>{availability?.card ?? copy.availableOpen}</dd>
        </div>
      </dl>

      <ul className={`flex flex-wrap gap-1.5 ${compact ? 'mt-3 min-h-[30px]' : 'mt-4 min-h-[66px] content-start'}`} aria-label={copy.skillsLabel}>
        <AnimatePresence mode="popLayout" initial={false}>
          {draft.skills.map((skill) => (
            <motion.li
              key={skill}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-medium text-brand-ink"
            >
              <Check aria-hidden size={12} strokeWidth={2.5} />
              {skill}
            </motion.li>
          ))}
        </AnimatePresence>
        {draft.skills.length === 0
          ? [64, 84, 52].map((width) => <li key={width} aria-hidden className="h-[27px] rounded-full bg-surface" style={{ width }} />)
          : null}
      </ul>

      <div className={`flex items-center justify-between gap-3 border-t border-line ${compact ? 'mt-3 pt-3' : 'mt-5 pt-4'}`}>
        <span className="text-[12.5px] text-faint">{copy.selfReported}</span>
        {complete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[12.5px] font-medium text-white">
            <Check aria-hidden size={13} strokeWidth={2.5} />
            {copy.inMatching}
          </span>
        ) : (
          <span className="flex items-center gap-2" aria-label={fill(copy.percentLabel, { percent })}>
            <span className="block h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
              <motion.span className="block h-full rounded-full bg-brand" initial={false} animate={{ width: `${percent}%` }} transition={{ type: 'spring', stiffness: 160, damping: 24 }} />
            </span>
            <span className="w-9 text-right text-[12.5px] tabular-nums text-muted">{fill(dict.common.percent, { n: percent })}</span>
          </span>
        )}
      </div>
    </div>
  )
}

/** Wie gut das Profil zum passenden Beispielprojekt passt. */
export function matchFor(draft: Draft, dict: Dictionary) {
  const role = findRole(dict.freelancer.roles, draft.role ?? 'ki')!
  const scenario = dict.scenarios.find((item) => item.id === role.match.scenario)!
  const needs = role.match.needs.map((need) => ({ ...need, met: draft.skills.includes(need.skill) }))
  return { role, scenario, needs, met: needs.filter((need) => need.met).length }
}

export function MatchTeaser({ draft }: { draft: Draft }) {
  const { dict } = useLocale()
  const copy = dict.freelancer.card
  const { scenario, needs, met } = matchFor(draft, dict)
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_24px_48px_-28px_rgb(14_20_17/0.35)]">
      <p className="text-[12.5px] text-faint">{copy.teaserLabel}</p>
      <p className="mt-0.5 text-[15px] font-medium text-ink">{scenario.title}</p>
      <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-brand-ink">
        <Check aria-hidden size={13} strokeWidth={2.5} />
        {fill(copy.teaserMet, { met, total: needs.length })}
      </p>
    </div>
  )
}
