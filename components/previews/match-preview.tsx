import { Check, CircleDashed, Search } from 'lucide-react'
import { AppRail, Avatar, Pill, type AvatarTone } from './app-parts'

const matches: { name: string; role: string; initials: string; tone: AvatarTone; meta: string; score: string; met: string[]; open: string[] }[] = [
  { name: 'Lena B.', role: 'KI-Engineer, LLM und RAG', initials: 'LB', tone: 'amber', meta: '950 € / Tag · ab 01.12.', score: '4 von 4', met: ['RAG', 'Azure OpenAI', 'Deutsch', 'Start Dezember'], open: [] },
  { name: 'Tobias K.', role: 'AI Solutions Architect', initials: 'TK', tone: 'green', meta: '1.100 € / Tag · ab Januar', score: '3 von 4', met: ['RAG', 'Azure OpenAI', 'Deutsch'], open: ['Start'] },
  { name: 'Sara M.', role: 'Data und AI Engineer', initials: 'SM', tone: 'slate', meta: '110 € / Std · sofort', score: '3 von 4', met: ['RAG', 'Deutsch', 'Start Dezember'], open: ['Azure'] },
]

export function MatchPreview() {
  return (
    <div className="flex h-[540px] w-[760px] bg-white text-[13px] text-ink">
      <AppRail active={0} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3 rounded-2xl border border-line p-3.5">
          <Search size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-faint" />
          <p className="leading-relaxed text-body">RAG-Chatbot für den Kundenservice, Azure OpenAI, auf Deutsch, Start im Dezember.</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium">3 passende Profile</p>
          <Pill tone="amber">Beispielprofile</Pill>
        </div>

        <ul className="flex flex-col gap-2.5">
          {matches.map((match) => (
            <li key={match.name} className="rounded-2xl border border-line p-3.5">
              <div className="flex items-center gap-3">
                <Avatar initials={match.initials} tone={match.tone} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {match.name} <span className="font-normal text-faint">· {match.role}</span>
                  </p>
                  <p className="text-[12px] text-faint">{match.meta}</p>
                </div>
                <Pill tone={match.open.length ? 'neutral' : 'brand'}>{match.score}</Pill>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 pl-12 text-[12px]">
                {match.met.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 text-brand-ink">
                    <Check size={12} strokeWidth={2.5} />
                    {item}
                  </span>
                ))}
                {match.open.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1 text-amber-ink">
                    <CircleDashed size={12} strokeWidth={2.25} />
                    {item} offen
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[12px] text-faint">Kontakt erst mit Zustimmung der Freelancer</span>
          <span className="inline-flex h-8 items-center rounded-full bg-brand px-3.5 font-medium text-white">Freelancer anfragen</span>
        </div>
      </div>
    </div>
  )
}
