import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import type { Ai } from '@/lib/ai/openai'
import { analyse, describeError } from '@/lib/matching/analyse'
import { inputHash, profileText } from '@/lib/matching/team'
import type { AiConfig } from '@/lib/server/env'
import { brief } from './fixtures'

const config: AiConfig = { apiKey: 'k', briefModel: 'nano', embeddingModel: 'emb', monthlyTokenLimit: 1_000, analysesPerVisitorPerDay: 3 }

const profiles = [
  { id: 'p1', first_name: 'Vincent', role_title: 'AI Engineer', role_key: 'ki', headline: null, skills: ['RAG'], about: 'Agenten.', availability: 'now', work_mode: 'remote', day_rate_eur: 760 },
  { id: 'p2', first_name: 'Marc', role_title: 'Auditor', role_key: 'isms', headline: null, skills: ['ISO 27001 Audits'], about: null, availability: null, work_mode: 'remote', day_rate_eur: 980 },
]
const p1Hash = inputHash(profileText({ roleTitle: 'AI Engineer', headline: null, skills: ['RAG'], about: 'Agenten.' }), 'emb')

function fakeDb({ allowed = true, tokens = 0 } = {}) {
  const writes: { table: string; rows: unknown }[] = []
  const rpcs: { name: string; args: Record<string, unknown> }[] = []
  const tables: Record<string, unknown[]> = {
    freelancers: profiles,
    freelancer_embeddings: [{ freelancer_id: 'p1', input_hash: p1Hash, model: 'emb' }],
    showcase_profiles: [{ freelancer_id: 'p1' }],
  }
  const db = {
    rpc: async (name: string, args: Record<string, unknown> = {}) => {
      rpcs.push({ name, args })
      if (name === 'consume_rate_limit') return { data: allowed, error: null }
      if (name === 'ai_tokens_this_month') return { data: tokens, error: null }
      if (name === 'match_freelancers') return { data: [{ freelancer_id: 'p1', similarity: 0.6 }, { freelancer_id: 'p2', similarity: 0.4 }], error: null }
      return { data: null, error: { code: 'unknown_rpc' } }
    },
    from: (table: string) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        limit: () => chain,
        in: () => chain,
        then: (resolve: (value: unknown) => unknown) => resolve({ data: tables[table] ?? [], error: null }),
        insert: async (rows: unknown) => (writes.push({ table, rows }), { error: null }),
        upsert: async (rows: unknown) => (writes.push({ table, rows }), { error: null }),
      }
      return chain
    },
  }
  return { db: db as unknown as SupabaseClient, writes, rpcs }
}

function fakeAi(): Ai & { embedded: string[][] } {
  const embedded: string[][] = []
  return {
    embedded,
    embeddingModel: 'emb',
    brief: vi.fn(async () => ({ brief, usage: { kind: 'brief' as const, model: 'nano', inputTokens: 100, outputTokens: 50 } })),
    embed: vi.fn(async (texts: string[]) => {
      embedded.push(texts)
      return { vectors: texts.map(() => [0.1, 0.2]), usage: { kind: 'embedding' as const, model: 'emb', inputTokens: 20, outputTokens: 0 } }
    }),
  }
}

const input = { text: 'Wir brauchen einen Chatbot.', locale: 'de' as const, visitor: { key: 'a'.repeat(64), bucket: 'analyse' as const } }

