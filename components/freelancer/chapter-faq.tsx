import { Plus } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Antworten nach den Regeln des bestehenden Bewerber-Portals (Kosten, Sichtbarkeit, Prüfung, Unterlagen); Texte im Wörterbuch.
export function ChapterFaq({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).freelancer.faq
  return (
    <section id={IDS[locale].faq} className="scroll-mt-16 border-t border-line py-28 md:py-36" aria-labelledby="fragen-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="06">{copy.label}</ChapterLabel>
          <h2 id="fragen-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
        </div>
        <div className="border-t border-line">
          {copy.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-transform duration-300 group-open:rotate-45">
                  <Plus aria-hidden size={16} strokeWidth={2} />
                </span>
              </summary>
              <p className="max-w-[620px] pb-6 pr-12 text-[16px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
