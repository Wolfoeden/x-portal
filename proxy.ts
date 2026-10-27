import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_OPTIONS, supabasePublicEnv } from '@/lib/supabase/env'

// Hält die Anmeldung frisch und schreibt erneuerte Tokens zurück. Läuft nur auf Konto- und Anmeldeseiten,
// damit alle anderen Seiten weiter fertig aus dem CDN kommen. Ohne Rückschreiben würde ein Refresh-Token
// zweimal benutzt, und Supabase beendet die Sitzung.
export async function proxy(request: NextRequest) {
  const env = supabasePublicEnv()
  if (!env) return NextResponse.next()

  let response = NextResponse.next({ request })
  const supabase = createServerClient(env.url, env.publishableKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options)
      },
    },
  })
  await supabase.auth.getClaims()
  return response
}

export const config = {
  matcher: ['/konto', '/anmelden', '/en/account', '/en/sign-in'],
}
