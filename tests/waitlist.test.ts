import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { WAITLIST_CONSENT_VERSION, WaitlistBody, confirmWaitlist, hashToken, submitWaitlist } from '@/lib/waitlist/submit'
import { waitlistConfirmLink, waitlistNotification } from '@/lib/email/messages'

const TOKEN = 'a'.repeat(64)
const visitor = { key: 'k'.repeat(64), bucket: 'analyse' as const }
const input = WaitlistBody.parse({ use: 'workation', start: 'sofort', firstName: ' Lena ', email: 'lena@example.com', consent: true, locale: 'de', offer: 'workation' })

type Mail = { to: string; subject: string; text: string; replyTo?: string }

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
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => (rows.push({ table, ...row }), { error: insertError }),
      update: (patch: Record<string, unknown>) => (updates.push(patch), chain),
    }),
  }
  return { db: db as unknown as SupabaseClient, rows, rpcs, filters, updates }
}

describe('Warteliste Node001: Eingaben', () => {
  it('verlangt E-Mail, Einwilligung und eine bekannte Nutzung', () => {
    expect(() => WaitlistBody.parse({ ...input, email: 'lena@example' })).toThrow()
    expect(() => WaitlistBody.parse({ ...input, consent: false })).toThrow()
    expect(() => WaitlistBody.parse({ ...input, use: 'tauschen' })).toThrow()
    expect(() => WaitlistBody.parse({ ...input, start: 'bald' })).toThrow()
  })
})

describe('Warteliste Node001: eintragen', () => {
  const mails: Mail[] = []
  const send = async (message: Mail) => (mails.push(message), { delivered: true })

  it('speichert unbestätigt in waitlist_entries, nur mit dem Hash des Links, und schickt den Link', async () => {
    const { db, rows, rpcs } = fakeDb()
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu/', db, send, TOKEN)).toEqual({ ok: true })
    expect(rpcs[0]).toMatchObject({ p_bucket: 'warteliste', p_max: 5 })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      table: 'waitlist_entries',
      first_name: 'Lena',
      email: 'lena@example.com',
      interest: 'workation',
      timing: 'now',
      campaign: 'workation',
      locale: 'de',
      consent_text_version: WAITLIST_CONSENT_VERSION,
      confirm_token_hash: hashToken(TOKEN),
    })
    expect(JSON.stringify(rows[0])).not.toContain(TOKEN)
    expect(mails).toHaveLength(1)
    expect(mails[0].to).toBe('lena@example.com')
    expect(mails[0].text).toContain(`https://x-portal.eu/api/waitlist/confirm?token=${TOKEN}&lang=de`)
  })

  it('übersetzt Nutzung und Zeitpunkt in die Werte der Datenbank', async () => {
    const { db, rows } = fakeDb()
    await submitWaitlist({ ...input, use: 'kaufen', start: 'spaeter', firstName: undefined, offer: undefined }, visitor, 'https://x-portal.eu', db, send, TOKEN)
    await submitWaitlist({ ...input, use: 'mieten', firstName: 'L' }, visitor, 'https://x-portal.eu', db, send, TOKEN)
    expect(rows[0]).toMatchObject({ interest: 'buy', timing: 'later', first_name: null, campaign: null })
    expect(rows[1]).toMatchObject({ interest: 'rent', timing: 'now', first_name: null })
  })

  it('meldet dem Postfach noch nichts: Der Eintrag ist erst nach dem Klick bestätigt', async () => {
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'info@x-portal.eu')
    const sent: Mail[] = []
    await submitWaitlist(input, visitor, 'https://x-portal.eu', fakeDb().db, async (message) => (sent.push(message), { delivered: true }), TOKEN)
    vi.unstubAllEnvs()
    expect(sent.map((mail) => mail.to)).toEqual(['lena@example.com'])
  })

  it('hält das Tageslimit ein und zählt Tests getrennt', async () => {
    const limited = fakeDb({ allowed: false })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', limited.db, send, TOKEN)).toEqual({ ok: false, reason: 'limit' })
    expect(limited.rows).toEqual([])
    const test = fakeDb()
    await submitWaitlist(input, { key: 'xportal-test-bucket', bucket: 'analyse_test' }, 'https://x-portal.eu', test.db, send, TOKEN)
    expect(test.rpcs[0]).toMatchObject({ p_bucket: 'warteliste_test' })
  })

  it('meldet „nicht verfügbar“ ohne Datenbank, bei Fehlern beim Speichern oder wenn die Mail nicht rausgeht', async () => {
    const original = console.error
    console.error = () => {}
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', null, send, TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', fakeDb({ insertError: { code: '23514' } }).db, send, TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
    expect(await submitWaitlist(input, visitor, 'https://x-portal.eu', fakeDb().db, async () => ({ delivered: false }), TOKEN)).toEqual({ ok: false, reason: 'unavailable' })
    console.error = original
  })
})

