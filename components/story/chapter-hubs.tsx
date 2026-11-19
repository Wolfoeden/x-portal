import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { EuropeAtlas } from '@/components/map/europe-atlas'
import { Container } from '@/components/ui/primitives'
import { HubPreview } from '@/components/investors/hub-preview'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pagePath, type Locale } from '@/lib/i18n/routes'

export function ChapterHubs({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const copy = dict.home.hubs
  const opener = dict.investors.opener
  return (
    <section id={IDS[locale].hubs} aria-labelledby="hubs-title" className="relative scroll-mt-16 bg-brand-deep">
      <Container className="grid min-w-0 items-center gap-8 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="05" tone="light">{copy.label}</ChapterLabel>
          <h2 id="hubs-title" className={`${chapterTitle} text-white`}>{copy.title}</h2>
          <p className="max-w-[420px] text-[18px] leading-relaxed text-brand-soft">{copy.text}</p>
          <p className="text-sm text-brand-soft">{copy.count}</p>
          <Link href={pagePath('investors', locale)} className="inline-flex w-fit items-center gap-2 text-white underline underline-offset-4">{copy.investors}<ArrowRight size={16} aria-hidden /></Link>
        </div>
        <figure className="min-w-0">
          <EuropeAtlas label={copy.mapLabel} name={dict.places.hero.label} marker={
            <HubPreview href={pagePath('places', locale)} name={copy.hubName} status={copy.hubStatus}
              show={opener.hubShow} title={opener.hubPreviewTitle} text={opener.hubPreviewText}
              action={opener.hubPreviewAction} label={opener.hubPreviewLabel} imageAlt={opener.hubImageAlt} />
          } />
          <figcaption className="mt-2 text-sm text-brand-soft">{copy.disclaimer}</figcaption>
        </figure>
      </Container>
    </section>
  )
}
