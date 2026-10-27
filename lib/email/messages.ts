import type { ContactTopic } from '@/lib/contact/topics'
import type { Locale } from '@/lib/i18n/routes'

// Texte der Vorgangsmails. Reiner Text, kurz. Die Bestätigung an Absender wiederholt keine Eingaben:
// Sonst ließe sich das Formular nutzen, um beliebigen Text an fremde Adressen zu schicken.

const TOPIC_NAMES: Record<Locale, Record<ContactTopic, string>> = {
  de: { automation: 'KI-Automatisierung', training: 'KI-Schulung', isms: 'ISMS', general: 'Allgemein' },
  en: { automation: 'AI automation', training: 'AI training', isms: 'ISMS', general: 'General' },
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
