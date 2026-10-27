import type { IdKey, PageKey } from '@/lib/i18n/routes'

/** Gibt einen Wert mit festem Typ zurück, damit Wörterbücher genaue Typen behalten (z. B. Seiten-Schlüssel statt string). */
export function typed<T>(value: T): T {
  return value
}

export type NavLink = { label: string; page: PageKey; anchor?: IdKey }
export type MenuEntry = NavLink & { text: string; icon: 'talent' | 'projects' | 'hubs' | 'automation' | 'training' | 'isms' }
export type FooterColumn = { title: string; links: NavLink[] }
export type TeamMember = { name: string; role: string; photo?: string; pending?: boolean }
export type Door = { key: 'companies' | 'freelancers' | 'investors'; who: string; title: string; text: string; action: string }
export type Faq = { question: string; answer: string }
