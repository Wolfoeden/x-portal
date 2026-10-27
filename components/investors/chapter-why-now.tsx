import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Nur belegte Aussagen mit Quelle. Die Firmen sind Quellen, keine Kunden von XPORTAL.
const sources = {
  vodafone: 'https://n8n.io/case-studies/vodafone/',
  lufthansa: 'https://www.lufthansa-industry-solutions.com/de-de/studien/whitepaper-agentic-ai-2025',
  aiAct: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
}

function Source({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mt-auto inline-flex w-fit items-center gap-1 pt-6 text-[13px] text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink">
      {children}
      <ArrowUpRight aria-hidden size={13} strokeWidth={2} />
    </a>
  )
}

export function ChapterWhyNow({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.whyNow
  return (
    <section id={IDS[locale].whyNow} className="scroll-mt-16 bg-surface py-28 md:py-40" aria-labelledby="warum-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="03">{copy.label}</ChapterLabel>
          <h2 id="warum-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[500px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          <article className="flex flex-col rounded-[28px] bg-white p-7 md:p-8">
            <p className="text-[13px] text-faint">{copy.vodafone.tag}</p>
            <p className="mt-6 text-[clamp(3rem,5vw,4.25rem)] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums">{copy.vodafone.value}</p>
            <p className="mt-2 text-[17px] text-ink">{copy.vodafone.unit}</p>
            <dl className="mt-6 flex flex-col gap-2 border-t border-line pt-4 text-[14.5px]">
              {copy.vodafone.rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-medium tabular-nums text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Source href={sources.vodafone}>{copy.vodafone.source}</Source>
          </article>

          <article className="flex flex-col rounded-[28px] bg-white p-7 md:p-8">
            <p className="text-[13px] text-faint">{copy.lufthansa.tag}</p>
            <blockquote className="mt-6 text-[22px] leading-snug tracking-[-0.01em] text-ink">{copy.lufthansa.quote}</blockquote>
            <p className="mt-4 text-[14px] text-muted">{copy.lufthansa.by}</p>
            <Source href={sources.lufthansa}>{copy.lufthansa.source}</Source>
          </article>

          <article className="flex flex-col rounded-[28px] bg-brand-deep p-7 text-white md:p-8">
            <p className="text-[13px] text-[#bfd8c8]">{copy.aiAct.tag}</p>
            <p className="mt-6 text-[clamp(3rem,5vw,4.25rem)] font-medium leading-none tracking-[-0.04em] tabular-nums">{copy.aiAct.value}</p>
            <p className="mt-3 text-[17px] leading-snug">{copy.aiAct.text}</p>
            <a href={sources.aiAct} target="_blank" rel="noreferrer" className="mt-auto inline-flex w-fit items-center gap-1 pt-6 text-[13px] text-[#bfd8c8] underline decoration-white/30 underline-offset-4 hover:text-white">
              {copy.aiAct.source}
              <ArrowUpRight aria-hidden size={13} strokeWidth={2} />
            </a>
          </article>
        </div>
        <p className="text-[13px] text-faint">{copy.note}</p>
      </Container>
    </section>
  )
}
