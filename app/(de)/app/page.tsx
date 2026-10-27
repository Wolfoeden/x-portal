import type { Metadata } from 'next'
import { LoadingMark } from '@/components/brand/loading-mark'

export const metadata: Metadata = { title: 'XPORTAL', robots: { index: false, follow: false } }

// Einstieg in die App für Angemeldete („Projekt starten“). Vorerst nur die Ladeanimation, ohne Weiterleitung.
// Die Seite ist sprachneutral und liegt nur deshalb in der Gruppe (de), weil dort ein Root-Layout ist.
export default function AppStartPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-5">
      <LoadingMark label="Arbeitsbereich wird geladen · Loading your workspace" />
    </main>
  )
}
