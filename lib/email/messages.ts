import type { ContactTopic } from '@/lib/contact/topics'
import type { Locale } from '@/lib/i18n/routes'

// Texte der Vorgangsmails. Reiner Text, kurz. Die Bestätigung an Absender wiederholt keine Eingaben:
// Sonst ließe sich das Formular nutzen, um beliebigen Text an fremde Adressen zu schicken.

const TOPIC_NAMES: Record<Locale, Record<ContactTopic, string>> = {
  de: { automation: 'KI-Automatisierung', training: 'KI-Schulung', isms: 'ISMS', places: 'Orte und Hub 01', general: 'Allgemein' },
  en: { automation: 'AI automation', training: 'AI training', isms: 'ISMS', places: 'Places and Hub 01', general: 'General' },
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

// Warteliste Hub 01 (Seite Orte). Die Seite spricht in Du-Form, die Mails auch.

type WaitlistMail = { firstName?: string | null; email: string; use: string; start: string; offer?: string | null; locale: Locale }

/** An das Postfach des Betreibers. */
export function waitlistNotification(input: WaitlistMail) {
  return {
    subject: `Neue Vormerkung Warteliste Hub 01: ${input.use} · ${input.start}`.slice(0, 160),
    text: [
      `Nutzung: ${input.use}`,
      `Ab wann: ${input.start}`,
      `Vorname: ${input.firstName || '–'}`,
      `E-Mail: ${input.email}`,
      `Kampagne: ${input.offer || '–'}`,
      `Sprache: ${input.locale === 'en' ? 'Englisch' : 'Deutsch'}`,
      '',
      'Steht auch in Supabase unter ops.posteingang (Kontakt, Nachricht beginnt mit „Warteliste Hub 01“).',
    ].join('\n'),
  }
}

/** An die Person, die sich vorgemerkt hat, in ihrer Sprache. */
export function waitlistConfirmation(input: Pick<WaitlistMail, 'firstName' | 'use' | 'locale'>) {
  if (input.locale === 'en') {
    return {
      subject: 'You are on the waitlist for Hub 01',
      text: [
        input.firstName ? `Hello ${input.firstName},` : 'Hello,',
        '',
        `thank you for registering your interest (${input.use}). You are on the waitlist for Hub 01 in the Carpathians of western Ukraine.`,
        'As soon as rental terms, prices and services are set, you will hear from us first.',
        '',
        'If you no longer want to hear from us, simply reply to this email and we will remove your address.',
        '',
        'XPORTAL',
        'https://x-portal.eu/en/places',
        '',
        'You are receiving this email because this address was entered on the waitlist at x-portal.eu. If that was not you, simply ignore it.',
      ].join('\n'),
    }
  }
  return {
    subject: 'Du stehst auf der Warteliste für Hub 01',
    text: [
      input.firstName ? `Hallo ${input.firstName},` : 'Hallo,',
      '',
      `danke für dein Interesse (${input.use}). Du stehst auf der Warteliste für Hub 01 in den Karpaten der Westukraine.`,
      'Sobald Mietdauer, Preise und Leistungen feststehen, hörst du als Erstes von uns.',
      '',
      'Möchtest du keine Nachrichten mehr von uns, antworte einfach auf diese Mail, dann löschen wir deine Adresse.',
      '',
      'XPORTAL',
      'https://x-portal.eu/orte',
      '',
      'Du bekommst diese Mail, weil diese Adresse auf x-portal.eu in die Warteliste eingetragen wurde. Warst du das nicht, ignoriere sie einfach.',
    ].join('\n'),
  }
}
