import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { ContactBody, submitContact } from '@/lib/contact/submit'
import { contactHref, topicFromSearch } from '@/lib/contact/topics'
import { pageHref, translateTopic } from '@/lib/i18n/routes'

function fakeDb({ allowed = true, insertError = null as null | { code: string } } = {}) {
  const rows: unknown[] = []
  const rpcs: Record<string, unknown>[] = []
  const db = {
    rpc: async (_name: string, args: Record<string, unknown>) => (rpcs.push(args), { data: allowed, error: null }),
    from: () => ({ insert: async (row: unknown) => (rows.push(row), { error: insertError }) }),
  }
  return { db: db as unknown as SupabaseClient, rows, rpcs }
}

const input = ContactBody.parse({ topic: 'isms', name: ' Anna Berg ', email: 'anna@firma.de', message: 'Wir brauchen ISO 27001 bis Juni.', locale: 'de' })
const visitor = { key: 'k'.repeat(64), bucket: 'analyse' as const }

describe('Kontaktthemen in der Adresse', () => {
  it('führen aus dem Menü zur passenden Anfrage, in beiden Sprachen', () => {
    expect(pageHref('contact', 'de', 'topicTraining')).toBe('/kontakt?thema=ki-schulung')
    expect(pageHref('contact', 'en', 'topicAutomation')).toBe('/en/contact?topic=ai-automation')
    expect(contactHref('general', 'de')).toBe('/kontakt')
    expect(topicFromSearch(new URLSearchParams('thema=ki-automatisierung'), 'de')).toBe('automation')
    expect(topicFromSearch(new URLSearchParams('topic=isms'), 'en')).toBe('isms')
    expect(topicFromSearch(new URLSearchParams('thema=unbekannt'), 'de')).toBe('general')
    expect(translateTopic('?thema=ki-schulung', 'de', 'en')).toBe('?topic=ai-training')
    expect(translateTopic('', 'de', 'en')).toBe('')
    expect(pageHref('contact', 'de', 'topicPlaces')).toBe('/kontakt?thema=orte')
    expect(topicFromSearch(new URLSearchParams('topic=places'), 'en')).toBe('places')
    expect(translateTopic('?thema=orte', 'de', 'en')).toBe('?topic=places')
  })
})

describe('submitContact', () => {
  const noMail = async () => ({ delivered: true })

  it('speichert eine Leistungsanfrage mit Thema und Leistung', async () => {
    const { db, rows, rpcs } = fakeDb()
    expect(await submitContact(input, visitor, db, noMail)).toEqual({ ok: true })
    expect(rows).toEqual([{ topic: 'services', service: 'isms', name: 'Anna Berg', email: 'anna@firma.de', company: null, message: 'Wir brauchen ISO 27001 bis Juni.', locale: 'de' }])
    expect(rpcs[0]).toMatchObject({ p_bucket: 'kontakt', p_max: 5 })
  })

  it('zählt Testanfragen getrennt und speichert Allgemeines ohne Leistung', async () => {
    const { db, rows, rpcs } = fakeDb()
    await submitContact({ ...input, topic: 'general' }, { key: 'xportal-test-bucket', bucket: 'analyse_test' }, db, noMail)
    expect(rpcs[0]).toMatchObject({ p_bucket: 'kontakt_test' })
    expect(rows[0]).toMatchObject({ topic: 'general', service: null })
  })

  it('speichert Fragen zu den Orten als Allgemein, erkennbar am Kennzeichen vorn', async () => {
    const { db, rows } = fakeDb()
    await submitContact({ ...input, topic: 'places', message: 'Gibt es dort Kinderbetreuung?' }, visitor, db, noMail)
    expect(rows[0]).toMatchObject({ topic: 'general', service: null, message: '[Orte und Hub 01] Gibt es dort Kinderbetreuung?' })
  })

  it('hält das Tageslimit ein und speichert dann nichts', async () => {
    const { db, rows } = fakeDb({ allowed: false })
    const sent: unknown[] = []
    expect(await submitContact(input, visitor, db, async (message) => sent.push(message))).toEqual({ ok: false, reason: 'limit' })
    expect(rows).toEqual([])
    expect(sent).toEqual([])
  })

  it('meldet die Anfrage dem Postfach und bestätigt dem Absender, ohne seine Eingaben zu wiederholen', async () => {
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'info@x-portal.eu')
    const sent: { to: string; subject: string; text: string; replyTo?: string }[] = []
    await submitContact({ ...input, company: 'Berg GmbH' }, visitor, fakeDb().db, async (message) => sent.push(message))
    vi.unstubAllEnvs()
    expect(sent).toHaveLength(2)
    expect(sent[0]).toMatchObject({ to: 'info@x-portal.eu', replyTo: 'anna@firma.de', subject: 'Neue Kontaktanfrage: ISMS · Anna Berg' })
    expect(sent[0].text).toContain('Wir brauchen ISO 27001 bis Juni.')
    expect(sent[0].text).toContain('Firma: Berg GmbH')
    expect(sent[1]).toMatchObject({ to: 'anna@firma.de', subject: 'Ihre Anfrage bei XPORTAL' })
    expect(sent[1].text).toContain('„ISMS“')
    expect(sent[1].text).not.toContain('Anna')
    expect(sent[1].text).not.toContain('ISO 27001 bis Juni')
  })

  it('speichert auch, wenn der Versand scheitert', async () => {
    const result = await submitContact(input, visitor, fakeDb().db, async () => {
      throw new Error('smtp down')
    })
    expect(result).toEqual({ ok: true })
  })

  it('meldet ohne Datenbank, ohne IP oder bei Fehlern „nicht verfügbar“', async () => {
    expect(await submitContact(input, visitor, null)).toEqual({ ok: false, reason: 'unavailable' })
    expect(await submitContact(input, { problem: 'no_ip' }, fakeDb().db)).toEqual({ ok: false, reason: 'unavailable' })
    const original = console.error
    console.error = () => {}
    expect(await submitContact(input, visitor, fakeDb({ insertError: { code: '23514' } }).db, noMail)).toEqual({ ok: false, reason: 'unavailable' })
    console.error = original
  })

  it('lehnt Ungültiges ab', () => {
    expect(() => ContactBody.parse({ ...input, email: 'keine-mail' })).toThrow()
    expect(() => ContactBody.parse({ ...input, message: 'kurz' })).toThrow()
    expect(() => ContactBody.parse({ ...input, topic: 'press' })).toThrow()
  })
})
