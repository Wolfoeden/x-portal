'use client'

import { useId, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { UserIdentity } from '@supabase/supabase-js'
import { Check, Sparkles } from 'lucide-react'
import { GitHubLogo, LinkedInLogo } from '@/components/brand/channel-logos'
import { useLocale } from '@/components/i18n/locale-provider'
import { Card, inputClass, smallButton } from '@/components/account/fields'
import { fill } from '@/lib/i18n/format'
import { pagePath } from '@/lib/i18n/routes'
import type { ImportDraft } from '@/lib/profile/draft'
import { browserSupabase } from '@/lib/supabase/browser'
import type { OAuthProvider } from '@/lib/supabase/env'

type Linked = 'github' | 'linkedin_oidc'

function Row({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-6 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="flex min-w-0 gap-4">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-ink">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[16px] font-medium text-ink">{title}</p>
          <p className="mt-1 max-w-[460px] text-[14px] leading-relaxed text-muted">{text}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">{children}</div>
    </div>
  )
}

/** Profil ergänzen: Lebenslauf per KI, GitHub, LinkedIn. Vorschläge landen im Formular, gespeichert wird erst mit „Speichern“. */
export function ImportsCard({
  hasCv,
  github,
  linkedin,
  canUnlink,
  providers,
  onDraft,
  onLinkedinName,
  onAvatar,
}: {
  hasCv: boolean
  github: { login: string } | null
  linkedin: { name: string | null; picture: string | null } | null
  canUnlink: boolean
  /** Anbieter, die in Supabase eingeschaltet sind. */
  providers: OAuthProvider[]
  onDraft: (draft: ImportDraft) => number
  onLinkedinName: () => void
  onAvatar: (url: string | null) => void
}) {
  const id = useId()
  const router = useRouter()
  const { dict, locale } = useLocale()
  const copy = dict.account.imports
  const [busy, setBusy] = useState<'cv' | 'github' | 'linkedin' | 'link' | null>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [otherLogin, setOtherLogin] = useState(false)
  const [login, setLogin] = useState('')

  const errorText = (code: string | undefined) => copy.errors[code ?? 'failed'] ?? copy.errors.failed
  const applied = (draft: ImportDraft) => {
    const taken = onDraft(draft)
    setMessage({ tone: 'ok', text: taken ? fill(copy.taken, { count: taken }) : copy.nothing })
  }

  const run = async (kind: 'cv' | 'github', body: object) => {
    setBusy(kind)
    setMessage(null)
    try {
      const response = await fetch(kind === 'cv' ? '/api/profile/cv-extract' : '/api/profile/github-import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...body, locale }),
      })
      const data = (await response.json().catch(() => ({}))) as { draft?: ImportDraft; error?: string }
      if (response.ok && data.draft) applied(data.draft)
      else setMessage({ tone: 'error', text: errorText(data.error) })
    } catch {
      setMessage({ tone: 'error', text: copy.errors.failed })
    } finally {
      setBusy(null)
    }
  }

  // Verbinden wechselt nie das Konto: linkIdentity hängt GitHub oder LinkedIn an das angemeldete Konto.
  const connect = async (provider: Linked) => {
    const supabase = browserSupabase()
    if (!supabase) return setMessage({ tone: 'error', text: copy.errors.unavailable })
    setBusy('link')
    const next = encodeURIComponent(pagePath('account', locale))
    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?lang=${locale}&next=${next}`, ...(provider === 'linkedin_oidc' ? { scopes: 'openid profile email' } : {}) },
    })
    if (error) {
      setBusy(null)
      setMessage({ tone: 'error', text: errorText(error.code === 'manual_linking_disabled' ? 'manual_linking' : 'failed') })
    }
  }

  const disconnect = async (provider: Linked) => {
    const supabase = browserSupabase()
    if (!supabase) return
    setBusy('link')
    setMessage(null)
    const { data } = await supabase.auth.getUserIdentities()
    const identity = data?.identities.find((item: UserIdentity) => item.provider === provider)
    const { error } = identity ? await supabase.auth.unlinkIdentity(identity) : { error: new Error('missing') }
    setBusy(null)
    if (error) return setMessage({ tone: 'error', text: copy.errors.failed })
    router.refresh()
  }

  const takePhoto = async () => {
    setBusy('linkedin')
    setMessage(null)
    try {
      const response = await fetch('/api/profile/linkedin', { method: 'POST' })
      const data = (await response.json().catch(() => ({}))) as { avatarUrl?: string | null; error?: string }
      if (!response.ok) return setMessage({ tone: 'error', text: errorText(data.error) })
      onAvatar(data.avatarUrl ?? null)
      setMessage({ tone: 'ok', text: copy.linkedinPhotoDone })
    } catch {
      setMessage({ tone: 'error', text: copy.errors.failed })
    } finally {
      setBusy(null)
    }
  }

  const unlinkButton = (provider: Linked) =>
    canUnlink ? (
      <button type="button" onClick={() => disconnect(provider)} disabled={busy !== null} className="text-[13.5px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink disabled:opacity-50">
        {copy.unlink}
      </button>
    ) : null

  return (
    <Card id="ergaenzen" title={copy.title} text={copy.text}>
      <div className="flex flex-col divide-y divide-line">
        <Row icon={<Sparkles size={18} strokeWidth={1.75} />} title={copy.cv} text={hasCv ? copy.cvText : `${copy.cvText} ${copy.cvNeedsFile}`}>
          <button type="button" onClick={() => run('cv', {})} disabled={!hasCv || busy !== null} className={smallButton}>
            {busy === 'cv' ? copy.cvRunning : copy.cvRun}
          </button>
        </Row>

        <Row icon={<GitHubLogo className="size-[18px]" />} title={copy.github} text={copy.githubText}>
          {github ? <p className="flex items-center gap-1.5 text-[13.5px] text-muted"><Check aria-hidden size={14} strokeWidth={2.5} className="text-brand" />{fill(copy.githubConnected, { login: github.login })}</p> : null}
          {github && !otherLogin ? (
            <button type="button" onClick={() => run('github', {})} disabled={busy !== null} className={smallButton}>
              {busy === 'github' ? copy.githubRunning : copy.githubRun}
            </button>
          ) : null}
          {!github && providers.includes('github') && !otherLogin ? (
            <button type="button" onClick={() => connect('github')} disabled={busy !== null} className={smallButton}>
              {copy.githubConnect}
            </button>
          ) : null}
          {otherLogin ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (login.trim()) run('github', { login: login.trim() })
              }}
              className="flex gap-2"
            >
              <label htmlFor={`${id}-login`} className="sr-only">
                {copy.githubLogin}
              </label>
              <input id={`${id}-login`} value={login} onChange={(event) => setLogin(event.target.value)} placeholder={copy.githubLogin} maxLength={120} autoComplete="off" spellCheck={false} className={`${inputClass} h-10 w-44`} />
              <button type="submit" disabled={busy !== null || !login.trim()} className={smallButton}>
                {busy === 'github' ? copy.githubRunning : copy.githubRun}
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setOtherLogin(true)} className="text-[13.5px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
              {copy.githubOther}
            </button>
          )}
          {github ? unlinkButton('github') : null}
        </Row>

        <Row icon={<LinkedInLogo className="size-[17px]" />} title={copy.linkedin} text={copy.linkedinText}>
          {linkedin ? (
            <>
              <p className="flex items-center gap-1.5 text-[13.5px] text-muted"><Check aria-hidden size={14} strokeWidth={2.5} className="text-brand" />{fill(copy.linkedinConnected, { name: linkedin.name ?? 'LinkedIn' })}</p>
              <div className="flex flex-wrap gap-2">
                {linkedin.name ? (
                  <button type="button" onClick={onLinkedinName} disabled={busy !== null} className={smallButton}>
                    {copy.linkedinName}
                  </button>
                ) : null}
                {linkedin.picture ? (
                  <button type="button" onClick={takePhoto} disabled={busy !== null} className={smallButton}>
                    {copy.linkedinPhoto}
                  </button>
                ) : null}
              </div>
              {unlinkButton('linkedin_oidc')}
            </>
          ) : providers.includes('linkedin_oidc') ? (
            <button type="button" onClick={() => connect('linkedin_oidc')} disabled={busy !== null} className={smallButton}>
              {copy.linkedinConnect}
            </button>
          ) : null}
        </Row>
      </div>
      {message ? (
        <p role={message.tone === 'error' ? 'alert' : 'status'} className={`mt-6 rounded-2xl px-4 py-3 text-[14px] ${message.tone === 'error' ? 'bg-amber-soft text-amber-ink' : 'bg-brand-soft text-brand-ink'}`}>
          {message.text}
        </p>
      ) : null}
    </Card>
  )
}
