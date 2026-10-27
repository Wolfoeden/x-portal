'use client'

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { EMPTY_DRAFT, type Draft } from '@/lib/freelancer/profile'
import { useLocale } from '@/components/i18n/locale-provider'

type DraftState = {
  /** Was der Assistent gerade zeigt: erst die Demo, nach dem ersten Klick das eigene Profil. */
  draft: Draft
  setDraft: Dispatch<SetStateAction<Draft>>
  /** Hat die Person selbst begonnen? */
  own: boolean
  startOwn: () => void
  /** Profil für die Kapitel weiter unten: das eigene, sonst ein ruhiges Beispiel statt der laufenden Demo. */
  shown: Draft
}

const DraftContext = createContext<DraftState | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const { dict } = useLocale()
  const sample = dict.freelancer.samples[0]
  const yourName = dict.freelancer.card.namePlaceholder
  const [draft, setDraft] = useState<Draft>(sample)
  const [own, setOwn] = useState(false)

  const value = useMemo<DraftState>(() => {
    const shown = own ? { ...draft, role: draft.role ?? sample.role, name: draft.name.trim() ? draft.name : yourName } : sample
    return {
      draft,
      setDraft,
      own,
      startOwn: () => {
        if (own) return
        setOwn(true)
        setDraft(EMPTY_DRAFT)
      },
      shown,
    }
  }, [draft, own, sample, yourName])

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useDraft() {
  const value = useContext(DraftContext)
  if (!value) throw new Error('useDraft braucht einen DraftProvider')
  return value
}
