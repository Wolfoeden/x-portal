import { sessionUser, unauthorized } from '@/lib/profile/server'

// Datenexport (Art. 15 und 20 DSGVO): alle Zeilen, die zum eigenen Konto gehören, als JSON. Gelesen wird mit der
// eigenen Sitzung, RLS begrenzt also auf genau dieses Konto. Dateien selbst lädt man im Konto einzeln herunter.

export async function GET() {
  const session = await sessionUser()
  if (!session) return unauthorized()
  const { supabase, user } = session

  const [profile, freelancer, consents, orders, subscriptions] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('freelancers').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('consents').select('purpose, granted, text_version, source, created_at').eq('user_id', user.id).order('created_at'),
    supabase.from('orders').select('*').eq('user_id', user.id),
    supabase.from('subscriptions').select('*').eq('user_id', user.id),
  ])
  const freelancerId = (freelancer.data?.id as string | undefined) ?? null
  const [projects, documents] = freelancerId
    ? await Promise.all([
        supabase.from('freelancer_projects').select('*').eq('freelancer_id', freelancerId).order('position'),
        supabase.from('freelancer_documents').select('file_name, mime_type, byte_size, uploaded_at').eq('freelancer_id', freelancerId),
      ])
    : [{ data: [] }, { data: [] }]

  const body = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      signInMethods: (user.identities ?? []).map((identity) => ({ provider: identity.provider, linkedAt: identity.created_at ?? null })),
    },
    profile: profile.data ?? null,
    freelancer: freelancer.data ?? null,
    projects: projects.data ?? [],
    cvFiles: documents.data ?? [],
    consents: consents.data ?? [],
    orders: orders.data ?? [],
    subscriptions: subscriptions.data ?? [],
  }
  const day = new Date().toISOString().slice(0, 10)
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="xportal-daten-${day}.json"`,
      'cache-control': 'no-store',
    },
  })
}
