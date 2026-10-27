import { z } from 'zod'
import { analyse } from '@/lib/matching/analyse'
import { isSameOrigin, readJson, visitorKey } from '@/lib/server/request'

// Ein Satz aus dem Aufmacher oder der Eingabeleiste. Antwort: echtes Team oder der Hinweis, die Demo zu zeigen.

const Body = z.object({
  text: z.string().trim().min(10).max(2_000),
  locale: z.enum(['de', 'en']),
  // Honigtopf: Menschen sehen das Feld nicht und lassen es leer.
  website: z.string().max(200).optional(),
})

const noStore = { 'cache-control': 'no-store' }

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })

  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await readJson(request))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }
  if (body.website) return Response.json({ mode: 'demo', reason: 'limit' }, { headers: noStore })

  const result = await analyse({ text: body.text, locale: body.locale, visitor: visitorKey(request) })
  return Response.json(result, { headers: noStore })
}
