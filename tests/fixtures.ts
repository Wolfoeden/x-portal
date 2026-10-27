import type { Brief } from '@/lib/ai/brief'
import type { Candidate } from '@/lib/matching/team'

export const brief: Brief = {
  title: 'KI-Chatbot für den Kundenservice',
  summary: 'Chatbot auf eigenen Dokumenten.',
  roles: ['ki', 'isms'],
  teamSize: 2,
  requiredSkills: ['RAG', 'ISO 27001'],
  optionalSkills: [],
  workMode: 'remote',
  location: null,
  start: null,
  durationDays: null,
  budgetEur: null,
  maxDayRateEur: null,
  deliverables: ['Datenquellen angebunden'],
}

export function candidate(overrides: Partial<Candidate>): Candidate {
  return {
    id: 'x',
    similarity: 0.5,
    firstName: 'Vorname',
    showcase: false,
    roleTitle: 'Rolle',
    roleKey: null,
    skills: [],
    availability: 'now',
    workMode: 'remote',
    dayRate: 800,
    ...overrides,
  }
}
