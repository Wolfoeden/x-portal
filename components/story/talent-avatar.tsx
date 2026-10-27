import { Bot, Building2 } from 'lucide-react'
import { kindOf, talentOf, type TeamMember, type Talent, type Tone } from '@/lib/demo/scenarios'
import type { Dictionary } from '@/lib/i18n/dictionary'

export const toneClass: Record<Tone, string> = {
  green: 'bg-brand-soft text-brand-ink',
  amber: 'bg-amber-soft text-amber-ink',
  slate: 'bg-[#e3ecef] text-[#24515e]',
  stone: 'bg-surface-2 text-body',
}

// KI-Agenten und Ihr Team haben ein Zeichen statt Initialen.
const kindClass = { agent: 'bg-ink text-white', client: 'bg-[#e3ecef] text-[#24515e]' }

export function avatarClass(talent: Talent) {
  return talent.kind === 'agent' || talent.kind === 'client' ? kindClass[talent.kind] : toneClass[talent.tone]
}

export function AvatarFace({ talent, size }: { talent: Talent; size: number }) {
  const icon = Math.round(size * 0.46)
  if (talent.kind === 'agent') return <Bot aria-hidden size={icon} strokeWidth={1.75} />
  if (talent.kind === 'client') return <Building2 aria-hidden size={icon} strokeWidth={1.75} />
  // Nur echte Profile mit Einwilligung haben ein Foto; der Name steht daneben, deshalb ein leeres alt.
  if (talent.photo) return <img src={talent.photo} alt="" loading="lazy" decoding="async" className="size-full rounded-full object-cover" />
  return <>{talent.initials}</>
}

export function TalentAvatar({ talent, size, className = '' }: { talent: Talent; size: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${avatarClass(talent)} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      <AvatarFace talent={talent} size={size} />
    </span>
  )
}

/** Kleines Schild rechts auf der Karte: Arbeitsort bei Freelancern, „KI-Agent“ bei Agenten, „intern“ bei Ihrem Team. */
export function memberBadge(member: TeamMember, dict: Dictionary): { label: string; className: string } {
  const kind = kindOf(member)
  if (kind === 'agent') return { label: dict.agents.role, className: 'bg-ink text-white' }
  if (kind === 'client') return { label: dict.choices.internalBadge, className: 'bg-[#e3ecef] text-[#24515e]' }
  return talentOf(member).onSite
    ? { label: dict.common.onSite, className: 'bg-brand-soft text-brand-ink' }
    : { label: dict.common.remote, className: 'bg-surface text-muted' }
}

export function ChapterLabel({ number, children, tone = 'dark' }: { number: string; children: string; tone?: 'dark' | 'light' }) {
  return (
    <p className={`flex items-center gap-3 text-[13px] tracking-[0.02em] ${tone === 'light' ? 'text-[#bfd8c8]' : 'text-faint'}`}>
      <span className="tabular-nums">{number}</span>
      <span aria-hidden className={`h-px w-8 ${tone === 'light' ? 'bg-[#bfd8c8]/50' : 'bg-line-strong'}`} />
      {children}
    </p>
  )
}

export const chapterTitle = 'text-[clamp(2.5rem,5.4vw,4.75rem)] font-medium leading-[0.98] tracking-[-0.04em] text-balance'
