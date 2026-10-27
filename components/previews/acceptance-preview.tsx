import { CircleCheck, FileSignature, Lock } from 'lucide-react'
import { AppRail, Pill, Stepper } from './app-parts'

const deliveries = [
  { title: 'Datenquellen angebunden', who: 'Leon · gesicherter Bereich' },
  { title: 'Antworten mit Quellenangabe', who: 'Mara · gesicherter Bereich' },
  { title: '200 Testfragen geprüft', who: 'Eva · gesicherter Bereich' },
  { title: 'Oberfläche für den Kundenservice', who: 'Noah · synthetische Testdaten' },
]

export function AcceptancePreview() {
  return (
    <div className="flex h-[540px] w-[760px] bg-white text-[13px] text-ink">
      <AppRail active={3} />
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <Stepper current={3} />

        <div>
          <p className="mb-2 text-[14px] font-medium">Lieferungen</p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {deliveries.map((item) => (
              <li key={item.title} className="flex items-center gap-3 px-3 py-2.5">
                <CircleCheck size={16} strokeWidth={1.75} className="shrink-0 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block">{item.title}</span>
                  <span className="block text-[11.5px] text-faint">{item.who}</span>
                </span>
                <Pill tone="brand">geliefert</Pill>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line p-4">
          <p className="text-[14px] font-medium">Abnahme durch die Beispiel GmbH</p>
          <p className="mt-1 text-body/80">Alle vier Lieferungen liegen vor. Die Abnahme steht mit Zeitstempel im Protokoll.</p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex h-8 items-center rounded-full bg-brand px-3.5 font-medium text-white">Digital abnehmen</span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3.5 font-medium">
              <FileSignature size={14} strokeWidth={1.75} />
              PDF mit Unterschrift
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-muted">
          <Lock size={14} strokeWidth={2} />
          <span className="flex-1">Zahlung wird nach der Abnahme frei</span>
          <span className="font-medium tabular-nums text-ink">11.500 SIM</span>
        </div>
      </div>
    </div>
  )
}
