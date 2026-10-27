import { Image as ImageIcon, Map as MapIcon, Ruler } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Platzhalter, bis Pläne, Renderings und Fotos vom Architekten da sind.
const frames = [
  { icon: Ruler, className: 'aspect-[4/3] md:col-span-2' },
  { icon: ImageIcon, className: 'aspect-[4/3] md:aspect-auto' },
  { icon: MapIcon, className: 'aspect-[4/3] md:col-span-3 md:aspect-[3/1]' },
]

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

        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-3">
          {frames.map(({ icon: Icon, className }, index) => (
            <div key={copy.frames[index]} className={`relative grid place-items-center overflow-hidden rounded-[22px] border border-dashed border-white/25 bg-white/[0.03] ${className}`}>
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <p className="relative flex flex-col items-center gap-2 text-center">
                <Icon aria-hidden size={22} strokeWidth={1.5} className="text-[#bfd8c8]" />
                <span className="text-[15px] font-medium">{copy.frames[index]}</span>
                <span className="text-[13px] text-[#bfd8c8]">{copy.pending}</span>
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