describe('Warteliste Node001: bestätigen', () => {
  const entry = { first_name: 'Lena', email: 'lena@example.com', interest: 'buy', timing: 'later', campaign: 'kaufen', locale: 'en' }

  it('bestätigt nur offene, gültige Links, löscht den Hash und meldet es dem Postfach', async () => {
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'info@x-portal.eu')
    const sent: Mail[] = []
    const { db, filters, updates } = fakeDb({ confirmed: entry })
    expect(await confirmWaitlist(TOKEN, db, async (message) => (sent.push(message), { delivered: true }))).toEqual({ ok: true, locale: 'en' })
    vi.unstubAllEnvs()
    expect(updates[0]).toMatchObject({ status: 'confirmed', confirm_token_hash: null })
    expect(filters).toContainEqual(['eq', 'confirm_token_hash', hashToken(TOKEN)])
    expect(filters).toContainEqual(['eq', 'status', 'pending'])
    expect(filters.some(([op, column]) => op === 'gt' && column === 'confirm_expires_at')).toBe(true)
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({ to: 'info@x-portal.eu', replyTo: 'lena@example.com', subject: 'Warteliste Node001 bestätigt: Kaufen · Nur Interesse, für später' })
    expect(sent[0].text).toContain('Kampagne: kaufen')
  })

  it('lehnt falsche, abgelaufene oder benutzte Links ab', async () => {
    expect(await confirmWaitlist('kurz', fakeDb().db)).toEqual({ ok: false, reason: 'invalid' })
    expect(await confirmWaitlist(null, fakeDb().db)).toEqual({ ok: false, reason: 'invalid' })
    expect(await confirmWaitlist(TOKEN, fakeDb({ confirmed: null }).db)).toEqual({ ok: false, reason: 'invalid' })
    expect(await confirmWaitlist(TOKEN, null)).toEqual({ ok: false, reason: 'unavailable' })
  })
})

describe('Warteliste Node001: Mails', () => {
  it('wiederholen keine Eingaben an die Person und sprechen sie in Du-Form an', () => {
    const mail = waitlistConfirmLink({ locale: 'de', link: 'https://x-portal.eu/api/waitlist/confirm?token=x' })
    expect(mail.subject).toBe('Bitte bestätigen: Warteliste Node001')
    expect(mail.text).toContain('bitte bestätige')
    expect(mail.text).not.toContain('Lena')
    expect(waitlistConfirmLink({ locale: 'en', link: 'l' }).subject).toBe('Please confirm: waitlist for Node001')
  })

  it('nennen dem Betreiber Nutzung und Zeitpunkt, auch ohne Vorname und Kampagne', () => {
    const text = waitlistNotification({ first_name: null, email: 'lena@example.com', interest: 'rent', timing: 'now', campaign: null, locale: 'de' }).text
    expect(text).toContain('Nutzung: Mieten')
    expect(text).toContain('Ab wann: Sofort')
    expect(text).toContain('Vorname: –')
    expect(text).toContain('Kampagne: –')
  })
})
