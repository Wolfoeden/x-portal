// Demo-Motor für die Startseite: ordnet einen Satz einem Beispielszenario zu.
// Echte Treffer kommen von /api/analyse in derselben Form (source: 'live'); ohne Server antwortet dieser Motor.
// Die Texte der Szenarien und Rollen stehen je Sprache in lib/i18n.

export type Tone = 'green' | 'amber' | 'slate' | 'stone'

/** Freelancer (Beispiel oder echtes Profil), KI-Agent von XPORTAL oder jemand aus dem Team des Auftraggebers. */
export type MemberKind = 'freelancer' | 'agent' | 'client'

export type Talent = {
  id: string
  name: string
  initials: string
  tone: Tone
  onSite: boolean
  kind?: MemberKind
  /** Foto echter Profile mit Einwilligung, über /api/avatar. */
  photo?: string
}

/** `who`: Teammitglied, das die Anforderung abdeckt. Übernimmt Ihr Team diese Stelle, gilt sie als abgedeckt. */
export type Requirement = { label: string; met: boolean; by: string; who?: string }

export type ScenarioId = 'chatbot' | 'automation' | 'analytics' | 'isms'

/** Echte Treffer bringen ihr Profil mit; Beispielprofile stehen in TALENTS. Ohne `kind` ein Freelancer. */
export type TeamMember = {
  id: string
  why: string[]
  from: string
  talent?: Talent
  role?: string
  kind?: MemberKind
  /** Bei KI-Agenten: wer das Ergebnis prüft. */
  reviewer?: string
  /** Tagessatz in Euro; daraus entstehen die Kosten ohne die Stellen Ihres Teams. */
  rate?: number
  /** Alle Stärken, nicht nur die gezeigten; zählt für die Modellwahl. */
  skills?: string[]
}

/** Kosten als Zahl, damit sie sich ohne die Stellen Ihres Teams neu rechnen lassen. */
export type Costs = { value: number; kind: 'total' | 'estimate' | 'perDay' }

export type Scenario = {
  id: ScenarioId | `live-${string}`
  source?: 'demo' | 'live'
  chip: string
  sentence: string
  title: string
  keywords: string[]
  team: TeamMember[]
  rate: string
  requirements: Requirement[]
  deliveries: string[]
  budget: string
  costs?: Costs
  /** KI-Projekt: Der Auftraggeber wählt das Modell (Claude, OpenAI oder eigene Server). */
  ai?: boolean
}

export const TALENTS: Talent[] = [
  { id: 'mara', name: 'Mara', initials: 'MA', tone: 'green', onSite: true },
  { id: 'leon', name: 'Leon', initials: 'LE', tone: 'amber', onSite: true },
  { id: 'eva', name: 'Eva', initials: 'EV', tone: 'slate', onSite: true },
  { id: 'noah', name: 'Noah', initials: 'NO', tone: 'stone', onSite: false },
  { id: 'jonas', name: 'Jonas', initials: 'JO', tone: 'green', onSite: false },
  { id: 'aylin', name: 'Aylin', initials: 'AY', tone: 'slate', onSite: true },
  { id: 'sara', name: 'Sara', initials: 'SA', tone: 'amber', onSite: false },
  { id: 'clara', name: 'Clara', initials: 'CL', tone: 'stone', onSite: false },
  { id: 'tobias', name: 'Tobias', initials: 'TO', tone: 'green', onSite: true },
  { id: 'lena', name: 'Lena', initials: 'LN', tone: 'amber', onSite: false },
  { id: 'malik', name: 'Malik', initials: 'MK', tone: 'slate', onSite: true },
  { id: 'ines', name: 'Ines', initials: 'IN', tone: 'stone', onSite: false },
  { id: 'paul', name: 'Paul', initials: 'PA', tone: 'green', onSite: false },
  { id: 'yara', name: 'Yara', initials: 'YA', tone: 'amber', onSite: true },
  { id: 'ben', name: 'Ben', initials: 'BE', tone: 'slate', onSite: false },
  { id: 'mira', name: 'Mira', initials: 'MI', tone: 'stone', onSite: false },
]

export const talentById = new Map(TALENTS.map((talent) => [talent.id, talent]))

const UNKNOWN: Talent = { id: 'unknown', name: '', initials: '', tone: 'stone', onSite: false }

export function talentOf(member: TeamMember): Talent {
  return member.talent ?? talentById.get(member.id) ?? UNKNOWN
}

export function kindOf(member: TeamMember): MemberKind {
  return member.kind ?? member.talent?.kind ?? 'freelancer'
}

/** Wer das Ergebnis eines Agenten prüft, so wie die Person im Team steht. `ownTeam` ersetzt „Ihr Team“ mitten im Satz (Englisch klein). */
export function reviewerOf(member: TeamMember, team: TeamMember[], ownTeam?: string) {
  const reviewer = team.find((item) => item.id === member.reviewer)
  if (!reviewer) return ''
  return ownTeam && kindOf(reviewer) === 'client' ? ownTeam : talentOf(reviewer).name
}

/** Rolle eines Teammitglieds: bei echten Treffern aus dem Profil, sonst aus dem Wörterbuch. */
export function roleOf(member: TeamMember, talentRoles: Record<string, string>) {
  return member.role ?? talentRoles[member.id] ?? ''
}

// Lange Schlüsselwörter dürfen in zusammengesetzten Wörtern stecken („Kundenservice“), kurze nur am Wortanfang („bi“ nicht in „bis“).
function hasKeyword(text: string, tokens: string[], keyword: string) {
  return keyword.length > 3 ? text.includes(keyword) : tokens.some((token) => token === keyword || (keyword.length === 3 && token.startsWith(keyword)))
}

/** Wählt das Szenario mit den meisten Treffern; ohne Treffer bleibt es beim ersten (Chatbot). */
export function matchScenario(text: string, scenarios: Scenario[]): Scenario {
  const words = text.toLowerCase()
  const tokens = words.split(/[^a-z0-9äöüß]+/).filter(Boolean)
  let best = scenarios[0]
  let bestScore = 0
  for (const scenario of scenarios) {
    const score = scenario.keywords.reduce((sum, keyword) => (hasKeyword(words, tokens, keyword) ? sum + 1 : sum), 0)
    if (score > bestScore) {
      best = scenario
      bestScore = score
    }
  }
  return best
}

/** Einzahl und Mehrzahl; Ihr Team zählt nicht, es steht nur da. */
export type MixWords = { freelancer: [string, string]; agent: [string, string]; client: string }

/** „2 Freelancer · 1 KI-Agent · 1 aus Ihrem Team“ in der Sprache der Seite. */
export function teamMix(team: TeamMember[], words: MixWords): string {
  const count = (kind: MemberKind) => team.filter((member) => kindOf(member) === kind).length
  const freelancers = count('freelancer')
  const agents = count('agent')
  const clients = count('client')
  return [
    freelancers ? `${freelancers} ${words.freelancer[freelancers === 1 ? 0 : 1]}` : null,
    agents ? `${agents} ${words.agent[agents === 1 ? 0 : 1]}` : null,
    clients ? `${clients} ${words.client}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}
