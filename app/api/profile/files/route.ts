import { z } from 'zod'
import { isPdf } from '@/lib/ai/cv'
import { loadFreelancer, sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'

// Foto und Lebenslauf. Der Browser lädt die Datei mit seiner Sitzung direkt in den eigenen Ordner (Netlify nimmt nur
// etwa 6 MB an); diese Route prüft danach Pfad, Größe und Dateianfang und trägt die Datei ins Profil ein.

const KIND = z.enum(['avatar', 'cv'])
const Register = z.object({ kind: KIND, path: z.string().max(300), fileName: z.string().trim().min(1).max(200).optional() })
const Remove = z.object({ kind: KIND })
const noStore = { 'cache-control': 'no-store' }
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: noStore })

const BUCKET = { avatar: 'avatars', cv: 'cvs' } as const
const MAX_BYTES = { avatar: 5 * 1024 * 1024, cv: 10 * 1024 * 1024 } as const
const FILE = { avatar: /^[A-Za-z0-9_-]{1,80}\.(jpe?g|png|webp)$/u, cv: /^[A-Za-z0-9_-]{1,80}\.pdf$/u }

function isImage(bytes: Uint8Array) {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  return jpeg || png || webp
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('origin', 403)
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Register>
  try {
    body = Register.parse(await readJson(request, 2_000))
  } catch {
    return fail('invalid', 400)
  }
  const { supabase, user } = session
  const [folder, file, ...rest] = body.path.split('/')
  if (folder !== user.id || !file || rest.length || !FILE[body.kind].test(file)) return fail('path', 400)

  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return fail('no_profile', 404)

  const storage = supabase.storage.from(BUCKET[body.kind])
  const { data: stored, error: downloadError } = await storage.download(body.path)
  if (downloadError || !stored) return fail('not_found', 404)
  const bytes = new Uint8Array(await stored.arrayBuffer())
  // Der Bucket prüft nur den angegebenen Typ; hier zählt, was wirklich in der Datei steht.
  if (bytes.byteLength > MAX_BYTES[body.kind] || !(body.kind === 'cv' ? isPdf(bytes) : isImage(bytes))) {
    await storage.remove([body.path])
    return fail('file_type', 422)
  }

  if (body.kind === 'avatar') {
    const { error } = await supabase.from('freelancers').update({ avatar_path: body.path }).eq('id', freelancer.id)
    if (error) {
      console.error(JSON.stringify({ event: 'avatar_register_failed', code: error.code }))
      return fail('failed', 500)
    }
    if (freelancer.avatarPath && freelancer.avatarPath !== body.path) await storage.remove([freelancer.avatarPath])
    return Response.json({ ok: true }, { headers: noStore })
  }

  // Je Profil ein Lebenslauf: der neue ersetzt den alten.
  const previous = await supabase.from('freelancer_documents').select('id, storage_path').eq('freelancer_id', freelancer.id)
  const { error } = await supabase.from('freelancer_documents').insert({
    freelancer_id: freelancer.id,
    storage_path: body.path,
    file_name: (body.fileName ?? 'cv.pdf').replace(/[\u0000-\u001f\u007f/\\]/gu, ' ').slice(0, 200),
    mime_type: 'application/pdf',
    byte_size: bytes.byteLength,
  })
  if (error) {
    console.error(JSON.stringify({ event: 'cv_register_failed', code: error.code }))
    return fail('failed', 500)
  }
  const old = (previous.data ?? []).filter((row) => row.storage_path !== body.path)
  if (old.length) {
    await supabase.from('freelancer_documents').delete().in('id', old.map((row) => row.id as string))
    await storage.remove(old.map((row) => row.storage_path as string))
  }
  return Response.json({ ok: true, uploadedAt: new Date().toISOString() }, { headers: noStore })
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return fail('origin', 403)
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Remove>
  try {
    body = Remove.parse(await readJson(request, 500))
  } catch {
    return fail('invalid', 400)
  }
  const { supabase, user } = session
  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return fail('no_profile', 404)
  const storage = supabase.storage.from(BUCKET[body.kind])

  if (body.kind === 'avatar') {
    if (!freelancer.avatarPath) return Response.json({ ok: true }, { headers: noStore })
    const { error } = await supabase.from('freelancers').update({ avatar_path: null }).eq('id', freelancer.id)
    if (error) return fail('failed', 500)
    await storage.remove([freelancer.avatarPath])
    return Response.json({ ok: true }, { headers: noStore })
  }

  const documents = await supabase.from('freelancer_documents').select('id, storage_path').eq('freelancer_id', freelancer.id)
  const rows = documents.data ?? []
  if (rows.length) {
    const { error } = await supabase.from('freelancer_documents').delete().in('id', rows.map((row) => row.id as string))
    if (error) return fail('failed', 500)
    await storage.remove(rows.map((row) => row.storage_path as string))
  }
  return Response.json({ ok: true }, { headers: noStore })
}
