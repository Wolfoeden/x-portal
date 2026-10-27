'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { useStory } from '@/components/story/story-context'
import { useLocale } from '@/components/i18n/locale-provider'
import { useAutoHeight } from '@/lib/use-auto-height'

// Schwebt unten, sobald der Aufmacher aus dem Bild ist, und tritt bei den Hubs, den Türen und im Footer zurück.
export function CommandBar() {
  const { askFor } = useStory()
  const { dict, ids } = useLocale()
  const inputId = useId()
  const [text, setText] = useState('')
  const [visible, setVisible] = useState(false)
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  useAutoHeight(fieldRef, text)

  useEffect(() => {
    const states = new Map<string, boolean>()
    const targets = [ids.project, ids.hubs, ids.start, 'site-footer']
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) states.set(entry.target.id, entry.isIntersecting)
        setVisible(![...states.values()].some(Boolean))
      },
      { threshold: 0.05 },
    )
    targets.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [ids])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const sentence = text.trim()
    if (sentence.length < 3) return
    askFor(sentence)
    setText('')
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-4 z-30 px-4 transition-all duration-300 md:bottom-6 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}
      aria-hidden={!visible}
    >
      <form onSubmit={onSubmit} className="mx-auto flex max-w-[560px] items-end gap-2 rounded-[20px] border border-line-strong bg-white/95 p-1.5 pl-4 shadow-[0_1px_2px_rgb(14_20_17/0.06),0_24px_60px_-20px_rgb(14_20_17/0.35)] backdrop-blur">
        <label htmlFor={inputId} className="sr-only">
          {dict.commandBar.label}
        </label>
        <textarea
          ref={fieldRef}
          id={inputId}
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value.replace(/\s*\n\s*/g, ' '))}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          tabIndex={visible ? 0 : -1}
          autoComplete="off"
          enterKeyHint="send"
          placeholder={dict.commandBar.label}
          className="block max-h-[120px] min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-2.5 text-[16px] leading-6 text-ink outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          tabIndex={visible ? 0 : -1}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-ink px-4 text-[15px] font-medium text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="hidden sm:inline">{dict.commandBar.submit}</span>
          <ArrowRight aria-hidden size={17} strokeWidth={2} />
          <span className="sr-only sm:hidden">{dict.commandBar.submit}</span>
        </button>
      </form>
    </div>
  )
}
