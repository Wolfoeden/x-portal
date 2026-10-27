import { randomUUID } from 'node:crypto'
import { linkedinOf, loadFreelancer, sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin } from '@/lib/server/request'

// Foto aus LinkedIn übernehmen: Das Bild aus der Anmeldung wird in den eigenen Ordner kopiert und ist dann das Profilfoto.
// Abgerufen wird nur von LinkedIns Bildserver, nie von einer anderen Adresse.

const noStore = { 'cache-control': 'no-store' }
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: noStore })
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_BYTES = 5 * 1024 * 1024

function linkedinImage(value: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'media.licdn.com' ? url : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('origin', 403)
  const session = await sessionUser()
  if (!session) return unauthorized()
  const { supabase, user } = session
  const source = linkedinImage(linkedinOf(user)?.picture ?? null)
  if (!source) return fail('no_picture', 404)
  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return fail('no_profile', 404)

  let bytes: Uint8Array
  let type: string
  try {
    const response = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(8_000), cache: 'no-store' })
    type = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() ?? ''
    if (!response.ok || !TYPES[type]) return fail('no_picture', 404)
    bytes = new Uint8Array(await response.arrayBuffer())
    if (!bytes.byteLength || bytes.byteLength > MAX_BYTES) return fail('no_picture', 404)
  } catch {
    return fail('no_picture', 404)
  }

  const path = `${user.id}/${randomUUID()}.${TYPES[type]}`
  const storage = supabase.storage.from('avatars')
  const uploaded = await storage.upload(path, bytes, { contentType: type, upsert: false })
  if (uploaded.error) return fail('failed', 500)
  const { error } = await supabase.from('freelancers').update({ avatar_path: path }).eq('id', freelancer.id)
  if (error) {
    await storage.remove([path])
    return fail('failed', 500)
  }
  if (freelancer.avatarPath && freelancer.avatarPath !== path) await storage.remove([freelancer.avatarPath])
  const signed = await storage.createSignedUrl(path, 3_600)
  return Response.json({ ok: true, avatarUrl: signed.data?.signedUrl ?? null }, { headers: noStore })
}
