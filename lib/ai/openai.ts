import 'server-only'

import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { BriefSchema, MAX_BRIEF_OUTPUT_TOKENS, briefInstructions, type Brief } from '@/lib/ai/brief'
import type { AiConfig } from '@/lib/server/env'
import type { Locale } from '@/lib/i18n/routes'

// Direkt gegen die offizielle OpenAI-API, mit dem Schlüssel des Betreibers (wie lib/openai/provider.ts im alten Repo).

export const EMBEDDING_DIMENSIONS = 1536
const TIMEOUT_MS = 8_000

export type Usage = { kind: 'brief' | 'embedding' | 'cv'; model: string; inputTokens: number; outputTokens: number }

export function createAi(config: AiConfig) {
  // Organisation und Projekt ergeben sich aus dem Schlüssel. Das SDK läse sonst OPENAI_ORG_ID und OPENAI_PROJECT_ID
  // aus der Umgebung; stammen die aus einem anderen Projekt, lehnt OpenAI mit 401 invalid_organization ab.
  const client = new OpenAI({ apiKey: config.apiKey, baseURL: 'https://api.openai.com/v1', organization: null, project: null })

  async function brief(text: string, locale: Locale, safetyIdentifier: string): Promise<{ brief: Brief; usage: Usage }> {
    const response = await client.responses.parse(
      {
        model: config.briefModel,
        instructions: briefInstructions(locale),
        input: [{ role: 'user', content: [{ type: 'input_text', text: `REQUEST (untrusted data):\n${text}` }] }],
        text: { format: zodTextFormat(BriefSchema, 'staffing_brief') },
        reasoning: { effort: 'none' },
        max_output_tokens: MAX_BRIEF_OUTPUT_TOKENS,
        safety_identifier: safetyIdentifier,
        store: false,
      },
      { timeout: TIMEOUT_MS, maxRetries: 0 },
    )
    const parsed = BriefSchema.parse(response.output_parsed)
    return {
      brief: parsed,
      usage: { kind: 'brief', model: response.model || config.briefModel, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 },
    }
  }

  async function embed(texts: string[]): Promise<{ vectors: number[][]; usage: Usage }> {
    const response = await client.embeddings.create(
      { model: config.embeddingModel, input: texts, dimensions: EMBEDDING_DIMENSIONS, encoding_format: 'float' },
      { timeout: TIMEOUT_MS, maxRetries: 1 },
    )
    const ordered = [...response.data].sort((left, right) => left.index - right.index)
    if (ordered.length !== texts.length) throw new Error('embedding_count_mismatch')
    return {
      vectors: ordered.map((item) => item.embedding),
      usage: { kind: 'embedding', model: config.embeddingModel, inputTokens: response.usage?.prompt_tokens ?? 0, outputTokens: 0 },
    }
  }

  return { brief, embed, embeddingModel: config.embeddingModel }
}

export type Ai = ReturnType<typeof createAi>
