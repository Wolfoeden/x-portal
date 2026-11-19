import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { PlacesHero } from '@/components/places/places-hero'
import { ChapterPlace, ChapterPlacesFaq, PlaceFacts } from '@/components/places/places-chapters'
import { PlacesForInvestors, PlacesTimeline } from '@/components/places/places-plan'
import { ChapterDay } from '@/components/places/chapter-day'
import { WaitlistCard } from '@/components/places/waitlist-card'
import { WaitlistProvider } from '@/components/places/waitlist-state'
import { Transparency } from '@/components/site/transparency'
import { SectionNav } from '@/components/site/section-nav'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pageHref, type Locale } from '@/lib/i18n/routes'
import { JsonLd, pageLd } from '@/lib/seo/json-ld'

function ChapterWaitlist({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).places.waitlist
  return (
    <section id={IDS[locale].waitlist} aria-labelledby="warteliste-title" className="scroll-mt-16 bg-brand-deep text-white">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 py-14 md:gap-14 md:py-32 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="03" tone="light">
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
                <Link href={pageHref('contact', locale, 'topicPlaces')} className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                  {copy.quoteAction}
                </Link>
              </span>
            </figcaption>
          </figure>
        </div>
        <div data-waitlist-card className="scroll-mt-20 overflow-hidden rounded-[32px] bg-white text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06),0_40px_80px_-32px_rgb(0_0_0/0.55)]">
          <WaitlistCard />
        </div>
      </Container>
    </section>
  )
}

/** Seite Orte nach StoryBrand (17.11.2026): Hero → Problem und Begleiter (Der Ort) → Fakten → Ein Tag auf Node001 → Plan und Whitelist → Fragen → Transparenz.
 *  Die Whitelist (im Code „waitlist“) ist das Ziel aller Knöpfe. */
export function PlacesPage({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd data={pageLd('places', locale)} />
      <SiteHeader />
      <WaitlistProvider>
        <main>
          <PlacesHero locale={locale} />
          <SectionNav locale={locale} {...getDictionary(locale).places.sectionNav} />
          <ChapterPlace locale={locale} />
          <PlaceFacts locale={locale} />
          <PlacesTimeline locale={locale} />
          <ChapterDay locale={locale} />
          <ChapterWaitlist locale={locale} />
          <PlacesForInvestors locale={locale} />
          <ChapterPlacesFaq locale={locale} />
          <Transparency locale={locale} page="places" compact />
        </main>
      </WaitlistProvider>
      <SiteFooter locale={locale} />
    </>
  )
}
