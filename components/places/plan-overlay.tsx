import { PLAN_MARKS, PLAN_VIEW } from '@/components/places/plan-marks'

export default function PlanOverlay({ active }: { active: string }) {
  return (
    <svg viewBox={`${PLAN_VIEW.x} ${PLAN_VIEW.y} ${PLAN_VIEW.width} ${PLAN_VIEW.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <g className="plan-glow">
        {(PLAN_MARKS[active] ?? []).map((d, index) => <path key={index} d={d} className="plan-mark" />)}
      </g>
    </svg>
  )
}
