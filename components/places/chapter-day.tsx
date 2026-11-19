import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { KindBadge } from '@/components/places/ai-badge'
import { OfferAction } from '@/components/places/hero-form'
import { IMAGES, type ImageKey } from '@/lib/images'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

/**
 * „Ein Tag auf Node001“ (17.11.2026): das StoryBrand-Erfolgsbild als Tagesablauf, statt der Angebotskarten.
 * Wording nach dem Limbic-Sternbild „X-Portal Node001“ (Projektleitung, 17.11.2026; Index 3.0, Limbic Map beim Maslow-Teil):
 *   07:00 Morgen am Hang         Natur                    (Balance · Fantasie & Genuss)
 *   09:30 Frei und konzentriert  Effizienz, Freiheit      (Dominanz · Disziplin & Kontrolle / Abenteuer & Thrill)
 *   13:00 Gesund essen           Gesundheit               (Balance · Disziplin & Kontrolle)
 *   17:00 Draußen sein           Gesundheit, Natur        (Balance)
 *   20:00 Ruhig schlafen         Sicherheit               (Balance · Disziplin & Kontrolle)
 * Freiheit ist die freie Wahl von Platz und Dauer, nicht Abenteuerurlaub. Schwerpunkt bleibt 3 × Balance, 2 × Dominanz.
 * Fakten nur nach Plan: Kommunalgebäude (D64), Feuerstelle (D34), Sauna (D35), Gemüsegarten (M02-23) in Phase 1; Internet mit Starlink als Reserve (D63);
 * Trinkwasseraufbereitung (D61), Holz für den Winter (D60), Generator als Reserve (D59).
 */
const SCENE_IMAGES: (ImageKey | null)[] = ['unit', 'slope', null, null, 'target']
const POSITION: Record<string, string> = { unit: 'object-center', slope: 'object-[78%_50%]', target: 'object-[48%_45%]' }

export function ChapterDay({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.day
  return (
    <section id={IDS[locale].day} aria-labelledby="tag-title" className="scroll-mt-16">
      <Container className="flex flex-col gap-10 py-14 md:gap-14 md:py-32">
        <div className="flex max-w-[760px] flex-col gap-4">
          <ChapterLabel number="02">{copy.label}</ChapterLabel>
          <h2 id="tag-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[560px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.text}</p>
        </div>

        <ol className="relative flex flex-col gap-8 md:gap-10">
          {/* Zeitlinie */}
          <span aria-hidden className="absolute bottom-2 left-[27px] top-2 w-px bg-line md:left-[39px]" />
          {copy.scenes.map((scene, index) => {
            const key = SCENE_IMAGES[index]
            const image = key ? IMAGES[key] : null
            return (
              <li key={scene.time} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 md:grid-cols-[80px_minmax(0,1fr)] md:gap-x-8">
                <span className="relative z-10 mt-1 grid h-8 place-items-center self-start rounded-full bg-brand-deep px-2 text-[13px] font-medium tabular-nums text-white md:h-9 md:text-[14px]">
                  <time>{scene.time}</time>
                </span>
                <div className={`grid grid-cols-[minmax(0,1fr)] gap-4 ${image ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-10' : ''}`}>
                  <div className="flex max-w-[520px] flex-col gap-1.5">
                    <h3 className="text-[22px] font-medium leading-tight tracking-[-0.02em] text-ink md:text-[26px]">{scene.title}</h3>
                    <p className="text-[16px] leading-relaxed text-muted">{scene.text}</p>
                  </div>
                  {image ? (
                    <figure className="relative aspect-[16/10] overflow-hidden rounded-[22px]">
                      <Image src={image.src} alt={scene.imageAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className={`object-cover ${POSITION[key as string]}`} />
                      <KindBadge kind={image.kind} words={dict} />
                    </figure>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[24px] bg-brand-soft p-6 md:p-8">
          <p className="text-[20px] font-medium tracking-[-0.015em] text-ink md:text-[24px]">{copy.ctaText}</p>
          <OfferAction use="workation" label={copy.cta} className="bg-brand text-white hover:bg-brand-hover" />
        </div>
      </Container>
    </section>
  )
}
