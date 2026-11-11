import Link from 'next/link'
import { ArrowDown, ArrowRight, Lock } from 'lucide-react'
import { Wordmark } from '@/components/brand/logo'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { HubPreview } from '@/components/investors/hub-preview'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'
import { projectLonLat } from '@/lib/map/europe'
import { HUB_01 } from '@/lib/map/hubs'

/**
 * Einstieg der Investorenseite: Das grüne XPORTAL-Logo steht in der Mitte, alle Orte Europas laufen dorthin zusammen.
 * Darunter die Höhenkarte; Node001 in den Karpaten hat eine eigene grüne Linie zum Logo und zeigt beim Überfahren oder Antippen ein Vorschaubild.
 * Gezeichnet in einer Bühne von 1440 × 980. Ab xl ist der Hero genau bildschirmhoch und die Bühne bedeckt ihn ganz (wie object-fit: cover);
 * die Karte reicht über alle Ränder der Bühne hinaus. Darunter stehen Text und Karte untereinander.
 */

const STAGE = { width: 1440, height: 980 }
const LOGO = { x: 720, y: 330 } // Mitte des Logos in der Bühne
// Ab xl: Karte groß genug, dass ihre Daten (lon −11…42, lat 35…71) über alle Bühnenränder reichen; Node001 steht rechts unter den Knöpfen.
const SCALE = 1.5 // Karteneinheiten → Bühne
const MAP_X = 0
const MAP_Y = -425
const MAP_SIZE = 0.7 // feinere Waben, weil die Karte hier groß steht
const toStage = (x: number, y: number): [number, number] => [MAP_X + x * SCALE, MAP_Y + y * SCALE]
// Schmale Bildschirme: eigener Ausschnitt ohne hohen Norden, wie bisher.
const [ANCHOR_X, ANCHOR_Y] = projectLonLat(12, 52)
const S_SCALE = 1.1
const S_MAP_X = LOGO.x - ANCHOR_X * S_SCALE + 100
const S_MAP_Y = LOGO.y - ANCHOR_Y * S_SCALE + 40
const SMALL = { x: S_MAP_X, y: S_MAP_Y + 220 * S_SCALE, width: 1000 * S_SCALE, height: 900 * S_SCALE }
const toSmall = (x: number, y: number): [number, number] => [S_MAP_X + x * S_SCALE, S_MAP_Y + y * S_SCALE]

// Beispielhafte Orte, an denen KI-Freelancer arbeiten. Keine Kundenliste, nur das Bild eines europäischen Netzes.
const CITIES: [number, number][] = [
  [-9.14, 38.72], [-3.7, 40.42], [2.17, 41.39], [-8.61, 41.15], [-6.26, 53.35], [-3.19, 55.95], [12.5, 41.9], [18.07, 59.33],
  [10.75, 59.91], [24.94, 60.17], [24.1, 56.95], [25.28, 54.69], [26.1, 44.43], [23.32, 42.7], [5.32, 60.39], [-0.13, 51.5],
  [2.35, 48.86], [16.37, 48.21], [14.42, 50.08], [13.4, 52.52], [21.01, 52.23], [19.04, 47.5], [-0.58, 44.84], [-1.55, 47.22],
  [-4.49, 48.39], [-8.47, 51.9], [-4.25, 55.86], [-2.24, 53.48], [-0.38, 39.47],
]
// Flächen von Text, Logo und Knöpfen in der Bühne: Dort stehen keine Punkte.
const TEXT_BOXES = [
  [540, 136, 900, 226],
  [470, 181, 970, 351],
  [400, 361, 1040, 436],
  [545, 461, 895, 521],
]
const POINTS = CITIES.map(([lon, lat]) => toStage(...projectLonLat(lon, lat))).filter(
  ([x, y]) => y < 800 && !TEXT_BOXES.some(([a, b, c, d]) => x > a - 30 && x < c + 30 && y > b - 30 && y < d + 30),
)

