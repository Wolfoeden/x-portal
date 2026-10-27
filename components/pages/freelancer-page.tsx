import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { DraftProvider } from '@/components/freelancer/draft-context'
import { Builder } from '@/components/freelancer/builder'
import { ChapterMatch } from '@/components/freelancer/chapter-match'
import { ChapterPrivate } from '@/components/freelancer/chapter-private'
import { ChapterMode } from '@/components/freelancer/chapter-mode'
import { ChapterFree } from '@/components/freelancer/chapter-free'
import { ChapterFaq } from '@/components/freelancer/chapter-faq'
import { Closer } from '@/components/freelancer/closer'
import type { Locale } from '@/lib/i18n/routes'

export function FreelancerPage({ locale }: { locale: Locale }) {
  return (
    <DraftProvider>
      <SiteHeader />
      <main>
        <Builder />
        <ChapterMatch />
        <ChapterPrivate />
        <ChapterMode />
        <ChapterFree />
        <ChapterFaq locale={locale} />
        <Closer />
      </main>
      <SiteFooter locale={locale} />
    </DraftProvider>
  )
}
