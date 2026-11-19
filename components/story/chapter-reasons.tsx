'use client'

import { Check, CircleDashed } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useStory } from '@/components/story/story-context'
import { ChapterLabel, TalentAvatar, chapterTitle, memberBadge } from '@/components/story/talent-avatar'
import { TeamSetup } from '@/components/story/team-setup'
import { kindOf, roleOf, talentOf } from '@/lib/demo/scenarios'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

export function ChapterReasons() {
  const { scenario, query } = useStory()
  const { dict, ids } = useLocale()
  const copy = dict.home.reasons
  // Die Karte zeigt den ersten externen Menschen im Team; Agenten und Ihr Team stehen in der Liste daneben.
  const lead = scenario.team.find((member) => kindOf(member) === 'freelancer') ?? scenario.team[0]
  const talent = talentOf(lead)
  const badge = memberBadge(lead, dict)

  return (
    <section id={ids.reasons} className="scroll-mt-16 py-28 md:py-40" aria-labelledby="begruendung-title">
      <Container className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="flex flex-col gap-6">
          <ChapterLabel number="02">{copy.label}</ChapterLabel>
          <h2 id="begruendung-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
          <p className="max-w-[420px] text-[18px] leading-relaxed text-muted">{copy.text}</p>
          <div className="mt-2 max-w-[480px]">
            <TeamSetup />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px]">
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_40px_80px_-40px_rgb(14_20_17/0.35)] sm:p-8">
            <p className="truncate text-[13px] text-faint">{fill(copy.forQuery, { text: query ?? scenario.sentence })}</p>
            <div className="mt-5 flex items-center gap-4">
              <TalentAvatar talent={talent} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-[22px] font-medium leading-tight tracking-[-0.015em] text-ink">{talent.name}</p>
                <p className="text-[15px] text-muted">
                  {roleOf(lead, dict.talentRoles)} · <span className="whitespace-nowrap">{scenario.rate}</span> · <span className="whitespace-nowrap">{lead.from}</span>
                </p>
              </div>
              <span className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[12.5px] font-medium ${badge.className}`}>{badge.label}</span>
            </div>

            <ul className="mt-7 divide-y divide-line border-t border-line">
              {scenario.requirements.map((item) => (
                <li key={`${scenario.id}-${item.label}`} className="flex items-start gap-3.5 py-3.5">
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                      item.met ? 'bg-brand text-white' : 'bg-amber-soft text-amber-ink'
                    }`}
                  >
                    {item.met ? <Check aria-hidden size={14} strokeWidth={2.5} /> : <CircleDashed aria-hidden size={14} strokeWidth={2.25} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] text-ink">{item.label}</span>
                    <span className={`block text-[13.5px] ${item.met ? 'text-muted' : 'text-amber-ink'}`}>{item.by}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[13px] text-faint">{scenario.source === 'live' ? dict.live.reasonsNote : copy.note}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