function arc(x1: number, y1: number, x2: number, y2: number, bend = 0.22) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const sign = dx >= 0 ? -1 : 1
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${(mx + sign * dy * bend).toFixed(1)} ${(my - sign * dx * bend).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`

function Stage({ hub, mapLabel }: { hub: [number, number]; mapLabel: string }) {
  return (
    <svg viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} className="absolute inset-0 size-full" role="img" aria-label={mapLabel}>
      <defs>
        <radialGradient id="opener-clear" cx={LOGO.x} cy="380" r="330" gradientUnits="userSpaceOnUse" gradientTransform={`translate(${LOGO.x} 380) scale(1.25 0.72) translate(-${LOGO.x} -380)`}>
          <stop offset="0" stopColor="#174d32" stopOpacity="1" />
          <stop offset="0.62" stopColor="#174d32" stopOpacity="0.92" />
          <stop offset="1" stopColor="#174d32" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${MAP_X.toFixed(1)} ${MAP_Y.toFixed(1)}) scale(${SCALE})`} opacity="0.75">
        <ReliefLayer focus={HUB_01} tone="dark" size={MAP_SIZE} />
      </g>
      {POINTS.map(([x, y], index) => (
        <path key={index} d={arc(x, y, LOGO.x, LOGO.y)} className="opener-flow" style={{ animationDelay: `${(index * -0.37).toFixed(2)}s` }} />
      ))}
      <path d={arc(hub[0], hub[1], LOGO.x, LOGO.y, 0.18)} className="opener-hubflow" />
      <rect width={STAGE.width} height={STAGE.height} fill="url(#opener-clear)" />
      {POINTS.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="6" fill="#e8f2ec" className="opener-city" style={{ animationDelay: `${(0.3 + index * 0.06).toFixed(2)}s` }} />
      ))}
    </svg>
  )
}

