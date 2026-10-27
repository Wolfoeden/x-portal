import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { briefEmbeddingText, type Brief } from '@/lib/ai/brief'
import { createAi, type Ai, type Usage } from '@/lib/ai/openai'
import type { Scenario } from '@/lib/demo/scenarios'
import type { Availability, RoleId, WorkMode } from '@/lib/freelancer/profile'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/routes'
import { toLiveScenario } from '@/lib/matching/live-scenario'
import { fitsWorkMode, inputHash, lexicalSimilarity, pickTeam, profileText, type Candidate } from '@/lib/matching/team'
import { aiConfig, type AiConfig } from '@/lib/server/env'
import { TEST_BUCKET_PER_DAY, type Visitor } from '@/lib/server/request'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { photoUrl } from '@/lib/showcase'

// Ein Satz → Brief (OpenAI) → Vorauswahl (pgvector) → Team. Jeder Fehler endet in der Demo, nie in einer kaputten Seite.

export type DemoReason = 'not_configured' | 'limit' | 'budget' | 'no_match' | 'error'
export type AnalyseResult = { mode: 'live'; scenario: Scenario } | { mode: 'demo'; reason: DemoReason }

type Deps = { config: AiConfig | null; db: SupabaseClient | null; ai?: Ai }

type FreelancerRow = {
  id: string
  first_name: string
  role_title: string | null
  role_key: RoleId | null
  headline: string | null
  skills: string[]
  about: string | null
  availability: Availability | null
  work_mode: WorkMode | null
  day_rate_eur: number | null
}

/** Fehlerart ohne Inhalte: Schritt, HTTP-Status und Code von OpenAI oder Postgres. */
export function describeError(stage: string, error: unknown) {
  const value = (error ?? {}) as { status?: unknown; code?: unknown; type?: unknown; name?: unknown }
  const parts = [stage]
  if (typeof value.status === 'number') parts.push(String(value.status))
  const code = value.code ?? value.type ?? value.name
  if (typeof code === 'string' && code) parts.push(code)
  return parts.join(':').slice(0, 200)
}

async function recordUsage(db: SupabaseClient, usage: Usage) {
  const { error } = await db
    .from('ai_usage')
    .insert({ kind: usage.kind, model: usage.model.slice(0, 120), input_tokens: usage.inputTokens, output_tokens: usage.outputTokens })
  if (error) console.error(JSON.stringify({ event: 'ai_usage_failed', code: error.code }))
}

/** Keine Inhalte ins Log: nur, wo und wie es scheiterte. Sichtbar in Supabase unter ops.ki_fehler. */
async function recordError(db: SupabaseClient, stage: string, error: unknown) {
  const detail = describeError(stage, error)
  console.error(JSON.stringify({ event: 'analyse_failed', detail }))
  const { error: logError } = await db.from('ai_errors').insert({ stage, detail })
  if (logError) console.error(JSON.stringify({ event: 'ai_errors_failed', code: logError.code }))
}

/** Vorauswahl per Fingerabdruck: nur neu rechnen, was sich seit dem letzten Mal geändert hat. */
async function vectorSimilarity(db: SupabaseClient, ai: Ai, brief: Brief, rows: FreelancerRow[], setStage: (stage: string) => void) {
  setStage('embedding')
  const stored = await db.from('freelancer_embeddings').select('freelancer_id, input_hash, model')
  if (stored.error) throw stored.error
  const known = new Map((stored.data ?? []).map((row) => [row.freelancer_id as string, `${row.model}:${row.input_hash}`]))
  const stale = rows
    .map((row) => {
      const content = profileText({ roleTitle: row.role_title, headline: row.headline, skills: row.skills, about: row.about })
      return { id: row.id, content, hash: inputHash(content, ai.embeddingModel) }
    })
    .filter((row) => known.get(row.id) !== `${ai.embeddingModel}:${row.hash}`)

  const embedded = await ai.embed([briefEmbeddingText(brief), ...stale.map((row) => row.content)])
  await recordUsage(db, embedded.usage)
  const [query, ...fresh] = embedded.vectors
  if (stale.length) {
    const upsert = await db.from('freelancer_embeddings').upsert(
      stale.map((row, index) => ({ freelancer_id: row.id, input_hash: row.hash, model: ai.embeddingModel, embedding: fresh[index], created_at: new Date().toISOString() })),
    )
    if (upsert.error) throw upsert.error
  }

  setStage('match')
  const matches = await db.rpc('match_freelancers', {
    p_embedding: query,
    p_model: ai.embeddingModel,
    p_work_mode: brief.workMode === 'unknown' ? null : brief.workMode,
    p_limit: 20,
  })
  if (matches.error) throw matches.error
  return new Map(((matches.data ?? []) as { freelancer_id: string; similarity: number }[]).map((row) => [row.freelancer_id, row.similarity]))
}

