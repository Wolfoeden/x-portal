import { z } from 'zod'
import type { Draft } from '@/lib/freelancer/profile'

// Profilfelder mit denselben Grenzen wie die Datenbank (public.freelancers, public.freelancer_projects).
// Browser und Server prüfen mit demselben Schema; die Datenbank prüft trotzdem noch einmal.

const text = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null)
    .nullable()

const HTTPS_URL = /^https:\/\/[^\s]+$/

export const ROLE_KEYS = ['ki', 'data', 'auto', 'pm', 'design', 'isms'] as const
export const AVAILABILITY = ['now', 'month', 'part'] as const
export const WORK_MODES = ['onsite', 'remote', 'both'] as const

export const ProfileInput = z.object({
  firstName: text(60).min(1),
  lastName: optionalText(80),
  roleKey: z.enum(ROLE_KEYS).nullable(),
  roleTitle: optionalText(120),
  headline: optionalText(160),
  about: optionalText(4_000),
  skills: z.array(text(60).min(1)).max(30),
  languages: z.array(text(40).min(1)).max(12),
  dayRate: z.number().int().min(100).max(5_000).nullable(),
  availability: z.enum(AVAILABILITY).nullable(),
  workMode: z.enum(WORK_MODES).nullable(),
  location: optionalText(120),
  links: z.array(z.string().trim().max(300).regex(HTTPS_URL)).max(5),
})
export type ProfileInput = z.infer<typeof ProfileInput>

export const ProjectInput = z.object({
  title: text(160).min(2),
  client: optionalText(160),
  role: optionalText(120),
  startedOn: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
  endedOn: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
  ongoing: z.boolean(),
  technologies: z.array(text(60).min(1)).max(30),
  outcome: optionalText(2_000),
  link: z.string().trim().max(500).regex(HTTPS_URL).nullable(),
})
export type ProjectInput = z.infer<typeof ProjectInput>
export const MAX_PROJECTS = 10

/** Was zum Veröffentlichen fehlt, wie es der Trigger in der Datenbank verlangt. */
export function missingForPublish(profile: Pick<ProfileInput, 'roleKey' | 'roleTitle' | 'skills' | 'dayRate' | 'workMode'>) {
  const missing: ('role' | 'skills' | 'dayRate' | 'workMode')[] = []
  if (!profile.roleKey && !profile.roleTitle?.trim()) missing.push('role')
  if (!profile.skills.length) missing.push('skills')
  if (profile.dayRate === null) missing.push('dayRate')
  if (!profile.workMode) missing.push('workMode')
  return missing
}

/** Entwurf aus dem Assistenten auf /freelancer → Profilfelder. */
export function profileFromDraft(draft: Draft): ProfileInput {
  return {
    firstName: draft.name.trim().slice(0, 60),
    lastName: null,
    roleKey: draft.role,
    roleTitle: null,
    headline: null,
    about: null,
    skills: draft.skills.slice(0, 30),
    languages: [],
    dayRate: draft.rate,
    availability: draft.availability,
    workMode: draft.mode,
    location: null,
    links: [],
  }
}

/** Zeile aus public.freelancers → Profilfelder. */
export type FreelancerRow = {
  first_name: string
  last_name: string | null
  role_key: ProfileInput['roleKey']
  role_title: string | null
  headline: string | null
  about: string | null
  skills: string[]
  languages: string[]
  day_rate_eur: number | null
  availability: ProfileInput['availability']
  work_mode: ProfileInput['workMode']
  location_text: string | null
  links: unknown
}

export function profileFromRow(row: FreelancerRow): ProfileInput {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    roleKey: row.role_key,
    roleTitle: row.role_title,
    headline: row.headline,
    about: row.about,
    skills: row.skills ?? [],
    languages: row.languages ?? [],
    dayRate: row.day_rate_eur,
    availability: row.availability,
    workMode: row.work_mode,
    location: row.location_text,
    links: Array.isArray(row.links) ? row.links.filter((link): link is string => typeof link === 'string') : [],
  }
}

export function rowFromProfile(profile: ProfileInput) {
  return {
    first_name: profile.firstName,
    last_name: profile.lastName,
    role_key: profile.roleKey,
    role_title: profile.roleTitle,
    headline: profile.headline,
    about: profile.about,
    skills: profile.skills,
    languages: profile.languages,
    day_rate_eur: profile.dayRate,
    availability: profile.availability,
    work_mode: profile.workMode,
    location_text: profile.location,
    links: profile.links,
  }
}
