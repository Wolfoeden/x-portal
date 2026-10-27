import { describe, expect, it } from 'vitest'
import { draftFromCv } from '@/lib/ai/cv'
import { cleanProject, emptyImport, mergeDraft } from '@/lib/profile/draft'
import { draftFromGithub, loginFrom, relevantRepos, type GithubRepo } from '@/lib/profile/github'
import { ProfileInput, ProjectInput, missingForPublish, profileFromDraft, profileFromRow, rowFromProfile } from '@/lib/profile/schema'

const profile = ProfileInput.parse({
  firstName: 'Lena',
  lastName: null,
  roleKey: 'ki',
  roleTitle: null,
  headline: null,
  about: null,
  skills: ['RAG', 'Python'],
  languages: [],
  dayRate: 920,
  availability: 'now',
  workMode: 'both',
  location: null,
  links: [],
})

const project = (title: string): ProjectInput => ({ title, client: null, role: null, startedOn: null, endedOn: null, ongoing: false, technologies: [], outcome: null, link: null })

describe('Profilschema', () => {
  it('leert optionale Texte zu null und begrenzt wie die Datenbank', () => {
    const parsed = ProfileInput.parse({ ...profile, roleTitle: '   ', headline: ' KI für den Mittelstand ' })
    expect(parsed.roleTitle).toBeNull()
    expect(parsed.headline).toBe('KI für den Mittelstand')
    expect(ProfileInput.safeParse({ ...profile, dayRate: 99 }).success).toBe(false)
    expect(ProfileInput.safeParse({ ...profile, links: ['http://unsicher.de'] }).success).toBe(false)
    expect(ProfileInput.safeParse({ ...profile, skills: Array.from({ length: 31 }, (_, index) => `S${index}`) }).success).toBe(false)
  })

  it('nennt, was zum Veröffentlichen fehlt, wie der Trigger', () => {
    expect(missingForPublish(profile)).toEqual([])
    expect(missingForPublish({ ...profile, roleKey: null, skills: [], dayRate: null, workMode: null })).toEqual(['role', 'skills', 'dayRate', 'workMode'])
    // Eine eigene Berufsbezeichnung genügt als Rolle.
    expect(missingForPublish({ ...profile, roleKey: null, roleTitle: 'Data Engineer' })).toEqual([])
  })

  it('übernimmt den Entwurf aus dem Assistenten', () => {
    const fromDraft = profileFromDraft({ name: ' Jonas ', role: 'auto', skills: ['n8n'], rate: 820, availability: 'month', mode: 'remote' })
    expect(ProfileInput.safeParse(fromDraft).success).toBe(true)
    expect(fromDraft).toMatchObject({ firstName: 'Jonas', roleKey: 'auto', dayRate: 820, workMode: 'remote' })
  })

  it('bildet Zeile und Profil verlustfrei aufeinander ab', () => {
    const row = rowFromProfile({ ...profile, links: ['https://github.com/lena'] })
    expect(row).toMatchObject({ first_name: 'Lena', day_rate_eur: 920, work_mode: 'both', links: ['https://github.com/lena'] })
    expect(profileFromRow({ ...row, links: ['https://github.com/lena', 42] })).toEqual({ ...profile, links: ['https://github.com/lena'] })
  })
})

describe('Vorschläge mischen', () => {
  it('füllt nur leere Felder und ergänzt Listen ohne Doppelte', () => {
    const draft = { ...emptyImport('cv'), roleTitle: 'Senior AI Engineer', about: 'Ich baue RAG-Systeme.', skills: ['rag', 'LangChain', '  Azure   OpenAI '], languages: ['Englisch C1'] }
    const merged = mergeDraft({ ...profile, about: 'Eigener Text' }, [], draft)
    expect(merged.profile.roleTitle).toBe('Senior AI Engineer')
    expect(merged.profile.about).toBe('Eigener Text')
    expect(merged.profile.skills).toEqual(['RAG', 'Python', 'LangChain', 'Azure OpenAI'])
    expect(merged.profile.languages).toEqual(['Englisch C1'])
    expect(merged.taken).toBe(4)
  })

  it('hält die Grenzen ein und überspringt bekannte Projekte', () => {
    const many = Array.from({ length: 9 }, (_, index) => project(`Projekt ${index}`))
    const draft = { ...emptyImport('github'), projects: [project('projekt 0'), project('Neu A'), project('Neu B'), project('x')] }
    const merged = mergeDraft(profile, many, draft)
    expect(merged.projects).toHaveLength(10)
    expect(merged.projects.at(-1)?.title).toBe('Neu A')
    expect(merged.taken).toBe(1)
  })

  it('säubert übernommene Projekte', () => {
    const clean = cleanProject({ ...project('  Chatbot  '), startedOn: '2025-13', endedOn: '2024-01', outcome: 'kurz', link: 'http://alt.de', technologies: ['Python', 'python', ''] })
    expect(clean).toMatchObject({ title: 'Chatbot', startedOn: null, endedOn: '2024-01', outcome: null, link: null, technologies: ['Python'] })
    expect(cleanProject({ ...project('Lauf'), startedOn: '2025-03', endedOn: '2024-01' })?.endedOn).toBeNull()
    expect(cleanProject(project(' '))).toBeNull()
  })

  it('übernimmt aus dem Lebenslauf nur, was ins Profil passt', () => {
    const draft = draftFromCv({ roleTitle: 'Data Engineer', about: null, location: 'Köln', skills: ['dbt'], languages: [], projects: [{ ...project('Datenplattform'), technologies: ['dbt'] }] })
    expect(draft.source).toBe('cv')
    expect(mergeDraft(profile, [], draft).profile.location).toBe('Köln')
  })
})

const repo = (name: string, extra: Partial<GithubRepo> = {}): GithubRepo => ({
  name,
  description: null,
  html_url: `https://github.com/lena/${name}`,
  fork: false,
  archived: false,
  stargazers_count: 0,
  created_at: '2024-03-01T00:00:00Z',
  pushed_at: '2026-01-01T00:00:00Z',
  topics: [],
  ...extra,
})

describe('GitHub', () => {
  it('liest nur eigene, aktive Repositorys', () => {
    const repos = [repo('fork', { fork: true }), repo('alt', { archived: true }), repo('rag-bot')]
    expect(relevantRepos(repos).map((item) => item.name)).toEqual(['rag-bot'])
  })

  it('macht Sprachen und bekannte Themen zu Stärken, nie Unbekanntes', () => {
    const draft = draftFromGithub({
      repos: [repo('rag-bot', { topics: ['rag', 'hacktoberfest', 'ai'], stargazers_count: 5, description: 'Chatbot auf eigenen Dokumenten.' }), repo('infra')],
      languages: { 'rag-bot': { Python: 9_000, Shell: 400 }, infra: { HCL: 3_000, Makefile: 10 } },
      locale: 'en',
    })
    expect(draft.skills).toEqual(['Python', 'Terraform', 'RAG', 'AI'])
    expect(draft.projects[0]).toMatchObject({ title: 'rag-bot', startedOn: '2024-03', outcome: 'Chatbot auf eigenen Dokumenten.', link: 'https://github.com/lena/rag-bot' })
    expect(draft.projects).toHaveLength(2)
  })

  it('erkennt Namen und Profiladressen', () => {
    expect(loginFrom('@octocat')).toBe('octocat')
    expect(loginFrom('https://github.com/octo-cat/')).toBe('octo-cat')
    expect(loginFrom('octo--cat')).toBeNull()
    expect(loginFrom('https://github.com/octocat/repo')).toBeNull()
  })
})
