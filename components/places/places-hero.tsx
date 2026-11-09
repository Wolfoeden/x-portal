import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { AiBadge } from '@/components/places/ai-badge'
import { HeroEmailForm } from '@/components/places/hero-form'
import { StickyEmail } from '@/components/places/sticky-email'
import { getDictionary } from '@/lib/i18n/dictionary'
import { HUB_01 } from '@/lib/map/hubs'
import { MAP } from '@/lib/map/europe'
import type { Locale } from '@/lib/i18n/routes'

// Häuser im Luftbild (Pixel im Bild 1672 × 941): Dachmitte, die Nummer sitzt knapp darüber.
const HOUSES: [number, number][] = [
  [877, 572], [683, 276], [1432, 384], [1430, 170],
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
    <section id="top" aria-labelledby="orte-title" className="relative bg-brand-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_30%_75%,#1b5c39_0%,transparent_55%)]" />
      <Container className="relative flex flex-col gap-8 pb-16 pt-10 md:pb-24 md:pt-14">
        <h1 id="orte-title" className="sr-only">
          {copy.title}
        </h1>
        <p className="flex items-center gap-3 text-[13px] tracking-[0.02em] text-[#bfd8c8]">
          <span className="whitespace-nowrap">{copy.label}</span>
          <span aria-hidden className="h-px w-8 shrink-0 bg-[#bfd8c8]/50" />
          {copy.region}
        </p>


        {/* Das E-Mail-Feld läuft mit: erst unten am Bildschirm über dem Bild, dann an seinem Platz unter dem Bild,
            danach oben unter der Kopfzeile, bis „Ein Ort. Für Dich.“ kommt; dort geht es in den Knopf der Kopfzeile über. */}
        <div className="relative flex flex-col gap-10">
          <figure className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_4px_rgb(0_0_0/0.1),0_50px_90px_-40px_rgb(0_0_0/0.7)]">
          <div className="relative overflow-hidden" style={{ aspectRatio: `${IMAGE.width} / ${IMAGE.height}` }}>
            <Image src="/orte/hub-01-hang.webp" alt={copy.imageAlt} fill priority sizes="(min-width: 1272px) 1208px, 100vw" className="animate-[orte-zoom_1.8s_cubic-bezier(.2,.7,.2,1)_both] object-cover motion-reduce:animate-none" />
            {HOUSES.map(([x, y], index) => (
              <span key={index} className="orte-pin" style={{ left: `${(x / IMAGE.width) * 100}%`, top: `${(y / IMAGE.height) * 100}%` }}>
                <span aria-hidden className="orte-pin-ring" style={{ animationDelay: `${index * 0.4}s` }} />
                <span className="orte-pin-dot">{index + 1}</span>
              </span>
            ))}
            <AiBadge text={dict.aiImage} label={dict.aiImageLabel} />
          </div>
          <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-ink md:px-6">
            <b className="text-[16px] font-medium">{copy.houses}</b>
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
          {/* Direkt im mitlaufenden Bereich, sonst endet sticky zu früh. Der Hinweis bleibt an seinem Platz. */}
          <StickyEmail>
            <HeroEmailForm />
          </StickyEmail>

          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
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
          </div>
        </div>
      </Container>
    </section>
  )
}
