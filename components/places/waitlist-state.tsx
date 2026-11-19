'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLocale } from '@/components/i18n/locale-provider'

type WaitlistState = {
  email: string
  setEmail: (value: string) => void
  /** Springt zum Formular der Whitelist und setzt den Fokus auf die E-Mail. */
  goToForm: () => void
}

const WaitlistContext = createContext<WaitlistState | null>(null)

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const { ids } = useLocale()
  const [email, setEmail] = useState('')

  const value = useMemo<WaitlistState>(
    () => ({
      email,
      setEmail,
      goToForm: () => {
        const section = document.getElementById(ids.waitlist)
        if (!section) return
        const card = section.querySelector<HTMLElement>('[data-waitlist-card]') ?? section
        card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
        window.history.replaceState(null, '', `#${ids.waitlist}`)
        window.setTimeout(() => card.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true }), 500)
      },
    }),
    [email, ids.waitlist],
  )

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>
}

export function useWaitlist() {
  const value = useContext(WaitlistContext)
  if (!value) throw new Error('useWaitlist braucht den WaitlistProvider')
  return value
}
