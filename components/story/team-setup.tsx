'use client'

import { Check } from 'lucide-react'
import { useStory } from '@/components/story/story-context'
import { ModelPicker } from '@/components/story/model-picker'
import { TalentAvatar } from '@/components/story/talent-avatar'
import { useLocale } from '@/components/i18n/locale-provider'
import { agentIdOf } from '@/lib/agents'
import { reviewerOf, roleOf, talentOf } from '@/lib/demo/scenarios'
import { fill } from '@/lib/i18n/format'

/** Der Auftraggeber legt fest, was sein Team selbst macht und welches KI-Modell läuft. Alle Kapitel ziehen mit. */
export function TeamSetup() {
  const { scenario, choices, toggleInternal, setModel } = useStory()
  const { dict } = useLocale()
  const copy = dict.choices

  return (
    <div className="rounded-[24px] border border-line bg-white p-4 shadow-[0_1px_2px_rgb(14_20_17/0.04)] sm:p-5">
      <p className="text-[15px] font-medium text-ink">{copy.title}</p>
      <p className="mt-0.5 text-[13.5px] text-muted">{copy.text}</p>
      <ul className="mt-3 divide-y divide-line">
        {scenario.team.map((member) => {
          const talent = talentOf(member)
          const internal = choices.internal.includes(member.id)
          const agent = internal ? null : agentIdOf(member)
          return (
            <li key={member.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <TalentAvatar talent={talent} size={34} />
              <div className="min-w-0 flex-1 basis-[140px]">
                <p className="truncate text-[14.5px] text-ink">
                  <span className="font-medium">{talent.name}</span>
                  <span className="text-faint"> · {roleOf(member, dict.talentRoles)}</span>
                </p>
                {agent ? (
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                    {dict.agents.items[agent].does} {fill(dict.agents.reviewer, { name: reviewerOf(member, scenario.team, copy.ownTeam) })}.
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                aria-pressed={internal}
                aria-label={copy.internal}
                onClick={() => toggleInternal(member.id)}
                className={`ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  internal ? 'border-ink bg-ink text-white' : 'border-line-strong text-body hover:border-ink/50'
                }`}
              >
                {internal ? <Check aria-hidden size={13} strokeWidth={2.5} /> : null}
                <span className="sm:hidden">{copy.internalShort}</span>
                <span className="hidden sm:inline">{copy.internal}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {scenario.ai ? (
        <div className="mt-1 flex flex-col items-start gap-2.5 border-t border-line pt-4">
          <ModelPicker value={choices.model} onChange={setModel} />
        </div>
      ) : null}
    </div>
  )
}
