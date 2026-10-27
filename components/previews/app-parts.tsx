import { Check, FileText, FolderKanban, HelpCircle, Receipt, Search, Settings, ShieldCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/brand/logo'

const avatarTones = {
  green: 'bg-brand-soft text-brand-ink',
  amber: 'bg-amber-soft text-amber-ink',
  slate: 'bg-[#e3ecef] text-[#24515e]',
  stone: 'bg-surface-2 text-body',
}

export type AvatarTone = keyof typeof avatarTones

export function Avatar({ initials, tone, size = 32 }: { initials: string; tone: AvatarTone; size?: number }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${avatarTones[tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  )
}

const railIcons = [Search, Users, FolderKanban, FileText, ShieldCheck, Receipt]

export function AppRail({ active }: { active: number }) {
  return (
    <div className="flex w-[60px] shrink-0 flex-col items-center gap-1.5 border-r border-line py-4">
      <LogoMark className="mb-4 h-[17px] w-auto text-ink" />
      {railIcons.map((Icon, index) => (
        <span
          key={index}
          className={`grid size-9 place-items-center rounded-[10px] ${index === active ? 'bg-surface text-ink' : 'text-faint'}`}
        >
          <Icon size={17} strokeWidth={1.75} />
        </span>
      ))}
      <span className="mt-auto grid size-9 place-items-center text-faint">
        <HelpCircle size={17} strokeWidth={1.75} />
      </span>
      <span className="grid size-9 place-items-center text-faint">
        <Settings size={17} strokeWidth={1.75} />
      </span>
    </div>
  )
}

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'brand' | 'amber' | 'ink'; children: ReactNode }) {
  const tones = {
    neutral: 'bg-surface text-muted',
    brand: 'bg-brand-soft text-brand-ink',
    amber: 'bg-amber-soft text-amber-ink',
    ink: 'bg-ink text-white',
  }
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[11.5px] font-medium ${tones[tone]}`}>{children}</span>
}

const steps = ['Brief', 'Team', 'Lieferung', 'Abnahme', 'Zahlung']

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, index) => {
        const done = index < current
        const now = index === current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-[12.5px] ${
                now ? 'bg-ink text-white' : done ? 'text-brand-ink' : 'text-faint'
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[11px] font-semibold ${
                  now ? 'bg-white/15' : done ? 'bg-brand-soft' : 'border border-line-strong'
                }`}
              >
                {done ? <Check size={12} strokeWidth={2.5} /> : index + 1}
              </span>
              {label}
            </span>
            {index < steps.length - 1 ? <span className="h-px w-5 bg-line-strong" /> : null}
          </li>
        )
      })}
    </ol>
  )
}
