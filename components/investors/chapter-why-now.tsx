import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Der eigene Nachweisweg: erst Kundenaufgaben, dann wiederverwendbare Lösungen, dann der erste Standort.
// Daneben nur die Pflicht aus dem EU AI Act als belegte Quelle; fremde Fallstudien belegen keine Nachfrage nach XPORTAL.
const aiActSource = 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'

export function ChapterWhyNow({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.whyNow
  return (
    <section id={IDS[locale].whyNow} className="scroll-mt-16 bg-surface py-28 md:py-40" aria-labelledby="warum-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="04">{copy.label}</ChapterLabel>
          <h2 id="warum-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[620px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
          <article className="flex flex-col rounded-[28px] bg-white p-7 md:col-span-2 md:p-8">
            <p className="text-[13px] text-faint">{copy.stepsLabel}</p>
            <ol className="mt-4 flex flex-col">
              {copy.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4 border-t border-line py-4">
                  <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                  <span>
                    <span className="block text-[18px] font-medium text-ink">{step.title}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-muted">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </article>

          <article className="flex flex-col rounded-[28px] bg-brand-deep p-7 text-white md:p-8">
            <p className="text-[13px] text-[#bfd8c8]">{copy.aiAct.tag}</p>
            <p className="mt-6 text-[clamp(3rem,5vw,4.25rem)] font-medium leading-none tracking-[-0.04em] tabular-nums">{copy.aiAct.value}</p>
            <p className="mt-3 text-[17px] leading-snug">{copy.aiAct.text}</p>
            <a href={aiActSource} target="_blank" rel="noreferrer" className="mt-auto inline-flex w-fit items-center gap-1 pt-6 text-[13px] text-[#bfd8c8] underline decoration-white/30 underline-offset-4 hover:text-white">
              {copy.aiAct.source}
              <ArrowUpRight aria-hidden size={13} strokeWidth={2} />
            </a>
          </article>
        </div>
      </Container>
    </section>
  )
}
