import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Wofür Kapital gesucht wird: Firma und Node001 getrennt. Keine Beträge, bis sie festgelegt sind; der Knopf führt zur Deck-Anfrage.
export function ChapterCapital({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.capital
  const ids = IDS[locale]
  return (
    <section id={ids.capital} className="scroll-mt-16 bg-surface py-28 md:py-40" aria-labelledby="capital-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="09">{copy.label}</ChapterLabel>
          <h2 id="capital-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[520px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {copy.cards.map((card) => (
            <article key={card.tag} className="flex flex-col rounded-[28px] bg-white p-7 md:p-8">
              <p className="text-[13px] text-faint">{card.tag}</p>
              <h3 className="mt-4 text-[28px] font-medium leading-tight tracking-[-0.02em] text-ink">{card.title}</h3>
              <dl className="mt-6 flex flex-col">
                {card.rows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 border-t border-line py-3">
                    <dt className="text-[13px] text-faint">{row.label}</dt>
                    <dd className="text-[15px] leading-relaxed text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <a
            href={`#${ids.deck}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-fit sm:px-7"
          >
            {copy.cta}
            <ArrowRight aria-hidden size={17} strokeWidth={2} />
          </a>
          <p className="max-w-[640px] text-[13px] leading-relaxed text-faint">{copy.note}</p>
        </div>
      </Container>
    </section>
  )
}
