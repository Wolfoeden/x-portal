import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

/** Ruhige Zeitleiste. Einzige Jahreszahl im Block steht bei Stufe 0, als Ziel. */
export function PlacesTimeline({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.timeline
  return (
    <section id={IDS[locale].plan} aria-labelledby="fahrplan-title" className="scroll-mt-16 border-b border-line bg-surface">
      <Container className="py-14 md:py-24">
        <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
        <h2 id="fahrplan-title" className={`${chapterTitle} mt-3 text-ink`}>
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.note}</p>
        <p className="mt-2 text-[15px] text-muted">
          {copy.proof}{' '}
          <a href={`#${IDS[locale].detail}`} className="font-medium text-brand underline-offset-4 hover:underline">
            {copy.proofLink} →
          </a>
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.phases.map((phase) => (
            <li key={phase.state} className="flex flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
              <p className="text-[13px] font-medium tracking-[0.01em] text-muted">{phase.state}</p>
              <ul className="flex flex-col gap-2">
                {phase.items.map((item) => (
                  <li key={item} className="text-[15px] leading-snug text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
