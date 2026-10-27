import { describe, expect, it } from 'vitest'
import { kindOf, teamMix, type Scenario } from '@/lib/demo/scenarios'
import { getDictionary } from '@/lib/i18n/dictionary'
import { NO_CHOICES, applyChoices, type Choices } from '@/lib/story/choices'

const de = getDictionary('de')
const en = getDictionary('en')
const scenario = (id: Scenario['id'], dict = de) => dict.scenarios.find((item) => item.id === id)!
const apply = (id: Scenario['id'], choices: Partial<Choices>, dict = de) =>
  applyChoices(scenario(id, dict), { ...NO_CHOICES, ...choices }, dict, dict === de ? 'de' : 'en')

describe('Beispielszenarien', () => {
  it('verweisen nur auf Mitglieder des eigenen Teams und haben einen Agenten mit prüfendem Menschen', () => {
    for (const dict of [de, en]) {
      for (const item of dict.scenarios) {
        const ids = item.team.map((member) => member.id)
        for (const requirement of item.requirements) if (requirement.who) expect(ids).toContain(requirement.who)
        const agents = item.team.filter((member) => kindOf(member) === 'agent')
        expect(agents.length).toBe(1)
        for (const agent of agents) {
          expect(agent.from).toBe(dict.agents.role)
          expect(ids).toContain(agent.reviewer)
        }
      }
    }
  })

  it('sind auf Deutsch und Englisch gleich aufgebaut', () => {
    const shape = (dict: typeof de) =>
      dict.scenarios.map((item) => ({ id: item.id, ai: item.ai, costs: item.costs, team: item.team.map((member) => [member.id, member.rate ?? null, member.reviewer ?? null]), who: item.requirements.map((r) => r.who ?? null) }))
    expect(shape(en)).toEqual(shape(de))
  })
})

describe('teamMix', () => {
  it('zählt Freelancer, Agenten und Ihr Team', () => {
    expect(teamMix(scenario('chatbot').team, de.common.mix)).toBe('3 Freelancer · 1 KI-Agent')
    expect(teamMix(apply('chatbot', { internal: ['mara'] }).team, de.common.mix)).toBe('2 Freelancer · 1 KI-Agent · 1 aus Ihrem Team')
    expect(teamMix(apply('chatbot', { internal: ['noah'] }, en).team, en.common.mix)).toBe('2 freelancers · 1 AI agent · 1 from your team')
  })
})

describe('applyChoices', () => {
  it('fragt bei KI-Projekten nach dem Modell und lässt es bis zur Wahl offen', () => {
    const chatbot = apply('chatbot', {})
    expect(chatbot.requirements).toHaveLength(5)
    expect(chatbot.requirements[1]).toEqual({ label: 'KI-Modell', met: false, by: 'Ihre Wahl: Claude, OpenAI, unsere oder Ihre Server' })
    expect(apply('isms', {}).requirements.some((item) => item.label.startsWith('KI-Modell'))).toBe(false)
  })

  it('nennt das gewählte Cloud-Modell und wer es anbindet', () => {
    expect(apply('chatbot', { model: 'claude' }).requirements[1]).toEqual({ label: 'KI-Modell: Claude (Anthropic)', met: true, by: 'Mara, Anbindung per API' })
    expect(apply('chatbot', { model: 'openai' }, en).requirements[1]).toEqual({ label: 'AI model: OpenAI', met: true, by: 'Mara, connected via API' })
  })

  it('betreibt das Modell auf Wunsch auf den Servern von XPORTAL', () => {
    expect(apply('automation', { model: 'ours' }).requirements[1]).toEqual({ label: 'KI-Modell auf unseren Servern', met: true, by: 'XPORTAL, im eigenen Betrieb' })
    expect(apply('chatbot', { model: 'ours' }, en).requirements[1]).toEqual({ label: 'AI model on our servers', met: true, by: 'XPORTAL, run in-house' })
  })

  it('braucht für eigene Server jemanden, der offene Modelle auf eigener Hardware betreibt', () => {
    expect(apply('chatbot', { model: 'own' }).requirements[1]).toEqual({ label: 'KI-Modell auf Ihren Servern', met: true, by: 'Lena, Offene Modelle on-premise' })
    expect(apply('chatbot', { model: 'own', internal: ['lena'] }).requirements[1]).toMatchObject({ met: true, by: 'Ihr Team, Offene Modelle on-premise' })
    expect(apply('automation', { model: 'own' }).requirements[1]).toEqual({
      label: 'KI-Modell auf Ihren Servern',
      met: false,
      by: 'Betrieb auf eigener Hardware: im Gespräch klären',
    })
  })

  it('macht aus einer Stelle „Ihr Team“, deckt ihre Anforderungen ab und rechnet die Kosten ohne sie', () => {
    const chatbot = apply('chatbot', { internal: ['mara'] })
    expect(chatbot.team[0]).toMatchObject({ kind: 'client', talent: { name: 'Ihr Team', kind: 'client' } })
    expect(chatbot.requirements[0]).toMatchObject({ met: true, by: 'deckt Ihr Team ab' })
    // Der Agent bleibt; sein Ergebnis prüft jetzt Ihr Team.
    expect(chatbot.requirements[3]).toEqual({ label: 'Antworten mit Quellenangabe', met: true, by: 'Dokumenten-Assistent, Ergebnis prüft Ihr Team', who: 'agent-docs' })
    expect(apply('chatbot', { internal: ['mara'] }, en).requirements[3].by).toBe('Document assistant, reviewed by your team')
    // Die Karte nennt den Tagessatz der nächsten Person.
    expect(chatbot.rate).toBe('920 € / Tag')
    // 11.500 € × (920 + 780) / (980 + 920 + 780), auf 100 € gerundet.
    expect(chatbot.budget).toBe('7.300 €')
  })

  it('kann rückgängig gemacht werden und ändert die Vorlage nicht', () => {
    const base = scenario('chatbot')
    const before = JSON.stringify(base)
    apply('chatbot', { internal: ['mara', 'noah'], model: 'own' })
    expect(JSON.stringify(base)).toBe(before)
    const plain = apply('chatbot', {})
    expect(plain.budget).toBe(base.budget)
    expect(plain.rate).toBe(base.rate)
    expect(plain.team).toEqual(base.team)
  })

  it('übernimmt ein Agent-Platz durch Ihr Team als abgedeckt', () => {
    const isms = apply('isms', { internal: ['agent-nis2'] })
    expect(isms.requirements[1]).toMatchObject({ met: true, by: 'deckt Ihr Team ab' })
    // Agenten haben keinen Tagessatz: Die Kosten bleiben.
    expect(isms.budget).toBe(scenario('isms').budget)
  })
})
