import type { Locale } from '@/lib/i18n/routes'

const euroFormat = {
  de: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
}

/** Euro ohne Nachkommastellen: „920 €“ auf Deutsch, „€920“ auf Englisch. */
export function euro(value: number, locale: Locale) {
  return euroFormat[locale].format(value)
}

/** Setzt Werte in Platzhalter wie {n} ein. Wörterbücher bleiben so reine Daten. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