export async function analyse(
  { text, locale, visitor }: { text: string; locale: Locale; visitor: Visitor },
  deps: Deps = { config: aiConfig(), db: supabaseAdmin() },
): Promise<AnalyseResult> {
  const { config, db } = deps
  if (!config || !db || ('problem' in visitor && visitor.problem === 'no_secret')) return { mode: 'demo', reason: 'not_configured' }
  if ('problem' in visitor) {
    // Ohne IP kein Rate-Limit je Besucher: lieber Demo als ein gemeinsamer Zähler für alle.
    await db.from('ai_errors').insert({ stage: 'limit', detail: 'limit:no_client_ip' })
    return { mode: 'demo', reason: 'error' }
  }

  let stage = 'limit'
  try {
    const allowed = await db.rpc('consume_rate_limit', {
      p_bucket: visitor.bucket,
      p_key: visitor.key,
      p_max: visitor.bucket === 'analyse_test' ? TEST_BUCKET_PER_DAY : config.analysesPerVisitorPerDay,
      p_window_seconds: 86_400,
    })
    if (allowed.error) throw allowed.error
    if (allowed.data !== true) return { mode: 'demo', reason: 'limit' }

    stage = 'budget'
    const used = await db.rpc('ai_tokens_this_month')
    if (used.error) throw used.error
    if (Number(used.data) >= config.monthlyTokenLimit) return { mode: 'demo', reason: 'budget' }

    stage = 'brief'
    const ai = deps.ai ?? createAi(config)
    const { brief, usage } = await ai.brief(text, locale, visitor.key.slice(0, 32))
    await recordUsage(db, usage)

    // Fingerabdrücke: nur neu rechnen, was sich seit dem letzten Mal geändert hat.
    stage = 'profiles'
    const profiles = await db
      .from('freelancers')
      .select('id, first_name, role_title, role_key, headline, skills, about, availability, work_mode, day_rate_eur')
      .eq('status', 'published')
      .limit(1_000)
    if (profiles.error) throw profiles.error
    const rows = (profiles.data ?? []) as FreelancerRow[]

    let similarity: Map<string, number>
    try {
      similarity = await vectorSimilarity(db, ai, brief, rows, (next) => (stage = next))
    } catch (error) {
      // Ohne Fingerabdrücke (z. B. Embedding-Modell im OpenAI-Projekt nicht freigegeben) zählen Stärken und Rolle direkt.
      await recordError(db, stage, error)
      stage = 'lexical'
      similarity = new Map(
        rows
          .filter((row) => fitsWorkMode(brief.workMode, row.work_mode))
          .map((row) => [row.id, lexicalSimilarity(brief, { roleKey: row.role_key, skills: row.skills })]),
      )
    }
    if (!similarity.size) return { mode: 'demo', reason: 'no_match' }

    const showcase = await db.from('showcase_profiles').select('freelancer_id, slug, has_avatar').in('freelancer_id', [...similarity.keys()])
    if (showcase.error) throw showcase.error
    const consented = new Map((showcase.data ?? []).map((row) => [row.freelancer_id as string, row.has_avatar ? photoUrl(row.slug as string) : null]))

    const candidates: Candidate[] = rows
      .filter((row) => similarity.has(row.id))
      .map((row) => ({
        id: row.id,
        similarity: similarity.get(row.id)!,
        firstName: row.first_name,
        showcase: consented.has(row.id),
        photo: consented.get(row.id) ?? null,
        roleTitle: row.role_title,
        roleKey: row.role_key,
        skills: row.skills,
        availability: row.availability,
        workMode: row.work_mode,
        dayRate: row.day_rate_eur,
      }))
    const team = pickTeam(brief, candidates)
    if (!team.length) return { mode: 'demo', reason: 'no_match' }

    return {
      mode: 'live',
      scenario: toLiveScenario({ text, brief, team, dict: getDictionary(locale), locale, stamp: Date.now().toString(36) }),
    }
  } catch (error) {
    await recordError(db, stage, error)
    return { mode: 'demo', reason: 'error' }
  }
}
