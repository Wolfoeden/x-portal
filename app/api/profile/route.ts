import { ProfileInput, rowFromProfile } from '@/lib/profile/schema'
import { sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'

// Freelancer-Profil anlegen oder ändern. Slug, Prüfstufe und Einwilligungen setzt die Datenbank, nie diese Route.

const noStore = { 'cache-control': 'no-store' }

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })
  const session = await sessionUser()
  if (!session) return unauthorized()

  let input: ProfileInput
  try {
    input = ProfileInput.parse(await readJson(request, 32_000))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }

  const { supabase, user } = session
  const values = rowFromProfile(input)
  const existing = await supabase.from('freelancers').select('id').eq('user_id', user.id).maybeSingle()
  const { error } = existing.data
    ? await supabase.from('freelancers').update(values).eq('id', existing.data.id)
    : await supabase.from('freelancers').insert(values)
  if (error) {
    console.error(JSON.stringify({ event: 'profile_save_failed', code: error.code }))
    // check_violation: Ein veröffentlichtes Profil darf nicht unvollständig werden.
    return Response.json({ error: error.code === '23514' ? 'incomplete' : 'failed' }, { status: error.code === '23514' ? 422 : 500, headers: noStore })
  }
  return Response.json({ ok: true, created: !existing.data }, { headers: noStore })
}
