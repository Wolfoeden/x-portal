import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { CONTACT_TOPICS } from '@/lib/contact/topics'
import { deliverEmail, operatorAddress, type EmailMessage } from '@/lib/email/deliver'
import { contactConfirmation, contactNotification } from '@/lib/email/messages'
import type { Visitor } from '@/lib/server/request'

// Kontaktanfrage → public.contact_requests (sichtbar in ops.posteingang), dazu ein Hinweis ans Postfach
// und eine kurze Bestätigung an den Absender. Scheitert eine Mail, bleibt die Anfrage trotzdem gespeichert.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const ContactBody = z.object({
  topic: z.enum(CONTACT_TOPICS),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(254).regex(EMAIL),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().min(10).max(4_000),
  locale: z.enum(['de', 'en']),
  // Honigtopf: Menschen sehen das Feld nicht und lassen es leer.
  website: z.string().max(200).optional(),
})
export type ContactInput = z.infer<typeof ContactBody>

export type ContactResult = { ok: true } | { ok: false; reason: 'limit' | 'unavailable' }

export const CONTACTS_PER_DAY = 5

type Send = (message: EmailMessage) => Promise<unknown>

export async function submitContact(input: ContactInput, visitor: Visitor, db: SupabaseClient | null, send: Send = deliverEmail): Promise<ContactResult> {
  if (!db || 'problem' in visitor) return { ok: false, reason: 'unavailable' }
  // Testanfragen zählen in einem eigenen Topf, wie bei der Analyse.
  const bucket = visitor.bucket === 'analyse_test' ? 'kontakt_test' : 'kontakt'
  const allowed = await db.rpc('consume_rate_limit', { p_bucket: bucket, p_key: visitor.key, p_max: CONTACTS_PER_DAY, p_window_seconds: 86_400 })
  if (allowed.error) {
    console.error(JSON.stringify({ event: 'contact_failed', stage: 'limit', code: allowed.error.code }))
    return { ok: false, reason: 'unavailable' }
  }
  if (allowed.data !== true) return { ok: false, reason: 'limit' }

  // Fragen zu den Orten haben in der Tabelle kein eigenes Thema: Sie laufen als „general“ mit einem Kennzeichen vorn in der Nachricht,
  // damit sie in ops.posteingang ohne neue Migration erkennbar sind.
  const service = input.topic === 'general' || input.topic === 'places' ? null : input.topic
  const { error } = await db.from('contact_requests').insert({
    topic: service ? 'services' : 'general',
    service,
    name: input.name,
    email: input.email,
    company: input.company || null,
    message: input.topic === 'places' ? `[Orte und Hub 01] ${input.message}`.slice(0, 4_000) : input.message,
    locale: input.locale,
  })
  if (error) {
    console.error(JSON.stringify({ event: 'contact_failed', stage: 'insert', code: error.code }))
    return { ok: false, reason: 'unavailable' }
  }

  // Abwarten, bevor die Funktion endet; Netlify beendet sie sonst mitten im Versand.
  const operator = operatorAddress()
  await Promise.allSettled([
    operator ? send({ to: operator, replyTo: input.email, ...contactNotification(input) }) : Promise.resolve(),
    send({ to: input.email, ...contactConfirmation(input) }),
  ])
  return { ok: true }
}
