import { ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Was steht, was in Arbeit ist, was offen ist: eine Karte mit drei Gruppen statt drei Karten (kürzer auf dem Handy).
// Die Technik aus plan/technik/technik.json klappt auf; nur was läuft, ohne Beträge (Wahl vom 14.11.2026).
export function ChapterStatus({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.status
  return (
    <section id={IDS[locale].status} className="scroll-mt-16 py-14 md:py-32" aria-labelledby="status-title">
      <Container className="flex flex-col gap-10">
        <div className="flex max-w-[760px] flex-col gap-4">
          <ChapterLabel number="03">{copy.label}</ChapterLabel>
          <h2 id="status-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="text-[15px] text-muted">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 rounded-[24px] border border-line p-6 md:grid-cols-3 md:p-8">
          {copy.columns.map((column) => (
            <div key={column.title}>
              <h3 className={`w-fit rounded-full px-2.5 py-1 text-[12.5px] font-medium ${column.live ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'}`}>{column.title}</h3>
              <ul className="mt-3 flex flex-col">
                {column.items.map((item) => (
                  <li key={item} className="border-t border-line py-2 text-[15px] leading-snug text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <details className="group rounded-[24px] border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
            <span className="flex flex-col gap-1">
              <span className="text-[19px] font-medium tracking-[-0.015em] text-ink">{copy.tech.title}</span>
              <span className="text-[14.5px] leading-relaxed text-muted">{copy.tech.text}</span>
            </span>
            <ChevronDown aria-hidden size={20} strokeWidth={2} className="shrink-0 text-faint transition-transform group-open:rotate-180" />
          </summary>
          <dl className="grid grid-cols-[minmax(0,1fr)] border-t border-line md:grid-cols-2">
            {copy.tech.rows.map((row) => (
              <div key={row.tool} className="flex flex-col gap-0.5 border-b border-line px-6 py-3 md:odd:border-r">
                <dt className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-medium text-ink">{row.tool}</span>
                  <span className="text-[12.5px] text-faint">{row.area}</span>
                </dt>
                <dd className="text-[14.5px] leading-snug text-muted">{row.purpose}</dd>
                <dd className="text-[13px] leading-snug text-faint">
                  {copy.tech.head.proof}: {row.proof}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </Container>
    </section>
  )
}