describe('analyse', () => {
  it('zeigt die Demo, solange Schlüssel fehlen', async () => {
    expect(await analyse(input, { config: null, db: null })).toEqual({ mode: 'demo', reason: 'not_configured' })
  })

  it('teilt ohne IP keinen Zähler, sondern zeigt die Demo und hält den Grund fest', async () => {
    const ai = fakeAi()
    const { db, writes, rpcs } = fakeDb()
    expect(await analyse({ ...input, visitor: { problem: 'no_ip' } }, { config, db, ai })).toEqual({ mode: 'demo', reason: 'error' })
    expect(rpcs).toEqual([])
    expect(writes).toEqual([{ table: 'ai_errors', rows: { stage: 'limit', detail: 'limit:no_client_ip' } }])
  })

  it('zählt Testanfragen in einem eigenen Topf', async () => {
    const ai = fakeAi()
    const { db, rpcs } = fakeDb()
    await analyse({ ...input, visitor: { key: 'xportal-test-bucket', bucket: 'analyse_test' } }, { config, db, ai })
    expect(rpcs[0]).toEqual({ name: 'consume_rate_limit', args: expect.objectContaining({ p_bucket: 'analyse_test', p_max: 10 }) })
  })

  it('fragt die KI nicht, wenn das Tageslimit erreicht ist', async () => {
    const ai = fakeAi()
    const { db } = fakeDb({ allowed: false })
    expect(await analyse(input, { config, db, ai })).toEqual({ mode: 'demo', reason: 'limit' })
    expect(ai.brief).not.toHaveBeenCalled()
  })

  it('fragt die KI nicht, wenn das Monatsbudget aufgebraucht ist', async () => {
    const ai = fakeAi()
    const { db } = fakeDb({ tokens: 1_000 })
    expect(await analyse(input, { config, db, ai })).toEqual({ mode: 'demo', reason: 'budget' })
    expect(ai.brief).not.toHaveBeenCalled()
  })

  it('bildet ein echtes Team und rechnet nur veraltete Fingerabdrücke neu', async () => {
    const ai = fakeAi()
    const { db, writes, rpcs } = fakeDb()
    const result = await analyse(input, { config, db, ai })
    expect(result.mode).toBe('live')
    if (result.mode !== 'live') return
    expect(result.scenario.team.map((member) => member.talent?.name)).toEqual(['Vincent', 'Auditor'])
    // Brief plus das eine Profil ohne aktuellen Fingerabdruck.
    expect(ai.embedded).toEqual([[expect.stringContaining('KI-Chatbot'), 'Auditor\nSkills: ISO 27001 Audits']])
    expect(writes.filter((write) => write.table === 'ai_usage')).toHaveLength(2)
    expect(writes.find((write) => write.table === 'freelancer_embeddings')?.rows).toEqual([
      expect.objectContaining({ freelancer_id: 'p2', model: 'emb', embedding: [0.1, 0.2] }),
    ])
    expect(rpcs.find((call) => call.name === 'match_freelancers')?.args).toMatchObject({ p_model: 'emb', p_work_mode: 'remote' })
    expect(JSON.stringify(result)).not.toContain('Marc')
  })

  it('zeigt die Demo, wenn OpenAI scheitert', async () => {
    const ai = fakeAi()
    ai.brief = vi.fn(async () => {
      throw new Error('timeout')
    })
    const { db } = fakeDb()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await analyse(input, { config, db, ai })).toEqual({ mode: 'demo', reason: 'error' })
    expect(spy.mock.calls[0][0]).not.toContain('Chatbot')
    spy.mockRestore()
  })

  it('hält die Fehlerart fest, ohne Inhalte', async () => {
    const ai = fakeAi()
    ai.brief = vi.fn(async () => {
      throw Object.assign(new Error('You exceeded your current quota for Chatbot'), { status: 429, code: 'insufficient_quota' })
    })
    const { db, writes } = fakeDb()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await analyse(input, { config, db, ai })
    spy.mockRestore()
    expect(writes.find((write) => write.table === 'ai_errors')?.rows).toEqual({ stage: 'brief', detail: 'brief:429:insufficient_quota' })
  })
})

describe('analyse ohne Embedding-Modell', () => {
  it('bildet trotzdem ein echtes Team aus Stärken und Rolle und hält den Grund fest', async () => {
    const ai = fakeAi()
    ai.embed = vi.fn(async () => {
      throw Object.assign(new Error('model'), { status: 403, code: 'model_not_found' })
    })
    const { db, writes, rpcs } = fakeDb()
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = await analyse(input, { config, db, ai })
    spy.mockRestore()
    expect(result.mode).toBe('live')
    if (result.mode !== 'live') return
    expect(result.scenario.team.map((member) => member.talent?.name)).toEqual(['Vincent', 'Auditor'])
    expect(writes.find((write) => write.table === 'ai_errors')?.rows).toEqual({ stage: 'embedding', detail: 'embedding:403:model_not_found' })
    expect(rpcs.some((call) => call.name === 'match_freelancers')).toBe(false)
  })
})

describe('describeError', () => {
  it('liest Status und Code von OpenAI und Postgres', () => {
    expect(describeError('match', { code: '42883', message: 'function does not exist' })).toBe('match:42883')
    expect(describeError('brief', Object.assign(new Error('x'), { status: 404, code: 'model_not_found' }))).toBe('brief:404:model_not_found')
    expect(describeError('brief', new TypeError('fetch failed'))).toBe('brief:TypeError')
  })
})
