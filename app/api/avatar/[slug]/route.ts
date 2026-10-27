import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Profilfoto für die Website: nur, wenn das Profil in showcase_profiles steht (veröffentlicht und Einwilligung „showcase“)
// und ein Foto hat. Widerruft jemand, ist das Foto nach spätestens fünf Minuten auch aus Zwischenspeichern weg.

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const notFound = () => new Response(null, { status: 404, headers: { 'cache-control': 'public, max-age=60' } })

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug.length > 80 || !SLUG.test(slug)) return notFound()
  const admin = supabaseAdmin()
  if (!admin) return notFound()

  const card = await admin.from('showcase_profiles').select('freelancer_id, has_avatar').eq('slug', slug).maybeSingle()
  if (!card.data?.has_avatar) return notFound()
  const row = await admin.from('freelancers').select('avatar_path').eq('id', card.data.freelancer_id as string).maybeSingle()
  const path = row.data?.avatar_path as string | null | undefined
  if (!path) return notFound()
  const { data: file } = await admin.storage.from('avatars').download(path)
  if (!file || !TYPES.has(file.type)) return notFound()

  return new Response(file, {
    headers: {
      'content-type': file.type,
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'",
      'cache-control': 'public, max-age=300',
    },
  })
}
