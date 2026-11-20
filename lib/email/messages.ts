import type { RequestTopic } from '@/lib/contact/topics'
import type { Locale } from '@/lib/i18n/routes'

// Texte der Vorgangsmails. Reiner Text, kurz. Die Bestätigung an Absender wiederholt keine Eingaben:
// Sonst ließe sich das Formular nutzen, um beliebigen Text an fremde Adressen zu schicken.

const TOPIC_NAMES: Record<Locale, Record<RequestTopic, string>> = {
  de: { automation: 'KI-Automatisierung', training: 'KI-Schulung', isms: 'ISMS', places: 'Orte und Node001', general: 'Allgemein', investors: 'Whitepaper und Deck' },
  en: { automation: 'AI automation', training: 'AI training', isms: 'ISMS', places: 'Places and Node001', general: 'General', investors: 'Whitepaper and deck' },
}

type ContactMail = { topic: RequestTopic; name: string; email: string; company?: string | null; message: string; locale: Locale }

/** An das Postfach des Betreibers. Antworten gehen direkt an den Absender. */
export function contactNotification(input: ContactMail) {
  return {
    subject: `Neue Kontaktanfrage: ${TOPIC_NAMES.de[input.topic]} · ${input.name}`.slice(0, 160),
    text: [
      `Thema: ${TOPIC_NAMES.de[input.topic]}`,
      `Name: ${input.name}`,
      `E-Mail: ${input.email}`,
      `Firma: ${input.company || '–'}`,
      `Sprache: ${input.locale === 'en' ? 'Englisch' : 'Deutsch'}`,
      '',
      input.message,
      '',
      '—',
      'Steht auch in Supabase unter ops.posteingang. „Antworten“ schreibt direkt an den Absender.',
    ].join('\n'),
  }
}

/** An den Absender, in seiner Sprache. */
export function contactConfirmation(input: Pick<ContactMail, 'topic' | 'locale'>) {
  if (input.locale === 'en') {
    return {
      subject: 'Your request to XPORTAL',
      text: [
        'Hello,',
        '',
        `thank you for your request about “${TOPIC_NAMES.en[input.topic]}”. It has reached us, and we will get back to you personally by email.`,
        '',
        'XPORTAL',
        'https://x-portal.eu',
        '',
        'You are receiving this email because this address was entered in the contact form on x-portal.eu. If that was not you, simply ignore it.',
      ].join('\n'),
    }
  }
  return {
    subject: 'Ihre Anfrage bei XPORTAL',
    text: [
      'Guten Tag,',
      '',
      `danke für Ihre Anfrage zu „${TOPIC_NAMES.de[input.topic]}“. Sie ist bei uns angekommen, wir melden uns persönlich per E-Mail.`,
      '',
      'XPORTAL',
      'https://x-portal.eu',
      '',
      'Sie erhalten diese Mail, weil diese Adresse im Kontaktformular auf x-portal.eu eingetragen wurde. Waren Sie das nicht, ignorieren Sie sie einfach.',
    ].join('\n'),
  }
}

/** Ein Freelancer hat sein Profil veröffentlicht. */
export function freelancerPublishedNotification(input: { firstName: string; roleTitle: string | null; email: string | null }) {
  return {
    subject: `Neues Profil veröffentlicht: ${input.firstName}${input.roleTitle ? ` · ${input.roleTitle}` : ''}`.slice(0, 160),
    text: [
      `${input.firstName}${input.roleTitle ? `, ${input.roleTitle}` : ''} hat ein Profil veröffentlicht und ist ab jetzt im Matching.`,
      `Konto: ${input.email ?? '–'}`,
      '',
      'Details in Supabase unter ops.freelancer und ops.posteingang.',
    ].join('\n'),
  }
}

// Whitelist Node001 (Seite Orte; im Code „waitlist“). Die Seite spricht in Du-Form, die Mails auch.

