import 'server-only'

import { createHmac } from 'node:crypto'

// Nach dem Muster von lib/security/request.ts im alten Repo.

const SAME_SITE_FETCH = new Set(['same-origin', 'same-site'])

/** Schreibende Anfragen nur von der eigenen Seite. `Sec-Fetch-Site` setzt der Browser selbst, Skripte können ihn nicht fälschen. */
export function isSameOrigin(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase()
  if (fetchSite && !SAME_SITE_FETCH.has(fetchSite)) return false
  const origin = request.headers.get('origin')
  if (!origin) return Boolean(fetchSite && SAME_SITE_FETCH.has(fetchSite))
  const allowed = new Set([new URL(request.url).origin])
  const host = request.headers.get('host')?.trim()
  if (host) allowed.add(`${new URL(request.url).protocol}//${host}`)
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (site) allowed.add(new URL(site).origin)
  return allowed.has(origin)
}

export async function readJson(request: Request, maximumBytes = 8_000): Promise<unknown> {
  const body = await request.text()
  if (new TextEncoder().encode(body).byteLength > maximumBytes) throw new Error('too_large')
  return JSON.parse(body) as unknown
}

function clientIp(request: Request) {
  // Netlify setzt diesen Header an der Kante und überschreibt Werte vom Client. NETLIFY=true gibt es nur beim Bauen,
  // nicht in den Funktionen; deshalb zählt allein der Header.
  const netlify = request.headers.get('x-nf-client-connection-ip')?.trim()
  if (netlify) return netlify.slice(0, 128)
  if (process.env.NODE_ENV !== 'production') return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  return null
}

export type Visitor = { key: string; bucket: 'analyse' | 'analyse_test' } | { problem: 'no_secret' | 'no_ip' }

/** Eigene, knapp begrenzte Zählung für Testanfragen, damit Tests kein Besucherlimit verbrauchen. */
export const TEST_BUCKET_PER_DAY = 10

/** Schlüssel ohne Personenbezug für das Rate-Limit: HMAC der IP. Ohne IP gibt es keinen Sammelschlüssel. */
export function visitorKey(request: Request): Visitor {
  const secret = process.env.IP_HASH_SECRET?.trim()
  if ((!secret || secret.length < 32) && process.env.NODE_ENV === 'production') return { problem: 'no_secret' }
  if (request.headers.get('x-xportal-test') === '1') return { key: 'xportal-test-bucket', bucket: 'analyse_test' }
  const ip = clientIp(request)
  if (!ip) return { problem: 'no_ip' }
  return { key: createHmac('sha256', secret || 'nur-lokal').update(`ip:${ip}`).digest('hex'), bucket: 'analyse' }
}

/** Pseudonym eines Kontos für Rate-Limit und safety_identifier: HMAC der Konto-ID, nie die ID selbst. */
export function accountKey(userId: string): string | null {
  const secret = process.env.IP_HASH_SECRET?.trim()
  if ((!secret || secret.length < 32) && process.env.NODE_ENV === 'production') return null
  return createHmac('sha256', secret || 'nur-lokal').update(`user:${userId}`).digest('hex')
}
