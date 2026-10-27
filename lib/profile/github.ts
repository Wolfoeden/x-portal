import { emptyImport, type ImportDraft } from '@/lib/profile/draft'
import type { ProjectInput } from '@/lib/profile/schema'
import type { Locale } from '@/lib/i18n/routes'

// Öffentliche GitHub-Daten als Vorschlag, übernommen aus lib/freelancer/import/github.ts im alten Projekt.
// GitHub ergänzt, es belegt nichts: Ein Repository in Python sagt, dass die Person Python verwendet hat, nicht wie gut.
// Deshalb nur Stärken und bis zu drei Projekte, ohne Aussage zu Seniorität oder Aktivität. Rein und testbar.

export type GithubRepo = {
  name: string
  description: string | null
  html_url: string
  fork: boolean
  archived: boolean
  stargazers_count: number
  created_at: string
  pushed_at: string
  topics?: string[]
}

export type GithubLanguages = Readonly<Record<string, number>>

/** Wie viele Repositorys der Abruf genauer ansieht (je ein Sprachenabruf). */
export const GITHUB_ANALYZED_REPOS = 6
export const GITHUB_MAX_PROJECTS = 3
const MAX_LANGUAGE_SKILLS = 8
/** Unter diesem Anteil am Code zählt eine Sprache nicht als Stärke. */
const MIN_LANGUAGE_SHARE = 0.05

/** GitHub-Sprachen, die anders heißen als die Kompetenz dahinter; null heißt: keine Stärke. */
const LANGUAGE_SKILLS: Readonly<Record<string, string | null>> = {
  Dockerfile: 'Docker',
  HCL: 'Terraform',
  'Jupyter Notebook': 'Python',
  Makefile: null,
  Batchfile: null,
  Procfile: null,
  Roff: null,
  CMake: null,
  'Vim Script': null,
  Shell: null,
  PowerShell: null,
  HTML: null,
  CSS: null,
  SCSS: null,
}

/** Themen nur, wenn sie eine Stärke sind; „hacktoberfest“ ist keine. */
const TOPIC_SKILLS: Readonly<Record<string, string>> = {
  ai: 'KI',
  llm: 'LLM',
  llms: 'LLM',
  rag: 'RAG',
  'retrieval-augmented-generation': 'RAG',
  agents: 'Agenten',
  'ai-agents': 'Agenten',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex',
  openai: 'OpenAI',
  'azure-openai': 'Azure OpenAI',
  anthropic: 'Anthropic',
  huggingface: 'Hugging Face',
  transformers: 'Transformers',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  'machine-learning': 'Machine Learning',
  'deep-learning': 'Deep Learning',
  nlp: 'NLP',
  'computer-vision': 'Computer Vision',
  ocr: 'OCR',
  embeddings: 'Embeddings',
  'vector-database': 'Vektordatenbank',
  pgvector: 'pgvector',
  'data-engineering': 'Datenpipeline',
  etl: 'ETL',
  dbt: 'dbt',
  snowflake: 'Snowflake',
  databricks: 'Databricks',
  spark: 'Spark',
  airflow: 'Airflow',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  supabase: 'Supabase',
  n8n: 'n8n',
  automation: 'Automatisierung',
  fastapi: 'FastAPI',
  django: 'Django',
  flask: 'Flask',
  react: 'React',
  nextjs: 'Next.js',
  'next-js': 'Next.js',
  nodejs: 'Node.js',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  mlops: 'MLOps',
  security: 'IT-Sicherheit',
  iso27001: 'ISO 27001',
  nis2: 'NIS2',
}

/** Wo die Stärke auf Englisch anders heißt. */
const TOPIC_SKILLS_EN: Readonly<Record<string, string>> = {
  ai: 'AI',
  agents: 'Agents',
  'ai-agents': 'Agents',
  'vector-database': 'Vector database',
  'data-engineering': 'Data pipelines',
  automation: 'Automation',
  security: 'IT security',
}

function languageSkill(language: string) {
  return language in LANGUAGE_SKILLS ? (LANGUAGE_SKILLS[language] ?? null) : language
}

function topicSkill(topic: string, locale: Locale) {
  const id = topic.trim().toLowerCase()
  return (locale === 'en' ? TOPIC_SKILLS_EN[id] : undefined) ?? TOPIC_SKILLS[id] ?? null
}

/** Die Repositorys, die etwas über die Arbeit der Person sagen: eigene, aktive. */
export function relevantRepos(repos: readonly GithubRepo[]) {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, GITHUB_ANALYZED_REPOS)
}

function monthOf(value: string) {
  const match = /^(\d{4})-(\d{2})/u.exec(value)
  return match ? `${match[1]}-${match[2]}` : null
}

function unique(values: Iterable<string | null>) {
  const seen = new Map<string, string>()
  for (const value of values) {
    const clean = value?.trim()
    if (clean && !seen.has(clean.toLowerCase())) seen.set(clean.toLowerCase(), clean)
  }
  return [...seen.values()]
}

export function draftFromGithub(input: { repos: readonly GithubRepo[]; languages: Readonly<Record<string, GithubLanguages>>; locale: Locale }): ImportDraft {
  const draft = emptyImport('github')
  const repos = relevantRepos(input.repos)
  if (!repos.length) return draft

  const totals = new Map<string, number>()
  for (const repo of repos) {
    for (const [language, bytes] of Object.entries(input.languages[repo.name] ?? {})) totals.set(language, (totals.get(language) ?? 0) + bytes)
  }
  const all = [...totals.values()].reduce((sum, bytes) => sum + bytes, 0)
  const languageSkills = [...totals.entries()]
    .filter(([, bytes]) => all > 0 && bytes / all >= MIN_LANGUAGE_SHARE)
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => languageSkill(language))
  const topicSkills = repos.flatMap((repo) => (repo.topics ?? []).map((topic) => topicSkill(topic, input.locale)))
  draft.skills = unique([...unique(languageSkills).slice(0, MAX_LANGUAGE_SKILLS), ...topicSkills])

  draft.projects = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at))
    .filter((repo) => repo.name.length >= 3)
    .slice(0, GITHUB_MAX_PROJECTS)
    .map((repo): ProjectInput => {
      const languages = Object.entries(input.languages[repo.name] ?? {})
        .sort((a, b) => b[1] - a[1])
        .map(([language]) => languageSkill(language))
      const description = repo.description?.replace(/\s+/gu, ' ').trim() ?? ''
      return {
        title: repo.name.slice(0, 160),
        client: null,
        role: null,
        startedOn: monthOf(repo.created_at),
        endedOn: null,
        ongoing: false,
        technologies: unique([...languages, ...(repo.topics ?? []).map((topic) => topicSkill(topic, input.locale))]).slice(0, 30),
        outcome: description.length >= 10 ? description.slice(0, 2_000) : null,
        link: repo.html_url.startsWith('https://github.com/') ? repo.html_url : null,
      }
    })
  return draft
}

/** GitHub-Namen: Buchstaben, Ziffern und einzelne Bindestriche, höchstens 39 Zeichen. */
export const GITHUB_LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/iu

/** „octocat“, „@octocat“ oder „https://github.com/octocat“ ergeben „octocat“. */
export function loginFrom(value: string) {
  const trimmed = value.trim().replace(/^@/u, '')
  const fromUrl = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#\s]+)\/?$/iu.exec(trimmed)?.[1]
  const login = fromUrl ?? trimmed
  return GITHUB_LOGIN.test(login) ? login : null
}
