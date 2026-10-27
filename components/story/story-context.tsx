'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Scenario } from '@/lib/demo/scenarios'
import { useLocale } from '@/components/i18n/locale-provider'
import { NO_CHOICES, applyChoices, type Choices, type ModelChoice } from '@/lib/story/choices'

// Das Projekt aus dem Aufmacher trägt durch alle Kapitel. Ohne eigene Eingabe gilt das Beispiel.
// Was der Auftraggeber am Team festlegt (eigene Leute, KI-Modell), sehen alle Kapitel gleich.
type Ask = { sentence: string; id: number }

type Story = {
  /** Mit den Festlegungen des Auftraggebers. */
  scenario: Scenario
  /** Wie es aus Demo oder Analyse kam. */
  base: Scenario
  query: string | null
  setStory: (scenario: Scenario, query: string | null) => void
  choices: Choices
  toggleInternal: (memberId: string) => void
  setModel: (model: ModelChoice) => void
  ask: Ask | null
  askFor: (sentence: string) => void
}

const StoryContext = createContext<Story | null>(null)

export function StoryProvider({ children }: { children: ReactNode }) {
  const { dict, locale } = useLocale()
  const [base, setBase] = useState<Scenario>(dict.scenarios[0])
  const [query, setQuery] = useState<string | null>(null)
  const [choices, setChoices] = useState<Choices>(NO_CHOICES)
  const [ask, setAsk] = useState<Ask | null>(null)

  // Ein neues Projekt beginnt ohne Festlegungen.
  const setStory = useCallback((next: Scenario, nextQuery: string | null) => {
    setBase(next)
    setQuery(nextQuery)
    setChoices(NO_CHOICES)
  }, [])

  const toggleInternal = useCallback((memberId: string) => {
    setChoices((current) => ({
      ...current,
      internal: current.internal.includes(memberId) ? current.internal.filter((id) => id !== memberId) : [...current.internal, memberId],
    }))
  }, [])

  const setModel = useCallback((model: ModelChoice) => setChoices((current) => ({ ...current, model })), [])

  const askFor = useCallback((sentence: string) => {
    setAsk({ sentence, id: Date.now() })
  }, [])

  const scenario = useMemo(() => applyChoices(base, choices, dict, locale), [base, choices, dict, locale])
  const value = useMemo(
    () => ({ scenario, base, query, setStory, choices, toggleInternal, setModel, ask, askFor }),
    [scenario, base, query, setStory, choices, toggleInternal, setModel, ask, askFor],
  )
  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
}

export function useStory() {
  const story = useContext(StoryContext)
  if (!story) throw new Error('useStory braucht den StoryProvider')
  return story
}
