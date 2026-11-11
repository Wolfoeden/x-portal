import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Was heute vorhanden ist, was in Arbeit und was offen. Nur Belegtes; Muster der Karten wie bei den Erlösen.
export function ChapterStatus({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.status
  return (
    <section id={IDS[locale].status} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="status-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="05">{copy.label}</ChapterLabel>
          <h2 id="status-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[520px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          {copy.columns.map((column) => (
            <article key={column.title} className="flex flex-col rounded-[28px] border border-line p-7 md:p-8">
              <span className={`w-fit rounded-full px-2.5 py-1 text-[12.5px] font-medium ${column.live ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'}`}>{column.title}</span>
              <ul className="mt-6 flex flex-col">
                {column.items.map((item) => (
                  <li key={item} className="border-t border-line py-3 text-[15px] leading-relaxed text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
