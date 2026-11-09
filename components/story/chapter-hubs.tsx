'use client'

import Link from 'next/link'
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { MARK } from '@/components/brand/logo-paths'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { MAP } from '@/lib/map/europe'
import { useMediaQuery } from '@/lib/use-media-query'
import { useLocale } from '@/components/i18n/locale-provider'
import { pagePath } from '@/lib/i18n/routes'

// Kartenausschnitt mit etwas Luft oben für die hohen Blöcke in Skandinavien.
const VIEW = { y: -50, height: MAP.height + 50 }

/** relief: Höhenblöcke der Karte (components/map/relief-map.tsx), auf dem Server gezeichnet. hub: Hub 01 oben auf seinem Block. */
type MapProps = { relief: ReactNode; hub: { x: number; top: number } }

// Geometrie der Bildmarke (Einheiten der viewBox 123 × 100).
const MARK_CENTER = { x: 61.5, y: 50 }
// Zielpunkt des Flugs: rechts vom Schlitz in der Kreuzung, dort ist die Marke bei jedem Seitenverhältnis am breitesten gefüllt.
const ZOOM_ORIGIN = { x: 69.2, y: 59.2 }
// Halbe Höhe des größten Rechtecks um den Zielpunkt, das ganz in der Marke liegt, je Seitenverhältnis (Breite / Höhe). Vermessen mit isPointInFill.
const COVER_TABLE: [number, number][] = [
  [0.42, 10.6], [0.5, 10], [0.6, 9.4], [0.75, 8.6], [1, 7.4], [1.33, 6.2], [1.6, 5.6], [1.78, 5.2], [2, 4.8], [2.4, 4.2],
]

function coverHalfHeight(ratio: number) {
  if (ratio <= COVER_TABLE[0][0]) return COVER_TABLE[0][1]
  const last = COVER_TABLE[COVER_TABLE.length - 1]
  if (ratio >= last[0]) return (last[1] * last[0]) / ratio
  const index = COVER_TABLE.findIndex(([r]) => r >= ratio)
  const [r0, h0] = COVER_TABLE[index - 1]
  const [r1, h1] = COVER_TABLE[index]
  return h0 + ((h1 - h0) * (ratio - r0)) / (r1 - r0)
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function HubsContent({ relief, hub }: MapProps) {
  const { locale, dict } = useLocale()
  const copy = dict.home.hubs
  return (
    <Container className="relative grid h-full grid-cols-[minmax(0,1fr)] items-center gap-10 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative z-10 flex flex-col gap-5">
        <ChapterLabel number="05" tone="light">
          {copy.label}
        </ChapterLabel>
        <h2 id="hubs-title" className={`${chapterTitle} text-white`}>
          {copy.title}
        </h2>
        <p className="max-w-[420px] text-[18px] leading-relaxed text-[#bfd8c8]">{copy.text}</p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5" aria-label={copy.squaresLabel}>
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className={`size-3.5 ${index === 0 ? 'bg-white' : 'border border-[#bfd8c8]/60'}`} />
            ))}
          </div>
          <p className="text-[14px] text-[#bfd8c8]">{copy.count}</p>
        </div>
        <Link href={pagePath('investors', locale)} className="mt-4 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-white underline decoration-white/40 underline-offset-[6px] hover:decoration-white">
          {copy.investors}
          <ArrowRight aria-hidden size={16} strokeWidth={2} />
        </Link>
        <p className="text-[12.5px] text-[#bfd8c8]/80">{copy.disclaimer}</p>
      </div>

      <div className="relative">
        <svg viewBox={`0 ${VIEW.y} ${MAP.width} ${VIEW.height}`} className="h-auto w-full" role="img" aria-label={copy.mapLabel}>
          {relief}
          <circle cx={hub.x} cy={hub.top} r="16" fill="none" stroke="#fff" strokeWidth="2" className="hub-pulse" />
          <circle cx={hub.x} cy={hub.top} r="9" fill="#fff" />
        </svg>
        <div
          className="absolute rounded-2xl bg-white px-4 py-3 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)]"
          style={{ left: `max(0px, calc(${(hub.x / MAP.width) * 100}% - 250px))`, top: `calc(${((hub.top - VIEW.y) / VIEW.height) * 100}% - 112px)` }}
        >
          <p className="text-[15px] font-medium text-ink">{copy.hubName}</p>
          <p className="text-[13px] text-muted">{copy.hubStatus}</p>
        </div>
      </div>
    </Container>
  )
}

/**
 * „Und dann …“ mit der Bildmarke darunter. Beim Hereinscrollen erscheint das X, danach wird es zum Fenster:
 * Die Fläche um das X ist weiß, durch das X sieht man das dunkle Kapitel. Man fliegt in die Kreuzung, bis nur noch Grün bleibt.
 */
