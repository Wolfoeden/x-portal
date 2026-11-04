'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

type Interest = 'buy' | 'rent' | 'both'
type MoveIn = 'spring_2027' | 'later'
type Status = 'idle' | 'sending' | 'sent' | 'confirmed' | 'expired' | 'failed' | 'limit'

/** Warteliste Node001. Speichert über /api/waitlist; erst der Link in der Mail bestätigt den Eintrag. */
export function WaitlistForm() {
  const id = useId()
  const { dict, ids, locale } = useLocale()
  const copy = dict.investors.waitlist
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState<Interest | null>(null)
  const [moveIn, setMoveIn] = useState<MoveIn | null>(null)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  // Rückkehr vom Bestätigungslink: ?waitlist=ok oder ?waitlist=expired
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get('waitlist')
    if (result === 'ok') setStatus('confirmed')
    else if (result === 'expired') setStatus('expired')
  }, [])

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const valid = name.trim().length >= 2 && emailOk && interest !== null && consent

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, email, interest, moveIn: moveIn ?? undefined, note: note || undefined, consent: true, locale, website: website || undefined }),
      })
      setStatus(response.ok ? 'sent' : response.status === 429 ? 'limit' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  const field = 'h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50'
  const chip = (on: boolean) => `h-10 rounded-full px-4 text-[14px] transition-colors ${on ? 'bg-ink text-white' : 'border border-line-strong text-ink hover:border-ink/40'}`
  const done = status === 'sent' || status === 'confirmed'

  return (
    <section id={ids.waitlist} className="scroll-mt-16 pb-28 md:pb-36" aria-labelledby="waitlist-title">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 overflow-hidden rounded-[36px] border border-line bg-surface p-7 sm:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:p-16">
          <div className="flex flex-col gap-6">
            <h2 id="waitlist-title" className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-ink">
              {copy.title}
            </h2>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-muted">{copy.text}</p>
            <p className="mt-auto max-w-[420px] text-[12.5px] leading-relaxed text-faint">{copy.legal}</p>
          </div>

          <div className="rounded-[28px] bg-white p-6 text-ink sm:p-8">
            {done ? (
              <div className="flex min-h-[360px] flex-col justify-center gap-4" role="status">
                <span className="grid size-12 place-items-center rounded-full bg-brand text-white">
                  <Check aria-hidden size={22} strokeWidth={2.5} />
                </span>
                <p className="text-[24px] font-medium tracking-[-0.015em]">
                  {status === 'confirmed' ? copy.confirmed : fill(copy.thanks, { name: name.trim().split(' ')[0] })}
                </p>
                <p className="text-[15px] text-muted">{status === 'confirmed' ? copy.confirmedText : copy.thanksText}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-4">
                {status === 'expired' ? <p className="rounded-2xl bg-amber-soft px-4 py-3 text-[13.5px] text-amber-ink" role="status">{copy.expired}</p> : null}
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-name`}>
                    {copy.name}
                    <input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} className={field} aria-invalid={tried && name.trim().length < 2} />
                  </label>
                  <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-email`}>
                    {copy.email}
                    <input id={`${id}-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} className={field} aria-invalid={tried && !emailOk} />
                  </label>
                </div>
                <fieldset className="flex flex-col gap-2" aria-invalid={tried && interest === null}>
                  <legend className="mb-1.5 text-[14px] font-medium">{copy.interestLegend}</legend>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(copy.interests) as Interest[]).map((key) => (
                      <button key={key} type="button" aria-pressed={interest === key} onClick={() => setInterest(key)} className={chip(interest === key)}>
                        {copy.interests[key]}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1.5 text-[14px] font-medium">
                    {copy.moveInLegend} <span className="font-normal text-faint">{copy.optional}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(copy.moveIns) as MoveIn[]).map((key) => (
                      <button key={key} type="button" aria-pressed={moveIn === key} onClick={() => setMoveIn(moveIn === key ? null : key)} className={chip(moveIn === key)}>
                        {copy.moveIns[key]}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-note`}>
                  <span>
                    {copy.note} <span className="font-normal text-faint">{copy.optional}</span>
                  </span>
                  <textarea id={`${id}-note`} value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={1000} className="w-full rounded-2xl border border-line-strong bg-white px-4 py-3 text-[16px] text-ink outline-none transition-colors focus:border-ink/50" />
                </label>
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] h-px w-px opacity-0"
                />
                <label className="mt-1 flex items-start gap-3 text-[13.5px] leading-relaxed text-muted" htmlFor={`${id}-consent`}>
                  <input id={`${id}-consent`} type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#17643b]" aria-invalid={tried && !consent} />
                  {copy.consent}
                </label>
                {tried && !valid ? <p className="text-[13.5px] text-amber-ink">{copy.error}</p> : null}
                {status === 'failed' ? <p className="text-[13.5px] text-amber-ink" role="alert">{copy.failed}</p> : null}
                {status === 'limit' ? <p className="text-[13.5px] text-amber-ink" role="alert">{copy.limit}</p> : null}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60 sm:w-fit sm:px-7"
                >
                  {status === 'sending' ? copy.sending : copy.submit}
                  <ArrowRight aria-hidden size={17} strokeWidth={2} />
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
