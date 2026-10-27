import type { Brief } from '@/lib/ai/brief'
import { agentMember } from '@/lib/agents'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { euro, fill } from '@/lib/i18n/format'
import type { Locale } from '@/lib/i18n/routes'
import type { Costs, Requirement, Scenario, TeamMember } from '@/lib/demo/scenarios'
import { initialsOf } from '@/lib/freelancer/profile'
import { planAgents } from '@/lib/matching/agents'
import { coveredSkill, type Candidate } from '@/lib/matching/team'
import { formatCosts } from '@/lib/story/choices'

// Echte Treffer in der Form der Beispielszenarien, damit alle Kapitel sie unverändert zeigen.
// Ohne Einwilligung „showcase“ steht statt des Vornamens die Berufsbezeichnung; Kontaktdaten gibt es hier nie.
// Was kein Profil abdeckt, übernimmt ein passender KI-Agent; ein Mensch aus dem Team prüft sein Ergebnis.

type Input = { text: string; brief: Brief; team: Candidate[]; dict: Dictionary; locale: Locale; stamp: string }

// Ein gekürzter Titel endet nicht auf „für“, „and“ oder „&“.
const DANGLING = new Set(['für', 'fuer', 'und', 'mit', 'im', 'in', 'bei', 'von', 'der', 'die', 'das', 'for', 'and', 'with', 'of', 'the', 'at', 'to', '&', '+', '-', '/'])

/** „AI Engineer: RAG und Agenten“ → „AI Engineer“; ganze Wörter bis 32 Zeichen, mindestens das erste. */
export function shortTitle(title: string | null) {
  const words = title?.split(/[:|–—(]/)[0]?.trim().split(/\s+/).filter(Boolean) ?? []
  if (!words.length) return null
  const short = [words[0].slice(0, 40)]
  for (const word of words.slice(1)) {
    if (short.join(' ').length + 1 + word.length > 32) break
    short.push(word)
  }
  while (short.length > 1 && DANGLING.has(short[short.length - 1].toLowerCase())) short.pop()
  return short.join(' ')
}

export function toLiveScenario({ text, brief, team: ranked, dict, locale, stamp }: Input): Scenario {
  const live = dict.live
  const { team, agents: picks } = planAgents(brief, ranked)
  const roleOf = (candidate: Candidate) => dict.freelancer.roles.find((role) => role.id === candidate.roleKey)
  const nameOf = (candidate: Candidate) => (candidate.showcase ? candidate.firstName : (shortTitle(candidate.roleTitle) ?? roleOf(candidate)?.label ?? live.profile))
  const roleLine = (candidate: Candidate) => {
    const title = shortTitle(candidate.roleTitle)
    if (candidate.showcase) return title ?? roleOf(candidate)?.label ?? live.profile
    return title ? (roleOf(candidate)?.label ?? live.freelancer) : live.freelancer
  }

  const people: TeamMember[] = team.map((candidate) => {
    const matched = brief.requiredSkills.map((need) => coveredSkill(need, candidate)).filter((skill): skill is string => Boolean(skill))
    const why = (matched.length ? matched : candidate.skills).slice(0, 2)
    return {
      id: candidate.id,
      kind: 'freelancer',
      why,
      from: live.availability[candidate.availability ?? 'open'],
      role: roleLine(candidate),
      rate: candidate.dayRate ?? undefined,
      skills: candidate.skills,
      talent: {
        id: candidate.id,
        name: nameOf(candidate),
        initials: initialsOf(nameOf(candidate)) || '·',
        tone: roleOf(candidate)?.tone ?? 'stone',
        onSite: candidate.workMode !== null && candidate.workMode !== 'remote',
        kind: 'freelancer',
        ...(candidate.showcase && candidate.photo ? { photo: candidate.photo } : {}),
      },
    }
  })

  const agents = picks.map((pick) =>
    agentMember(pick.id, dict.agents, {
      why: pick.needs.length ? pick.needs.slice(0, 2) : [dict.freelancer.roles.find((role) => role.id === pick.role)?.label ?? dict.agents.role],
      reviewer: pick.reviewer.id,
    }),
  )
  const agentFor = (matches: (pick: (typeof picks)[number]) => boolean) => {
    const index = picks.findIndex(matches)
    return index < 0 ? null : { member: agents[index], text: fill(dict.agents.covers, { agent: dict.agents.items[picks[index].id].name, name: nameOf(picks[index].reviewer) }) }
  }

  const requirements: Requirement[] = brief.requiredSkills.slice(0, 5).map((need) => {
    const holder = team.find((candidate) => coveredSkill(need, candidate))
    if (holder) return { label: need, met: true, by: `${nameOf(holder)}, ${coveredSkill(need, holder)}`, who: holder.id }
    const agent = agentFor((pick) => pick.needs.includes(need))
    return agent ? { label: need, met: true, by: agent.text, who: agent.member.id } : { label: need, met: false, by: live.open }
  })
  if (brief.workMode === 'onsite') {
    const onSite = team.filter((candidate) => candidate.workMode === 'onsite' || candidate.workMode === 'both')
    requirements.push({ label: live.onSite, met: onSite.length > 0, by: onSite.length ? onSite.map(nameOf).join(', ') : live.open, who: onSite[0]?.id })
  }
  if (!requirements.length) {
    for (const role of brief.roles) {
      const holder = team.find((candidate) => candidate.roleKey === role)
      const label = dict.freelancer.roles.find((item) => item.id === role)?.label ?? role
      const agent = holder ? null : agentFor((pick) => pick.role === role)
      requirements.push(
        holder
          ? { label, met: true, by: nameOf(holder), who: holder.id }
          : agent
            ? { label, met: true, by: agent.text, who: agent.member.id }
            : { label, met: false, by: live.open },
      )
    }
  }

  const lead = team[0]
  const teamRate = team.reduce((sum, candidate) => sum + (candidate.dayRate ?? 0), 0)
  const costs: Costs | undefined = brief.budgetEur
    ? undefined
    : brief.durationDays && teamRate
      ? { value: Math.round((teamRate * brief.durationDays) / 100) * 100, kind: 'estimate' }
      : teamRate
        ? { value: teamRate, kind: 'perDay' }
        : undefined

  return {
    id: `live-${stamp}`,
    source: 'live',
    chip: '',
    sentence: text,
    title: brief.title,
    keywords: [],
    team: [...people, ...agents],
    rate: lead?.dayRate ? fill(live.rate, { amount: euro(lead.dayRate, locale) }) : live.availability.open,
    requirements,
    deliveries: brief.deliverables,
    budget: brief.budgetEur ? euro(brief.budgetEur, locale) : costs ? formatCosts(costs, dict, locale) : live.availability.open,
    costs,
    ai: brief.roles.includes('ki'),
  }
}
