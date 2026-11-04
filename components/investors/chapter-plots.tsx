import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Kaufen oder mieten auf Node001: Ablauf in vier Schritten. Kein Preis und keine Rendite, bis die Prüfung abgeschlossen ist.
export function ChapterPlots({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.plots
  const ids = IDS[locale]
  return (
    <section id={ids.plots} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="plots-title">
      <Container className="flex flex-col gap-14">
        <div className="flex max-w-[760px] flex-col gap-5">
          <ChapterLabel number="06">{copy.label}</ChapterLabel>
          <h2 id="plots-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[560px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <ol className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-[28px] border border-line p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] tabular-nums text-faint">0{index + 1}</span>
                <span className={`rounded-full px-2.5 py-1 text-[12.5px] font-medium ${index === 0 ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'}`}>{step.when}</span>
              </div>
              <h3 className="mt-4 text-[24px] font-medium leading-tight tracking-[-0.02em] text-ink">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 rounded-[28px] bg-surface p-6 md:p-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className="text-[13px] text-faint">{copy.factsLabel}</p>
            <dl className="mt-3 flex flex-col">
              {copy.facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-4 border-t border-line py-3 text-[15px]">
                  <dt className="text-ink">{fact.label}</dt>
                  <dd className="text-right text-muted">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-4">
            <a
              href={`#${ids.waitlist}`}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-fit sm:px-7"
            >
              {copy.cta}
              <ArrowRight aria-hidden size={17} strokeWidth={2} />
            </a>
            <p className="text-[13px] leading-relaxed text-faint">{copy.note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
