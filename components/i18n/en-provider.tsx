'use client'

import type { ReactNode } from 'react'
import { en } from '@/lib/i18n/en'
import { LocaleProvider } from '@/components/i18n/locale-provider'

// One cacheable language module across navigations instead of embedding it in every page.
export function EnglishProvider({ children }: { children: ReactNode }) {
  return <LocaleProvider locale="en" dict={en}>{children}</LocaleProvider>
}
