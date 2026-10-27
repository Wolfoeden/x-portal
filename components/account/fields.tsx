'use client'

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { fill } from '@/lib/i18n/format'

// Bausteine für das Konto, im Stil der Kontaktseite.

export const inputClass =
  'h-12 w-full rounded-2xl border border-line-strong bg-white px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50 aria-[invalid=true]:border-amber-ink'
export const textareaClass =
  'w-full resize-y rounded-2xl border border-line-strong bg-white px-4 py-3 text-[16px] leading-relaxed text-ink outline-none transition-colors placeholder:text-faint focus:border-ink/50 aria-[invalid=true]:border-amber-ink'
export const smallButton =
  'inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[14.5px] font-medium text-ink transition-colors hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50'
export const inkButton =
  'inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60'

export function Card({ id, title, text, children }: { id: string; title: string; text?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-[28px] border border-line bg-white p-6 sm:p-8">
      <h2 id={`${id}-title`} className="text-[22px] font-medium tracking-[-0.015em] text-ink">
        {title}
      </h2>
      {text ? <p className="mt-2 max-w-[620px] text-[15px] leading-relaxed text-muted">{text}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Field({ label, hint, optional, htmlFor, children }: { label: string; hint?: string; optional?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[14px] font-medium text-ink">
        {label} {optional ? <span className="font-normal text-faint">{optional}</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[13px] text-muted">{hint}</p> : null}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  describedBy,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label: string
  describedBy?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-brand' : 'bg-surface-2'
      }`}
    >
      <span aria-hidden className={`absolute size-6 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  )
}

/** Stichworte: mit Enter oder Komma hinzufügen, mit dem Kreuz entfernen. */
export function TagInput({
  id,
  values,
  onChange,
  max,
  maxLength,
  placeholder,
  suggestions = [],
  suggestionsLabel,
  addLabel,
  removeLabel,
  invalid,
}: {
  id: string
  values: string[]
  onChange: (next: string[]) => void
  max: number
  maxLength: number
  placeholder?: string
  suggestions?: string[]
  suggestionsLabel?: string
  addLabel: string
  removeLabel: string
  invalid?: boolean
}) {
  const [text, setText] = useState('')
  const hintId = useId()
  const lower = new Set(values.map((value) => value.toLocaleLowerCase()))
  const add = (raw: string) => {
    const value = raw.replace(/\s+/gu, ' ').trim().slice(0, maxLength)
    if (!value || values.length >= max || lower.has(value.toLocaleLowerCase())) return
    onChange([...values, value])
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add(text)
      setText('')
    } else if (event.key === 'Backspace' && !text && values.length) {
      onChange(values.slice(0, -1))
    }
  }
  const open = suggestions.filter((value) => !lower.has(value.toLocaleLowerCase())).slice(0, 8)
  return (
    <div className="flex flex-col gap-3">
      {values.length ? (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value} className="inline-flex h-9 items-center gap-1 rounded-full bg-ink pl-3.5 pr-1 text-[14px] text-white">
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((item) => item !== value))}
                aria-label={fill(removeLabel, { value })}
                className="grid size-7 place-items-center rounded-full text-white/70 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-brand"
              >
                <X aria-hidden size={14} strokeWidth={2.25} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <input
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            add(text)
            setText('')
          }}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={values.length >= max}
          aria-invalid={invalid}
          aria-describedby={open.length ? hintId : undefined}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => {
            add(text)
            setText('')
          }}
          aria-label={addLabel}
          className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-ink hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Plus aria-hidden size={18} strokeWidth={2} />
        </button>
      </div>
      {open.length ? (
        <div id={hintId} className="flex flex-wrap items-center gap-2">
          {suggestionsLabel ? <span className="text-[13px] text-faint">{suggestionsLabel}</span> : null}
          {open.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => add(value)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-[13.5px] text-muted hover:border-ink/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Plus aria-hidden size={12} strokeWidth={2.25} />
              {value}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
