'use client'

import { useId, useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

/** Deck-Anfrage. In der Vorschau wird nichts gesendet oder gespeichert. */
export function DeckForm() {
  const id = useId()
  const { dict, ids } = useLocale()
  const copy = dict.investors.deck
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [kind, setKind] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
  const valid = name.trim().length >= 2 && emailOk && consent

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (valid) setSent(true)
  }

  const field = 'h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50'

  return (
    <section id={ids.deck} className="scroll-mt-16 pb-28 md:pb-36" aria-labelledby="deck-title">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 overflow-hidden rounded-[36px] bg-brand-deep p-7 text-white sm:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:p-16">
          <div className="flex flex-col gap-6">
            <h2 id="deck-title" className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em]">
              {copy.title}
            </h2>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-[#cfe2d6]">{copy.text}</p>
            <p className="mt-auto max-w-[420px] text-[12.5px] leading-relaxed text-[#bfd8c8]/80">
              {copy.legal}
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-6 text-ink sm:p-8">
            {sent ? (
              <div className="flex min-h-[360px] flex-col justify-center gap-4" role="status">
                <span className="grid size-12 place-items-center rounded-full bg-brand text-white">
                  <Check aria-hidden size={22} strokeWidth={2.5} />
                </span>
                <p className="text-[24px] font-medium tracking-[-0.015em]">{fill(copy.thanks, { name: name.trim().split(' ')[0] })}</p>
                <p className="text-[15px] text-muted">{copy.thanksText}</p>
                <p className="rounded-2xl bg-amber-soft px-4 py-3 text-[13.5px] text-amber-ink">{copy.previewNote}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-name`}>
                    {copy.name}
                    <input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={field} aria-invalid={tried && name.trim().length < 2} />
                  </label>
                  <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-email`}>
                    {copy.email}
                    <input id={`${id}-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={field} aria-invalid={tried && !emailOk} />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5 text-[14px] font-medium" htmlFor={`${id}-org`}>
                  <span>
                    {copy.organisation} <span className="font-normal text-faint">{copy.optional}</span>
                  </span>
                  <input id={`${id}-org`} value={organisation} onChange={(event) => setOrganisation(event.target.value)} autoComplete="organization" className={field} />
                </label>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1.5 text-[14px] font-medium">
                    {copy.kindLegend} <span className="font-normal text-faint">{copy.optional}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {copy.kinds.map((item) => (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={kind === item}
                        onClick={() => setKind(kind === item ? null : item)}
                        className={`h-10 rounded-full px-4 text-[14px] transition-colors ${kind === item ? 'bg-ink text-white' : 'border border-line-strong text-ink hover:border-ink/40'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-1 flex items-start gap-3 text-[13.5px] leading-relaxed text-muted" htmlFor={`${id}-consent`}>
                  <input
                    id={`${id}-consent`}
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-[#17643b]"
                    aria-invalid={tried && !consent}
                  />
                  {copy.consent}
                </label>
                {tried && !valid ? <p className="text-[13.5px] text-amber-ink">{copy.error}</p> : null}
                <button
                  type="submit"
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-fit sm:px-7"
                >
                  {copy.submit}
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
