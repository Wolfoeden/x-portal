import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { WAITLIST_CONSENT_VERSION, WaitlistBody, confirmWaitlist, hashToken, submitWaitlist } from '@/lib/waitlist/submit'
import { waitlistConfirmLink, waitlistNotification } from '@/lib/email/messages'

const TOKEN = 'a'.repeat(64)
const visitor = { key: 'k'.repeat(64), bucket: 'analyse' as const }
const input = WaitlistBody.parse({ use: 'workation', start: 'sofort', work: 'suche', firstName: ' Lena ', lastName: ' Berg ', email: 'lena@example.com', country: 'DE', consent: true, locale: 'de', offer: 'workation' })

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
      last_name: 'Berg',
      email: 'lena@example.com',
      country: 'DE',
      work: 'seeks_work',
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

  it('übersetzt Nutzung, Zeitpunkt und Arbeit in die Werte der Datenbank; Arbeit ist freiwillig', async () => {
    const { db, rows } = fakeDb()
    await submitWaitlist({ ...input, use: 'workation', start: 'spaeter', work: undefined, offer: undefined }, visitor, 'https://x-portal.eu', db, send, TOKEN)
    await submitWaitlist({ ...input, use: 'mieten', work: 'habe' }, visitor, 'https://x-portal.eu', db, send, TOKEN)
    expect(rows[0]).toMatchObject({ interest: 'workation', timing: 'later', work: null, campaign: null })
    expect(rows[1]).toMatchObject({ interest: 'rent', timing: 'now', work: 'has_work' })
  })

  it('verlangt Vor- und Nachnamen und ein Land als Ländercode', () => {
    const base = { use: 'workation', start: 'sofort', firstName: 'Lena', lastName: 'Berg', email: 'lena@example.com', country: 'UA', consent: true, locale: 'de' }
    expect(WaitlistBody.safeParse(base).success).toBe(true)
    expect(WaitlistBody.safeParse({ ...base, lastName: ' ' }).success).toBe(false)
    expect(WaitlistBody.safeParse({ ...base, firstName: undefined }).success).toBe(false)
    expect(WaitlistBody.safeParse({ ...base, country: 'Ukraine' }).success).toBe(false)
    expect(WaitlistBody.safeParse({ ...base, work: 'vielleicht' }).success).toBe(false)
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
  const entry = { first_name: 'Lena', email: 'lena@example.com', interest: 'rent', timing: 'later', campaign: 'mieten', locale: 'en' }

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
    expect(sent[0]).toMatchObject({ to: 'info@x-portal.eu', replyTo: 'lena@example.com', subject: 'Whitelist Node001 bestätigt: Länger bleiben · Nur Interesse, für später' })
    expect(sent[0].text).toContain('Kampagne: mieten')
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
    expect(mail.subject).toBe('Bitte bestätigen: Whitelist Node001')
    expect(mail.text).toContain('bitte bestätige')
    expect(mail.text).not.toContain('Lena')
    expect(waitlistConfirmLink({ locale: 'en', link: 'l' }).subject).toBe('Please confirm: whitelist for Node001')
  })

  it('nennen dem Betreiber Nutzung und Zeitpunkt, auch ohne Vorname und Kampagne', () => {
    const text = waitlistNotification({ first_name: null, email: 'lena@example.com', interest: 'rent', timing: 'now', campaign: null, locale: 'de' }).text
    expect(text).toContain('Nutzung: Länger bleiben')
    expect(text).toContain('Ab wann: Sofort')
    expect(text).toContain('Name: –')
    const full = waitlistNotification({ first_name: 'Lena', last_name: 'Berg', email: 'l@x.eu', country: 'UA', work: 'seeks_work', interest: 'workation', timing: 'now', campaign: null, locale: 'de' }).text
    expect(full).toContain('Name: Lena Berg')
    expect(full).toContain('Land: UA')
    expect(full).toContain('Arbeit: sucht Arbeit über XPORTAL')
    expect(text).toContain('Kampagne: –')
  })
})
