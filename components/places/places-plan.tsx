import Link from 'next/link'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pageHref, type Locale } from '@/lib/i18n/routes'

function Marks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(⟦[^⟧]*⟧)/).map((part, index) =>
        part.startsWith('⟦') ? (
          <mark key={index} className="rounded bg-amber-soft px-1 text-amber-ink">
            {part.slice(1, -1)}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** Ruhige Zeitleiste. Einzige Jahreszahl im Block steht bei Stufe 0, als Ziel. */
export function PlacesTimeline({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.timeline
  return (
    <section id={IDS[locale].plan} aria-labelledby="fahrplan-title" className="scroll-mt-16 border-b border-line bg-surface">
      <Container className="py-14 md:py-24">
        <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
        <h2 id="fahrplan-title" className={`${chapterTitle} mt-3 text-ink`}>
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.note}</p>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.phases.map((phase) => (
            <li key={phase.state} className="flex flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
              <p className="text-[13px] font-medium tracking-[0.01em] text-muted">{phase.state}</p>
              <ul className="flex flex-col gap-2">
                {phase.items.map((item) => (
                  <li key={item} className="text-[15px] leading-snug text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}

/** Kompakter Investorenblock. Zahlen, Bewertung und Fotos bleiben Platzhalter, bis sie belegt sind. */
export function PlacesForInvestors({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.forInvestors
  return (
    <section id={IDS[locale].placeInvestors} aria-labelledby="orte-investoren-title" className="scroll-mt-16">
      <Container className="py-14 md:py-28">
        <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
        <h2 id="orte-investoren-title" className={`${chapterTitle} mt-3 text-ink`}>
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.text}</p>
        <dl className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            [copy.whyTitle, copy.why],
            [copy.needTitle, copy.need],
            [copy.capitalTitle, copy.capital],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-line pt-4">
              <dt className="text-[14px] font-medium text-ink">{title}</dt>
              <dd className="mt-2 text-[15.5px] leading-relaxed text-muted">
                <Marks text={body} />
              </dd>
            </div>
          ))}
          <div className="border-t border-line pt-4">
            <dt className="text-[14px] font-medium text-ink">{copy.stagesTitle}</dt>
            <dd className="mt-2 text-[15.5px] leading-relaxed text-muted">
              {copy.stages}{' '}
              <a href={`#${IDS[locale].plan}`} className="font-medium text-brand underline-offset-4 hover:underline">
                {copy.stagesLink} →
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-8 border-t border-line pt-6">
          <p className="text-[14px] font-medium text-ink">{copy.teamTitle}</p>
          <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-8">
            {copy.people.map((person) => (
              <li key={person.name} className="text-[15.5px] text-ink">
                {person.name} <span className="text-muted">· {person.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] text-muted">
            <Marks text={copy.photo} />
          </p>
        </div>
        <div className="mt-8 flex flex-col items-start gap-3">
          <Link href={pageHref('investors', locale, 'deck')} className="inline-flex h-12 items-center rounded-full bg-brand px-5 text-[15px] font-medium text-white transition-colors hover:bg-brand-hover">
            {copy.cta}
          </Link>
          <p className="max-w-[520px] text-[13.5px] leading-relaxed text-faint">{copy.note}</p>
        </div>
      </Container>
    </section>
  )
}
