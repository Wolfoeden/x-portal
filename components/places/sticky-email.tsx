'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const TOP = 80 // Abstand zum oberen Rand, wenn das Feld mitläuft (Kopfzeile 64 px + Luft)
const MERGE = 260 // Scrollweg, auf dem das Feld in den Knopf der Kopfzeile übergeht
const SLIDE = 240 // Scrollweg, auf dem das Feld nach rechts unter den Knopf gleitet
const GAP = 40 // Abstand zwischen Bild und Feld (gap-10)
const NARROW_WIDTH = 440 // Breite des Felds, wenn es rechts unter dem Knopf läuft

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Der sichtbare Knopf „Interesse vormerken“ der Kopfzeile (Desktop oder Mobil). */
function headerButton() {
  return [...document.querySelectorAll<HTMLElement>('[data-waitlist-cta]')].find((element) => element.offsetParent !== null) ?? null
}

/**
 * Hält das E-Mail-Feld beim Scrollen sichtbar (sticky), solange sein Abschnitt läuft.
 * Sobald es oben mitläuft, gleitet es nach rechts unter den Knopf „Interesse vormerken“ der Kopfzeile.
 * Kurz vor dem Ende des Abschnitts steigt es in den Knopf auf, schrumpft auf seine Breite und geht darin auf.
 * Der Knopf leuchtet kurz auf, wenn das Feld angekommen ist.
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
    let merged = false

    const update = () => {
      frame = 0
      const target = headerButton()
      const from = sticky.getBoundingClientRect()
      // Wie weit das Feld schon oben mitläuft: Abstand zwischen seinem eigentlichen Platz (unter dem Bild) und TOP.
      const before = sticky.previousElementSibling?.getBoundingClientRect().bottom ?? from.top
      const slide = easeInOut(clamp01((TOP - (before + GAP)) / SLIDE))
      const left = range.getBoundingClientRect().bottom - from.bottom
      const merge = easeInOut(clamp01(1 - left / MERGE))

      if (reduce || !target) {
        box.style.opacity = String(1 - merge)
      } else {
        const to = target.getBoundingClientRect()
        // Phase 1: nach rechts unter den Knopf gleiten und etwas schmaler werden.
        // Phase 2: nach oben in den Knopf, auf seine Breite schrumpfen und darin aufgehen.
        const narrow = Math.min(1, NARROW_WIDTH / from.width)
        const fit = to.width / from.width
        const scale = (1 + (narrow - 1) * slide) * (1 - merge) + fit * merge
        const dx = (to.right - from.right) * Math.max(slide, merge)
        const dy = (to.top + to.height / 2 - (from.height * fit) / 2 - from.top) * merge
        box.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`
        box.style.opacity = String(1 - clamp01((merge - 0.6) / 0.4))
      }
      box.style.pointerEvents = merge > 0.5 ? 'none' : ''
      box.inert = merge > 0.5
      if (target && merge >= 0.98 && !merged) {
        merged = true
        target.classList.remove('waitlist-merge')
        void target.offsetWidth
        target.classList.add('waitlist-merge')
      }
      if (merge < 0.9) merged = false
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
    <div ref={outer} className="sticky z-50 mx-auto w-full max-w-[600px]" style={{ top: TOP, bottom: 20 }}>
      <div ref={inner} className="origin-top-right will-change-transform">
        {children}
      </div>
    </div>
  )
}
