import 'server-only'

import type { Talent } from '@/lib/demo/scenarios'
import { initialsOf } from '@/lib/freelancer/profile'
import { getDictionary } from '@/lib/i18n/dictionary'
import { supabasePublicEnv } from '@/lib/supabase/env'

// Echte Profile mit Einwilligung „showcase“ für den Talentpool im Aufmacher: Vorname, Rolle, Foto über /api/avatar.
// Gelesen mit dem öffentlichen Schlüssel; showcase_profiles enthält nur freigegebene Felder.

type Card = { freelancer_id: string; slug: string; first_name: string; role_key: string | null; work_mode: string | null; has_avatar: boolean }

export const photoUrl = (slug: string) => `/api/avatar/${encodeURIComponent(slug)}`

export async function showcaseTalents(limit = 5): Promise<Talent[]> {
  const env = supabasePublicEnv()
  if (!env) return []
  try {
    const query = `select=freelancer_id,slug,first_name,role_key,work_mode,has_avatar&order=published_at.desc&limit=${limit}`
    const response = await fetch(`${env.url}/rest/v1/showcase_profiles?${query}`, {
      headers: { apikey: env.publishableKey, authorization: `Bearer ${env.publishableKey}` },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3_000),
    })
    if (!response.ok) return []
    const cards = (await response.json()) as Card[]
    const roles = getDictionary('de').freelancer.roles
    return cards.map((card) => ({
      id: card.freelancer_id,
      name: card.first_name,
      initials: initialsOf(card.first_name) || '·',
      tone: roles.find((role) => role.id === card.role_key)?.tone ?? 'stone',
      onSite: card.work_mode !== null && card.work_mode !== 'remote',
      kind: 'freelancer' as const,
      ...(card.has_avatar ? { photo: photoUrl(card.slug) } : {}),
    }))
  } catch {
    return []
  }
}
