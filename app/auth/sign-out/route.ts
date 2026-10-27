import { NextResponse } from 'next/server'
import { pagePath } from '@/lib/i18n/routes'
import { isSameOrigin } from '@/lib/server/request'
import { serverSupabase } from '@/lib/supabase/server'

// Abmelden per Formular (POST), damit kein Link oder Bild jemanden abmelden kann.

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response('origin', { status: 403 })
  const form = await request.formData().catch(() => null)
  const locale = form?.get('lang') === 'en' ? 'en' : 'de'
  const supabase = await serverSupabase()
  if (supabase) await supabase.auth.signOut()
  return NextResponse.redirect(new URL(pagePath('home', locale), new URL(request.url).origin), 303)
}
