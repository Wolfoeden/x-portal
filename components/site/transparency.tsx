import Image from 'next/image'
import { Check, PencilRuler } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IMAGES, IMAGE_USE, type ImageKey } from '@/lib/images'
import type { Locale } from '@/lib/i18n/routes'

/**
 * „Was echt ist und was geplant“ mit Bildnachweis, auf den Seiten Orte und Investoren (Wunsch vom 17.11.2026:
 * transparent angeben, wie was wo entstanden ist). Die Art jedes Bildes kommt aus lib/images.ts, wie beim kleinen i.
 */
export function Transparency({ locale, page }: { locale: Locale; page: 'places' | 'investors' }) {
  const copy = getDictionary(locale).transparency
  const shown = (Object.keys(IMAGES) as ImageKey[]).filter((key) => IMAGE_USE[key].includes(page))
  return (
    <section aria-labelledby={`transparenz-${page}`} className="border-y border-line bg-surface">
      <Container className="flex flex-col gap-12 py-24 md:py-28">
        <div className="flex max-w-[760px] flex-col gap-5">
          <p className="text-[13px] tracking-[0.02em] text-faint">{copy.label}</p>
          <h2 id={`transparenz-${page}`} className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[600px] text-[17px] leading-relaxed text-muted">{copy.text}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          {[
            { block: copy.real, icon: Check, tone: 'bg-brand-soft text-brand-ink' },
            { block: copy.planned, icon: PencilRuler, tone: 'bg-white text-muted border border-line' },
          ].map(({ block, icon: Icon, tone }) => (
            <article key={block.title} className="flex flex-col rounded-[28px] border border-line bg-white p-7 md:p-8">
              <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium ${tone}`}>
                <Icon aria-hidden size={14} strokeWidth={2.2} />
                {block.title}
              </span>
              <ul className="mt-6 flex flex-col">
                {block.items.map((item) => (
                  <li key={item} className="border-t border-line py-3 text-[15px] leading-relaxed text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex max-w-[640px] flex-col gap-2">
            <h3 className="text-[24px] font-medium tracking-[-0.02em] text-ink">{copy.imagesTitle}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{copy.imagesText}</p>
          </div>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((key) => (
              <li key={key} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3">
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
          <p className="text-[13px] text-faint">{copy.madeWith}</p>
        </div>
      </Container>
    </section>
  )
}
