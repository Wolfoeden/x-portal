import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { AiBadge } from '@/components/places/ai-badge'
import { HeroEmailForm, HeroPill } from '@/components/places/hero-form'
import { StickyEmail } from '@/components/places/sticky-email'
import { getDictionary } from '@/lib/i18n/dictionary'
import { HUB_01 } from '@/lib/map/hubs'
import { MAP } from '@/lib/map/europe'
import type { Locale } from '@/lib/i18n/routes'

// Kartenausschnitt: ganz Europa, oben etwas Luft für die hohen Blöcke in Skandinavien.
const VIEW = { x: 0, y: -50, width: MAP.width, height: MAP.height + 50 }
const leftOf = (x: number) => `${((x - VIEW.x) / VIEW.width) * 100}%`
const topOf = (y: number) => `${((y - VIEW.y) / VIEW.height) * 100}%`

/**
 * Hero der Seite Orte wie das Vorschaubild beim Teilen: Drohnenbild über die ganze Breite, links abgedunkelt,
 * darauf „Node001 · Westukraine“, die Überschrift und der Weg zur Warteliste. Darunter läuft das E-Mail-Feld mit, dann die Höhenkarte.
 */
export function PlacesHero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.hero
  const hub = reliefPoint(HUB_01[0], HUB_01[1])

  return (
    <section id="top" aria-labelledby="orte-title" className="relative bg-brand-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_30%_85%,#1b5c39_0%,transparent_55%)]" />
      {/* Bereich, in dem das E-Mail-Feld mitläuft: Bild, Feld, Karte. Das Feld muss direkt darin stehen, sonst endet sticky zu früh. */}
      <div className="relative flex flex-col gap-10 pb-16 md:pb-24">
        <div className="relative h-[min(calc(100svh-4rem),860px)] min-h-[560px] overflow-hidden">
          <Image
            src="/orte/hub-01-hang.webp"
            alt={copy.imageAlt}
            fill
            priority
            sizes="100vw"
            className="animate-[orte-zoom_1.8s_cubic-bezier(.2,.7,.2,1)_both] object-cover object-[62%_50%] motion-reduce:animate-none md:object-center"
          />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_30_20/0.15)_0%,rgb(10_30_20/0)_30%,rgb(10_30_20/0.55)_62%,rgb(10_30_20/0.9)_100%)] md:bg-[linear-gradient(90deg,rgb(10_30_20/0.88)_0%,rgb(10_30_20/0.55)_45%,rgb(10_30_20/0)_75%)]" />
          <Container className="relative flex h-full flex-col justify-end pb-[calc(1.5rem+140px)] sm:pb-[calc(3rem+76px)] md:pb-[calc(4.5rem+76px)]">
            <AiBadge text={dict.aiImage} label={dict.aiImageLabel} className="left-5 top-5 md:left-8 md:top-8" />
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

        <StickyEmail>
          <HeroEmailForm />
        </StickyEmail>

        <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <figure className="relative mx-auto w-full max-w-[640px]">
            <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`} className="h-auto w-full overflow-visible" role="img" aria-label={copy.mapLabel}>
              <ReliefLayer focus={HUB_01} tone="dark" />
              <circle cx={hub.x} cy={hub.top} r="20" fill="none" stroke="#fff" strokeWidth="2.5" className="hub-pulse" />
              <circle cx={hub.x} cy={hub.top} r="11" fill="#fff" />
            </svg>
            <div
              className="pointer-events-none absolute hidden whitespace-nowrap rounded-2xl bg-white px-3.5 py-2.5 text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)] md:block"
              style={{ left: `calc(${leftOf(hub.x)} - 250px)`, top: `calc(${topOf(hub.top)} - 104px)` }}
            >
              <p className="text-[14px] font-medium">{copy.hubName}</p>
              <p className="text-[12.5px] text-muted">{copy.hubStatus}</p>
            </div>
          </figure>
          <div className="flex flex-col gap-4">
            <p className="text-[13px] tracking-[0.02em] text-[#bfd8c8]">{copy.label}</p>
            <p className="text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.02] tracking-[-0.04em]">{copy.hubName}</p>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-[#bfd8c8]">{copy.region}</p>
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] text-white">
              <span aria-hidden className="size-2 rounded-full bg-[#8fd9ab]" />
              {copy.hubStatus}
            </p>
          </div>
        </Container>
      </div>
    </section>
  )
}
