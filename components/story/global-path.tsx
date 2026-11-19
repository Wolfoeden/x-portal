import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

/** Drei Globalziele in der festgelegten Folge. Die Karte zeigt nur Node001 als Ort. */
export function GlobalPath({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).home.goals
  return (
    <section id={IDS[locale].goals} aria-labelledby="ziele-title" className="scroll-mt-16 border-b border-line bg-surface text-ink">
      <Container className="py-16 md:py-24">
        <p className="text-[13px] tracking-[0.14em] text-brand-ink uppercase">{copy.label}</p>
        <h2 id="ziele-title" className="mt-3 max-w-[16ch] text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.04em]">
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[36rem] text-[16px] leading-relaxed text-muted">{copy.note}</p>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">
          {copy.steps.map((step) => (
            <li key={step.rank} className="flex flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
              <span className="text-[13px] tracking-[0.16em] text-brand-ink">{step.rank}</span>
              <h3 className="text-[22px] font-medium tracking-[-0.03em]">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <figure className="mt-8 overflow-hidden rounded-[28px] border border-line bg-white">
          <div className="relative mx-4 mt-4 h-32 sm:hidden" role="img" aria-label={copy.mapLabel}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
              <path d="M2 73 Q21 31 40 50 T73 62 T98 36" fill="none" stroke="var(--color-line-strong)" vectorEffect="non-scaling-stroke" />
              <path d="M2 84 Q26 56 46 72 T98 55" fill="none" stroke="var(--color-line)" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="relative grid h-full grid-cols-4 items-start text-center text-sm">
              {[copy.known, copy.open, copy.open, copy.open].map((label, index) => (
                <div key={index} className={`flex flex-col items-center gap-2 ${index === 0 ? 'pt-10 font-medium text-brand-ink' : 'pt-4 text-muted even:pt-12'}`}>
                  {label}
                  <span className={index === 0 ? 'size-3 rounded-full bg-brand' : 'size-2.5 rounded-full border border-muted bg-white'} />
                </div>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 960 280" className="hidden h-auto w-full sm:block" role="img" aria-label={copy.mapLabel}>
            <path d="M40 190 C 160 120, 240 80, 340 110 S 520 200, 640 150 S 820 70, 920 120" fill="none" stroke="var(--color-line-strong)" />
            <path d="M30 210 C 180 160, 300 140, 430 170 S 620 230, 760 180 S 880 140, 940 160" fill="none" stroke="var(--color-line)" />
            <path d="M70 150 C 200 90, 360 70, 500 100 S 700 160, 900 90" fill="none" stroke="var(--color-brand)" strokeOpacity="0.28" />
            <g>
              <circle cx="250" cy="132" r="7" fill="var(--color-brand)" />
              <text x="250" y="112" textAnchor="middle" fill="var(--color-brand)" fontSize="14" fontFamily="inherit">
                {copy.known}
              </text>
            </g>
            {[
              [470, 150],
              [640, 118],
              [790, 156],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="4" fill="none" stroke="var(--color-muted)" />
                <text x={x} y={y - 14} textAnchor="middle" fill="var(--color-muted)" fontSize="12" fontFamily="inherit">
                  {copy.open}
                </text>
              </g>
            ))}
          </svg>
          <figcaption className="px-5 py-3 text-[13px] text-muted">{copy.mapLabel}</figcaption>
        </figure>
      </Container>
    </section>
  )
}
