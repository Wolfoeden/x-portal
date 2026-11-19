import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { EuropeAtlas } from '@/components/map/europe-atlas'
import { KindBadge } from '@/components/places/ai-badge'
import { IMAGES } from '@/lib/images'
import { HeroEmailForm, HeroPill } from '@/components/places/hero-form'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/routes'

/**
 * Hero der Seite Orte wie das Vorschaubild beim Teilen: Drohnenbild über die ganze Breite, links abgedunkelt,
 * darauf „Node001 · Westukraine“, die Überschrift und der Weg zur Warteliste. Das E-Mail-Feld sitzt vor der Europakarte.
 */
export function PlacesHero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.hero

  return (
    <section id="top" aria-labelledby="orte-title" className="relative bg-brand-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_30%_85%,#1b5c39_0%,transparent_55%)]" />
      <div className="relative flex flex-col gap-10 pb-16 md:pb-24">
        <div className="relative h-[min(calc(100svh-4rem),860px)] min-h-[560px] overflow-hidden">
          <Image
            src={IMAGES.hub01.src}
            alt={copy.imageAlt}
            fill
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
            className="object-cover object-[62%_50%] md:object-center"
          />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_30_20/0.15)_0%,rgb(10_30_20/0)_30%,rgb(10_30_20/0.55)_62%,rgb(10_30_20/0.9)_100%)] md:bg-[linear-gradient(90deg,rgb(10_30_20/0.88)_0%,rgb(10_30_20/0.55)_45%,rgb(10_30_20/0)_75%)]" />
          <Container className="relative flex h-full flex-col justify-end pb-[calc(1.5rem+140px)] sm:pb-[calc(3rem+76px)] md:pb-[calc(4.5rem+76px)]">
            <KindBadge kind={IMAGES.hub01.kind} words={dict} className="left-5 top-5 md:left-8 md:top-8" />
            <p className="absolute left-[3.25rem] top-5 z-10 max-w-[min(280px,calc(100%-5.5rem))] rounded-2xl bg-[rgb(10_30_20/0.72)] px-3 py-1.5 text-[12.5px] leading-snug text-white md:left-[4.5rem] md:top-8 md:max-w-[360px] md:text-[13px]">
              {copy.caption}
            </p>
            <div className="flex max-w-[780px] flex-col items-start gap-4 md:gap-5">
              <p className="text-[clamp(1rem,1.6vw,1.375rem)] tracking-[0.01em] text-[#bfd8c8]">{copy.eyebrow}</p>
              <h1 id="orte-title" className="text-[clamp(2.5rem,5vw,4.25rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance">
                {copy.title}
              </h1>
              <div className="mt-1 md:mt-2">
                <HeroPill label={copy.pill} />
              </div>
            </div>
          </Container>
        </div>

        <div className="relative z-10 mx-auto -mt-24 w-[calc(100%-2.5rem)] max-w-[560px] sm:-mt-20">
          <HeroEmailForm />
        </div>

        <Container className="w-full">
          <figure className="location-atlas" id="node001">
            <EuropeAtlas label={copy.mapLabel} name={copy.label} />
            <figcaption>
              <p className="diagram-kicker">{copy.label}</p>
              <h2>{copy.region}</h2>
              <p className="atlas-status">{copy.hubStatus}</p>
            </figcaption>
          </figure>
        </Container>
      </div>
    </section>
  )
}
