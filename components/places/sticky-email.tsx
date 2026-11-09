'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const TOP = 80 // Abstand zum oberen Rand, wenn das Feld mitläuft (Kopfzeile 64 px + Luft)
const MERGE = 280 // Scrollweg, auf dem das Feld in den Knopf der Kopfzeile übergeht

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Der sichtbare Knopf „Interesse vormerken“ der Kopfzeile (Desktop oder Mobil). */
function headerButton() {
  return [...document.querySelectorAll<HTMLElement>('[data-waitlist-cta]')].find((element) => element.offsetParent !== null) ?? null
}

/**
 * Hält das E-Mail-Feld beim Scrollen sichtbar (sticky), solange sein Abschnitt läuft.
 * Kurz vor dem Ende des Abschnitts zieht es sich zum Knopf „Interesse vormerken“ in der Kopfzeile zusammen und verschwindet darin.
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
      const left = range.getBoundingClientRect().bottom - sticky.getBoundingClientRect().bottom
      const progress = easeInOut(clamp01(1 - left / MERGE))
      const target = headerButton()
      if (reduce || !target) {
        box.style.opacity = String(1 - progress)
      } else {
        const from = sticky.getBoundingClientRect()
        const to = target.getBoundingClientRect()
        const dx = to.left + to.width / 2 - (from.left + from.width / 2)
        const dy = to.top + to.height / 2 - (from.top + from.height / 2)
        const scale = 1 + (Math.min(1, to.width / from.width) - 1) * progress
        box.style.transform = `translate3d(${dx * progress}px, ${dy * progress}px, 0) scale(${scale})`
        box.style.opacity = String(1 - clamp01((progress - 0.55) / 0.45))
      }
      box.style.pointerEvents = progress > 0.5 ? 'none' : ''
      box.inert = progress > 0.5
      if (target && progress >= 0.98 && !merged) {
        merged = true
        target.classList.remove('waitlist-merge')
        void target.offsetWidth
        target.classList.add('waitlist-merge')
      }
      if (progress < 0.9) merged = false
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
      <div ref={inner} className="origin-center will-change-transform">
        {children}
      </div>
    </div>
  )
}
