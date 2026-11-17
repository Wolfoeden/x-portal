import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { InvestorOpener } from '@/components/investors/opener'
import { ChapterWhy } from '@/components/investors/chapter-why'
import { ChapterLoop } from '@/components/investors/chapter-loop'
import { ChapterStatus } from '@/components/investors/chapter-status'
import { ChapterNode } from '@/components/investors/chapter-node'
import { ChapterMoney } from '@/components/investors/chapter-money'
import { ChapterRoadmap } from '@/components/investors/chapter-roadmap'
import { ChapterTeam } from '@/components/story/chapter-team'
import { DeckForm } from '@/components/investors/deck-form'
import { Transparency } from '@/components/site/transparency'
import { SectionNav } from '@/components/site/section-nav'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/routes'
import { JsonLd, pageLd } from '@/lib/seo/json-ld'

// Investorenseite nach StoryBrand (17.11.2026): Held ist der Investor. Ablauf: Hero → Problem und Begleiter → Plan (Kreislauf)
// → Nachweise → Node001 → Erlöse und Kapital → Roadmap → Transparenz → Team → Aufruf.
export function InvestorsPage({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd data={pageLd('investors', locale)} />
      <SiteHeader />
      <main>
        <InvestorOpener locale={locale} />
        <SectionNav locale={locale} {...getDictionary(locale).investors.sectionNav} />
        <ChapterWhy locale={locale} />
        <ChapterLoop />
        <ChapterStatus locale={locale} />
        <ChapterNode locale={locale} />
        <ChapterMoney locale={locale} />
        <ChapterRoadmap />
        <Transparency locale={locale} page="investors" compact />
        <ChapterTeam locale={locale} number="07" />
        <DeckForm />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
