'use client'

import { useEffect } from 'react'
import { WORDMARK } from '@/components/brand/logo-paths'
import { APP_URL } from '@/lib/site'

// Ladeanimation beim Wechsel in die App: das Logo, über das ein heller Streifen läuft, darunter eine Fortschrittslinie.
// Bei „Bewegung reduzieren“ steht beides still (app/globals.css). Ist APP_URL gesetzt, geht es danach dorthin.

const HOLD_MS = 1_400

export function LoadingMark({ label }: { label: string }) {
  useEffect(() => {
    if (!APP_URL) return
    const timer = window.setTimeout(() => window.location.replace(APP_URL), HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8">
      <svg viewBox={WORDMARK.viewBox} aria-hidden focusable="false" className="h-12 w-auto text-ink sm:h-14">
        <defs>
          <linearGradient id="loader-shine" gradientUnits="userSpaceOnUse" x1="-180" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
            <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="720 0" dur="1.9s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        <path fillRule="evenodd" fill="currentColor" d={WORDMARK.d} />
        <path className="loader-shine" fillRule="evenodd" fill="url(#loader-shine)" d={WORDMARK.d} />
      </svg>
      <div className="h-[3px] w-40 overflow-hidden rounded-full bg-surface-2">
        <div className="loader-bar h-full w-1/3 rounded-full bg-brand" />
      </div>
      <p role="status" className="sr-only">
        {label}
      </p>
    </div>
  )
}
