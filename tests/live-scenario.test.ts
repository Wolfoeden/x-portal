import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/lib/i18n/dictionary'
import { shortTitle, toLiveScenario } from '@/lib/matching/live-scenario'
import { brief, candidate } from './fixtures'

const team = [
  candidate({ id: 'a', firstName: 'Vincent', showcase: true, roleKey: 'ki', roleTitle: 'AI Engineer', skills: ['Python', 'RAG'], dayRate: 760 }),
  candidate({ id: 'b', firstName: 'Marc', showcase: false, roleKey: 'isms', roleTitle: 'Auditor', skills: ['ISO 27001 Audits'], dayRate: 980, availability: null }),
]

describe('toLiveScenario', () => {
  const scenario = toLiveScenario({ text: 'Wir brauchen einen Chatbot.', brief, team, dict: getDictionary('de'), locale: 'de', stamp: 't' })

  it('zeigt den Vornamen nur mit Einwilligung, sonst die Berufsbezeichnung', () => {
    expect(scenario.team.map((member) => member.talent?.name)).toEqual(['Vincent', 'Auditor'])
    expect(scenario.team.map((member) => member.role)).toEqual(['AI Engineer', 'ISMS-Beratung'])
    expect(JSON.stringify(scenario)).not.toContain('Marc')
  })

  it('begründet mit den passenden Stärken und markiert Offenes', () => {
    expect(scenario.team[0].why).toEqual(['RAG'])
    expect(scenario.requirements).toEqual([
      { label: 'RAG', met: true, by: 'Vincent, RAG', who: 'a' },
      { label: 'ISO 27001', met: true, by: 'Auditor, ISO 27001 Audits', who: 'b' },
    ])
    expect(scenario.team[1].from).toBe('nach Absprache')
  })

  it('nennt Tagessatz und Teamkosten in der Sprache der Seite', () => {
    expect(scenario.source).toBe('live')
    expect(scenario.ai).toBe(true)
    // Intl trennt Betrag und € mit einem geschützten Leerzeichen.
    expect(scenario.rate).toBe('760 € / Tag')
    expect(scenario.budget).toBe('1.740 € / Tag fürs Team')
    expect(scenario.costs).toEqual({ value: 1_740, kind: 'perDay' })
    const english = toLiveScenario({ text: 'x', brief: { ...brief, durationDays: 20 }, team, dict: getDictionary('en'), locale: 'en', stamp: 't' })
    expect(english.rate).toBe('€760/day')
    expect(english.budget).toBe('approx. €34,800')
  })

  it('lässt ein Budget des Auftraggebers stehen', () => {
    const own = toLiveScenario({ text: 'x', brief: { ...brief, budgetEur: 12_000 }, team, dict: getDictionary('de'), locale: 'de', stamp: 't' })
    expect(own.budget).toBe('12.000 €')
    expect(own.costs).toBeUndefined()
  })
})

