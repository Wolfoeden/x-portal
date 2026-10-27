import { z } from 'zod'
import { SHOWCASE_TEXT_VERSION, sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'

// Schalter „Öffentlich sichtbar“: eine neue Zeile in consents (nur anfügen, mit Textversion).
// Der Trigger in der Datenbank setzt consent_showcase und pflegt showcase_profiles.

const Body = z.object({ visible: z.boolean() })
const noStore = { 'cache-control': 'no-store' }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await readJson(request, 1_000))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }
  const { error } = await session.supabase.from('consents').insert({ purpose: 'showcase', granted: body.visible, text_version: SHOWCASE_TEXT_VERSION })
  if (error) {
    console.error(JSON.stringify({ event: 'profile_visibility_failed', code: error.code }))
    return Response.json({ error: 'failed' }, { status: 500, headers: noStore })
  }
  return Response.json({ ok: true, visible: body.visible }, { headers: noStore })
}
