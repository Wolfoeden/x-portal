import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { KindBadge } from '@/components/places/ai-badge'
import { IMAGES } from '@/lib/images'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

// Node001 in einem Abschnitt (seit 17.11.2026; ersetzt „Der erste Ort“ und „Mieten, in Abschnitten gebaut“):
// Phasen, Bilder mit Kennzeichnung aus lib/images.ts und die wichtigsten Fakten; weitere Fakten klappen auf. Wie gemietet wird, steht auf /orte.
// Verkauft wird nichts (D45, D48). Der Knopf führt zur Whitelist auf der Seite Orte und wählt „Mieten“ vor.
const RENT_OFFER = { de: 'angebot=mieten', en: 'offer=rent' } as const
const frames = [
  { image: IMAGES.hub01, position: 'object-center', className: 'col-span-2 aspect-[2/1] md:col-span-2 md:aspect-[4/3]' },
  { image: IMAGES.slope, position: 'object-[80%_50%]', className: 'aspect-[4/3] md:aspect-auto' },
  { image: IMAGES.target, position: 'object-[50%_45%]', className: 'aspect-[4/3] md:col-span-3 md:aspect-[3/1]' },
]

export function ChapterNode({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const copy = dict.investors.node
  const ids = IDS[locale]
  return (
    <section id={ids.hub01} className="scroll-mt-16 bg-brand-deep py-20 text-white md:py-32" aria-labelledby="node-title">
      <Container className="flex flex-col gap-12">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <ChapterLabel number="04" tone="light">
              {copy.label}
            </ChapterLabel>
            <h2 id="node-title" className={`${chapterTitle} text-white`}>
              {copy.title}
            </h2>
            <p className="max-w-[440px] text-[17px] leading-relaxed text-[#cfe2d6] md:text-[18px]">{copy.text}</p>
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-[13px] text-[#bfd8c8]">{copy.phasesLabel}</p>
              <ol className="flex flex-col">
                {copy.phases.map((phase) => (
                  <li key={phase.name} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-t border-white/15 py-2.5 text-[15px] leading-snug">
                    <span className="font-medium text-white">{phase.name}</span>
                    <span className="text-[#cfe2d6]">{phase.text}</span>
                  </li>
                ))}
              </ol>
            </div>
            <Link href={pagePath('places', locale)} className="group inline-flex w-fit items-center gap-2 text-[15px] font-medium text-white underline decoration-white/40 underline-offset-[6px] hover:decoration-white">
              {copy.link}
              <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
              {frames.map((frame, index) => (
                <figure key={copy.frames[index]} className={`relative overflow-hidden rounded-[20px] bg-white/[0.04] ${frame.className}`}>
                  <Image src={frame.image.src} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className={`object-cover ${frame.position}`} />
                  <KindBadge kind={frame.image.kind} words={dict.places} className="left-2.5 top-2.5" />
                  <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-[rgb(14_20_17/0.7)] px-2.5 py-1 text-[12.5px] font-medium text-white backdrop-blur-md">{copy.frames[index]}</figcaption>
                </figure>
              ))}
            </div>
            <p className="text-[12.5px] text-[#bfd8c8]/80">{copy.disclaimer}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-4 rounded-[24px] bg-white p-6 text-ink">
            <p className="text-[13px] text-faint">{copy.factsLabel}</p>
            <dl className="grid grid-cols-2 gap-x-4 sm:grid-cols-1">
              {copy.facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5 border-t border-line py-2.5 sm:grid sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-3">
                  <dt className="text-[13px] text-faint sm:text-[15px] sm:text-ink">{fact.label}</dt>
                  <dd className="text-[15px] text-ink sm:text-muted">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <details className="group border-t border-line pt-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {copy.moreLabel}
                <ChevronDown aria-hidden size={18} strokeWidth={2} className="text-faint transition-transform group-open:rotate-180" />
              </summary>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 sm:grid-cols-1">
                {copy.more.map((fact) => (
                  <div key={fact.label} className="flex flex-col gap-0.5 border-t border-line py-2.5 sm:grid sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-3">
                    <dt className="text-[13px] text-faint sm:text-[15px] sm:text-ink">{fact.label}</dt>
                    <dd className="text-[15px] text-ink sm:text-muted">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <Link
              href={`${pagePath('places', locale)}?${RENT_OFFER[locale]}#${ids.waitlist}`}
              className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-fit sm:px-7"
            >
              {copy.cta}
              <ArrowRight aria-hidden size={17} strokeWidth={2} />
            </Link>
            <p className="text-[13px] leading-relaxed text-faint">{copy.note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