export function InvestorOpener({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.opener
  const ids = IDS[locale]
  const point = reliefPoint(HUB_01[0], HUB_01[1], MAP_SIZE)
  const hub = toStage(point.x, point.top)
  // Schmale Bildschirme zeigen die Waben in voller Größe, der Punkt sitzt auf deren Deckfläche.
  const pointSmall = reliefPoint(HUB_01[0], HUB_01[1])
  const hubSmall = toSmall(pointSmall.x, pointSmall.top)

  const words = (
    <p className="text-[clamp(1.5rem,2.1vw,1.875rem)] font-medium leading-none tracking-[-0.03em]">
      {copy.words.map((word, index) => (
        <span key={word} className={index === 0 ? 'text-[#7fa58f]' : index === 1 ? 'text-[#a9c8b5]' : 'text-white'}>
          {index > 0 ? ' ' : ''}
          {word}
        </span>
      ))}
    </p>
  )
  const title = (
    // Sichtbar zweimal (Bühne ab xl, darunter gestapelt), für Screenreader und Suchmaschinen nur einmal als h1 oben im Abschnitt.
    <div aria-hidden className="flex flex-col items-center gap-[clamp(1rem,1.8vw,1.625rem)] font-normal">
      <Wordmark className="h-auto w-[min(480px,78vw)] text-[#8fd9ab] drop-shadow-[0_0_32px_rgb(143_217_171/0.35)] xl:w-[33.3vw] xl:max-w-[480px]" />
      <span className="max-w-[620px] text-[clamp(1.125rem,1.55vw,1.375rem)] leading-normal tracking-[-0.01em] text-[#e3efe7]">{copy.textAfterLogo}</span>
    </div>
  )
  const actions = (
    <div className="flex flex-wrap justify-center gap-3">
      <Link href={`#${ids.deck}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {copy.deck}
        <ArrowRight aria-hidden size={17} strokeWidth={2} />
      </Link>
      <Link href={`#${ids.roadmap}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-medium text-white transition-colors hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {copy.roadmap}
        <ArrowDown aria-hidden size={16} strokeWidth={2} />
      </Link>
    </div>
  )
  const figures = (
    <dl className="grid grid-cols-[minmax(0,1fr)] gap-6 border-t border-white/15 pt-6 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
      {copy.figures.map((figure) => (
        <div key={figure.value}>
          <dt className="text-[clamp(1.75rem,2.4vw,2.125rem)] font-medium tracking-[-0.03em] tabular-nums">{figure.value}</dt>
          <dd className="mt-1 max-w-[260px] text-[14px] text-[#bfd8c8]">{figure.text}</dd>
        </div>
      ))}
    </dl>
  )
  const dataPill = (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-medium text-white backdrop-blur">
      <Lock aria-hidden size={12} strokeWidth={2} />
      {copy.dataSite}
    </p>
  )
  const preview = (
    <HubPreview
      href={pagePath('places', locale)}
      name={copy.hubName}
      status={copy.hubStatus}
      show={copy.hubShow}
      title={copy.hubPreviewTitle}
      text={copy.hubPreviewText}
      action={copy.hubPreviewAction}
      label={copy.hubPreviewLabel}
      imageAlt={copy.hubImageAlt}
    />
  )

  return (
    <section className="relative overflow-hidden bg-brand-deep text-white xl:h-[calc(100svh-4rem)] xl:min-h-[680px]" aria-labelledby="investoren-title">
      <h1 id="investoren-title" className="sr-only">
        {copy.text}
      </h1>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_38%,#1b5c39_0%,transparent_70%)]" />

      {/* Ab xl: eine Bühne, in der Logo, Linien und Karte genau übereinanderliegen. Sie bedeckt den Hero ganz (wie cover) und steht in seiner Mitte. */}
      <div
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:block"
        style={{ width: `max(100%, calc(max(100svh - 4rem, 680px) * ${(STAGE.width / STAGE.height).toFixed(4)}))`, aspectRatio: `${STAGE.width} / ${STAGE.height}` }}
      >
        <Stage hub={hub} mapLabel={copy.mapLabel} />
        <div className="absolute inset-x-0 flex flex-col items-center px-8 text-center" style={{ top: pct(150, STAGE.height) }}>
          <p className="mb-3.5 text-[14px] text-[#bfd8c8]">{copy.label}</p>
          {words}
          <div className="mt-[clamp(1rem,2vw,1.875rem)]">{title}</div>
          <div className="mt-[clamp(1.25rem,2.4vw,2.125rem)]">{actions}</div>
        </div>
        <div className="absolute z-10" style={{ left: pct(hub[0], STAGE.width), top: pct(hub[1], STAGE.height) }}>
          {preview}
        </div>
      </div>
      <div className="absolute left-8 top-8 hidden xl:block">{dataPill}</div>
      {/* Unten ausblenden, damit die Kennzahlen vor der Karte lesbar bleiben. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-56 bg-gradient-to-t from-brand-deep via-brand-deep/80 to-transparent xl:block" />
      <div className="absolute inset-x-0 bottom-8 hidden xl:block">
        <div className="mx-auto max-w-[1208px] px-8">{figures}</div>
      </div>

      {/* Darunter: Text oben, Karte mit Node001 darunter, Zahlen am Ende. */}
      <div className="relative flex flex-col items-center gap-8 px-5 pb-12 pt-12 text-center md:px-8 xl:hidden">
        {dataPill}
        <div className="flex flex-col items-center gap-4">
          <p className="text-[14px] text-[#bfd8c8]">{copy.label}</p>
          {words}
        </div>
        {title}
        {actions}
        <div className="relative w-full max-w-[640px]">
          <svg viewBox={`${SMALL.x.toFixed(1)} ${SMALL.y.toFixed(1)} ${SMALL.width} ${SMALL.height}`} className="h-auto w-full overflow-visible" aria-hidden>
            <g transform={`translate(${S_MAP_X.toFixed(1)} ${S_MAP_Y.toFixed(1)}) scale(${S_SCALE})`} opacity="0.85">
              <ReliefLayer focus={HUB_01} tone="dark" animate={false} />
            </g>
          </svg>
          <div className="absolute z-10" style={{ left: pct(hubSmall[0] - SMALL.x, SMALL.width), top: pct(hubSmall[1] - SMALL.y, SMALL.height) }}>
            {preview}
          </div>
        </div>
        <div className="w-full max-w-[1208px] text-left">{figures}</div>
      </div>
    </section>
  )
}
