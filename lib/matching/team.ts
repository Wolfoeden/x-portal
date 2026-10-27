import { createHash } from 'node:crypto'
import type { Brief } from '@/lib/ai/brief'
import type { Availability, RoleId, WorkMode } from '@/lib/freelancer/profile'

// Aus der Vorauswahl der Datenbank wird ein kleines Team: je benötigter Rolle das beste Profil, dann nach Punkten auffüllen.

export type Candidate = {
  id: string
  similarity: number
  firstName: string
  /** Steht in showcase_profiles: Vorname darf gezeigt werden. */
  showcase: boolean
  /** Foto über /api/avatar, nur mit Einwilligung und vorhandenem Foto. */
  photo?: string | null
  roleTitle: string | null
  roleKey: RoleId | null
  skills: string[]
  availability: Availability | null
  workMode: WorkMode | null
  dayRate: number | null
}

/** Unterhalb dieser Nähe gilt ein Profil nicht als Treffer. */
export const MIN_SIMILARITY = 0.18

export type ProfileText = { roleTitle: string | null; headline: string | null; skills: string[]; about: string | null }

/** Text für den Fingerabdruck eines Profils: ohne Namen, ohne Kontakt. */
export function profileText(profile: ProfileText) {
  return [profile.roleTitle, profile.headline, profile.skills.length ? `Skills: ${profile.skills.join(', ')}` : null, profile.about]
    .filter((part): part is string => Boolean(part?.trim()))
    .join('\n')
    .slice(0, 6_000)
}

export function inputHash(text: string, model: string) {
  return createHash('sha256').update(`${model}\n${text}`).digest('hex')
}

function normalize(skill: string) {
  return skill.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/** „ISO 27001“ passt zu „ISO 27001 Audits“, „RAG“ zu „rag“; kurze Wörter nur exakt. */
export function skillMatches(need: string, have: string) {
  const wanted = normalize(need)
  const offered = normalize(have)
  if (!wanted || !offered) return false
  if (wanted === offered) return true
  return (wanted.length >= 3 && ` ${offered} `.includes(` ${wanted} `)) || (offered.length >= 3 && ` ${wanted} `.includes(` ${offered} `))
}

export function coveredSkill(need: string, candidate: Candidate) {
  return candidate.skills.find((skill) => skillMatches(need, skill)) ?? null
}

/** Arbeitsort wie in match_freelancers: vor Ort braucht onsite oder both, remote braucht remote oder both, hybrid nimmt alle. */
export function fitsWorkMode(wanted: Brief['workMode'], offered: WorkMode | null) {
  if (wanted === 'unknown' || wanted === 'both') return true
  return offered === wanted || offered === 'both'
}

/** Nähe ohne Fingerabdruck: Anteil der gesuchten Stärken (Wunsch-Stärken halb) und passende Rolle. Wertebereich 0 bis 0,9. */
export function lexicalSimilarity(brief: Brief, profile: { roleKey: RoleId | null; skills: string[] }) {
  const has = (need: string) => profile.skills.some((skill) => skillMatches(need, skill))
  const weight = brief.requiredSkills.length + 0.5 * brief.optionalSkills.length
  const hits = brief.requiredSkills.filter(has).length + 0.5 * brief.optionalSkills.filter(has).length
  const role = profile.roleKey !== null && brief.roles.includes(profile.roleKey) ? 1 : 0
  return (weight ? (0.6 * hits) / weight : 0) + 0.3 * role
}

export function score(candidate: Candidate, brief: Brief) {
  const required = brief.requiredSkills
  const met = required.filter((need) => coveredSkill(need, candidate)).length
  let value = candidate.similarity + (required.length ? (0.25 * met) / required.length : 0)
  if (brief.maxDayRateEur && candidate.dayRate && candidate.dayRate > brief.maxDayRateEur) value -= 0.1
  if (candidate.availability === 'now') value += 0.02
  return value
}

export function pickTeam(brief: Brief, candidates: Candidate[]): Candidate[] {
  const ranked = candidates
    .filter((candidate) => candidate.similarity >= MIN_SIMILARITY)
    .sort((left, right) => score(right, brief) - score(left, brief))
  const size = Math.min(4, Math.max(brief.teamSize, brief.roles.length), ranked.length)
  const team: Candidate[] = []
  for (const role of brief.roles) {
    if (team.length >= size) break
    const pick = ranked.find((candidate) => candidate.roleKey === role && !team.includes(candidate))
    if (pick) team.push(pick)
  }
  for (const candidate of ranked) {
    if (team.length >= size) break
    if (!team.includes(candidate)) team.push(candidate)
  }
  // Das stärkste Profil führt das Team an; es steht in der Begründung vorn.
  return team.sort((left, right) => score(right, brief) - score(left, brief))
}
