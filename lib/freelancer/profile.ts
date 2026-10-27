// Profilentwurf für die Freelancer-Seite. In der Vorschau bleibt alles im Browser; gespeichert wird nichts.
// Rollen, Stärken und Beispielprofile stehen je Sprache in lib/i18n.

import type { ScenarioId, Tone } from '@/lib/demo/scenarios'

export type RoleId = 'ki' | 'data' | 'auto' | 'pm' | 'design' | 'isms'
export type Availability = 'now' | 'month' | 'part'
export type WorkMode = 'onsite' | 'remote' | 'both'

export type Role = {
  id: RoleId
  label: string
  tone: Tone
  skills: string[]
  /** Beispielprojekt, das zu dieser Rolle passt, und was es verlangt. */
  match: { scenario: ScenarioId; needs: { label: string; skill: string }[]; open: string }
}

export type AvailabilityOption = { id: Availability; label: string; card: string }
export type WorkModeOption = { id: WorkMode; label: string; text: string; badge: string }

export type Draft = {
  name: string
  role: RoleId | null
  skills: string[]
  rate: number
  availability: Availability | null
  mode: WorkMode | null
}

export const RATE = { min: 400, max: 1600, step: 10, start: 850 }

export const EMPTY_DRAFT: Draft = { name: '', role: null, skills: [], rate: RATE.start, availability: null, mode: null }

/** Anteil eines vollständigen Profils in Prozent. Ein vollständiges Profil geht sofort ins Matching. */
export function completeness(draft: Draft) {
  let score = 15 // Der Tagessatz hat immer einen Wert.
  if (draft.name.trim().length >= 2) score += 20
  if (draft.role) score += 20
  score += Math.round((Math.min(draft.skills.length, 3) / 3) * 25)
  if (draft.availability) score += 10
  if (draft.mode) score += 10
  return score
}

export function initialsOf(name: string) {
  const letters = name.trim().replace(/[^\p{L}]/gu, '')
  return letters.slice(0, 2).toUpperCase()
}

export function findRole(roles: Role[], id: RoleId | null) {
  return id ? roles.find((role) => role.id === id) ?? null : null
}
