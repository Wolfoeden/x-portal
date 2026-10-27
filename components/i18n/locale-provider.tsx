'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

type LocaleState = { locale: Locale; dict: Dictionary; ids: (typeof IDS)[Locale] }

const LocaleContext = createContext<LocaleState | null>(null)

/** Das Layout reicht nur das Wörterbuch der eigenen Sprache herein; die andere Sprache landet nicht im Browser. */
export function LocaleProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  const value = useMemo(() => ({ locale, dict, ids: IDS[locale] }), [locale, dict])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale braucht den LocaleProvider')
  return value
}
