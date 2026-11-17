import type { ContactTopic } from '@/lib/contact/topics'
import type { Locale } from '@/lib/i18n/routes'

// Texte der Vorgangsmails. Reiner Text, kurz. Die Bestätigung an Absender wiederholt keine Eingaben:
// Sonst ließe sich das Formular nutzen, um beliebigen Text an fremde Adressen zu schicken.

const TOPIC_NAMES: Record<Locale, Record<ContactTopic, string>> = {
  de: { automation: 'KI-Automatisierung', training: 'KI-Schulung', isms: 'ISMS', places: 'Orte und Node001', general: 'Allgemein' },
  en: { automation: 'AI automation', training: 'AI training', isms: 'ISMS', places: 'Places and Node001', general: 'General' },
}

type ContactMail = { topic: ContactTopic; name: string; email: string; company?: string | null; message: string; locale: Locale }

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

// Warteliste Node001 (Seite Orte). Die Seite spricht in Du-Form, die Mails auch.

const INTEREST_NAMES: Record<string, string> = { workation: 'Workation', rent: 'Mieten', buy: 'Kaufen' }
const TIMING_NAMES: Record<string, string> = { now: 'Sofort', later: 'Nur Interesse, für später' }

/** Bestätigungslink für die Warteliste Node001, in der Sprache des Eintrags. Wiederholt keine Eingaben, auch nicht den Vornamen. */
export function waitlistConfirmLink(input: { locale: Locale; link: string }) {
  if (input.locale === 'en') {
    return {
      subject: 'Please confirm: waitlist for Node001',
      text: [
        'Hello,',
        '',
        'please confirm that you would like to join the waitlist for Node001:',
        '',
        input.link,
        '',
        'The link is valid for seven days. Joining is not binding and involves no payment. We will write to you once prices and services are set.',
        '',
        'If you later no longer want to hear from us, simply reply to one of our emails and we will remove your address.',
        '',
        'XPORTAL',
        'https://x-portal.eu/en/places',
        '',
        'You are receiving this email because this address was entered on the waitlist at x-portal.eu. If that was not you, simply ignore it; without confirmation nothing happens.',
      ].join('\n'),
    }
  }
  return {
    subject: 'Bitte bestätigen: Warteliste Node001',
    text: [
      'Hallo,',
      '',
      'bitte bestätige, dass du auf die Warteliste für Node001 möchtest:',
      '',
      input.link,
      '',
      'Der Link gilt sieben Tage. Der Eintrag ist unverbindlich und ohne Zahlung. Wir schreiben dir, sobald Preise und Leistungen feststehen.',
      '',
      'Möchtest du später keine Nachrichten mehr von uns, antworte einfach auf eine unserer Mails, dann löschen wir deine Adresse.',
      '',
      'XPORTAL',
      'https://x-portal.eu/orte',
      '',
      'Du bekommst diese Mail, weil diese Adresse auf x-portal.eu in die Warteliste eingetragen wurde. Warst du das nicht, ignoriere sie einfach; ohne Bestätigung passiert nichts.',
    ].join('\n'),
  }
}

/** An das Postfach des Betreibers, sobald ein Eintrag bestätigt ist. Die Felder heißen wie in public.waitlist_entries. */
export function waitlistNotification(input: { first_name: string | null; email: string; interest: string; timing: string; campaign: string | null; locale: string }) {
  const use = INTEREST_NAMES[input.interest] ?? input.interest
  const start = TIMING_NAMES[input.timing] ?? input.timing
  return {
    subject: `Warteliste Node001 bestätigt: ${use} · ${start}`.slice(0, 160),
    text: [
      `Nutzung: ${use}`,
      `Ab wann: ${start}`,
      `Vorname: ${input.first_name || '–'}`,
      `E-Mail: ${input.email}`,
      `Kampagne: ${input.campaign || '–'}`,
      `Sprache: ${input.locale === 'en' ? 'Englisch' : 'Deutsch'}`,
      '',
      '—',
      'Bestätigt per Link. Alle Einträge in Supabase unter public.waitlist_entries, die Zählung unter ops.warteliste.',
    ].join('\n'),
  }
}
