import { ContactBody, submitContact, type ContactInput } from '@/lib/contact/submit'
import { isSameOrigin, readJson, visitorKey } from '@/lib/server/request'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Kontaktformular. Antwort: { ok: true } oder der Grund, warum nicht.

const noStore = { 'cache-control': 'no-store' }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })

  let body: ContactInput
  try {
    body = ContactBody.parse(await readJson(request))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }
  // Bots bekommen dieselbe Antwort wie Menschen, gespeichert wird nichts.
  if (body.website) return Response.json({ ok: true }, { headers: noStore })

  const result = await submitContact(body, visitorKey(request), supabaseAdmin())
  const status = result.ok ? 200 : result.reason === 'limit' ? 429 : 503
  return Response.json(result, { status, headers: noStore })
}
