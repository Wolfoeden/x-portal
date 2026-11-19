'use client'

import { useState } from 'react'
import { Container } from '@/components/ui/primitives'
import { useLocale } from '@/components/i18n/locale-provider'

// Lage im Limbic-Feld: x Balance (links) bis Dominanz (rechts), y nach Emotionsraum.
const STAR: Record<string, { x: number; y: number }> = {
  health: { x: 28, y: 30 },
  security: { x: 40, y: 44 },
  nature: { x: 30, y: 72 },
  efficiency: { x: 72, y: 32 },
  freedom: { x: 74, y: 70 },
}

/** Sternbild X-Portal Node001. Auswahl leuchtet auf und führt zur Whitelist. */
export function Constellation() {
  const { ids, dict } = useLocale()
  const copy = dict.places.stars
  const [picked, setPicked] = useState<string | null>(copy.values[0]?.id ?? null)
  const active = copy.values.find((value) => value.id === picked) ?? copy.values[0]

  return (
    <section id={ids.stars} aria-labelledby="sternbild-title" className="scroll-mt-16 border-b border-white/10 bg-[#0f1016] text-white">
      <Container className="grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div>
          <p className="text-[13px] tracking-[0.14em] text-[#ffca06] uppercase">{copy.label}</p>
          <h2 id="sternbild-title" className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.02] tracking-[-0.04em]">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-[36rem] text-[15px] leading-relaxed text-white/70">{copy.hint}</p>
          <p className="mt-2 text-[13px] text-[#ffca06]">{copy.note}</p>
          <div className="relative mt-8 aspect-[6/5] w-full max-w-[640px]">
            <svg viewBox="0 0 100 84" className="absolute inset-0 h-full w-full" aria-hidden>
              <line x1="12" y1="42" x2="88" y2="42" stroke="white" strokeOpacity="0.18" />
              <text x="12" y="10" fill="white" fillOpacity="0.45" fontSize="3.2">
                {copy.fields.discipline}
              </text>
              <text x="12" y="78" fill="white" fillOpacity="0.45" fontSize="3.2">
                {copy.fields.fantasy}
              </text>
              <text x="62" y="78" fill="white" fillOpacity="0.45" fontSize="3.2">
                {copy.fields.thrill}
              </text>
              <text x="8" y="40" fill="#ffca06" fontSize="3.1">
                {copy.balance}
              </text>
              <text x="74" y="40" fill="#ffca06" fontSize="3.1">
                {copy.dominance}
              </text>
              {copy.values.map((value) => {
                const at = STAR[value.id]
                const on = value.id === active?.id
                if (!at) return null
                return <circle key={value.id} cx={at.x} cy={at.y} r={on ? 2.3 : 1.15} fill={on ? '#ffca06' : 'white'} fillOpacity={on ? 1 : 0.35} />
              })}
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {copy.values.map((value) => {
              const on = value.id === active?.id
              return (
                <button
                  key={value.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(value.id)}
                  className={`rounded-full px-3 py-1.5 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffca06] ${on ? 'bg-[#ffca06] text-[#0f1016]' : 'bg-white/10 text-white'}`}
                >
                  {value.name}
                </button>
              )
            })}
          </div>
        </div>
        {active ? (
          <div className="rounded-[28px] border border-[#ffca06]/40 bg-white/[0.04] p-6">
            <p className="text-[13px] text-[#ffca06]">
              {active.pole} · {active.field}
            </p>
            <h3 className="mt-2 text-[28px] font-medium tracking-[-0.03em]">{active.name}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-white/80">{active.text}</p>
            <a
              href={`#${ids.waitlist}`}
              className="mt-6 inline-flex rounded-full bg-[#ffca06] px-4 py-2 text-[14px] font-medium text-[#0f1016] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffca06]"
            >
              {copy.cta}
            </a>
          </div>
        ) : null}
      </Container>
    </section>
  )
}
