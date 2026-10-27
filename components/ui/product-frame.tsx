'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Zeigt eine Produktansicht in fester Designgröße und skaliert sie auf die verfügbare Breite,
 * wie ein Screenshot. Mit `minScale` bleibt sie auf kleinen Bildschirmen lesbar und läuft
 * rechts aus dem Bild; das Elternelement schneidet dann horizontal ab.
 * Für Screenreader zählt nur die Beschreibung.
 */
export function ProductFrame({
  width,
  height,
  label,
  minScale = 0,
  className = '',
  children,
}: {
  width: number
  height: number
  label: string
  minScale?: number
  className?: string
  children: ReactNode
}) {
  const slotRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    const slot = slotRef.current
    if (!slot) return
    const update = () => setScale(Math.min(1, Math.max(minScale, (slot.clientWidth - 2) / width)))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(slot)
    return () => observer.disconnect()
  }, [width, minScale])

  const current = scale ?? 1

  return (
    <div ref={slotRef} className={`mx-auto w-full ${className}`} style={{ maxWidth: width + 2 }}>
      <div
        role="img"
        aria-label={label}
        className={`relative overflow-hidden rounded-[20px] border border-line bg-white shadow-frame transition-opacity duration-300 ${scale === null ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: Math.round(width * current) + 2, height: Math.round(height * current) + 2 }}
      >
        <div aria-hidden style={{ width, height, transform: `scale(${current})`, transformOrigin: 'top left' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
