import 'server-only'

// Server-Konfiguration aus den Netlify-Variablen. Fehlt etwas, antwortet die Seite mit der Demo statt mit einem Fehler.

function positiveInteger(name: string, fallback: number) {
  const value = Number(process.env[name])
  return Number.isInteger(value) && value > 0 ? value : fallback
}

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  return url && serviceRoleKey ? { url, serviceRoleKey } : null
}

export function aiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    // Wie im alten Repo fest auf Nano: Teure Modelle lassen sich nicht per Variable einschalten.
    briefModel: 'gpt-5.4-nano-2026-03-17',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL?.trim() || 'text-embedding-3-small',
    monthlyTokenLimit: positiveInteger('AI_MONTHLY_TOKEN_LIMIT', 20_000_000),
    analysesPerVisitorPerDay: positiveInteger('AI_ANALYSES_PER_VISITOR_PER_DAY', 3),
  }
}

export type AiConfig = NonNullable<ReturnType<typeof aiConfig>>
