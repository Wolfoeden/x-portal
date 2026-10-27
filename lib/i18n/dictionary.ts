import { de } from '@/lib/i18n/de'
import { en } from '@/lib/i18n/en'
import type { Locale } from '@/lib/i18n/routes'

/** Die Form aller Wörterbücher ist die des deutschen. */
export type Dictionary = typeof de

/** Nur auf dem Server verwenden; Client-Komponenten lesen über useLocale(), damit nur eine Sprache im Browser landet. */
export function getDictionary(locale: Locale): Dictionary {
  return locale === 'de' ? de : en
}
