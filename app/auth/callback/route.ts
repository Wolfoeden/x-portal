import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { pagePath } from '@/lib/i18n/routes'
import { safePath } from '@/lib/supabase/env'
import { serverSupabase } from '@/lib/supabase/server'

// Rückweg von Google, LinkedIn, GitHub (?code=…) und aus den Mails von Supabase (?token_hash=…&type=…).
// Der Mail-Weg funktioniert auch in einem anderen Browser als dem, in dem der Link angefordert wurde.

const EMAIL_TYPES: readonly EmailOtpType[] = ['email', 'signup', 'magiclink', 'email_change', 'invite', 'recovery']

export async function GET(request: Request) {
  const url = new URL(request.url)
  const locale = url.searchParams.get('lang') === 'en' ? 'en' : 'de'
  // Fehler gehen dorthin zurück, wo es weitergehen sollte (z. B. /konto beim Verbinden von GitHub), sonst zur Anmeldung.
  const failed = (reason: string) => {
    const target = safePath(url.searchParams.get('next'), pagePath('signIn', locale))
    return NextResponse.redirect(new URL(`${target}${target.includes('?') ? '&' : '?'}error=${reason}`, url.origin))
  }
  const done = () => NextResponse.redirect(new URL(safePath(url.searchParams.get('next'), pagePath('account', locale)), url.origin))

  const supabase = await serverSupabase()
  if (!supabase) return failed('unavailable')

  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  if (tokenHash && type && EMAIL_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      console.error(JSON.stringify({ event: 'auth_verify_failed', code: error.code ?? error.name }))
      return failed('link')
    }
    return done()
  }

  const code = url.searchParams.get('code')
  // Lehnt der Anbieter ab oder bricht jemand ab, kommt statt eines Codes ein Fehler zurück.
  if (!code) {
    const providerError = url.searchParams.get('error_code')
    return failed(providerError === 'identity_already_exists' ? 'identity_taken' : url.searchParams.get('error') ? 'provider' : 'missing_code')
  }
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error(JSON.stringify({ event: 'auth_exchange_failed', code: error.code ?? error.name }))
    return failed('exchange')
  }
  return done()
}
