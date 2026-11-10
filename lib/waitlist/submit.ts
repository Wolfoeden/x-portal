import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { deliverEmail, operatorAddress, type EmailMessage } from '@/lib/email/deliver'
import { waitlistConfirmation, waitlistNotification } from '@/lib/email/messages'
import type { Visitor } from '@/lib/server/request'

// Warteliste Hub 01 (Seite Orte) → public.contact_requests, wie das Kontaktformular. Kein eigenes Schema nötig:
// Thema „general“, die Nachricht beginnt mit „Warteliste Hub 01“ und enthält Nutzung, Zeitpunkt und Einwilligung.
// Dazu ein Hinweis ans Postfach und eine Bestätigung an die Person. Scheitert eine Mail, bleibt die Vormerkung gespeichert.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const WAITLIST_USES = ['workation', 'mieten', 'kaufen'] as const
export const WAITLIST_STARTS = ['sofort', 'spaeter'] as const
/** Fassung des Einwilligungstexts auf der Seite. Ändert sich der Text, ändert sich diese Kennung. */
export const WAITLIST_CONSENT_VERSION = 'orte-2026-11-10'

export const WaitlistBody = z.object({
  use: z.enum(WAITLIST_USES),
  start: z.enum(WAITLIST_STARTS),
  firstName: z.string().trim().max(120).optional(),
  email: z.string().trim().max(254).regex(EMAIL),
  consent: z.literal(true),
  locale: z.enum(['de', 'en']),
  // Kampagnen-Link, z. B. ?angebot=workation. Nur zur Auswertung, deshalb kurz und frei.
  offer: z.string().trim().max(40).optional(),
  // Honigtopf: Menschen sehen das Feld nicht und lassen es leer.
  website: z.string().max(200).optional(),
})
export type WaitlistInput = z.infer<typeof WaitlistBody>

export type WaitlistResult = { ok: true } | { ok: false; reason: 'limit' | 'unavailable' }

export const WAITLIST_PER_DAY = 5

const LABELS = {
  de: { workation: 'Workation', mieten: 'Mieten', kaufen: 'Kaufen', sofort: 'Sofort', spaeter: 'Nur Interesse, für später' },
  en: { workation: 'Workation', mieten: 'Rent', kaufen: 'Buy', sofort: 'Right away', spaeter: 'Just interested, for later' },
} as const

type Send = (message: EmailMessage) => Promise<unknown>

/** Text der Zeile in contact_requests. Steht so auch in ops.posteingang. */
export function waitlistMessage(input: WaitlistInput) {
  const de = LABELS.de
  return [
    'Warteliste Hub 01',
    `Nutzung: ${de[input.use]}`,
    `Ab wann: ${de[input.start]}`,
    `Einwilligung E-Mail zu Hub 01: ja (${WAITLIST_CONSENT_VERSION})`,
    input.offer ? `Kampagne: ${input.offer}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function submitWaitlist(input: WaitlistInput, visitor: Visitor, db: SupabaseClient | null, send: Send = deliverEmail): Promise<WaitlistResult> {
  if (!db || 'problem' in visitor) return { ok: false, reason: 'unavailable' }
  const bucket = visitor.bucket === 'analyse_test' ? 'warteliste_test' : 'warteliste'
  const allowed = await db.rpc('consume_rate_limit', { p_bucket: bucket, p_key: visitor.key, p_max: WAITLIST_PER_DAY, p_window_seconds: 86_400 })
  if (allowed.error) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'limit', code: allowed.error.code }))
    return { ok: false, reason: 'unavailable' }
  }
  if (allowed.data !== true) return { ok: false, reason: 'limit' }

  const firstName = input.firstName && input.firstName.length >= 2 ? input.firstName : null
  const { error } = await db.from('contact_requests').insert({
    topic: 'general',
    service: null,
    // Der Vorname ist freiwillig; die Tabelle verlangt einen Namen.
    name: firstName ?? 'Warteliste',
    email: input.email,
    company: null,
    message: waitlistMessage(input),
    locale: input.locale,
  })
  if (error) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'insert', code: error.code }))
    return { ok: false, reason: 'unavailable' }
  }

  const words = LABELS[input.locale]
  const operator = operatorAddress()
  // Abwarten, bevor die Funktion endet; Netlify beendet sie sonst mitten im Versand.
  await Promise.allSettled([
    operator
      ? send({ to: operator, replyTo: input.email, ...waitlistNotification({ firstName, email: input.email, use: LABELS.de[input.use], start: LABELS.de[input.start], offer: input.offer, locale: input.locale }) })
      : Promise.resolve(),
    send({ to: input.email, ...waitlistConfirmation({ firstName, use: words[input.use], locale: input.locale }) }),
  ])
  return { ok: true }
}
