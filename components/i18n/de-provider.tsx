'use client'

import type { ReactNode } from 'react'
import { de } from '@/lib/i18n/de'
import { LocaleProvider } from '@/components/i18n/locale-provider'

// One cacheable language module across navigations instead of embedding it in every page.
export function GermanProvider({ children }: { children: ReactNode }) {
  return <LocaleProvider locale="de" dict={de}>{children}</LocaleProvider>
}
