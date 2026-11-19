'use client'

import { useRef, useState } from 'react'
import { KindBadge } from '@/components/places/ai-badge'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'
import { IMAGES } from '@/lib/images'
import { PLAN_MARKS, PLAN_VIEW } from '@/components/places/plan-marks'

// Lagen auf dem beschnittenen Plan (Stempel und Unterschriften sind nicht im Bild). Anteile in Prozent.
const SPOTS = [
  { id: 'houses', x: 43.2, y: 29.9 },
  { id: 'admin', x: 66.5, y: 66.1 },
  { id: 'view', x: 52.4, y: 35.9 },
  { id: 'plant', x: 72.6, y: 61.2 },
  { id: 'paths', x: 66.7, y: 75.3 },
] as const

function PlanFigure({ active, onSelect, enlarged = false }: { active: string | null; onSelect: (id: string) => void; enlarged?: boolean }) {
  const { dict } = useLocale()
  const copy = dict.places.detailPlan
  return (
    <div className={`relative ${enlarged ? 'w-[1600px] max-w-none' : 'w-full'}`}>
      <picture>
        <source srcSet="/orte/detailplan.avif" type="image/avif" />
        <img
          src={IMAGES.detail.src}
          alt={enlarged ? '' : copy.imageAlt}
          width={2801}
          height={2592}
          className={`h-auto w-full bg-white ${active ? 'plan-dim' : ''}`}
        />
      </picture>
      <svg
        viewBox={`${PLAN_VIEW.x} ${PLAN_VIEW.y} ${PLAN_VIEW.width} ${PLAN_VIEW.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {active
          ? (PLAN_MARKS[active] ?? []).map((d, index) => <path key={index} d={d} pathLength={100} className="plan-mark" />)
          : null}
      </svg>
      {enlarged ? null : <KindBadge kind="plan" words={dict.places} className="left-3 top-3" />}
      {copy.spots.map((item, index) => {
        const spot = SPOTS.find((entry) => entry.id === item.id)
        if (!spot) return null
        const on = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={on}
            aria-label={item.title}
            onClick={() => onSelect(item.id)}
            className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[13px] font-medium shadow-[0_8px_20px_-10px_rgb(0_0_0/0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? 'bg-brand text-white' : 'bg-white text-ink'}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}

/** Detailplan von 01/2025. Das Original-PDF bleibt intern; hier liegt nur der beschnittene Plan. */
export function DetailPlan() {
  const { ids, dict } = useLocale()
  const copy = dict.places.detailPlan
  const [active, setActive] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const choose = (id: string) => setActive((current) => (current === id ? null : id))

  return (
    <section id={ids.detail} aria-labelledby="detailplan-title" className="scroll-mt-16 border-b border-line">
      <style>{`
        .plan-dim { filter: grayscale(0.62) brightness(0.78); transition: filter 0.6s ease }
        .plan-mark { fill: rgb(255 202 6 / 0.5); stroke: #ffca06; stroke-width: 2.2; stroke-linejoin: round; vector-effect: non-scaling-stroke }
        @media (prefers-reduced-motion: no-preference) {
          .plan-mark { stroke-dasharray: 100; stroke-dashoffset: 100; animation: plan-draw 0.65s ease forwards }
          @keyframes plan-draw { to { stroke-dashoffset: 0 } }
        }
      `}</style>
      <Container className="py-14 md:py-24">
        <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
        <h2 id="detailplan-title" className={`${chapterTitle} mt-3 text-ink`}>
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.area}</p>
        <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted">{copy.note}</p>
        <p className="mt-1 max-w-[640px] text-[15px] leading-relaxed text-muted">{copy.limit}</p>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
          <figure className="overflow-hidden rounded-[28px] border border-line bg-white">
            <PlanFigure active={active} onSelect={choose} />
            <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
              <span className="text-[13px] leading-snug text-muted">{dict.places.planImage}</span>
              <button
                type="button"
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                aria-label={copy.zoomLabel}
                onClick={() => dialog.current?.showModal()}
              >
                {copy.zoom}
              </button>
            </figcaption>
          </figure>
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-pressed={active === null}
              className="rounded-full border border-line px-3 py-1.5 text-[13px] font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {copy.reset}
            </button>
          </div>
          <ol className="flex flex-col gap-2">
            {copy.spots.map((spot, index) => {
              const on = active === spot.id
              return (
                <li key={spot.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(spot.id)}
                    className={`flex w-full gap-3 rounded-2xl border px-3.5 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? 'border-brand bg-brand-soft' : 'border-line bg-white'}`}
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-medium ${on ? 'bg-brand text-white' : 'bg-surface text-ink'}`}>{index + 1}</span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[15px] font-medium text-ink">{spot.title}</span>
                      <span className="text-[14px] leading-snug text-muted">{spot.text}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </Container>
      <dialog ref={dialog} className="m-auto max-h-[100dvh] w-[min(100vw,1200px)] max-w-none overflow-auto bg-white p-4 backdrop:bg-[rgb(14_20_17/0.55)]" aria-label={copy.title}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[15px] font-medium text-ink">{copy.title}</p>
          <button type="button" className="rounded-full border border-line px-3 py-1.5 text-[13px] font-medium" onClick={() => dialog.current?.close()}>
            {copy.close}
          </button>
        </div>
        <div className="overflow-auto">
          <PlanFigure active={active} onSelect={choose} enlarged />
        </div>
      </dialog>
    </section>
  )
}
