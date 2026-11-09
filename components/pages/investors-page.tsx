import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { InvestorOpener } from '@/components/investors/opener'
import { ChapterLoop } from '@/components/investors/chapter-loop'
import { ChapterWhyNow } from '@/components/investors/chapter-why-now'
import { ChapterRevenue } from '@/components/investors/chapter-revenue'
import { ChapterHub } from '@/components/investors/chapter-hub'
import { ChapterRoadmap } from '@/components/investors/chapter-roadmap'
import { ChapterTeam } from '@/components/story/chapter-team'
import { DeckForm } from '@/components/investors/deck-form'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { HUB_01 } from '@/lib/map/hubs'
import type { Locale } from '@/lib/i18n/routes'

export function InvestorsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <SiteHeader />
      <main>
        <InvestorOpener relief={<ReliefLayer focus={HUB_01} />} hub={reliefPoint(HUB_01[0], HUB_01[1])} />
        <ChapterLoop />
        <ChapterWhyNow locale={locale} />
        <ChapterRevenue locale={locale} />
        <ChapterHub locale={locale} />
        <ChapterRoadmap />
        <ChapterTeam locale={locale} number="07" />
        <DeckForm />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