// Datenbankwert „rent“ bleibt intern; nach außen heißt die Option seit 17.11.2026 „Länger bleiben“.
const INTEREST_NAMES: Record<string, string> = { workation: 'Workation', rent: 'Länger bleiben' }
const TIMING_NAMES: Record<string, string> = { now: 'Sofort', later: 'Nur Interesse, für später' }

/** Bestätigungslink für die Whitelist Node001, in der Sprache des Eintrags. Wiederholt keine Eingaben, auch nicht den Vornamen. */
export function waitlistConfirmLink(input: { locale: Locale; link: string }) {
  if (input.locale === 'en') {
    return {
      subject: 'Please confirm: whitelist for Node001',
      text: [
        'Hello,',
        '',
        'please confirm that you would like to join the whitelist for Node001:',
        '',
        input.link,
        '',
        'The link is valid for seven days. Joining is not binding and involves no payment. We will write to you once terms and services are set, and you will be among the first to hear when a living unit becomes free.',
        '',
        'If you later no longer want to hear from us, simply reply to one of our emails and we will remove your address.',
        '',
        'XPORTAL',
        'https://x-portal.eu/en/places',
        '',
        'You are receiving this email because this address was entered on the whitelist at x-portal.eu. If that was not you, simply ignore it; without confirmation nothing happens.',
      ].join('\n'),
    }
  }
  return {
    subject: 'Bitte bestätigen: Whitelist Node001',
    text: [
      'Hallo,',
      '',
      'bitte bestätige, dass du in die Whitelist für Node001 möchtest:',
      '',
      input.link,
      '',
      'Der Link gilt sieben Tage. Der Eintrag ist unverbindlich und ohne Zahlung. Wir schreiben dir, sobald Konditionen und Leistungen feststehen, und du erfährst als Erstes, wann eine Wohneinheit frei wird.',
      '',
      'Möchtest du später keine Nachrichten mehr von uns, antworte einfach auf eine unserer Mails, dann löschen wir deine Adresse.',
      '',
      'XPORTAL',
      'https://x-portal.eu/orte',
      '',
      'Du bekommst diese Mail, weil diese Adresse auf x-portal.eu in die Whitelist eingetragen wurde. Warst du das nicht, ignoriere sie einfach; ohne Bestätigung passiert nichts.',
    ].join('\n'),
  }
}

/** An das Postfach des Betreibers, sobald ein Eintrag bestätigt ist. Die Felder heißen wie in public.waitlist_entries. */
const WORK_NAMES: Record<string, string> = { has_work: 'hat schon Arbeit', seeks_work: 'sucht Arbeit über XPORTAL' }

export function waitlistNotification(input: { first_name: string | null; last_name?: string | null; email: string; country?: string | null; work?: string | null; interest: string | null; timing: string | null; campaign: string | null; locale: string }) {
  const use = input.interest ? (INTEREST_NAMES[input.interest] ?? input.interest) : null
  const start = input.timing ? (TIMING_NAMES[input.timing] ?? input.timing) : null
  const subject = use && start ? `Whitelist Node001 bestätigt: ${use} · ${start}` : `Whitelist Node001 bestätigt: ${input.email}`
  return {
    subject: subject.slice(0, 160),
    text: [
      `Nutzung: ${use ?? '–'}`,
      `Ab wann: ${start ?? '–'}`,
      `Name: ${[input.first_name, input.last_name].filter(Boolean).join(' ') || '–'}`,
      `E-Mail: ${input.email}`,
      `Land: ${input.country || '–'}`,
      `Arbeit: ${(input.work && WORK_NAMES[input.work]) || '–'}`,
      `Kampagne: ${input.campaign || '–'}`,
      `Sprache: ${input.locale === 'en' ? 'Englisch' : 'Deutsch'}`,
      '',
      '—',
      'Bestätigt per Link. Alle Einträge in Supabase unter public.waitlist_entries, die Zählung unter ops.warteliste.',
    ].join('\n'),
  }
}
