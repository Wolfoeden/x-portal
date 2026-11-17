import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { InvestorOpener } from '@/components/investors/opener'
import { ChapterAbout } from '@/components/investors/chapter-about'
import { ChapterLoop } from '@/components/investors/chapter-loop'
import { ChapterWhyNow } from '@/components/investors/chapter-why-now'
import { ChapterRevenue } from '@/components/investors/chapter-revenue'
import { ChapterHub } from '@/components/investors/chapter-hub'
import { ChapterPlots } from '@/components/investors/chapter-plots'
import { ChapterStatus } from '@/components/investors/chapter-status'
import { ChapterCapital } from '@/components/investors/chapter-capital'
import { ChapterRoadmap } from '@/components/investors/chapter-roadmap'
import { ChapterTeam } from '@/components/story/chapter-team'
import { DeckForm } from '@/components/investors/deck-form'
import type { Locale } from '@/lib/i18n/routes'

export function InvestorsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader />
      <main>
        <InvestorOpener locale={locale} />
        <ChapterAbout locale={locale} />
        <ChapterLoop />
        <ChapterRevenue locale={locale} />
        <ChapterWhyNow locale={locale} />
        <ChapterStatus locale={locale} />
        <ChapterHub locale={locale} />
        <ChapterPlots locale={locale} />
        <ChapterRoadmap />
        <ChapterCapital locale={locale} />
        <ChapterTeam locale={locale} number="10" />
        <DeckForm />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
