import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { deliverEmail, operatorAddress, type EmailMessage } from '@/lib/email/deliver'
import { waitlistConfirmLink, waitlistNotification } from '@/lib/email/messages'
import type { Visitor } from '@/lib/server/request'

// Warteliste für Node001 → public.waitlist_entries. Erst der Klick auf den Link in der Mail bestätigt den Eintrag
// (Double-Opt-in); gespeichert wird nur der SHA-256 des Links. Nach der Bestätigung geht ein Hinweis ans Postfach.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const WAITLIST_INTERESTS = ['buy', 'rent', 'both'] as const
export const WAITLIST_MOVE_INS = ['spring_2027', 'later'] as const
export const WAITLIST_PER_DAY = 3
export const CONSENT_VERSION = 'warteliste-2026-11-04'
const LINK_DAYS = 7

export const WaitlistBody = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().max(254).regex(EMAIL),
  interest: z.enum(WAITLIST_INTERESTS),
  moveIn: z.enum(WAITLIST_MOVE_INS).optional(),
  note: z.string().trim().max(1_000).optional(),
  consent: z.literal(true),
  locale: z.enum(['de', 'en']),
  // Honigtopf: Menschen sehen das Feld nicht und lassen es leer.
  website: z.string().max(200).optional(),
})
export type WaitlistInput = z.infer<typeof WaitlistBody>
export type WaitlistResult = { ok: true } | { ok: false; reason: 'limit' | 'unavailable' }
export type ConfirmResult = { ok: true; locale: 'de' | 'en' } | { ok: false; reason: 'invalid' | 'unavailable' }

type Send = (message: EmailMessage) => Promise<unknown>

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Speichert einen unbestätigten Eintrag und schickt den Bestätigungslink. `origin` ist die Adresse der Seite, z. B. https://x-portal.eu. */
export async function submitWaitlist(input: WaitlistInput, visitor: Visitor, origin: string, db: SupabaseClient | null, send: Send = deliverEmail, token = randomBytes(32).toString('hex')): Promise<WaitlistResult> {
  if (!db || 'problem' in visitor) return { ok: false, reason: 'unavailable' }
  const bucket = visitor.bucket === 'analyse_test' ? 'warteliste_test' : 'warteliste'
  const allowed = await db.rpc('consume_rate_limit', { p_bucket: bucket, p_key: visitor.key, p_max: WAITLIST_PER_DAY, p_window_seconds: 86_400 })
  if (allowed.error) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'limit', code: allowed.error.code }))
    return { ok: false, reason: 'unavailable' }
  }
  if (allowed.data !== true) return { ok: false, reason: 'limit' }

  const { error } = await db.from('waitlist_entries').insert({
    name: input.name,
    email: input.email,
    interest: input.interest,
    move_in: input.moveIn ?? null,
    note: input.note || null,
    locale: input.locale,
    consent_text_version: CONSENT_VERSION,
    confirm_token_hash: hashToken(token),
    confirm_expires_at: new Date(Date.now() + LINK_DAYS * 86_400_000).toISOString(),
  })
  if (error) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'insert', code: error.code }))
    return { ok: false, reason: 'unavailable' }
  }

  const link = `${origin.replace(/\/$/, '')}/api/waitlist/confirm?token=${token}&lang=${input.locale}`
  const sent = (await send({ to: input.email, ...waitlistConfirmLink({ locale: input.locale, link }) })) as { delivered?: boolean } | undefined
  if (sent && sent.delivered === false) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'mail' }))
    return { ok: false, reason: 'unavailable' }
  }
  return { ok: true }
}

/** Bestätigt einen Eintrag über den Link aus der Mail. Ein Link gilt einmal und sieben Tage. */
export async function confirmWaitlist(token: string | null, db: SupabaseClient | null, send: Send = deliverEmail): Promise<ConfirmResult> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return { ok: false, reason: 'invalid' }
  if (!db) return { ok: false, reason: 'unavailable' }
  const now = new Date().toISOString()
  const { data, error } = await db
    .from('waitlist_entries')
    .update({ status: 'confirmed', confirmed_at: now, confirm_token_hash: null, confirm_expires_at: null })
    .eq('confirm_token_hash', hashToken(token))
    .eq('status', 'pending')
    .gt('confirm_expires_at', now)
    .select('name, email, interest, move_in, note, locale')
    .maybeSingle()
  if (error) {
    console.error(JSON.stringify({ event: 'waitlist_failed', stage: 'confirm', code: error.code }))
    return { ok: false, reason: 'unavailable' }
  }
  if (!data) return { ok: false, reason: 'invalid' }

  const operator = operatorAddress()
  if (operator) await Promise.allSettled([send({ to: operator, replyTo: data.email, ...waitlistNotification(data) })])
  return { ok: true, locale: data.locale === 'en' ? 'en' : 'de' }
}
