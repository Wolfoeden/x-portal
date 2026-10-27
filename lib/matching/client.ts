import type { Scenario } from '@/lib/demo/scenarios'
import type { Locale } from '@/lib/i18n/routes'

/** Fragt /api/analyse. null heißt: Demo zeigen (kein Server, Limit, Fehler oder kein Treffer). */
export async function analyseOnServer(text: string, locale: Locale): Promise<Scenario | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, locale }),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const result = (await response.json()) as { mode?: string; scenario?: Scenario }
    return result.mode === 'live' && result.scenario ? result.scenario : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
