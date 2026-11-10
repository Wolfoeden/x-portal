import { ChevronRight, CircleCheck, Lock, Mail, Users } from 'lucide-react'
import { DiscordLogo, SlackLogo } from '@/components/brand/channel-logos'
import { AppRail, Avatar, Pill, Stepper, type AvatarTone } from './app-parts'

const team: { name: string; role: string; initials: string; tone: AvatarTone; place: string; hours: string; access: string; onSite: boolean; amount: string }[] = [
  { name: 'Mara', role: 'Projektleitung', initials: 'MA', tone: 'green', place: 'Node Ukraine', hours: '120 h', access: 'Personendaten', onSite: true, amount: '4.800' },
  { name: 'Leon', role: 'Data Engineer', initials: 'LE', tone: 'amber', place: 'Node Ukraine', hours: '80 h', access: 'Personendaten', onSite: true, amount: '2.800' },
  { name: 'Eva', role: 'Qualitätssicherung', initials: 'EV', tone: 'slate', place: 'Node Ukraine', hours: '60 h', access: 'Personendaten', onSite: true, amount: '1.800' },
  { name: 'Noah', role: 'Design', initials: 'NO', tone: 'stone', place: 'Remote', hours: '60 h', access: 'Synthetische Daten', onSite: false, amount: '2.100' },
]

const activity = [
  { title: 'KI-Teamvorschlag erstellt', meta: 'XPORTAL · 09:13' },
  { title: 'Hinweis in Slack gesendet', meta: '#kundenservice · 09:13' },
  { title: 'Brief bestätigt', meta: 'Beispiel GmbH · 09:12' },
]

export function WorkspacePreview() {
  return (
    <div className="flex h-[580px] w-[1120px] bg-white text-[13px] text-ink">
      <AppRail active={2} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-line px-6">
          <span className="text-faint">Projekte</span>
          <ChevronRight size={14} className="text-faint" />
          <span className="font-medium">Wissensassistent Kundenservice</span>
          <Pill tone="amber">Simulation</Pill>
          <span className="ml-auto text-faint">Budget 12.000 SIM</span>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-6 py-5">
          <Stepper current={1} />

          <div className="flex items-start gap-4 rounded-2xl bg-brand-soft/70 p-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-brand-ink">
              <Users size={17} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">KI-Teamvorschlag: 3 Personen vor Ort im Node, 1 remote</p>
              <p className="mt-1 leading-relaxed text-body/80">
                Das Projekt verarbeitet Kundendaten. Sie bleiben im gesicherten Bereich beim Team vor Ort. Das Design arbeitet remote mit synthetischen Testdaten.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <span className="inline-flex h-8 items-center rounded-full border border-line-strong bg-white px-3 font-medium">Anpassen</span>
              <span className="inline-flex h-8 items-center rounded-full bg-brand px-3 font-medium text-white">Team bestätigen</span>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-[1.6fr_1fr_0.6fr_1.1fr_0.7fr] px-3 pb-2 text-[12px] text-faint">
              <span>Person</span>
              <span>Ort</span>
              <span>Stunden</span>
              <span>Datenzugriff</span>
              <span className="text-right">Betrag</span>
            </div>
            <div className="divide-y divide-line rounded-xl border border-line">
              {team.map((person) => (
                <div key={person.name} className="grid grid-cols-[1.6fr_1fr_0.6fr_1.1fr_0.7fr] items-center px-3 py-2.5">
                  <span className="flex items-center gap-2.5">
                    <Avatar initials={person.initials} tone={person.tone} size={28} />
                    <span>
                      <span className="font-medium">{person.name}</span>
                      <span className="text-faint"> · {person.role}</span>
                    </span>
                  </span>
                  <span className="text-body">{person.place}</span>
                  <span className="text-body">{person.hours}</span>
                  <span>
                    <Pill tone={person.onSite ? 'brand' : 'neutral'}>
                      {person.onSite ? <Lock size={10} strokeWidth={2.25} /> : null}
                      {person.access}
                    </Pill>
                  </span>
                  <span className="text-right tabular-nums">{person.amount} SIM</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between rounded-xl bg-surface px-4 py-3">
            <span className="text-faint">Geschätzt gesamt</span>
            <span className="flex items-center gap-3">
              <Pill tone="brand">im Budget</Pill>
              <span className="text-[16px] font-medium tabular-nums">11.500 SIM</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-[290px] shrink-0 flex-col gap-6 border-l border-line px-5 py-5">
        <div>
          <p className="mb-3 font-medium">Kanäle</p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px] border border-line bg-white">
                <SlackLogo className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">Slack</span>
                <span className="block text-[11.5px] text-faint">#kundenservice</span>
              </span>
              <Pill tone="brand">verbunden</Pill>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px] border border-line bg-white">
                <DiscordLogo className="size-[17px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">Discord</span>
                <span className="block text-[11.5px] text-faint">Community-Server</span>
              </span>
              <Pill>verbinden</Pill>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[10px] border border-line bg-white text-ink">
                <Mail size={16} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">E-Mail</span>
                <span className="block text-[11.5px] text-faint">Fristen, Berichte</span>
              </span>
              <Pill tone="brand">aktiv</Pill>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-medium">Heute</p>
          <ul className="flex flex-col gap-3.5">
            {activity.map((item) => (
              <li key={item.title} className="flex gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-ink">
                  <CircleCheck size={15} strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block leading-snug">{item.title}</span>
                  <span className="block text-[11.5px] text-faint">{item.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-auto flex items-start gap-2 rounded-xl bg-surface p-3 text-[12px] leading-relaxed text-muted">
          <Lock size={13} strokeWidth={2} className="mt-0.5 shrink-0" />
          Personendaten nur im gesicherten Bereich. Gespeichert in der EU.
        </p>
      </div>
    </div>
  )
}
