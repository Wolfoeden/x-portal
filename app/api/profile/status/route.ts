import { z } from 'zod'
import { deliverEmail, operatorAddress } from '@/lib/email/deliver'
import { freelancerPublishedNotification } from '@/lib/email/messages'
import { missingForPublish } from '@/lib/profile/schema'
import { loadFreelancer, sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'

// Schalter „Für Projekte verfügbar“: veröffentlicht (im Matching) oder pausiert. Beim ersten Veröffentlichen ein Hinweis ans Postfach.

const Body = z.object({ available: z.boolean() })
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

  const { supabase, user } = session
  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return Response.json({ error: 'no_profile' }, { status: 404, headers: noStore })

  if (body.available) {
    const missing = missingForPublish(freelancer.profile)
    if (missing.length) return Response.json({ error: 'incomplete', missing }, { status: 422, headers: noStore })
  }
  const status = body.available ? 'published' : freelancer.status === 'draft' ? 'draft' : 'paused'
  const { error } = await supabase.from('freelancers').update({ status }).eq('id', freelancer.id)
  if (error) {
    console.error(JSON.stringify({ event: 'profile_status_failed', code: error.code }))
    return Response.json({ error: 'failed' }, { status: 500, headers: noStore })
  }

  const operator = operatorAddress()
  if (body.available && !freelancer.publishedAt && operator) {
    await deliverEmail({
      to: operator,
      ...freelancerPublishedNotification({ firstName: freelancer.profile.firstName, roleTitle: freelancer.profile.roleTitle, email: user.email ?? null }),
    }).catch(() => null)
  }
  return Response.json({ ok: true, status }, { headers: noStore })
}
