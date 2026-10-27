import { IDS, TOPIC_PARAM, pageHref, type IdKey, type Locale } from '@/lib/i18n/routes'

// Themen der Kontaktseite. Die drei Leistungen kommen aus dem Menü, „general“ ist alles andere.

export const CONTACT_TOPICS = ['automation', 'training', 'isms', 'general'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]

const ANCHOR: Record<Exclude<ContactTopic, 'general'>, IdKey> = { automation: 'topicAutomation', training: 'topicTraining', isms: 'topicIsms' }

export function contactHref(topic: ContactTopic, locale: Locale) {
  return topic === 'general' ? pageHref('contact', locale) : pageHref('contact', locale, ANCHOR[topic])
}

/** `?thema=ki-schulung` → training; Unbekanntes wird „general“. */
export function topicFromSearch(params: URLSearchParams, locale: Locale): ContactTopic {
  const slug = params.get(TOPIC_PARAM[locale])
  const found = (Object.keys(ANCHOR) as (keyof typeof ANCHOR)[]).find((topic) => IDS[locale][ANCHOR[topic]] === slug)
  return found ?? 'general'
}
