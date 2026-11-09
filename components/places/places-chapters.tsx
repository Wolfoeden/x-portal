import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { AiBadge } from '@/components/places/ai-badge'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { HeroEmailForm, OfferAction } from '@/components/places/hero-form'
import { ReappearEmail } from '@/components/places/sticky-email'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

const card = 'transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgb(14_20_17/0.05),0_34px_64px_-30px_rgb(14_20_17/0.38)]'

/** Platzhalter, bis die Bilder einzeln und gezielt eingesetzt werden. */
function ImageSlot({ label, tone = 'light', className = '' }: { label: string; tone?: 'light' | 'soft' | 'deep'; className?: string }) {
  const tones = {
    light: 'bg-surface text-faint',
    soft: 'bg-[#d6e8dc] text-brand-ink/70',
    deep: 'bg-[#1b4f34] text-[#bfd8c8]',
  }
  return (
    <div className={`relative grid place-items-center overflow-hidden ${tones[tone]} ${className}`}>
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1.5px)] bg-[length:18px_18px] opacity-[0.18]" />
      <span className="relative inline-flex items-center gap-2 rounded-full border border-current/25 px-3 py-1.5 text-[13px] font-medium">
        <ImageIcon aria-hidden size={15} strokeWidth={1.75} />
        {label}
      </span>
    </div>
  )
}

/** 01 Der Ort: genau ein Bildschirm hoch, das Hochformat-Bild ganz sichtbar neben dem Text. */
export function ChapterPlace({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.place
  return (
    <section id={IDS[locale].place} aria-labelledby="ort-title" className="scroll-mt-16 bg-surface lg:h-[calc(100svh-4rem)] lg:min-h-[600px]">
      <Container className="grid h-full grid-cols-[minmax(0,1fr)] gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-8">
        <div className="flex flex-col gap-5">
          <ReappearEmail>
            <HeroEmailForm id="orte-ort-email" />
          </ReappearEmail>
          <ChapterLabel number="01">{copy.label}</ChapterLabel>
          <h2 id="ort-title" className="text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-ink">
            <span className="block whitespace-nowrap text-[#7c847f]">{copy.titleGray}</span>
            <span className="block whitespace-nowrap">{copy.title}</span>
          </h2>
          <p className="max-w-[460px] text-[17px] leading-relaxed text-muted md:text-[18px]">{copy.text}</p>
        </div>
        <figure className="group relative aspect-[1122/1402] w-full overflow-hidden rounded-[28px] shadow-[0_1px_2px_rgb(14_20_17/0.04),0_30px_70px_-30px_rgb(14_20_17/0.35)] lg:h-full lg:max-h-[820px] lg:w-auto lg:self-center">
          <Image src="/orte/gemeinschaftshaus-hang.webp" alt={copy.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03]" />
          <AiBadge text={dict.aiImage} label={dict.aiImageLabel} />
        </figure>
      </Container>
    </section>
  )
}

export function PlaceFacts({ locale }: { locale: Locale }) {
  const facts = getDictionary(locale).places.facts
  return (
    <section aria-label={getDictionary(locale).places.place.label} className="border-b border-line">
      <Container>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <li key={fact.value} className={`flex flex-col gap-1 py-6 md:py-7 ${index % 2 === 1 ? 'border-l border-line pl-5 md:pl-6' : ''} ${index >= 2 ? 'max-lg:border-t max-lg:border-line' : ''} ${index === 2 ? 'lg:border-l lg:border-line lg:pl-6' : ''} ${index < 3 ? 'pr-5 lg:pr-6' : ''}`}>
              <span className="text-[22px] font-medium tracking-[-0.03em] text-ink md:text-[30px]">{fact.value}</span>
              <span className="text-[14px] text-muted">{fact.text}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

const OFFERS = [
  { use: 'mieten' as const, tone: 'light' as const },
  { use: 'workation' as const, tone: 'soft' as const },
  { use: 'mieten' as const, tone: 'deep' as const },
]

const offerTones = {
  light: { card: 'border border-line bg-white', tag: 'bg-brand-soft text-brand-ink', text: 'text-muted', title: 'text-ink', action: 'bg-ink text-white hover:bg-ink/85' },
  soft: { card: 'bg-brand-soft', tag: 'bg-white text-brand-ink', text: 'text-brand-ink', title: 'text-ink', action: 'bg-brand text-white hover:bg-brand-hover hover:shadow-[0_12px_26px_-12px_rgb(23_100_59/0.7)]' },
  deep: { card: 'bg-brand-deep text-white', tag: 'bg-white/12 text-white', text: 'text-[#bfd8c8]', title: 'text-white', action: 'bg-white text-ink hover:bg-brand-soft' },
}

export function ChapterOffers({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.offers
  return (
    <section id={IDS[locale].offers} aria-labelledby="angebote-title" className="scroll-mt-16">
      <Container className="flex flex-col gap-12 py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex flex-col gap-5">
            <ChapterLabel number="02">{copy.label}</ChapterLabel>
            <h2 id="angebote-title" className={`${chapterTitle} max-w-[760px] text-ink`}>
              {copy.title}
            </h2>
          </div>
          <p className="max-w-[380px] text-[16px] text-muted">{copy.text}</p>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          {copy.items.map((item, index) => {
            const offer = OFFERS[index]
            const tone = offerTones[offer.tone]
            return (
              <li key={item.title} className={`flex flex-col overflow-hidden rounded-[28px] ${tone.card} ${card}`}>
                <ImageSlot label={dict.imageSoon} tone={offer.tone} className="aspect-[4/5]" />
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <span className={`self-start rounded-full px-2.5 py-1 text-[13px] font-medium ${tone.tag}`}>{item.tag}</span>
                  <h3 className={`text-[26px] font-medium leading-[1.1] tracking-[-0.03em] md:text-[28px] ${tone.title}`}>{item.title}</h3>
                  <p className={tone.text}>{item.text}</p>
                  <div className="mt-auto pt-2">
                    <OfferAction use={offer.use} label={copy.action} className={tone.action} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

export function ChapterEveryday({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.everyday
  return (
    <section id={IDS[locale].everyday} aria-labelledby="alltag-title" className="scroll-mt-16 border-y border-line bg-surface">
      <Container className="flex flex-col gap-12 py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex flex-col gap-5">
            <ChapterLabel number="03">{copy.label}</ChapterLabel>
            <h2 id="alltag-title" className={`${chapterTitle} max-w-[820px] text-ink`}>
              {copy.title}
            </h2>
          </div>
          <p className="max-w-[380px] text-[16px] text-muted">{copy.text}</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-4">
          {copy.items.map((item) => (
            <figure key={item.title} className={`overflow-hidden rounded-[28px] border border-line bg-white ${card}`}>
              <ImageSlot label={dict.imageSoon} className="aspect-[4/5]" />
              <figcaption className="flex flex-col gap-1 px-6 pb-6 pt-5">
                <strong className="text-[20px] font-medium tracking-[-0.02em] text-ink">{item.title}</strong>
                <span className="text-muted">{item.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

export function ChapterPlacesFaq({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.faq
  return (
    <section aria-labelledby="orte-fragen-title">
      <Container className="max-w-[960px] py-24 md:py-28">
        <h2 id="orte-fragen-title" className="mb-8 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.04em] text-ink">
          {copy.title}
        </h2>
        <div className="border-t border-line">
          {copy.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="text-[22px] font-normal text-faint transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[720px] pb-6 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
