import Link from 'next/link'
import Image from 'next/image'
import { KindBadge } from '@/components/places/ai-badge'
import { IMAGES } from '@/lib/images'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { HeroEmailForm } from '@/components/places/hero-form'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pageHref, type Locale } from '@/lib/i18n/routes'

const card = 'transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgb(14_20_17/0.05),0_34px_64px_-30px_rgb(14_20_17/0.38)]'


/** 01 Der Ort: genau ein Bildschirm hoch, das Hochformat-Bild ganz sichtbar neben dem Text. */
export function ChapterPlace({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).places
  const copy = dict.place
  return (
    <section id={IDS[locale].place} aria-labelledby="ort-title" className="scroll-mt-16 bg-surface lg:h-[calc(100svh-4rem)] lg:min-h-[600px]">
      <Container className="grid h-full grid-cols-[minmax(0,1fr)] gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16 lg:py-8">
        <div className="flex flex-col gap-5">
          <div className="w-full max-w-[520px]">
            <HeroEmailForm id="orte-ort-email" />
          </div>
          <ChapterLabel number="01">{copy.label}</ChapterLabel>
          <h2 id="ort-title" className="text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-ink">
            <span className="block whitespace-nowrap text-[#7c847f]">{copy.titleGray}</span>
            <span className="block whitespace-nowrap">{copy.title}</span>
          </h2>
          <p className="max-w-[460px] text-[17px] leading-relaxed text-muted md:text-[18px]">{copy.text}</p>
        </div>
        <figure className="group relative aspect-[1122/1402] w-full overflow-hidden rounded-[28px] shadow-[0_1px_2px_rgb(14_20_17/0.04),0_30px_70px_-30px_rgb(14_20_17/0.35)] lg:h-full lg:max-h-[820px] lg:w-auto lg:self-center">
          <Image src={IMAGES.community.src} alt={copy.imageAlt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.03]" />
          <KindBadge kind={IMAGES.community.kind} words={dict} />
        </figure>
      </Container>
    </section>
  )
}

export function PlaceFacts({ locale }: { locale: Locale }) {
  const places = getDictionary(locale).places
  const facts = places.facts
  return (
    <section aria-label={places.place.label} className="border-b border-line">
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

export function ChapterPlacesFaq({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.faq
  return (
    <section id={IDS[locale].faq} aria-labelledby="orte-fragen-title" className="scroll-mt-16">
      <Container className="max-w-[960px] py-14 md:py-28">
        <h2 id="orte-fragen-title" className="mb-8 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.04em] text-ink">
          {copy.title}
        </h2>
        <div className="border-t border-line">
          {copy.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[17px] font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:py-5 md:text-[18px] [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="text-[22px] font-normal text-faint transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[720px] pb-6 text-muted">
                {item.answer}
                {item.link ? (
                  <>
                    {' '}
                    <Link href={pageHref(item.link.page, locale, item.link.anchor)} className="whitespace-nowrap font-medium text-brand underline-offset-4 hover:underline">
                      {item.link.label} →
                    </Link>
                  </>
                ) : null}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
