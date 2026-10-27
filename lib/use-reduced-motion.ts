'use client'

import { useMediaQuery } from '@/lib/use-media-query'

/**
 * Wie `useReducedMotion` aus motion, aber ohne Hydrationsfehler: Beim ersten Rendern gilt wie auf dem Server
 * „Bewegung an“, danach die Einstellung des Geräts.
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false)
}
