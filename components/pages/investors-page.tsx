import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { InvestorOpener } from '@/components/investors/opener'
import { ChapterLoop } from '@/components/investors/chapter-loop'
import { ChapterWhyNow } from '@/components/investors/chapter-why-now'
import { ChapterRevenue } from '@/components/investors/chapter-revenue'
import { ChapterHub } from '@/components/investors/chapter-hub'
import { ChapterPlots } from '@/components/investors/chapter-plots'
import { ChapterRoadmap } from '@/components/investors/chapter-roadmap'
import { ChapterTeam } from '@/components/story/chapter-team'
import { DeckForm } from '@/components/investors/deck-form'
import { WaitlistForm } from '@/components/investors/waitlist-form'
import type { Locale } from '@/lib/i18n/routes'

export function InvestorsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader />
      <main>
        <InvestorOpener />
        <ChapterLoop />
        <ChapterWhyNow locale={locale} />
        <ChapterRevenue locale={locale} />
        <ChapterHub locale={locale} />
        <ChapterPlots locale={locale} />
        <ChapterRoadmap />
        <WaitlistForm />
        <ChapterTeam locale={locale} number="08" />
        <DeckForm />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
