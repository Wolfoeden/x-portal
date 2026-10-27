import type { Brief } from '@/lib/ai/brief'
import { AGENT_IDS, type AgentId } from '@/lib/agents'
import type { RoleId } from '@/lib/freelancer/profile'
import { coveredSkill, skillMatches, type Candidate } from '@/lib/matching/team'

// Wofür ein KI-Agent im Live-Ergebnis einspringt: Stärken und Rollen, die kein Profil im Team abdeckt.

export const MAX_TEAM = 4

// Wörter, wie sie im Brief stehen: ganze Wörter zählen („Vektor-Datenbanken“ passt auf „Vektor Datenbanken“, nicht auf „Datenbank“).
const COVERAGE: Record<AgentId, { roles: RoleId[]; skills: string[] }> = {
  nis2: {
    roles: ['isms'],
    skills: ['NIS2', 'ISO 27001', 'ISMS', 'Informationssicherheit', 'Information security', 'Lückenanalyse', 'Gap-Analyse', 'Gap analysis', 'Risikoanalyse', 'Risk assessment'],
  },
  docs: {
    roles: ['ki'],
    skills: [
      'RAG', 'Chatbot', 'Wissensdatenbank', 'Knowledge base', 'Dokumentensuche', 'Document search', 'Dokumenten-Ingestion', 'Document ingestion',
      'Vektor-Datenbank', 'Vektor-Datenbanken', 'Vektordatenbank', 'Vektordatenbanken', 'Vector database', 'Vector databases', 'Embeddings', 'Semantische Suche', 'Semantic search',
    ],
  },
  receipts: {
    roles: ['auto'],
    skills: ['OCR', 'Belege', 'Belegerkennung', 'Belegerfassung', 'Receipts', 'Rechnungen', 'Rechnungsverarbeitung', 'Invoices', 'Invoice processing', 'Angebote', 'Quotes'],
  },
  insights: {
    roles: ['data'],
    skills: ['Reporting', 'Berichte', 'Reports', 'Churn', 'Abwanderung', 'Kündigungsprognose', 'Churn prediction', 'Datenanalyse', 'Data analysis', 'Dashboards', 'BI'],
  },
}

export type AgentPick = { id: AgentId; needs: string[]; role: RoleId | null; reviewer: Candidate }

/**
 * Erst offene Pflicht-Stärken, dann fehlende Rollen; das Team hat höchstens vier Plätze. Wer nichts Gefordertes abdeckt
 * und dessen Rolle schon jemand anderes im Team hat, macht einem Agenten Platz, der eine offene Stärke abdeckt.
 * Ein Mensch aus dem Team prüft jedes Ergebnis.
 */
export function planAgents(brief: Brief, ranked: Candidate[]): { team: Candidate[]; agents: AgentPick[] } {
  if (!ranked.length) return { team: ranked, agents: [] }
  const covers = (candidate: Candidate) => brief.requiredSkills.some((need) => coveredSkill(need, candidate))
  const openNeeds = brief.requiredSkills.filter((need) => !ranked.some((candidate) => coveredSkill(need, candidate)))
  const openRoles = brief.roles.filter((role) => !ranked.some((candidate) => candidate.roleKey === role))
  const fitting = AGENT_IDS.map((id) => {
    const coverage = COVERAGE[id]
    return {
      id,
      roles: coverage.roles,
      needs: openNeeds.filter((need) => coverage.skills.some((skill) => skillMatches(need, skill))),
      role: openRoles.find((item) => coverage.roles.includes(item)) ?? null,
    }
  })
    .filter((pick) => pick.needs.length || pick.role)
    .sort((left, right) => right.needs.length - left.needs.length)

  // Ersetzt werden zuerst die am schwächsten Passenden (das Team ist nach Punkten sortiert); jede Rolle behält einen Menschen.
  const displaced = new Set<Candidate>()
  let missing = fitting.filter((pick) => pick.needs.length).length - (MAX_TEAM - ranked.length)
  for (const candidate of [...ranked].reverse()) {
    if (missing <= 0) break
    const roleStays = ranked.some((other) => other !== candidate && !displaced.has(other) && other.roleKey === candidate.roleKey)
    if (!covers(candidate) && roleStays) {
      displaced.add(candidate)
      missing -= 1
    }
  }
  const team = ranked.filter((candidate) => !displaced.has(candidate))

  const agents = fitting.slice(0, Math.max(0, MAX_TEAM - team.length)).map(({ roles, ...pick }) => ({
    ...pick,
    reviewer: team.find((candidate) => candidate.roleKey !== null && roles.includes(candidate.roleKey)) ?? team[0],
  }))
  return { team, agents }
}