describe('KI-Agenten im Live-Ergebnis', () => {
  const dict = getDictionary('de')
  const onlyEngineer = [team[0]]
  const nis2Brief = { ...brief, requiredSkills: ['RAG', 'NIS2'] }

  it('springen ein, wo kein Profil die Stärke oder Rolle abdeckt, und nennen, wer prüft', () => {
    const scenario = toLiveScenario({ text: 'x', brief: nis2Brief, team: onlyEngineer, dict, locale: 'de', stamp: 't' })
    expect(scenario.team.map((member) => [member.talent?.name, member.kind])).toEqual([
      ['Vincent', 'freelancer'],
      ['NIS2-Pre-Assessment', 'agent'],
    ])
    expect(scenario.team[1]).toMatchObject({ from: 'KI-Agent', role: 'KI-Agent', reviewer: 'a', why: ['NIS2'] })
    expect(scenario.requirements[1]).toEqual({ label: 'NIS2', met: true, by: 'NIS2-Pre-Assessment, Ergebnis prüft Vincent', who: 'agent-nis2' })
  })

  it('füllen das Team höchstens auf vier auf', () => {
    const four = [0, 1, 2, 3].map((index) => candidate({ id: `c${index}`, roleKey: 'ki', skills: ['RAG'] }))
    const scenario = toLiveScenario({ text: 'x', brief: nis2Brief, team: four, dict, locale: 'de', stamp: 't' })
    expect(scenario.team).toHaveLength(4)
    expect(scenario.requirements[1]).toEqual({ label: 'NIS2', met: false, by: 'noch offen, im Gespräch klären' })
  })

  it('nehmen den Platz von Profilen ein, die nichts Gefordertes abdecken und deren Rolle schon besetzt ist', () => {
    const ocrBrief = { ...brief, roles: ['ki' as const], requiredSkills: ['RAG', 'OCR'] }
    const ranked = [
      candidate({ id: 'r1', roleKey: 'ki', roleTitle: 'AI Engineer', skills: ['RAG'] }),
      candidate({ id: 'r2', roleKey: 'ki', roleTitle: 'KI-Entwickler', skills: ['RAG'] }),
      candidate({ id: 'f1', roleKey: 'ki', roleTitle: 'Fullstack', skills: ['React'] }),
      candidate({ id: 'f2', roleKey: 'ki', roleTitle: 'Consultant', skills: ['Strategie'] }),
    ]
    const scenario = toLiveScenario({ text: 'x', brief: ocrBrief, team: ranked, dict, locale: 'de', stamp: 't' })
    expect(scenario.team.map((member) => member.id)).toEqual(['r1', 'r2', 'f1', 'agent-receipts'])
    expect(scenario.requirements[1]).toEqual({ label: 'OCR', met: true, by: 'Beleg-Agent, Ergebnis prüft AI Engineer', who: 'agent-receipts' })
    // Die Kosten zählen nur die Menschen, die bleiben.
    expect(scenario.costs).toEqual({ value: 2_400, kind: 'perDay' })
  })

  it('erkennen Stärken so, wie sie im Brief stehen', () => {
    const ragBrief = { ...brief, roles: ['ki' as const], requiredSkills: ['RAG', 'Vektor-Datenbanken', 'Dokumenten-Ingestion (PDF/HTML)'] }
    const scenario = toLiveScenario({ text: 'x', brief: ragBrief, team: [team[0]], dict, locale: 'de', stamp: 't' })
    expect(scenario.team.map((member) => member.id)).toEqual(['a', 'agent-docs'])
    expect(scenario.team[1].why).toEqual(['Vektor-Datenbanken', 'Dokumenten-Ingestion (PDF/HTML)'])
  })

  it('lassen jeder Rolle einen Menschen', () => {
    const ranked = [
      candidate({ id: 'a', roleKey: 'ki' }),
      candidate({ id: 'b', roleKey: 'design' }),
      candidate({ id: 'c', roleKey: 'design' }),
      candidate({ id: 'd', roleKey: 'pm' }),
    ]
    const scenario = toLiveScenario({ text: 'x', brief: { ...brief, roles: ['ki'], requiredSkills: ['OCR', 'NIS2'] }, team: ranked, dict, locale: 'de', stamp: 't' })
    // Nur „c“ geht: Design bleibt mit „b“ besetzt, KI und Projektleitung haben niemand anderen.
    expect(scenario.team.map((member) => member.id)).toEqual(['a', 'b', 'd', 'agent-nis2'])
  })

  it('kommen nicht, wenn das Team alles abdeckt', () => {
    const scenario = toLiveScenario({ text: 'x', brief, team, dict, locale: 'de', stamp: 't' })
    expect(scenario.team.some((member) => member.kind === 'agent')).toBe(false)
  })
})

describe('shortTitle', () => {
  it('kürzt Berufsbezeichnungen für die Karte', () => {
    expect(shortTitle('AI Engineer: RAG und Agenten')).toBe('AI Engineer')
    expect(shortTitle('Senior Data Scientist (Churn, Forecasting)')).toBe('Senior Data Scientist')
    expect(shortTitle('Informationssicherheitsbeauftragter und Auditor für ISO 27001')).toBe('Informationssicherheitsbeauftragter')
    expect(shortTitle('GenAI Fullstack Developer for Enterprise Search')).toBe('GenAI Fullstack Developer')
    expect(shortTitle('KI Consultant & Project Manager')).toBe('KI Consultant & Project Manager')
    expect(shortTitle('Berater für')).toBe('Berater')
    expect(shortTitle('  ')).toBeNull()
    expect(shortTitle(null)).toBeNull()
  })
})
