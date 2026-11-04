import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Node001: Visualisierung auf dem echten Grundstück und der Entwurf Stufe 1. Ort nur als Region, ohne Kataster.
const frames = ['aspect-[16/10] md:col-span-2', 'aspect-[4/3] bg-white md:aspect-auto']

export function ChapterHub({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).investors.hub
  return (
    <section id={IDS[locale].hub01} className="scroll-mt-16 bg-brand-deep py-28 text-white md:py-40" aria-labelledby="hub-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="05" tone="light">
            {copy.label}
          </ChapterLabel>
          <h2 id="hub-title" className={`${chapterTitle} text-white`}>
            {copy.title}
          </h2>
          <p className="max-w-[420px] text-[18px] leading-relaxed text-[#cfe2d6]">{copy.text}</p>
          <p className="max-w-[420px] text-[15px] leading-relaxed text-[#bfd8c8]">{copy.kind}</p>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-1.5" aria-label={copy.squaresLabel}>
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index} className={`size-4 ${index === 0 ? 'bg-white' : 'border border-[#bfd8c8]/50'}`} />
              ))}
            </div>
            <p className="text-[14px] text-[#bfd8c8]">{copy.count}</p>
          </div>
          <p className="mt-auto pt-6 text-[12.5px] text-[#bfd8c8]/80">{copy.disclaimer}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 self-center md:grid-cols-3">
          {copy.images.map((image, index) => (
            <figure key={image.src} className={`relative overflow-hidden rounded-[22px] ${frames[index] ?? 'aspect-[4/3]'}`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={index === 1 ? '(min-width: 1024px) 220px, (min-width: 768px) 33vw, 100vw' : '(min-width: 1024px) 660px, 100vw'}
                className={index === 1 ? 'object-contain p-2' : 'object-cover'}
                priority={index === 0}
              />
              <figcaption className="absolute bottom-3 left-3 right-3 w-fit rounded-2xl bg-black/55 px-3 py-1 text-[12.5px] font-medium text-white backdrop-blur-sm">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
