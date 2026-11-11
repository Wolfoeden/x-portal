import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Wer XPORTAL ist und warum: Leitlinie P01 in zwei Absätzen, dazu für wen der Nutzen entsteht.
export function ChapterAbout({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.about
  return (
    <section id={IDS[locale].about} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="about-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div className="flex flex-col gap-6">
          <ChapterLabel number="01">{copy.label}</ChapterLabel>
          <h2 id="about-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          {copy.text.map((paragraph) => (
            <p key={paragraph} className="max-w-[620px] text-[18px] leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-3 lg:self-end">
          <p className="text-[13px] text-faint">{copy.audienceLabel}</p>
          <ul className="flex flex-col">
            {copy.audience.map((item) => (
              <li key={item.who} className="flex flex-col gap-1 border-t border-line py-4">
                <span className="text-[17px] font-medium text-ink">{item.who}</span>
                <span className="text-[15px] leading-relaxed text-muted">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
