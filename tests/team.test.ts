import { describe, expect, it } from 'vitest'
import { MIN_SIMILARITY, fitsWorkMode, inputHash, lexicalSimilarity, pickTeam, profileText, skillMatches } from '@/lib/matching/team'
import { brief, candidate } from './fixtures'

describe('skillMatches', () => {
  it('erkennt gleiche Stärken trotz Schreibweise und Zusatz', () => {
    expect(skillMatches('RAG', 'rag')).toBe(true)
    expect(skillMatches('ISO 27001', 'ISO 27001 Audits')).toBe(true)
    expect(skillMatches('Power BI', 'power-bi')).toBe(true)
  })
  it('verwechselt kurze oder ähnliche Wörter nicht', () => {
    expect(skillMatches('AI', 'Agentic AI Development')).toBe(false)
    expect(skillMatches('Python', 'Pydantic')).toBe(false)
    expect(skillMatches('SQL', 'PostgreSQL')).toBe(false)
  })
})

describe('pickTeam', () => {
  it('nimmt je Rolle das beste Profil, das stärkste zuerst', () => {
    const team = pickTeam(brief, [
      candidate({ id: 'ki-schwach', roleKey: 'ki', similarity: 0.3 }),
      candidate({ id: 'ki-stark', roleKey: 'ki', similarity: 0.6, skills: ['RAG'] }),
      candidate({ id: 'isms', roleKey: 'isms', similarity: 0.4, skills: ['ISO 27001 Audits'] }),
      candidate({ id: 'data', roleKey: 'data', similarity: 0.55 }),
    ])
    expect(team.map((member) => member.id)).toEqual(['ki-stark', 'isms'])
  })

  it('lässt Profile unterhalb der Mindestnähe weg', () => {
    const team = pickTeam(brief, [candidate({ id: 'fern', similarity: MIN_SIMILARITY - 0.01 })])
    expect(team).toEqual([])
  })

  it('füllt fehlende Rollen mit den besten übrigen Profilen auf', () => {
    const team = pickTeam({ ...brief, teamSize: 3 }, [
      candidate({ id: 'a', similarity: 0.5 }),
      candidate({ id: 'b', similarity: 0.4 }),
      candidate({ id: 'c', similarity: 0.3 }),
      candidate({ id: 'd', similarity: 0.2 }),
    ])
    expect(team.map((member) => member.id)).toEqual(['a', 'b', 'c'])
  })

  it('wertet Profile über dem gewünschten Tagessatz ab', () => {
    const team = pickTeam({ ...brief, roles: ['ki'], teamSize: 1, maxDayRateEur: 700 }, [
      candidate({ id: 'teuer', roleKey: 'ki', similarity: 0.5, dayRate: 1200 }),
      candidate({ id: 'passend', roleKey: 'ki', similarity: 0.45, dayRate: 650 }),
    ])
    expect(team[0].id).toBe('passend')
  })
})

describe('Fingerabdruck', () => {
  it('enthält keine Namen und ändert den Hash mit dem Inhalt', () => {
    const text = profileText({ roleTitle: 'AI Engineer', headline: null, skills: ['RAG'], about: 'Baut Agenten.' })
    expect(text).toBe('AI Engineer\nSkills: RAG\nBaut Agenten.')
    expect(inputHash(text, 'm')).toMatch(/^[0-9a-f]{64}$/)
    expect(inputHash(text, 'm')).not.toBe(inputHash(`${text}!`, 'm'))
    expect(inputHash(text, 'm')).not.toBe(inputHash(text, 'anderes-modell'))
  })
})

describe('Vergleich ohne Fingerabdruck', () => {
  it('zählt gesuchte Stärken und die passende Rolle', () => {
    expect(lexicalSimilarity(brief, { roleKey: 'ki', skills: ['RAG', 'ISO 27001 Audits'] })).toBeCloseTo(0.9)
    expect(lexicalSimilarity(brief, { roleKey: null, skills: ['RAG'] })).toBeCloseTo(0.3)
    expect(lexicalSimilarity(brief, { roleKey: 'design', skills: ['Figma'] })).toBe(0)
  })
  it('hält sich an den gewünschten Arbeitsort', () => {
    expect(fitsWorkMode('onsite', 'remote')).toBe(false)
    expect(fitsWorkMode('onsite', 'both')).toBe(true)
    expect(fitsWorkMode('remote', 'remote')).toBe(true)
    expect(fitsWorkMode('unknown', 'onsite')).toBe(true)
  })
})
