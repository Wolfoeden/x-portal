import { MAX_PROJECTS, type ProfileInput, type ProjectInput } from '@/lib/profile/schema'

// Vorschlag aus einem Import (Lebenslauf, GitHub). Regel wie im alten Projekt (lib/freelancer/import/draft.ts):
// Ein Import füllt leere Felder und ergänzt Listen, er überschreibt nie. Gespeichert wird erst, wenn die Person bestätigt.
// Rein und ohne Server-Importe: Das Konto mischt im Browser.

export type ImportSource = 'cv' | 'github'

export type ImportDraft = {
  source: ImportSource
  roleTitle: string | null
  about: string | null
  location: string | null
  skills: string[]
  languages: string[]
  projects: ProjectInput[]
}

export const emptyImport = (source: ImportSource): ImportDraft => ({ source, roleTitle: null, about: null, location: null, skills: [], languages: [], projects: [] })

const LIMITS = {
  roleTitle: 120,
  about: 4_000,
  location: 120,
  skills: { count: 30, length: 60 },
  languages: { count: 12, length: 40 },
  technologies: { count: 30, length: 60 },
  title: 160,
  client: 160,
  role: 120,
  outcome: 2_000,
}

const key = (value: string) => value.trim().toLocaleLowerCase('de-DE')

export function cleanTag(value: string, maxLength: number) {
  return value.replace(/\s+/gu, ' ').trim().slice(0, maxLength).trim()
}

function cleanText(value: string | null | undefined, maxLength: number) {
  const clean = (value ?? '').replace(/[ \t]+/gu, ' ').trim().slice(0, maxLength).trim()
  return clean || null
}

function appendTags(current: string[], incoming: string[], limit: { count: number; length: number }) {
  const values = [...current]
  const seen = new Set(values.map(key))
  let added = 0
  for (const raw of incoming) {
    if (values.length >= limit.count) break
    const value = cleanTag(raw, limit.length)
    if (!value || seen.has(key(value))) continue
    seen.add(key(value))
    values.push(value)
    added += 1
  }
  return { values, added }
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/u

/** Ein Projekt aus einem Import, in den Grenzen von ProjectInput, damit das Speichern nicht an einem übernommenen Wert scheitert. */
export function cleanProject(project: ProjectInput): ProjectInput | null {
  const title = cleanText(project.title, LIMITS.title)
  if (!title || title.length < 2) return null
  const startedOn = project.startedOn && MONTH.test(project.startedOn) ? project.startedOn : null
  const endedOn = !project.ongoing && project.endedOn && MONTH.test(project.endedOn) ? project.endedOn : null
  const outcome = cleanText(project.outcome, LIMITS.outcome)
  return {
    title,
    client: cleanText(project.client, LIMITS.client),
    role: cleanText(project.role, LIMITS.role),
    startedOn,
    endedOn: startedOn && endedOn && endedOn < startedOn ? null : endedOn,
    ongoing: project.ongoing,
    technologies: appendTags([], project.technologies, LIMITS.technologies).values,
    outcome: outcome && outcome.length >= 10 ? outcome : null,
    link: project.link && /^https:\/\/[^\s]+$/u.test(project.link) && project.link.length <= 500 ? project.link : null,
  }
}

/** Mischt einen Vorschlag in Profil und Projekte. `taken` zählt, was wirklich neu dazukam. */
export function mergeDraft(profile: ProfileInput, projects: ProjectInput[], draft: ImportDraft) {
  let taken = 0
  const next: ProfileInput = { ...profile }
  for (const field of ['roleTitle', 'about', 'location'] as const) {
    const incoming = cleanText(draft[field], LIMITS[field])
    if (!next[field]?.trim() && incoming) {
      next[field] = incoming
      taken += 1
    }
  }
  const skills = appendTags(next.skills, draft.skills, LIMITS.skills)
  const languages = appendTags(next.languages, draft.languages, LIMITS.languages)
  next.skills = skills.values
  next.languages = languages.values
  taken += skills.added + languages.added

  const nextProjects = [...projects]
  const titles = new Set(nextProjects.map((project) => key(project.title)))
  for (const project of draft.projects) {
    if (nextProjects.length >= MAX_PROJECTS) break
    const clean = cleanProject(project)
    if (!clean || clean.title.length < 3 || titles.has(key(clean.title))) continue
    titles.add(key(clean.title))
    nextProjects.push(clean)
    taken += 1
  }
  return { profile: next, projects: nextProjects, taken }
}
