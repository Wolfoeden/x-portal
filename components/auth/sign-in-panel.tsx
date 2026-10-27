'use client'

import Link from 'next/link'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { GitHubLogo, GoogleLogo, LinkedInLogo } from '@/components/brand/channel-logos'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'
import { pagePath } from '@/lib/i18n/routes'
import { browserSupabase } from '@/lib/supabase/browser'
import type { OAuthProvider as Provider } from '@/lib/supabase/env'

// Wie im alten Projekt: Google, LinkedIn (OpenID), GitHub und ein Link per E-Mail. Kein Passwort.
// Gezeigt wird nur, was in Supabase eingeschaltet ist.

const LOGOS: Record<Provider, ReactNode> = {
  google: <GoogleLogo className="size-5" />,
  linkedin_oidc: <LinkedInLogo className="size-[18px]" />,
  github: <GitHubLogo className="size-[18px]" />,
}

// Bei LinkedIn nur Name, E-Mail und Bild; GitHub und Google bleiben bei der Vorgabe von Supabase.
const SCOPES: Partial<Record<Provider, string>> = { linkedin_oidc: 'openid profile email' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type State = 'idle' | 'sending' | 'sent' | 'invalid' | 'wait' | 'failed' | 'unavailable'

/** Ohne Konto zur Adresse lehnt Supabase ab; die Seite sagt dasselbe wie bei Erfolg, damit sich Adressen nicht abfragen lassen. */
function unknownAccount(error: { code?: string; message?: string }) {
  return error.code === 'otp_disabled' || error.code === 'user_not_found' || Boolean(error.message?.toLowerCase().includes('signups not allowed'))
}

export function SignInPanel({
  error,
  providers,
  email: emailEnabled,
  signup = false,
}: {
  error: string | null
  providers: Provider[]
  email: boolean
  /** Vom Assistenten: Ein neues Konto entsteht, auch per E-Mail. */
  signup?: boolean
}) {
  const id = useId()
  const { dict, locale } = useLocale()
  const copy = dict.auth
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>(error === 'unavailable' ? 'unavailable' : error ? 'failed' : 'idle')
  const [busy, setBusy] = useState<Provider | null>(null)

  const redirectTo = () => `${window.location.origin}/auth/callback?lang=${locale}`

  const signInWith = async (provider: Provider) => {
    const supabase = browserSupabase()
    if (!supabase) return setState('unavailable')
    setBusy(provider)
    const scopes = SCOPES[provider]
    const { error: failure } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo(), ...(scopes ? { scopes } : {}) } })
    // Ohne Fehler leitet der Browser jetzt zum Anbieter weiter.
    if (failure) {
      setBusy(null)
      setState(failure.status === 429 ? 'wait' : 'failed')
    }
  }

  const sendLink = async (event: FormEvent) => {
    event.preventDefault()
    if (!EMAIL.test(email.trim())) return setState('invalid')
    const supabase = browserSupabase()
    if (!supabase) return setState('unavailable')
    setState('sending')
    const { error: failure } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: signup, emailRedirectTo: redirectTo() },
    })
    if (!failure || unknownAccount(failure)) return setState('sent')
    setState(failure.status === 429 ? 'wait' : 'failed')
  }

  const message =
    state === 'invalid' ? copy.emailInvalid : state === 'wait' ? copy.wait : state === 'failed' ? copy.failed : state === 'unavailable' ? copy.unavailable : null

  return (
    <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.3)] sm:p-8">
      <div className={`flex flex-col gap-3 ${providers.length ? '' : 'hidden'}`}>
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => signInWith(provider)}
            disabled={busy !== null}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-line-strong bg-white text-[15px] font-medium text-ink transition-colors hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
          >
            {LOGOS[provider]}
            {copy.providers[provider]}
          </button>
        ))}
      </div>

      {providers.length && emailEnabled ? (
        <div className="my-6 flex items-center gap-3 text-[13px] text-faint">
          <span aria-hidden className="h-px flex-1 bg-line" />
          {copy.or}
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
      ) : null}

      {!emailEnabled ? null : state === 'sent' ? (
        <p role="status" className="flex items-start gap-3 rounded-2xl bg-brand-soft px-4 py-3 text-[14.5px] leading-relaxed text-brand-ink">
          <Check aria-hidden size={18} strokeWidth={2.5} className="mt-0.5 shrink-0" />
          {fill(signup ? copy.signup.emailSent : copy.emailSent, { email: email.trim() })}
        </p>
      ) : (
        <form onSubmit={sendLink} noValidate className="flex flex-col gap-3">
          <label htmlFor={`${id}-email`} className="text-[14px] font-medium text-ink">
            {copy.email}
          </label>
          <input
            id={`${id}-email`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            maxLength={254}
            aria-invalid={state === 'invalid'}
            className="h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-70"
          >
            {state === 'sending' ? copy.emailSending : signup ? copy.signup.emailSubmit : copy.emailSubmit}
            <ArrowRight aria-hidden size={17} strokeWidth={2} />
          </button>
        </form>
      )}

      {message ? (
        <p role="alert" className="mt-4 text-[13.5px] text-amber-ink">
          {message}
        </p>
      ) : null}

      {signup ? <p className="mt-6 text-[13px] text-muted">{copy.signup.terms}</p> : null}
      <p className={`${signup ? 'mt-3' : 'mt-6'} text-[14px] text-muted`}>
        {signup ? copy.signup.haveAccount : copy.newHere}{' '}
        <Link href={signup ? pagePath('signIn', locale) : pagePath('freelancer', locale)} className="font-medium text-ink underline-offset-4 hover:underline">
          {signup ? copy.signup.haveAccountLink : copy.newHereLink}
        </Link>
      </p>
    </div>
  )
}
