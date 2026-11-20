import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Erlöse und Kapital in einem Abschnitt (seit 17.11.2026; ersetzt „Erlöse“ und „Kapital“).
// Kapital getrennt nach Firma und Node001 (D46, D47). Keine Beträge nach außen (Wahl vom 14.11.2026). Aufruf und Rechtshinweis stehen beim Formular.
export function ChapterMoney({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.money
  const ids = IDS[locale]
  return (
    <section id={ids.revenue} className="scroll-mt-16 bg-surface py-14 md:py-32" aria-labelledby="money-title">
      <Container className="flex flex-col gap-10">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="05">{copy.label}</ChapterLabel>
          <h2 id="money-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-muted md:text-[18px]">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <article className="rounded-[24px] bg-white p-6">
            <h3 className="text-[13px] font-normal text-faint">{copy.streamsLabel}</h3>
            <ul className="mt-3 flex flex-col">
              {copy.streams.map((stream) => (
                <li key={stream.name} className="flex flex-col gap-1 border-t border-line py-3">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[17px] font-medium text-ink">{stream.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-medium ${stream.live ? 'bg-brand-soft text-brand-ink' : 'bg-surface-2 text-body'}`}>{stream.status}</span>
                  </span>
                  <span className="text-[15px] leading-relaxed text-muted">{stream.text}</span>
                </li>
              ))}
            </ul>
          </article>
          <article id={ids.capital} className="scroll-mt-16 rounded-[24px] bg-white p-6">
            <h3 className="text-[13px] font-normal text-faint">{copy.capitalLabel}</h3>
            <ul className="mt-3 flex flex-col">
              {copy.capital.map((item) => (
                <li key={item.tag} className="flex flex-col gap-1 border-t border-line py-3">
                  <span className="text-[17px] font-medium text-ink">{item.tag}</span>
                  <span className="text-[15px] leading-relaxed text-muted">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-line pt-3 text-[15px] text-ink">{copy.terms}</p>
          </article>
        </div>
      </Container>
    </section>
  )
}
