'use client'

import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { useWaitlist } from '@/components/places/waitlist-state'

/** E-Mail im Hero: übernimmt die Adresse in die Warteliste und springt zum Formular. */
export function HeroEmailForm({ id = 'orte-hero-email' }: { id?: string }) {
  const copy = useLocale().dict.places.hero
  const { email, setEmail, goToForm } = useWaitlist()
  return (
    <form
      aria-label={copy.submit}
      onSubmit={(event) => {
        event.preventDefault()
        goToForm()
      }}
      className="w-full max-w-[560px]"
    >
      <div className="flex flex-col gap-2 rounded-[22px] bg-white p-2 shadow-[0_1px_2px_rgb(0_0_0/0.1),0_24px_48px_-24px_rgb(0_0_0/0.55)] focus-within:ring-2 focus-within:ring-[#8fd9ab] sm:flex-row sm:items-center sm:pl-5">
        <label htmlFor={id} className="sr-only">
          {copy.emailLabel}
        </label>
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={copy.emailPlaceholder}
          className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[17px] text-ink outline-none placeholder:text-faint sm:px-0"
        />
        <button type="submit" className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand px-[22px] text-[15px] font-medium text-white transition-[background-color,box-shadow] hover:bg-brand-hover hover:shadow-[0_12px_26px_-12px_rgb(23_100_59/0.7)]">
          {copy.submit}
          <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  )
}

/** Knopf einer Angebotskarte: wählt die Nutzung im Formular vor und springt dorthin. */
export function OfferAction({ use, label, className }: { use: 'workation' | 'mieten' | 'kaufen'; label: string; className: string }) {
  const { ids } = useLocale()
  const { setUse, goToForm } = useWaitlist()
  return (
    <a
      href={`#${ids.waitlist}`}
      onClick={(event) => {
        event.preventDefault()
        setUse(use)
        goToForm()
      }}
      className={`group inline-flex h-11 items-center gap-2 self-start rounded-full px-5 text-[15px] font-medium transition-[background-color,box-shadow] ${className}`}
    >
      {label}
      <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
    </a>
  )
}

/** Weißer Knopf im Hero („Warteliste · Workation, Miete, später Kauf“): führt direkt zum Formular. */
export function HeroPill({ label }: { label: string }) {
  const { ids } = useLocale()
  const { goToForm } = useWaitlist()
  return (
    <a
      href={`#${ids.waitlist}`}
      onClick={(event) => {
        event.preventDefault()
        goToForm()
      }}
      className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[clamp(0.95rem,1.3vw,1.125rem)] font-medium text-brand-deep shadow-[0_12px_30px_-14px_rgb(0_0_0/0.6)] transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {label}
      <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
    </a>
  )
}
