'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocale } from '@/components/i18n/locale-provider'

export type WaitlistUse = 'workation' | 'mieten' | 'kaufen'
export type WaitlistStart = 'sofort' | 'spaeter'

type WaitlistState = {
  email: string
  setEmail: (value: string) => void
  use: WaitlistUse
  setUse: (value: WaitlistUse) => void
  start: WaitlistStart
  setStart: (value: WaitlistStart) => void
  /** Springt zum Formular der Warteliste und setzt den Fokus auf das passende Feld. */
  goToForm: () => void
}

const WaitlistContext = createContext<WaitlistState | null>(null)

/** Kampagnen-Links wie /orte?angebot=workation (englisch ?offer=workation|rent|buy) belegen die Nutzung vor. */
const OFFER_PARAM = { de: 'angebot', en: 'offer' } as const
const OFFER_VALUES: Record<string, WaitlistUse> = { workation: 'workation', mieten: 'mieten', kaufen: 'kaufen', rent: 'mieten', buy: 'kaufen' }

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const { locale, ids } = useLocale()
  const [email, setEmail] = useState('')
  const [use, setUse] = useState<WaitlistUse>('workation')
  const [start, setStart] = useState<WaitlistStart>('sofort')

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get(OFFER_PARAM[locale])
    if (value && OFFER_VALUES[value]) setUse(OFFER_VALUES[value])
  }, [locale])

  const value = useMemo<WaitlistState>(
    () => ({
      email,
      setEmail,
      use,
      setUse,
      start,
      setStart,
      goToForm: () => {
        const section = document.getElementById(ids.waitlist)
        if (!section) return
        // Direkt zur Formularkarte: Auf dem Handy steht davor viel Text, der Abschnittsanfang zeigt das Formular nicht.
        const card = section.querySelector<HTMLElement>('[data-waitlist-card]') ?? section
        card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${ids.waitlist}`)
        window.setTimeout(() => section.querySelector<HTMLInputElement>('input[name="vorname"]')?.focus({ preventScroll: true }), 500)
      },
    }),
    [email, use, start, ids.waitlist],
  )

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
}

export function useWaitlist() {
  const value = useContext(WaitlistContext)
  if (!value) throw new Error('useWaitlist braucht den WaitlistProvider')
  return value
}
