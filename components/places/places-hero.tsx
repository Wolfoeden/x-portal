import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { AiBadge } from '@/components/places/ai-badge'
import { HeroEmailForm } from '@/components/places/hero-form'
import { getDictionary } from '@/lib/i18n/dictionary'
import { HUB_01 } from '@/lib/map/hubs'
import { MAP } from '@/lib/map/europe'
import type { Locale } from '@/lib/i18n/routes'

// Häuser im Luftbild (Pixel im Bild 1672 × 941), von links unten nach rechts oben gezählt.
const HOUSES: [number, number][] = [
  [474, 484], [735, 331], [1077, 267], [1323, 224], [1577, 276], [1052, 470], [1421, 428], [1190, 664],
]
const IMAGE = { width: 1672, height: 941 }

// Kartenausschnitt: ganz Europa, oben etwas Luft für die hohen Blöcke in Skandinavien.
const VIEW = { x: 0, y: -50, width: MAP.width, height: MAP.height + 50 }
const leftOf = (x: number) => `${((x - VIEW.x) / VIEW.width) * 100}%`
const topOf = (y: number) => `${((y - VIEW.y) / VIEW.height) * 100}%`

export function PlacesHero({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.hero
  const hub = reliefPoint(HUB_01[0], HUB_01[1])

  return (
    <section id="top" aria-labelledby="orte-title" className="relative overflow-hidden bg-brand-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_62%,#1b5c39_0%,transparent_55%)]" />
      <Container className="relative flex flex-col gap-10 pb-20 pt-12 md:pb-28 md:pt-[72px]">
        <h1 id="orte-title" className="sr-only">
          {copy.title}
        </h1>
        <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-6">
          <p className="flex items-center gap-3 text-[13px] tracking-[0.02em] text-[#bfd8c8] md:pt-[26px]">
            <span className="whitespace-nowrap">{copy.label}</span>
            <span aria-hidden className="h-px w-8 bg-[#bfd8c8]/50" />
            {copy.region}
          </p>
          <HeroEmailForm />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,8fr)] lg:gap-12">
          <figure className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
            <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`} className="h-auto w-full overflow-visible" role="img" aria-label={copy.mapLabel}>
              <ReliefLayer focus={HUB_01} tone="dark" />
              <circle cx={hub.x} cy={hub.top} r="20" fill="none" stroke="#fff" strokeWidth="2.5" className="hub-pulse" />
              <circle cx={hub.x} cy={hub.top} r="11" fill="#fff" />
            </svg>
            <div
              className="pointer-events-none absolute hidden whitespace-nowrap rounded-2xl md:block bg-white px-3.5 py-2.5 text-ink shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)]"
              style={{ left: `calc(${leftOf(hub.x)} - 250px)`, top: `calc(${topOf(hub.top)} - 104px)` }}
            >
              <p className="text-[14px] font-medium">{copy.hubName}</p>
              <p className="text-[12.5px] text-muted">{copy.hubStatus}</p>
            </div>
            <div className="mt-4 inline-flex flex-col rounded-2xl bg-white px-3.5 py-2.5 text-ink md:hidden">
              <p className="text-[14px] font-medium">{copy.hubName}</p>
              <p className="text-[12.5px] text-muted">{copy.hubStatus}</p>
            </div>
            <figcaption className="mt-3 text-[12.5px] text-[#bfd8c8]/85">{copy.reliefNote}</figcaption>
          </figure>

          <figure className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_4px_rgb(0_0_0/0.1),0_50px_90px_-40px_rgb(0_0_0/0.7)]">
            <div className="relative overflow-hidden" style={{ aspectRatio: `${IMAGE.width} / ${IMAGE.height}` }}>
              <Image src="/orte/hub-01-luftbild.webp" alt={copy.imageAlt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="animate-[orte-zoom_1.8s_cubic-bezier(.2,.7,.2,1)_both] object-cover motion-reduce:animate-none" />
              {HOUSES.map(([x, y], index) => (
                <span key={index} className="orte-pin" style={{ left: `${(x / IMAGE.width) * 100}%`, top: `${(y / IMAGE.height) * 100}%`, animationDelay: `${index * 0.3}s` }}>
                  <span aria-hidden className="orte-pin-ring" style={{ animationDelay: `${index * 0.3}s` }} />
                  <span className="orte-pin-dot">{index + 1}</span>
                </span>
              ))}
              <AiBadge text={dict.aiImage} label={dict.aiImageLabel} />
            </div>
            <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2.5 px-5 py-4 text-ink md:px-6">
              <span className="inline-flex items-center gap-2.5">
                <span className="grid size-[22px] place-items-center rounded-full border border-[#cfe3d6] bg-brand-soft text-[11px] font-semibold text-brand-ink">{HOUSES.length}</span>
                <b className="text-[16px] font-medium">{copy.houses}</b>
              </span>
              <span className="text-[14px] text-muted">{copy.housesText}</span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted lg:ml-auto" aria-label={copy.hubsLabel}>
                <span aria-hidden className="flex gap-1">
                  {Array.from({ length: 4 }, (_, index) => (
                    <span key={index} className={`size-3 ${index === 0 ? 'bg-brand' : 'border border-[#c9d0cb]'}`} />
                  ))}
                </span>
                <span aria-hidden>{copy.hubsOf}</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  )
}
