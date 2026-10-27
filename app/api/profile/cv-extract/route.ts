import { z } from 'zod'
import { extractCv, isPdf } from '@/lib/ai/cv'
import { loadFreelancer, sessionUser, unauthorized } from '@/lib/profile/server'
import { aiConfig } from '@/lib/server/env'
import { accountKey, isSameOrigin, readJson } from '@/lib/server/request'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Lebenslauf per KI einlesen: der zuletzt hochgeladene eigene Lebenslauf wird zum Vorschlag fürs Profil.
// Fünf Auswertungen am Tag und Konto, dazu die Monatsgrenze für alle KI-Aufrufe. Gespeichert wird nur der Verbrauch.

const Body = z.object({ locale: z.enum(['de', 'en']).default('de') })
const noStore = { 'cache-control': 'no-store' }
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: noStore })
const PER_DAY = 5

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail('origin', 403)
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await readJson(request, 500))
  } catch {
    return fail('invalid', 400)
  }
  const config = aiConfig()
  const admin = supabaseAdmin()
  const key = accountKey(session.user.id)
  if (!config || !admin || !key) return fail('unavailable', 503)

  const { supabase, user } = session
  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return fail('no_profile', 404)
  const document = await supabase
    .from('freelancer_documents')
    .select('storage_path')
    .eq('freelancer_id', freelancer.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!document.data) return fail('no_cv', 404)

  const allowed = await admin.rpc('consume_rate_limit', { p_bucket: 'cv_extract', p_key: key, p_max: PER_DAY, p_window_seconds: 86_400 })
  if (allowed.error) return fail('unavailable', 503)
  if (allowed.data !== true) return fail('limit', 429)
  const used = await admin.rpc('ai_tokens_this_month')
  if (used.error || Number(used.data) >= config.monthlyTokenLimit) return fail('unavailable', 503)

  const { data: file, error } = await supabase.storage.from('cvs').download(document.data.storage_path as string)
  if (error || !file) return fail('no_cv', 404)
  const pdf = new Uint8Array(await file.arrayBuffer())
  if (!isPdf(pdf)) return fail('file_type', 422)

  try {
    const { draft, usage } = await extractCv(config, { pdf, safetyIdentifier: key.slice(0, 64), locale: body.locale })
    const recorded = await admin.from('ai_usage').insert({ kind: usage.kind, model: usage.model, input_tokens: usage.inputTokens, output_tokens: usage.outputTokens })
    if (recorded.error) console.error(JSON.stringify({ event: 'ai_usage_failed', code: recorded.error.code }))
    return Response.json({ draft }, { headers: noStore })
  } catch (failure) {
    console.error(JSON.stringify({ event: 'cv_extract_failed', detail: (failure as { status?: number; code?: string }).code ?? (failure as { status?: number }).status ?? (failure as Error).name }))
    return fail('failed', 502)
  }
}
