import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// StoryBrand: Problem und Begleiter. Was fehlt und wer XPORTAL ist (Mission aus dem Index 3.0).
// Ersetzt seit 17.11.2026 „Wer wir sind“ und „Nachweisweg“; die Belege stehen im Abschnitt „Stand“.

export function ChapterWhy({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.why
  return (
    <section id={IDS[locale].about} className="scroll-mt-16 py-14 md:py-32" aria-labelledby="why-title">
      <Container>
        <div className="flex flex-col gap-5">
          <ChapterLabel number="01">{copy.label}</ChapterLabel>
          <h2 id="why-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          {copy.text.map((paragraph) => (
            <p key={paragraph} className="max-w-[600px] text-[17px] leading-relaxed text-muted md:text-[18px]">
              {paragraph}
            </p>
          ))}
          <figure className="mt-2 max-w-[600px] border-l-2 border-brand pl-4">
            <figcaption className="text-[13px] text-faint">{copy.missionLabel}</figcaption>
            <blockquote className="mt-1 text-[16px] leading-relaxed text-ink">{copy.mission}</blockquote>
          </figure>
        </div>
      </Container>
    </section>
  )
}
