import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

/** Versorgungszielbild. Keine Messwerte: nur Quelle und Reserve, als geplant gekennzeichnet. */
export function SupplyBoard({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.supply
  return (
    <section id={IDS[locale].supply} aria-labelledby="versorgung-title" className="scroll-mt-16 border-b border-white/10 bg-[#0f1016] text-white">
      <Container className="py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[13px] tracking-[0.14em] text-[#ffca06] uppercase">{copy.label}</p>
            <h2 id="versorgung-title" className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-none tracking-[-0.04em]">
              {copy.title}
            </h2>
          </div>
          <p className="rounded-full border border-[#ffca06]/50 px-3 py-1 text-[13px] text-[#ffca06]">{copy.badge}</p>
        </div>
        <p className="mt-4 max-w-[40rem] text-[16px] leading-relaxed text-white/70">{copy.text}</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {copy.items.map((item) => (
            <li key={item.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[13px] tracking-[0.12em] text-white/45 uppercase">{item.title}</p>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-[12px] text-white/45">{copy.sourceLabel}</dt>
                  <dd className="mt-1 text-[18px] font-medium">{item.source}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-white/45">{copy.reserveLabel}</dt>
                  <dd className="mt-1 text-[18px] font-medium text-[#ffca06]">{item.reserve}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
