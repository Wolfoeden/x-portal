'use client'

import { useLocale } from '@/components/i18n/locale-provider'
import { MODELS, type ModelChoice } from '@/lib/story/choices'

/** Claude, OpenAI, Server von XPORTAL oder die des Auftraggebers. Die Wahl gilt für alle Kapitel. Auf dem Handy 2 × 2. */
export function ModelPicker({ value, onChange, compact = false }: { value: ModelChoice | null; onChange: (model: ModelChoice) => void; compact?: boolean }) {
  const { dict } = useLocale()
  const words = dict.choices.model
  return (
    <div role="group" aria-label={words.title} className="grid max-w-full grid-cols-2 gap-1 rounded-[20px] border border-line-strong bg-white p-1 sm:inline-flex sm:rounded-full">
      {MODELS.map((model) => {
        const active = value === model
        return (
          <button
            key={model}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(model)}
            className={`whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              compact ? 'h-7 px-2.5 text-[12.5px]' : 'h-9 px-3.5 text-[14px]'
            } ${active ? 'bg-ink text-white' : 'text-body hover:text-ink'}`}
          >
            {words.options[model].label}
          </button>
        )
      })}
    </div>
  )
}
