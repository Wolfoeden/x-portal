import type { TeamMember } from '@/lib/demo/scenarios'

// KI-Agenten von XPORTAL. Jeder nennt, wer sein Ergebnis prüft. Namen und Beschreibungen stehen je Sprache in lib/i18n.

export const AGENT_IDS = ['nis2', 'docs', 'receipts', 'insights'] as const
export type AgentId = (typeof AGENT_IDS)[number]

export type AgentText = { name: string; does: string }

export type AgentWords = {
  role: string
  reviewer: string
  covers: string
  items: Record<AgentId, AgentText>
}

/** `reviewer`: id des Teammitglieds, das das Ergebnis prüft. */
export function agentMember(id: AgentId, words: AgentWords, { why, reviewer }: { why: string[]; reviewer: string }): TeamMember {
  return {
    id: `agent-${id}`,
    kind: 'agent',
    why,
    from: words.role,
    role: words.role,
    reviewer,
    talent: { id: `agent-${id}`, name: words.items[id].name, initials: '', tone: 'slate', onSite: false, kind: 'agent' },
  }
}

export function agentIdOf(member: TeamMember): AgentId | null {
  const id = member.id.slice('agent-'.length)
  return member.id.startsWith('agent-') && (AGENT_IDS as readonly string[]).includes(id) ? (id as AgentId) : null
}
