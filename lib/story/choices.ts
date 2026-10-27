import { agentIdOf } from '@/lib/agents'
import { kindOf, reviewerOf, talentOf, type Costs, type Requirement, type Scenario, type TeamMember } from '@/lib/demo/scenarios'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { euro, fill } from '@/lib/i18n/format'
import type { Locale } from '@/lib/i18n/routes'

// Was der Auftraggeber am Team festlegt: welche Stellen sein eigenes Team besetzt und welches KI-Modell läuft.
// Alle Kapitel zeigen dasselbe Ergebnis, weil sie es aus dieser einen Funktion bekommen.

/** `ours`: Server von XPORTAL, `own`: Server des Auftraggebers. */
export const MODELS = ['claude', 'openai', 'ours', 'own'] as const
export type ModelChoice = (typeof MODELS)[number]
export type Choices = { internal: string[]; model: ModelChoice | null }
export const NO_CHOICES: Choices = { internal: [], model: null }

/** Stärken, mit denen jemand ein offenes Modell auf eigener Hardware betreibt. */
const ON_PREMISE = /on-?prem|self-?host|eigene[nrm]? (hardware|server)|offene[nr]? (ki-)?modell|open[- ](weight|source) (llm|model)|ollama|vllm|llama\.cpp|lokale[nr]? (ki|llm|modell)|local (llm|model)/i

export function formatCosts(costs: Costs, dict: Dictionary, locale: Locale) {
  const amount = euro(costs.value, locale)
  if (costs.kind === 'estimate') return fill(dict.live.estimate, { amount })
  if (costs.kind === 'perDay') return fill(dict.live.perDay, { amount })
  return amount
}

function asClient(member: TeamMember, dict: Dictionary): TeamMember {
  const talent = talentOf(member)
  return { ...member, kind: 'client', from: dict.choices.internalBadge, talent: { ...talent, name: dict.choices.yourTeam, initials: '', kind: 'client' } }
}

function modelRequirement(team: TeamMember[], model: ModelChoice | null, dict: Dictionary): Requirement {
  const words = dict.choices.model
  if (!model) return { label: words.label, met: false, by: words.open }
  if (model === 'own') {
    for (const member of team) {
      if (kindOf(member) === 'agent') continue
      const skill = (member.skills ?? member.why).find((item) => ON_PREMISE.test(item))
      if (skill) return { label: words.own, met: true, by: `${talentOf(member).name}, ${skill}` }
    }
    return { label: words.own, met: false, by: words.ownOpen }
  }
  if (model === 'ours') return { label: words.ours, met: true, by: words.oursBy }
  const lead = team.find((member) => kindOf(member) !== 'agent')
  return { label: fill(words.cloud, { model: words.options[model].full }), met: true, by: fill(words.cloudBy, { name: lead ? talentOf(lead).name : 'XPORTAL' }) }
}

/** Kosten ohne die Stellen Ihres Teams, anteilig nach Tagessatz. Ein Budget des Auftraggebers bleibt, wie es ist. */
function budgetWithout(scenario: Scenario, internal: Set<string>, dict: Dictionary, locale: Locale) {
  if (!scenario.costs || !internal.size) return scenario.budget
  const rated = scenario.team.filter((member) => member.rate)
  const total = rated.reduce((sum, member) => sum + (member.rate ?? 0), 0)
  const external = rated.filter((member) => !internal.has(member.id)).reduce((sum, member) => sum + (member.rate ?? 0), 0)
  if (!total || external === total) return scenario.budget
  const step = scenario.costs.kind === 'perDay' ? 10 : 100
  return formatCosts({ ...scenario.costs, value: Math.round((scenario.costs.value * external) / total / step) * step }, dict, locale)
}

export function applyChoices(scenario: Scenario, choices: Choices, dict: Dictionary, locale: Locale): Scenario {
  const internal = new Set(choices.internal.filter((id) => scenario.team.some((member) => member.id === id)))
  const team = scenario.team.map((member) => (internal.has(member.id) ? asClient(member, dict) : member))
  const byId = new Map(team.map((member) => [member.id, member]))

  const requirements = scenario.requirements.map((item): Requirement => {
    const holder = item.who ? byId.get(item.who) : undefined
    if (!holder) return item
    if (kindOf(holder) === 'client') return { ...item, met: true, by: dict.choices.covered }
    const agent = kindOf(holder) === 'agent' ? agentIdOf(holder) : null
    // Die Zeile nennt den Agenten und wer sein Ergebnis prüft, auch wenn das inzwischen Ihr Team ist.
    if (agent) return { ...item, met: true, by: fill(dict.agents.covers, { agent: dict.agents.items[agent].name, name: reviewerOf(holder, team, dict.choices.ownTeam) }) }
    return item
  })
  if (scenario.ai) requirements.splice(Math.min(1, requirements.length), 0, modelRequirement(team, choices.model, dict))

  // Übernimmt Ihr Team die führende Person, nennt die Karte den Tagessatz der nächsten.
  const lead = team.find((member) => kindOf(member) === 'freelancer')
  const baseLead = scenario.team.find((member) => kindOf(member) === 'freelancer')
  const rate =
    lead?.id === baseLead?.id ? scenario.rate : lead?.rate ? fill(dict.live.rate, { amount: euro(lead.rate, locale) }) : dict.live.availability.open

  return { ...scenario, team, requirements, rate, budget: budgetWithout(scenario, internal, dict, locale) }
}
