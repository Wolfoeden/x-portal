'use client'

import { useLayoutEffect, type RefObject } from 'react'

function fit(field: HTMLTextAreaElement) {
  field.style.height = 'auto'
  field.style.height = `${field.scrollHeight}px`
  // Erst ab der Höchsthöhe darf das Feld scrollen.
  field.style.overflowY = field.scrollHeight > field.clientHeight + 1 ? 'auto' : 'hidden'
}

/** Passt die Höhe eines Textfelds an den Inhalt an, damit der ganze Satz sichtbar bleibt. */
export function useAutoHeight(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    if (ref.current) fit(ref.current)
  }, [ref, value])

  // Wird das Feld schmaler oder breiter, brechen die Zeilen anders um.
  useLayoutEffect(() => {
    const field = ref.current
    const parent = field?.parentElement
    if (!field || !parent) return
    let width = parent.clientWidth
    const observer = new ResizeObserver(() => {
      if (parent.clientWidth === width) return
      width = parent.clientWidth
      fit(field)
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [ref])
}