function ApertureStage({ desktop, zoomEnd, children }: { desktop: boolean; zoomEnd: number; children?: (progress: MotionValue<number>) => ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<SVGPathElement>(null)
  const coverRef = useRef<SVGSVGElement>(null)
  const geometry = useRef({ width: 0, height: 0, x: 0, y: 0 })

  const { scrollYProgress: enter } = useScroll({ target: trackRef, offset: ['start end', 'start start'] })
  const { scrollYProgress: progress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  const andThen = useLocale().dict.home.hubs.andThen
  const markWidth = desktop ? 156 : 112
  const baseScale = markWidth / 123
  const zoomStart = 0.06

  const apply = useCallback(() => {
    const { width, height, x, y } = geometry.current
    const path = markRef.current
    if (!path || !width) return
    const appear = easeOut(clamp01((enter.get() - 0.35) / 0.5))
    const zoom = clamp01((progress.get() - zoomStart) / (zoomEnd - zoomStart))
    const fullScale = ((height / 2) / coverHalfHeight(width / height)) * 1.12
    const start = baseScale * appear
    const scale = start * Math.pow(fullScale / baseScale, Math.pow(zoom, 1.2))
    const glide = easeInOut(zoom)
    const fromX = x + (ZOOM_ORIGIN.x - MARK_CENTER.x) * start
    const fromY = y + (ZOOM_ORIGIN.y - MARK_CENTER.y) * start
    const anchorX = fromX + (width / 2 - fromX) * glide
    const anchorY = fromY + (height / 2 - fromY) * glide
    path.setAttribute('transform', `translate(${anchorX.toFixed(2)} ${anchorY.toFixed(2)}) scale(${scale.toFixed(4)}) translate(${-ZOOM_ORIGIN.x} ${-ZOOM_ORIGIN.y})`)
    if (coverRef.current) coverRef.current.style.visibility = zoom >= 1 ? 'hidden' : 'visible'
  }, [enter, progress, baseScale, zoomEnd])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const slot = slotRef.current
    if (!stage || !slot) return
    const measure = () => {
      const box = stage.getBoundingClientRect()
      const target = slot.getBoundingClientRect()
      geometry.current = { width: box.width, height: box.height, x: target.left - box.left + target.width / 2, y: target.top - box.top + target.height / 2 }
      apply()
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [apply])

  useMotionValueEvent(enter, 'change', apply)
  useMotionValueEvent(progress, 'change', apply)

  const wordOpacity = useTransform([enter, progress], ([e, p]) => clamp01(((e as number) - 0.3) / 0.4) * (1 - clamp01(((p as number) - zoomStart) / 0.12)))
  const wordY = useTransform([enter, progress], ([e, p]) => (1 - easeOut(clamp01(((e as number) - 0.3) / 0.5))) * 28 - clamp01(((p as number) - zoomStart) / 0.12) * 36)

  return (
    <div ref={trackRef} className={desktop ? 'relative h-[280vh]' : 'relative h-[230vh]'}>
      <div ref={stageRef} className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden bg-[radial-gradient(ellipse_at_50%_58%,#1b5c39_0%,#12402a_58%)]">
        {children ? children(progress) : null}

        <svg ref={coverRef} aria-hidden className="pointer-events-none absolute inset-0 size-full">
          <defs>
            <mask id="hub-aperture" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <rect width="100%" height="100%" fill="#fff" />
              <path ref={markRef} d={MARK.d} fillRule="evenodd" fill="#000" transform="scale(0)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="#fff" mask="url(#hub-aperture)" />
        </svg>

        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10 pb-[6vh] md:gap-12">
          <motion.p style={{ opacity: wordOpacity, y: wordY }} className="text-[clamp(2.75rem,5.4vw,4.75rem)] font-medium leading-none tracking-[-0.04em] text-ink">
            {andThen}
          </motion.p>
          {/* Platzhalter: Hier sitzt das X, bevor es zum Fenster wird. */}
          <div ref={slotRef} style={{ width: markWidth, height: (markWidth * 100) / 123 }} />
        </div>
      </div>
    </div>
  )
}

function DesktopContent({ progress, map }: { progress: MotionValue<number>; map: MapProps }) {
  const opacity = useTransform(progress, [0.6, 0.74], [0, 1])
  const y = useTransform(progress, [0.6, 0.74], [18, 0])
  const [live, setLive] = useState(false)
  useMotionValueEvent(progress, 'change', (value) => setLive(value > 0.66))
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0" inert={!live}>
      <HubsContent {...map} />
    </motion.div>
  )
}

export function ChapterHubs(map: MapProps) {
  const reduceMotion = useReducedMotion()
  // Am Desktop erscheint der Inhalt in der gehaltenen Szene, darunter folgt er nach dem Flug durch das X.
  const desktop = useMediaQuery('(min-width: 1024px)', true)
  const { ids } = useLocale()

  if (reduceMotion) {
    return (
      <section id={ids.hubs} aria-labelledby="hubs-title" className="relative scroll-mt-16 bg-brand-deep">
        <HubsContent {...map} />
      </section>
    )
  }

  if (desktop) {
    return (
      <section id={ids.hubs} aria-labelledby="hubs-title" className="relative">
        <ApertureStage desktop zoomEnd={0.6}>
          {(progress) => <DesktopContent progress={progress} map={map} />}
        </ApertureStage>
      </section>
    )
  }

  return (
    <section id={ids.hubs} aria-labelledby="hubs-title" className="relative">
      <ApertureStage desktop={false} zoomEnd={0.9} />
      <div className="bg-brand-deep">
        <HubsContent {...map} />
      </div>
    </section>
  )
}
