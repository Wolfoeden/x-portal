import { NextResponse } from 'next/server'
import { pageHref } from '@/lib/i18n/routes'
import { WAITLIST_RESULT_PARAM } from '@/lib/waitlist/result'
import { confirmWaitlist } from '@/lib/waitlist/submit'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

// Link aus der Bestätigungsmail. Leitet zur Warteliste auf der Seite Orte, mit dem Ergebnis in der Adresse.

export async function GET(request: Request) {
  const url = new URL(request.url)
  const result = await confirmWaitlist(url.searchParams.get('token'), supabaseAdmin())
  const locale = result.ok ? result.locale : url.searchParams.get('lang') === 'en' ? 'en' : 'de'
  const [path, anchor] = pageHref('places', locale, 'waitlist').split('#')
  const target = new URL(`${path}?${WAITLIST_RESULT_PARAM}=${result.ok ? 'ok' : 'expired'}#${anchor}`, url.origin)
  return NextResponse.redirect(target, { headers: { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } })
}
