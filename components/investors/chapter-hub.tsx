import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { AiBadge } from '@/components/places/ai-badge'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

// Bilder vom Grundstück: Drohnenfoto mit eingesetzten Häusern, dazu zwei Schaubilder. Pläne vom Architekten folgen.
const frames = [
  { image: '/orte/hub-01-hang.webp', position: 'object-center', drone: true, className: 'aspect-[4/3] md:col-span-2' },
  { image: '/orte/gemeinschaftshaus-hang.webp', position: 'object-[50%_45%]', drone: false, className: 'aspect-[4/3] md:aspect-auto' },
  { image: '/orte/holzbloecke.webp', position: 'object-[50%_55%]', drone: false, className: 'aspect-[4/3] md:col-span-3 md:aspect-[3/1]' },
]

export function ChapterHub({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const copy = dict.investors.hub
  const images = dict.places
  return (
    <section id={IDS[locale].hub01} className="scroll-mt-16 bg-brand-deep py-28 text-white md:py-40" aria-labelledby="hub-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="06" tone="light">
            {copy.label}
          </ChapterLabel>
          <h2 id="hub-title" className={`${chapterTitle} text-white`}>
            {copy.title}
          </h2>
          <p className="max-w-[420px] text-[18px] leading-relaxed text-[#cfe2d6]">{copy.text}</p>
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-1.5" aria-label={copy.squaresLabel}>
              {Array.from({ length: 10 }, (_, index) => (
                <span key={index} className={`size-4 ${index === 0 ? 'bg-white' : 'border border-[#bfd8c8]/50'}`} />
              ))}
            </div>
            <p className="text-[14px] text-[#bfd8c8]">{copy.count}</p>
          </div>
          <Link
            href={pagePath('places', locale)}
            className="group mt-4 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-white underline decoration-white/40 underline-offset-[6px] hover:decoration-white"
          >
            {copy.link}
            <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-auto pt-6 text-[12.5px] text-[#bfd8c8]/80">{copy.disclaimer}</p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {frames.map((frame, index) => (
            <figure key={copy.frames[index]} className={`relative overflow-hidden rounded-[22px] bg-white/[0.04] ${frame.className}`}>
              <Image src={frame.image} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className={`object-cover ${frame.position}`} />
              <AiBadge
                text={frame.drone ? images.aiImage : images.renderImage}
                label={frame.drone ? images.aiImageLabel : images.renderImageLabel}
                className="left-3 top-3"
              />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-[rgb(14_20_17/0.7)] px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-md">{copy.frames[index]}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}
