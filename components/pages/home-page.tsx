import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { StoryProvider } from '@/components/story/story-context'
import { Opener } from '@/components/story/opener'
import { ChapterReasons } from '@/components/story/chapter-reasons'
import { ChapterWorkspace } from '@/components/story/chapter-workspace'
import { ChapterEurope } from '@/components/story/chapter-europe'
import { ChapterHubs } from '@/components/story/chapter-hubs'
import { ChapterDoors } from '@/components/story/chapter-doors'
import { ChapterTeam } from '@/components/story/chapter-team'
import { CommandBar } from '@/components/story/command-bar'
import { ReliefLayer, reliefPoint } from '@/components/map/relief-map'
import { HUB_01 } from '@/lib/map/hubs'
import type { Locale } from '@/lib/i18n/routes'
import { showcaseTalents } from '@/lib/showcase'

export async function HomePage({ locale }: { locale: Locale }) {
  // Echte Profile mit Einwilligung zuerst im Talentpool; alle fünf Minuten neu gelesen.
  const pool = await showcaseTalents()
  return (
    <StoryProvider>
      <SiteHeader />
      <main>
        <Opener pool={pool} />
        <ChapterReasons />
        <ChapterWorkspace />
        <ChapterEurope />
        <ChapterHubs relief={<ReliefLayer focus={HUB_01} animate={false} />} hub={reliefPoint(HUB_01[0], HUB_01[1])} />
        <ChapterDoors locale={locale} />
        <ChapterTeam locale={locale} />
      </main>
      <SiteFooter locale={locale} />
      <CommandBar />
    </StoryProvider>
  )
}
