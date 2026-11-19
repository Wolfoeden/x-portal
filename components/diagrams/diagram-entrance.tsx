'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** The drawing is complete in HTML. Entering the viewport adds one optional accent. */
export function DiagramEntrance({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element || !window.IntersectionObserver || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.dataset.entered = 'true'
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={className}>{children}</div>
}
