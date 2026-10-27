import { z } from 'zod'
import { draftFromGithub, loginFrom } from '@/lib/profile/github'
import { fetchGithubProfile } from '@/lib/profile/github-fetch'
import { githubLoginOf, sessionUser, unauthorized } from '@/lib/profile/server'
import { accountKey, isSameOrigin, readJson } from '@/lib/server/request'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Öffentliche GitHub-Daten als Vorschlag fürs Profil. Ohne Angabe gilt das verbundene GitHub-Konto.
// Der Vorschlag wird nicht gespeichert; die Person übernimmt ihn im Konto und speichert selbst.

const Body = z.object({ login: z.string().trim().max(120).optional(), locale: z.enum(['de', 'en']).default('de') })
const noStore = { 'cache-control': 'no-store' }
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: noStore })
const PER_HOUR = 10

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('origin', 403)
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await readJson(request, 1_000))
  } catch {
    return fail('invalid', 400)
  }
  const typed = body.login ? loginFrom(body.login) : null
  if (body.login && !typed) return fail('login', 400)
  const login = typed ?? githubLoginOf(session.user)
  if (!login) return fail('login', 400)

  const admin = supabaseAdmin()
  const key = accountKey(session.user.id)
  if (!admin || !key) return fail('unavailable', 503)
  const allowed = await admin.rpc('consume_rate_limit', { p_bucket: 'github_import', p_key: key, p_max: PER_HOUR, p_window_seconds: 3_600 })
  if (allowed.error) return fail('unavailable', 503)
  if (allowed.data !== true) return fail('limit', 429)

  const result = await fetchGithubProfile(login)
  if (result.status === 'not_found') return fail('not_found', 404)
  if (result.status === 'rate_limited') return fail('github_busy', 503)
  if (result.status !== 'ok') return fail('github_failed', 502)
  return Response.json({ login, draft: draftFromGithub({ repos: result.repos, languages: result.languages, locale: body.locale }) }, { headers: noStore })
}
