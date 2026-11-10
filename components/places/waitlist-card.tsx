'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { ArrowRight, Check, Clock, House, Laptop, Mail, Tag, User, type LucideProps } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { useWaitlist, type WaitlistStart, type WaitlistUse } from '@/components/places/waitlist-state'
import { fill } from '@/lib/i18n/format'
import { pageHref } from '@/lib/i18n/routes'
import { WAITLIST_RESULT_PARAM, type WaitlistResultValue } from '@/lib/waitlist/result'

const ICONS: Record<WaitlistUse, ComponentType<LucideProps>> = { workation: Laptop, mieten: House, kaufen: Tag }

function Step({ number, children }: { number: number; children: string }) {
  return (
    <legend className="mb-3 flex items-center gap-2.5 p-0 text-[15px] font-medium text-ink">
      <span aria-hidden className="grid size-6 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">
        {number}
      </span>
      {children}
    </legend>
  )
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Status = 'idle' | 'sending' | 'failed' | 'limit'

/**
 * Karte der Warteliste. Sendet an /api/waitlist; gespeichert wird unbestätigt in waitlist_entries, dazu geht ein Link per Mail.
 * Erst der Klick darauf bestätigt den Eintrag; der Link führt mit ?waitlist=ok oder ?waitlist=expired hierher zurück.
 * Fehler stehen am Feld, der Fokus springt zum ersten.
 */
export function WaitlistCard() {
  const { locale, dict } = useLocale()
  const copy = dict.places.waitlist
  const { email, setEmail, use, setUse, start, setStart } = useWaitlist()
  const [firstName, setFirstName] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [done, setDone] = useState(false)
  const [returned, setReturned] = useState<WaitlistResultValue | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)

  // Rückkehr vom Bestätigungslink aus der Mail.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get(WAITLIST_RESULT_PARAM)
    if (value === 'ok' || value === 'expired') setReturned(value)
  }, [])

  const emailError = !email.trim() ? copy.emailMissing : EMAIL.test(email.trim()) ? null : copy.emailInvalid
  const consentError = consent ? null : copy.consentMissing
  const showEmailError = tried && emailError
  const showConsentError = tried && consentError

  const submit = async () => {
    setTried(true)
    if (emailError) return emailRef.current?.focus()
    if (consentError) return consentRef.current?.focus()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const offer = new URLSearchParams(window.location.search).get(locale === 'de' ? 'angebot' : 'offer') ?? undefined
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ use, start, firstName: firstName.trim() || undefined, email: email.trim(), consent: true, locale, offer, website: website || undefined }),
      })
      if (response.ok) {
        setStatus('idle')
        setReturned(null)
        setDone(true)
        return
      }
      setStatus(response.status === 429 ? 'limit' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  const useTitle = copy.uses.find((item) => item.id === use)?.title ?? ''
  const startLabel = copy.starts.find((item) => item.id === start)?.label ?? ''

  if (returned === 'ok' && !done) {
    return (
      <div className="flex flex-col items-start gap-5 p-8 md:p-10" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-brand text-white">
          <Check aria-hidden size={26} strokeWidth={2.25} />
        </span>
        <h3 className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-ink">{copy.confirmedTitle}</h3>
        <p className="max-w-[440px] text-muted">{copy.confirmedText}</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-5 p-8 md:p-10" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
          <Mail aria-hidden size={26} strokeWidth={1.75} />
        </span>
        <h3 className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-ink">{copy.doneTitle}</h3>
        <p className="max-w-[440px] text-muted">{fill(copy.doneText, { email: email.trim() })}</p>
        <dl className="grid w-full grid-cols-[max-content_1fr] gap-x-6 gap-y-2 rounded-2xl bg-surface p-5 text-[14.5px]">
          <dt className="text-faint">{copy.doneUse}</dt>
          <dd className="font-medium text-ink">{useTitle}</dd>
          <dt className="text-faint">{copy.doneStart}</dt>
          <dd className="font-medium text-ink">{startLabel}</dd>
        </dl>
        <ol className="flex flex-col gap-2.5 text-[15px] text-ink">
          {copy.doneSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className={`grid size-6 place-items-center rounded-full text-[12px] font-semibold ${index === 0 ? 'bg-brand text-white' : 'bg-surface text-muted'}`}>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => {
            setDone(false)
            setTried(false)
          }} className="text-[15px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
          {copy.again}
        </button>
      </div>
    )
  }

  return (
    <form
      aria-label={copy.cardTitle}
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
      className="flex flex-col"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-2 px-5 pb-5 pt-6 md:px-8 md:pt-7">
        <div className="flex flex-col gap-1">
          <p className="text-[13px] font-medium text-brand">{copy.kicker}</p>
          <h3 className="text-[28px] font-medium leading-[1.1] tracking-[-0.03em] text-ink">{copy.cardTitle}</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] text-muted">
          <Clock aria-hidden size={14} strokeWidth={2} />
          {copy.duration}
        </span>
      </div>

      <div className="flex flex-col gap-7 px-5 py-6 md:px-8 md:py-7">
        {returned === 'expired' ? (
          <p role="status" className="rounded-xl bg-[#fbe9e4] px-3.5 py-2.5 text-[13.5px] text-[#a3361f]">
            <span className="font-medium">{copy.expiredTitle}</span> {copy.expiredText}
          </p>
        ) : null}
        <fieldset className="min-w-0">
          <Step number={1}>{copy.useQuestion}</Step>
          <div className="flex flex-col gap-2">
            {copy.uses.map((item) => {
              const id = item.id as WaitlistUse
              const on = use === id
              const Icon = ICONS[id]
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setUse(id)}
                  className={`flex min-h-[68px] w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? 'border-[1.5px] border-brand bg-[#f3f8f5]' : 'border border-[#e1e5e1] bg-white hover:border-line-strong'}`}
                >
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${on ? 'bg-brand text-white' : 'bg-surface text-body'}`}>
                    <Icon aria-hidden size={20} strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-medium text-ink">{item.title}</span>
                    <span className="text-[13px] leading-snug text-muted">{item.text}</span>
                  </span>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full ${on ? 'bg-brand' : 'shadow-[inset_0_0_0_1.5px_#c9d0cb]'}`}>
                    {on ? <Check aria-hidden size={12} strokeWidth={3} className="text-white" /> : null}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <Step number={2}>{copy.startQuestion}</Step>
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
            {copy.starts.map((item) => {
              const on = start === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStart(item.id as WaitlistStart)}
                  className={`min-h-11 rounded-xl px-2 py-1.5 text-[13.5px] font-medium leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-brand ${on ? 'bg-white text-ink shadow-[0_1px_2px_rgb(14_20_17/0.08),0_4px_12px_-6px_rgb(14_20_17/0.25)]' : 'text-muted hover:text-ink'}`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <Step number={3}>{copy.contactQuestion}</Step>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="flex h-[52px] items-center gap-2.5 rounded-[14px] border border-line-strong bg-white px-4 focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/15">
              <User aria-hidden size={18} strokeWidth={1.75} className="text-faint" />
              <span className="sr-only">{copy.firstName}</span>
              <input name="vorname" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder={copy.firstName} className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint" />
            </label>
            <div className="flex flex-col gap-1.5">
              <label className={`flex h-[52px] items-center gap-2.5 rounded-[14px] border bg-white px-4 focus-within:ring-[3px] ${showEmailError ? 'border-[#a3361f] focus-within:ring-[#a3361f]/15' : 'border-line-strong focus-within:border-brand focus-within:ring-brand/15'}`}>
                <Mail aria-hidden size={18} strokeWidth={1.75} className={showEmailError ? 'text-[#a3361f]' : 'text-faint'} />
                <span className="sr-only">{copy.email}</span>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.email}
                  aria-invalid={showEmailError ? true : undefined}
                  aria-describedby={showEmailError ? 'warteliste-email-fehler' : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
                />
              </label>
              {showEmailError ? (
                <p id="warteliste-email-fehler" className="text-[13px] font-medium text-[#a3361f]">
                  {emailError}
                </p>
              ) : null}
            </div>
          </div>
          <label className={`mt-3 flex cursor-pointer items-start gap-3 rounded-[14px] px-4 py-3.5 text-[13.5px] leading-normal text-muted ${showConsentError ? 'bg-[#fbe9e4] ring-1 ring-[#a3361f]/40' : 'bg-surface'}`}>
            <input
              ref={consentRef}
              type="checkbox"
              name="einwilligung"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              aria-invalid={showConsentError ? true : undefined}
              aria-describedby={showConsentError ? 'warteliste-einwilligung-fehler' : undefined}
              className="mt-px size-5 shrink-0 accent-brand"
            />
            <span>
              {copy.consent}{' '}
              <a href={pageHref('home', locale, 'privacy')} className="text-brand underline underline-offset-2">
                {copy.privacy}
              </a>
            </span>
          </label>
          {showConsentError ? (
            <p id="warteliste-einwilligung-fehler" className="mt-1.5 text-[13px] font-medium text-[#a3361f]">
              {consentError}
            </p>
          ) : null}
          {/* Honigtopf: für Menschen unsichtbar, Bots füllen es aus. */}
          <input type="text" name="website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
        </fieldset>
      </div>

      <div className="flex flex-col gap-3.5 border-t border-surface-2 bg-[#fafbfa] px-5 pb-6 pt-5 md:px-8 md:pb-7">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13.5px] text-muted">
          <span>{copy.selection}</span>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 font-medium text-brand-ink">{useTitle}</span>
          <span className="rounded-full border border-line bg-white px-2.5 py-1 text-body">{startLabel}</span>
        </p>
        {status === 'failed' || status === 'limit' ? (
          <p role="alert" className="rounded-xl bg-[#fbe9e4] px-3.5 py-2.5 text-[13.5px] font-medium text-[#a3361f]">
            {status === 'limit' ? copy.limit : copy.failed}
          </p>
        ) : null}
        <button type="submit" disabled={status === 'sending'} className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-brand text-[16.5px] font-medium text-white shadow-[0_10px_24px_-12px_rgb(23_100_59/0.8)] transition-colors hover:bg-brand-hover disabled:opacity-70">
          {status === 'sending' ? copy.sending : copy.submit}
          <ArrowRight aria-hidden size={18} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
        </button>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12.5px] text-faint">
          {copy.trust.map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <Check aria-hidden size={14} strokeWidth={2} className="text-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </form>
  )
}
