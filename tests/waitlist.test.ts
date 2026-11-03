import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { WaitlistBody, confirmWaitlist, hashToken, submitWaitlist } from '@/lib/waitlist/submit'
import { waitlistConfirmLink, waitlistNotification } from '@/lib/email/messages'

const TOKEN = 'a'.repeat(64)
const visitor = { key: 'k'.repeat(64), bucket: 'analyse' as const }
const input = WaitlistBody.parse({ name: ' Lena Kraus ', email: 'lena@example.de', interest: 'rent', moveIn: 'spring_2027', consent: true, locale: 'de' })

function fakeDb({ allowed = true, insertError = null as null | { code: string }, confirmed = null as null | Record<string, unknown> } = {}) {
  const rows: Record<string, unknown>[] = []
  const rpcs: Record<string, unknown>[] = []
  const filters: [string, string, unknown][] = []
  const updates: Record<string, unknown>[] = []
  const chain = {
    eq: (column: string, value: unknown) => (filters.push(['eq', column, value]), chain),
    gt: (column: string, value: unknown) => (filters.push(['gt', column, value]), chain),
    select: () => chain,
    maybeSingle: async () => ({ data: confirmed, error: null }),
  }
  const db = {
    rpc: async (_name: string, args: Record<string, unknown>) => (rpcs.push(args), { data: allowed, error: null }),
    from: () => ({
      insert: async (row: Record<string, unknown>) => (rows.push(row), { error: insertError }),
      update: (patch: Record<string, unknown>) => (updates.push(patch), chain),
    }),
  }
  return { db: db as unknown as SupabaseClient, rows, rpcs, filters, updates }
}

describe('WaitlistBody', () => {
  it('verlangt Wahl und Einwilligung', () => {
    expect(WaitlistBody.safeParse({ name: 'Lena', email: 'lena@example.de', consent: true, locale: 'de' }).success).toBe(false)
    expect(WaitlistBody.safeParse({ name: 'Lena', email: 'lena@example.de', interest: 'buy', consent: false, locale: 'de' }).success).toBe(false)
    expect(WaitlistBody.safeParse({ name: 'Lena', email: 'keine-mail', interest: 'buy', consent: true, locale: 'de' }).success).toBe(false)
  })
})

describe('submitWaitlist', () => {
  const mails: { to: string; subject: string; text: string }[] = []
  const send = async (message: { to: string; subject: string; text: string }) => (mails.push(message), { delivered: true })

  it('speichert unbestätigt, nur mit dem Hash des Links, und schickt den Link', async () => {
    const { db, rows, rpcs } = fakeDb()
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu/', db, send, TOKEN)).toEqual({ ok: true })
    expect(rpcs[0]).toMatchObject({ p_bucket: 'warteliste', p_max: 3 })
    expect(rows[0]).toMatchObject({ name: 'Lena Kraus', email: 'lena@example.de', interest: 'rent', move_in: 'spring_2027', note: null, locale: 'de', confirm_token_hash: hashToken(TOKEN) })
    expect(JSON.stringify(rows[0])).not.toContain(TOKEN)
    expect(mails.at(-1)?.to).toBe('lena@example.de')
    expect(mails.at(-1)?.text).toContain(`https://x-portal.eu/api/waitlist/confirm?token=${TOKEN}&lang=de`)
  })

  it('hält das Tageslimit ein und speichert dann nichts', async () => {
    const { db, rows } = fakeDb({ allowed: false })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', db, send, TOKEN)).toEqual({ ok: false, reason: 'limit' })
    expect(rows).toHaveLength(0)
  })

  it('meldet einen Fehler, wenn Speichern oder Mail scheitert', async () => {
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', fakeDb({ insertError: { code: '23514' } }).db, send, TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
    const noMail = async () => ({ delivered: false })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', fakeDb().db, noMail, TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', null, send, TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
  })

  it('zählt Testeinträge in einem eigenen Topf', async () => {
    const { db, rpcs } = fakeDb()
    await submitWaitlist(input, { key: 'xportal-test-bucket', bucket: 'analyse_test' }, 'https://x-portal.eu', db, send, TOKEN)
    expect(rpcs[0]).toMatchObject({ p_bucket: 'warteliste_test' })
  })
})

describe('confirmWaitlist', () => {
  const entry = { name: 'Lena Kraus', email: 'lena@example.de', interest: 'rent', move_in: 'spring_2027', note: null, locale: 'en' }

  it('bestätigt nur offene, gültige Links und löscht den Hash', async () => {
    const { db, filters, updates } = fakeDb({ confirmed: entry })
    expect(await confirmWaitlist(TOKEN, db, async () => ({ delivered: true }))).toEqual({ ok: true, locale: 'en' })
    expect(updates[0]).toMatchObject({ status: 'confirmed', confirm_token_hash: null })
    expect(filters).toContainEqual(['eq', 'confirm_token_hash', hashToken(TOKEN)])
    expect(filters).toContainEqual(['eq', 'status', 'pending'])
    expect(filters.some(([op, column]) => op === 'gt' && column === 'confirm_expires_at')).toBe(true)
  })

  it('lehnt falsche, abgelaufene oder benutzte Links ab', async () => {
    expect(await confirmWaitlist('kurz', fakeDb().db)).toEqual({ ok: false, reason: 'invalid' })
    expect(await confirmWaitlist(null, fakeDb().db)).toEqual({ ok: false, reason: 'invalid' })
    expect(await confirmWaitlist(TOKEN, fakeDb({ confirmed: null }).db)).toEqual({ ok: false, reason: 'invalid' })
  })
})

describe('Mails der Warteliste', () => {
  it('wiederholen keine Eingaben an den Eintragenden und nennen die Wahl dem Betreiber', () => {
    const mail = waitlistConfirmLink({ locale: 'de', link: 'https://x-portal.eu/api/waitlist/confirm?token=x' })
    expect(mail.subject).toBe('Bitte bestätigen: Warteliste Hub 01')
    expect(mail.text).not.toContain('Lena')
    expect(waitlistConfirmLink({ locale: 'en', link: 'l' }).subject).toContain('Hub 01')
    expect(waitlistNotification({ name: 'Lena', email: 'lena@example.de', interest: 'both', move_in: null, note: null, locale: 'de' }).text).toContain('Möchte: Noch offen')
  })
})
