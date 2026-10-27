'use client'

import Link from 'next/link'
import { useId, useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'
import { CONTACT_TOPICS, contactHref, type ContactTopic } from '@/lib/contact/topics'
import { fill } from '@/lib/i18n/format'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'limit'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Kontaktseite: Thema wählen (steht in der Adresse), dann schreiben. Gespeichert wird in Supabase, sichtbar in ops.posteingang. */
export function ContactSection({ topic }: { topic: ContactTopic }) {
  const id = useId()
  const { dict, locale } = useLocale()
  const copy = dict.contact
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [sentTopic, setSentTopic] = useState<ContactTopic>(topic)

  const emailOk = EMAIL.test(email.trim())
  const valid = name.trim().length >= 2 && emailOk && message.trim().length >= 10

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, name, email, company: company || undefined, message, locale, website: website || undefined }),
      })
      if (response.ok) {
        setSentTopic(topic)
        setStatus('sent')
        return
      }
      setStatus(response.status === 429 ? 'limit' : 'failed')
    } catch {
      setStatus('failed')
    }
  }

  const reset = () => {
    setMessage('')
    setTried(false)
    setStatus('idle')
  }

  const field = 'h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50'

  return (
    <section className="py-14 md:py-24" aria-labelledby="kontakt-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <p className="text-[14px] text-faint">{copy.label}</p>
          <h1 id="kontakt-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h1>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
          <nav aria-label={copy.topicsLabel} className="mt-2">
            <p className="mb-3 text-[14px] font-medium text-ink">{copy.topicsLabel}</p>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
              {CONTACT_TOPICS.map((item) => {
                const active = item === topic
                return (
                  <li key={item}>
                    <Link
                      href={contactHref(item, locale)}
                      scroll={false}
                      replace
                      aria-current={active ? 'true' : undefined}
                      className={`flex h-full flex-col rounded-2xl border px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        active ? 'border-ink bg-ink text-white' : 'border-line-strong bg-white text-ink hover:border-ink/40'
                      }`}
                    >
                      <span className="text-[15px] font-medium">{copy.topics[item].label}</span>
                      <span className={`text-[13px] ${active ? 'text-white/75' : 'text-muted'}`}>{copy.topics[item].text}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.3)] sm:p-8 lg:self-start">
          {status === 'sent' ? (
            <div className="flex min-h-[420px] flex-col justify-center gap-4" role="status">
              <span className="grid size-12 place-items-center rounded-full bg-brand text-white">
                <Check aria-hidden size={22} strokeWidth={2.5} />
              </span>
              <p className="text-[24px] font-medium tracking-[-0.015em] text-ink">{fill(copy.thanks, { name: name.trim().split(' ')[0] })}</p>
              <p className="text-[15px] text-muted">{fill(copy.thanksText, { topic: copy.topics[sentTopic].label })}</p>
              <button type="button" onClick={reset} className="mt-2 w-fit text-[15px] font-medium text-ink underline-offset-4 hover:underline">
                {copy.another}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
              <p className="text-[20px] font-medium tracking-[-0.015em] text-ink">{fill(copy.formTitle, { topic: copy.topics[topic].label })}</p>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-[14px] font-medium text-ink" htmlFor={`${id}-name`}>
                  {copy.name}
                  <input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={120} className={field} aria-invalid={tried && name.trim().length < 2} />
                </label>
                <label className="flex flex-col gap-1.5 text-[14px] font-medium text-ink" htmlFor={`${id}-email`}>
                  {copy.email}
                  <input id={`${id}-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} className={field} aria-invalid={tried && !emailOk} />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-[14px] font-medium text-ink" htmlFor={`${id}-company`}>
                <span>
                  {copy.company} <span className="font-normal text-faint">{copy.optional}</span>
                </span>
                <input id={`${id}-company`} value={company} onChange={(event) => setCompany(event.target.value)} autoComplete="organization" maxLength={160} className={field} />
              </label>
              <label className="flex flex-col gap-1.5 text-[14px] font-medium text-ink" htmlFor={`${id}-message`}>
                {copy.message}
                <textarea
                  id={`${id}-message`}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  maxLength={4_000}
                  placeholder={copy.topics[topic].placeholder}
                  className="w-full resize-y rounded-2xl border border-line-strong bg-white px-4 py-3 text-[16px] leading-relaxed text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50"
                  aria-invalid={tried && message.trim().length < 10}
                />
              </label>
              {/* Honigtopf: für Menschen unsichtbar, Bots füllen es aus. */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-px w-px opacity-0"
              />
              {tried && !valid ? <p className="text-[13.5px] text-amber-ink">{copy.error}</p> : null}
              {status === 'failed' ? <p className="text-[13.5px] text-amber-ink" role="alert">{copy.failed}</p> : null}
              {status === 'limit' ? <p className="text-[13.5px] text-amber-ink" role="alert">{copy.limit}</p> : null}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-70 sm:w-fit sm:px-7"
              >
                {status === 'sending' ? copy.sending : copy.submit}
                <ArrowRight aria-hidden size={17} strokeWidth={2} />
              </button>
              <p className="text-[12.5px] leading-relaxed text-faint">{copy.note}</p>
            </form>
          )}
        </div>
      </Container>
    </section>
  )
}
