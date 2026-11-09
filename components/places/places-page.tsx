import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { PlacesHero } from '@/components/places/places-hero'
import { ChapterEveryday, ChapterOffers, ChapterPlace, ChapterPlacesFaq, PlaceFacts } from '@/components/places/places-chapters'
import { WaitlistCard } from '@/components/places/waitlist-card'
import { WaitlistProvider } from '@/components/places/waitlist-state'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

function ChapterWaitlist({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.waitlist
  return (
    <section id={IDS[locale].waitlist} aria-labelledby="warteliste-title" className="scroll-mt-16 bg-brand-deep text-white">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-14 py-24 md:py-32 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="04" tone="light">
            {copy.label}
          </ChapterLabel>
          <h2 id="warteliste-title" className={`${chapterTitle} text-white`}>
            {copy.title}
          </h2>
          <p className="max-w-[440px] text-[18px] leading-relaxed text-[#bfd8c8]">{copy.text}</p>
          <ol className="mt-3 flex flex-col gap-3.5">
            {copy.steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[36px_minmax(0,1fr)] gap-2">
                <span className="tabular-nums text-[#bfd8c8]">{String(index + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <figure className="mt-6 flex items-center gap-4">
            <Image src="/team/roman-dering.webp" alt={copy.quoteName} width={64} height={64} className="size-16 rounded-full object-cover" />
            <figcaption className="flex flex-col gap-0.5">
              <span className="text-[16px]">{copy.quote}</span>
              <span className="text-[14px] text-[#bfd8c8]">
                {copy.quoteName} ·{' '}
                <Link href={pagePath('contact', locale)} className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  {copy.quoteAction}
                </Link>
              </span>
            </figcaption>
          </figure>
        </div>
        <div className="overflow-hidden rounded-[32px] bg-white text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06),0_40px_80px_-32px_rgb(0_0_0/0.55)]">
          <WaitlistCard />
        </div>
      </Container>
    </section>
  )
}

/** Seite Orte: Wohnen, arbeiten, zusammenkommen. Die Warteliste ist das Ziel aller Knöpfe. */
export function PlacesPage({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader />
      <WaitlistProvider>
        <main>
          <PlacesHero locale={locale} />
          <ChapterPlace locale={locale} />
          <PlaceFacts locale={locale} />
          <ChapterOffers locale={locale} />
          <ChapterEveryday locale={locale} />
          <ChapterWaitlist locale={locale} />
          <ChapterPlacesFaq locale={locale} />
        </main>
      </WaitlistProvider>
      <SiteFooter locale={locale} />
    </>
  )
}
