'use client'

import { useRef, useState } from 'react'
import { KindBadge } from '@/components/places/ai-badge'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'
import { IMAGES } from '@/lib/images'
import { PLAN_MARKS, PLAN_VIEW } from '@/components/places/plan-marks'

function PlanFigure({ active, enlarged = false }: { active: string | null; enlarged?: boolean }) {
  const { dict } = useLocale()
  const copy = dict.places.detailPlan
  return (
    <div className={`relative mx-auto w-fit max-w-full ${enlarged ? 'w-[1600px] max-w-none' : ''}`}>
      <picture>
        <source srcSet="/orte/detailplan.avif" type="image/avif" />
        <img
          src={IMAGES.detail.src}
          alt={enlarged ? '' : copy.imageAlt}
          width={2801}
          height={2592}
          className={`block h-auto w-auto max-w-full bg-white ${enlarged ? '' : 'max-h-[42vh] lg:max-h-[calc(100dvh-18.5rem)]'} ${active ? 'plan-dim' : ''}`}
        />
      </picture>
      {active ? <div className="pointer-events-none absolute inset-0 bg-[rgb(20_16_8/0.22)]" aria-hidden /> : null}
      <svg
        viewBox={`${PLAN_VIEW.x} ${PLAN_VIEW.y} ${PLAN_VIEW.width} ${PLAN_VIEW.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g className={active ? 'plan-glow' : undefined}>
          {active
            ? (PLAN_MARKS[active] ?? []).map((d, index) => <path key={index} d={d} className="plan-mark" />)
            : null}
        </g>
      </svg>
      {enlarged ? null : <KindBadge kind="plan" words={dict.places} className="left-3 top-3" />}
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
  const activeSpot = copy.spots.find((spot) => spot.id === active)

  return (
    <section id={ids.detail} aria-labelledby="detailplan-title" className="scroll-mt-16 border-b border-line">
      <style>{`
        .plan-dim { filter: brightness(0.52) saturate(0.72); transition: filter 0.45s ease }
        .plan-mark { fill: rgb(255 202 6 / 0.58); stroke: #ffca06; stroke-width: 1.5; stroke-linejoin: round; vector-effect: non-scaling-stroke }
        .plan-glow { filter: drop-shadow(0 0 2px #ffca06) drop-shadow(0 0 6px rgb(255 202 6 / 0.75)) }
        @media (prefers-reduced-motion: no-preference) {
          .plan-mark { animation: plan-in 0.35s ease }
          @keyframes plan-in { from { opacity: 0 } to { opacity: 1 } }
        }
      `}</style>
      <Container className="py-8 lg:py-3">
        <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
        <h2 id="detailplan-title" className={`${chapterTitle} mt-1 text-[1.85rem]! leading-none text-ink`}>
          {copy.title}
        </h2>
        <p className="mt-2 max-w-[720px] text-[14px] leading-snug text-muted lg:text-[13px] lg:leading-tight">{copy.area}</p>
        <p className="mt-1 max-w-[760px] text-[13px] leading-snug text-muted lg:leading-tight">{copy.note}</p>
        <p className="mt-1 max-w-[760px] text-[13px] leading-snug text-muted lg:leading-tight">{copy.limit}</p>

        <div className="mt-3 lg:grid lg:grid-cols-[minmax(0,63%)_minmax(240px,1fr)] lg:items-start lg:gap-4">
          <div className="lg:sticky lg:top-16">
            <figure className="overflow-hidden rounded-[28px] border border-line bg-white">
              <PlanFigure active={active} />
              <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
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
            <div className="mt-3 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-pressed={active === null}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active === null ? 'border-brand bg-brand-soft text-ink' : 'border-line bg-white text-ink'}`}
                >
                  {copy.reset}
                </button>
                {copy.spots.map((spot) => {
                  const on = active === spot.id
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(spot.id)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink'}`}
                    >
                      {spot.title}
                    </button>
                  )
                })}
              </div>
              {activeSpot ? <p className="mt-2 text-[14px] leading-snug text-muted">{activeSpot.text}</p> : null}
            </div>
          </div>
          <div className="mt-4 hidden flex-col gap-2 lg:mt-0 lg:flex">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-pressed={active === null}
              className={`rounded-2xl border px-3.5 py-2.5 text-left text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${active === null ? 'border-brand bg-brand-soft text-ink' : 'border-line bg-white text-ink'}`}
            >
              {copy.reset}
            </button>
            <ul className="flex flex-col gap-2">
              {copy.spots.map((spot) => {
                const on = active === spot.id
                return (
                  <li key={spot.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(spot.id)}
                      className={`flex w-full flex-col gap-0.5 rounded-2xl border px-3.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${on ? 'border-brand bg-brand-soft' : 'border-line bg-white'}`}
                    >
                      <span className="text-[15px] font-medium text-ink">{spot.title}</span>
                      <span className="text-[13px] leading-snug text-muted">{spot.text}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
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
          <PlanFigure active={active} enlarged />
        </div>
      </dialog>
    </section>
  )
}
