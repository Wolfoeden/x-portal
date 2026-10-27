import { z } from 'zod'
import { sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Konto löschen (Art. 17 DSGVO). Zuerst die Dateien im eigenen Ordner, dann das Konto; Profil, Projekte, Lebenslauf-Einträge,
// Einwilligungen und Kontodaten folgen per Cascade. Bestellungen bleiben für die Buchhaltung, ohne Bezug zum Konto.

const Body = z.object({ confirm: z.literal(true) })
const noStore = { 'cache-control': 'no-store' }

async function removeFolder(admin: NonNullable<ReturnType<typeof supabaseAdmin>>, bucket: string, folder: string) {
  const { data, error } = await admin.storage.from(bucket).list(folder, { limit: 1000 })
  if (error) throw error
  const paths = (data ?? []).map((item) => `${folder}/${item.name}`)
  if (paths.length) {
    const removed = await admin.storage.from(bucket).remove(paths)
    if (removed.error) throw removed.error
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })
  const session = await sessionUser()
  if (!session) return unauthorized()
  try {
    Body.parse(await readJson(request, 200))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }
  const admin = supabaseAdmin()
  if (!admin) return Response.json({ error: 'unavailable' }, { status: 503, headers: noStore })

  const { supabase, user } = session
  try {
    await removeFolder(admin, 'avatars', user.id)
    await removeFolder(admin, 'cvs', user.id)
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
  } catch (error) {
    console.error(JSON.stringify({ event: 'account_delete_failed', code: (error as { code?: string; name?: string }).code ?? (error as Error).name }))
    return Response.json({ error: 'failed' }, { status: 500, headers: noStore })
  }
  // Das Konto gibt es nicht mehr; hier werden nur noch die Cookies dieses Browsers geleert.
  await supabase.auth.signOut({ scope: 'local' }).catch(() => null)
  console.info(JSON.stringify({ event: 'account_deleted' }))
  return Response.json({ ok: true }, { headers: noStore })
}
