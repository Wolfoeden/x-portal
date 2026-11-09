import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

// Software ohne Preise, mit Verweis auf die Plattform auf der Startseite.
export function ChapterRevenue({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.revenue
  return (
    <section id={IDS[locale].revenue} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="erloese-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="04">{copy.label}</ChapterLabel>
          <h2 id="erloese-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[520px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          {copy.streams.map((stream, index) => (
            <article key={stream.name} className="flex flex-col rounded-[28px] border border-line p-7 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${stream.live ? 'bg-brand-soft text-brand-ink' : 'bg-amber-soft text-amber-ink'}`}>{stream.status}</span>
              </div>
              <h3 className="mt-8 text-[32px] font-medium tracking-[-0.025em] text-ink">{stream.name}</h3>
              <dl className="mt-6 flex flex-col">
                {stream.items.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-4 border-t border-line py-3 text-[15px]">
                    <dt className="text-ink">{item.label}</dt>
                    <dd className="text-right tabular-nums text-muted">{item.value}</dd>
                  </div>
                ))}
              </dl>
              {stream.link ? (
                <Link href={pagePath('home', locale)} className="group mt-6 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-brand underline decoration-brand/30 underline-offset-[6px] hover:decoration-brand">
                  {stream.link}
                  <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        {copy.note ? <p className="text-[13px] text-faint">{copy.note}</p> : null}
      </Container>
    </section>
  )
}
