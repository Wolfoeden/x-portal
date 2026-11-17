import Image from 'next/image'
import { Check, ChevronDown, PencilRuler } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IMAGES, IMAGE_USE, type ImageKey } from '@/lib/images'
import type { Locale } from '@/lib/i18n/routes'

/**
 * „Was echt ist und was geplant“ mit Bildnachweis, auf den Seiten Orte und Investoren (Wunsch vom 17.11.2026:
 * transparent angeben, wie was wo entstanden ist). Die Art jedes Bildes kommt aus lib/images.ts, wie beim kleinen i.
 */
/** compact: nur Bildnachweis und Hinweis, ohne „echt / geplant“ (auf der Investorenseite steht der Stand schon darüber). */
export function Transparency({ locale, page, compact = false }: { locale: Locale; page: 'places' | 'investors'; compact?: boolean }) {
  const copy = getDictionary(locale).transparency
  const shown = (Object.keys(IMAGES) as ImageKey[]).filter((key) => IMAGE_USE[key].includes(page))
  return (
    <section aria-labelledby={`transparenz-${page}`} className="border-y border-line bg-surface">
      <Container className="flex flex-col gap-8 py-16 md:py-24">
        <div className="flex max-w-[760px] flex-col gap-5">
          <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
          <h2 id={`transparenz-${page}`} className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[600px] text-[16px] leading-relaxed text-muted md:text-[17px]">{copy.text}</p>
        </div>

        {compact ? null : <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {[
            { block: copy.real, icon: Check, tone: 'bg-brand-soft text-brand-ink' },
            { block: copy.planned, icon: PencilRuler, tone: 'bg-white text-muted border border-line' },
          ].map(({ block, icon: Icon, tone }) => (
            <article key={block.title} className="flex flex-col rounded-[24px] border border-line bg-white p-6">
              <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium ${tone}`}>
                <Icon aria-hidden size={14} strokeWidth={2.2} />
                {block.title}
              </span>
              <ul className="mt-3 flex flex-col">
                {block.items.map((item) => (
                  <li key={item} className="border-t border-line py-2 text-[15px] leading-snug text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>}

        <details className="group rounded-[24px] border border-line bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
            <span className="flex flex-col gap-1">
              <span className="text-[19px] font-medium tracking-[-0.015em] text-ink">{copy.imagesTitle}</span>
              <span className="text-[14.5px] leading-relaxed text-muted">{copy.imagesText}</span>
            </span>
            <ChevronDown aria-hidden size={20} strokeWidth={2} className="shrink-0 text-faint transition-transform group-open:rotate-180" />
          </summary>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((key) => (
              <li key={key} className="flex items-center gap-4 rounded-2xl border border-line p-3">
                <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image src={IMAGES[key].src} alt="" fill sizes="96px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-medium text-ink">{copy.images[key]}</span>
                  <span className="text-[13px] leading-snug text-muted">{copy.kinds[IMAGES[key].kind]}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
        <p className="text-[13px] text-faint">{copy.madeWith}</p>
      </Container>
    </section>
  )
}
