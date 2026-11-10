import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { WAITLIST_CONSENT_VERSION, WaitlistBody, submitWaitlist, waitlistMessage } from '@/lib/waitlist/submit'

function fakeDb({ allowed = true, insertError = null as null | { code: string } } = {}) {
  const rows: Record<string, unknown>[] = []
  const rpcs: Record<string, unknown>[] = []
  const db = {
    rpc: async (_name: string, args: Record<string, unknown>) => (rpcs.push(args), { data: allowed, error: null }),
    from: (table: string) => ({ insert: async (row: Record<string, unknown>) => (rows.push({ table, ...row }), { error: insertError }) }),
  }
  return { db: db as unknown as SupabaseClient, rows, rpcs }
}

const input = WaitlistBody.parse({ use: 'workation', start: 'sofort', firstName: ' Lena ', email: 'lena@example.com', consent: true, locale: 'de', offer: 'workation' })
const visitor = { key: 'k'.repeat(64), bucket: 'analyse' as const }
const noMail = async () => ({ delivered: true })

describe('Warteliste Hub 01', () => {
  it('speichert in contact_requests wie das Kontaktformular, mit Nutzung, Zeitpunkt und Einwilligung', async () => {
    const { db, rows, rpcs } = fakeDb()
    expect(await submitWaitlist(input, visitor, db, noMail)).toEqual({ ok: true })
    expect(rpcs[0]).toMatchObject({ p_bucket: 'warteliste', p_max: 5 })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ table: 'contact_requests', topic: 'general', service: null, name: 'Lena', email: 'lena@example.com', company: null, locale: 'de' })
    const message = String(rows[0].message)
    expect(message.startsWith('Warteliste Hub 01')).toBe(true)
    expect(message).toContain('Nutzung: Workation')
    expect(message).toContain('Ab wann: Sofort')
    expect(message).toContain(WAITLIST_CONSENT_VERSION)
    expect(message).toContain('Kampagne: workation')
    // Die Tabelle verlangt 10 bis 4000 Zeichen.
    expect(message.length).toBeGreaterThanOrEqual(10)
  })

  it('setzt einen Platzhalter, wenn der freiwillige Vorname fehlt', async () => {
    const { db, rows } = fakeDb()
    await submitWaitlist({ ...input, firstName: undefined }, visitor, db, noMail)
    expect(rows[0]).toMatchObject({ name: 'Warteliste' })
  })

  it('meldet die Vormerkung dem Postfach und bestätigt der Person in Du-Form', async () => {
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'info@x-portal.eu')
    const sent: { to: string; subject: string; text: string; replyTo?: string }[] = []
    await submitWaitlist(input, visitor, fakeDb().db, async (message) => sent.push(message))
    vi.unstubAllEnvs()
    expect(sent).toHaveLength(2)
    expect(sent[0]).toMatchObject({ to: 'info@x-portal.eu', replyTo: 'lena@example.com', subject: 'Neue Vormerkung Warteliste Hub 01: Workation · Sofort' })
    expect(sent[1]).toMatchObject({ to: 'lena@example.com', subject: 'Du stehst auf der Warteliste für Hub 01' })
    expect(sent[1].text).toContain('Hallo Lena,')
  })

  it('schreibt die Bestätigung auf Englisch, wenn die Seite englisch war', async () => {
    const sent: { subject: string; text: string }[] = []
    await submitWaitlist({ ...input, locale: 'en', use: 'mieten' }, visitor, fakeDb().db, async (message) => sent.push(message))
    expect(sent.at(-1)?.subject).toBe('You are on the waitlist for Hub 01')
    expect(sent.at(-1)?.text).toContain('(Rent)')
  })

  it('hält das Tageslimit ein und zählt Tests getrennt', async () => {
    const limited = fakeDb({ allowed: false })
    expect(await submitWaitlist(input, visitor, limited.db, noMail)).toEqual({ ok: false, reason: 'limit' })
    expect(limited.rows).toEqual([])
    const test = fakeDb()
    await submitWaitlist(input, { key: 'xportal-test-bucket', bucket: 'analyse_test' }, test.db, noMail)
    expect(test.rpcs[0]).toMatchObject({ p_bucket: 'warteliste_test' })
  })

  it('meldet ohne Datenbank oder bei Fehlern „nicht verfügbar“', async () => {
    expect(await submitWaitlist(input, visitor, null)).toEqual({ ok: false, reason: 'unavailable' })
    const original = console.error
    console.error = () => {}
    expect(await submitWaitlist(input, visitor, fakeDb({ insertError: { code: '23514' } }).db, noMail)).toEqual({ ok: false, reason: 'unavailable' })
    console.error = original
  })

  it('verlangt E-Mail und Einwilligung', () => {
    expect(() => WaitlistBody.parse({ ...input, email: 'lena@example' })).toThrow()
    expect(() => WaitlistBody.parse({ ...input, consent: false })).toThrow()
    expect(() => WaitlistBody.parse({ ...input, use: 'tauschen' })).toThrow()
    expect(waitlistMessage({ ...input, offer: undefined })).not.toContain('Kampagne')
  })
})
