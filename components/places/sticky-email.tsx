'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const TOP = 80 // Abstand zum oberen Rand, wenn das Feld mitläuft (Kopfzeile 64 px + Luft)
const SLIDE = 240 // Scrollweg, auf dem das Feld nach rechts gleitet
const FADE = 320 // Scrollweg am Ende über der Karte, auf dem das Feld kleiner wird und verschwindet
const GAP = 40 // Abstand zwischen Bild und Feld (gap-10)
const NARROW_WIDTH = 440 // Breite des Felds, wenn es rechts mitläuft

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/**
 * E-Mail-Feld im Hero, ganz an der Scrollposition ausgerichtet (rückwärts läuft alles zurück):
 * erst unter dem Bild, dann gleitet es oben mitlaufend auf die rechte Seite,
 * über der Karte (Westukraine) wird es kleiner und verschwindet. Danach taucht es in „Ein Ort. Für Dich.“ links wieder auf (ReappearEmail).
 */
export function StickyEmail({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sticky = outer.current
    const box = inner.current
    const range = sticky?.parentElement
    if (!sticky || !box || !range) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0

    const update = () => {
      frame = 0
      const from = sticky.getBoundingClientRect()
      const before = sticky.previousElementSibling?.getBoundingClientRect().bottom ?? from.top
      const slide = easeInOut(clamp01((TOP - (before + GAP)) / SLIDE))
      const left = range.getBoundingClientRect().bottom - from.bottom
      const fade = easeInOut(clamp01(1 - left / FADE))
      // Rechter Rand des Inhalts (Container 1272 px, Rand 20 bzw. 32 px), nicht des Bildschirms.
      const gutter = window.innerWidth >= 768 ? 32 : 20
      const contentRight = Math.min(window.innerWidth, (window.innerWidth + 1272) / 2) - gutter

      if (reduce) {
        box.style.opacity = String(1 - fade)
      } else {
        const narrow = Math.min(1, NARROW_WIDTH / from.width)
        const scale = (1 + (narrow - 1) * slide) * (1 - 0.45 * fade)
        // Rechtsbündig mit dem Inhalt: der rechte Rand des Felds wandert zum rechten Rand des Inhaltsbereichs.
        const dx = (contentRight - from.right) * slide
        box.style.transform = `translate3d(${dx}px, 0, 0) scale(${scale})`
        box.style.opacity = String(1 - fade)
      }
      box.style.pointerEvents = fade > 0.5 ? 'none' : ''
      box.inert = fade > 0.5
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div ref={outer} className="sticky z-30 mx-auto w-[calc(100%-2.5rem)] max-w-[600px]" style={{ top: TOP, bottom: 20 }}>
      <div ref={inner} className="origin-top-right will-change-transform">
        {children}
      </div>
    </div>
  )
}

/** Das E-Mail-Feld taucht links über „Ein Ort. Für Dich.“ wieder auf, wenn der Abschnitt hereinscrollt, und bleibt dann dort stehen. */
export function ReappearEmail({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = outer.current
    if (!element) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const update = () => {
      frame = 0
      const top = element.getBoundingClientRect().top
      // Erst sichtbar, wenn das Feld gut im Bild ist: So liegt ein kurzer Scrollweg zwischen Verschwinden und Auftauchen.
      const show = easeInOut(clamp01((window.innerHeight * 0.72 - top) / 200))
      element.style.opacity = String(show)
      element.style.transform = reduce ? '' : `translate3d(${(-40 * (1 - show)).toFixed(1)}px, 0, 0) scale(${(0.6 + 0.4 * show).toFixed(3)})`
      element.style.pointerEvents = show < 0.5 ? 'none' : ''
      element.inert = show < 0.5
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div ref={outer} className="w-full max-w-[520px] origin-top-left opacity-0 will-change-transform">
      {children}
    </div>
  )
}
