'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useDraft } from '@/components/freelancer/draft-context'
import { MatchTeaser, ProfileCard } from '@/components/freelancer/profile-card'
import { TALENTS } from '@/lib/demo/scenarios'
import { toneClass } from '@/components/story/talent-avatar'
import { EMPTY_DRAFT, RATE, completeness, findRole, type Draft } from '@/lib/freelancer/profile'
import { useLocale } from '@/components/i18n/locale-provider'
import { euro, fill } from '@/lib/i18n/format'
import { pagePath } from '@/lib/i18n/routes'
import { profileFromDraft } from '@/lib/profile/schema'
import { keepPendingProfile } from '@/lib/profile/pending'

// Sechs Fragen; die Texte stehen im Wörterbuch.
const STEP_COUNT = 6
const DONE: number = STEP_COUNT

// Profile im Hintergrund: Ihr Profil kommt in denselben Pool wie die Startseite.
const POOL = [
  { id: 'mara', x: 8, y: 10, size: 40 },
  { id: 'eva', x: 86, y: 6, size: 34 },
  { id: 'malik', x: 99, y: 30, size: 44 },
  { id: 'yara', x: 3, y: 50, size: 32 },
  { id: 'paul', x: 12, y: 92, size: 38 },
  { id: 'ines', x: 80, y: 95, size: 34 },
  { id: 'tobias', x: 52, y: 1, size: 30 },
]

function stepValid(step: number, draft: Draft) {
  if (step === 0) return draft.name.trim().length >= 2
  if (step === 1) return Boolean(draft.role)
  if (step === 2) return draft.skills.length > 0
  if (step === 4) return Boolean(draft.availability)
  if (step === 5) return Boolean(draft.mode)
  return true
}

function Chip({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-[15px] transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        selected ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink hover:border-ink/40'
      } ${className}`}
    >
      {selected ? <Check aria-hidden size={14} strokeWidth={2.5} /> : null}
      {children}
    </button>
  )
}

export function Builder() {
  const reduceMotion = useReducedMotion()
  const { draft, setDraft, own, startOwn } = useDraft()
  const { locale, dict, ids } = useLocale()
  const router = useRouter()
  const copy = dict.freelancer.builder
  const { roles, availability, workModes, samples } = dict.freelancer
  const [step, setStep] = useState<number>(DONE)
  const [ownSkill, setOwnSkill] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const wizardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  // Wechselt der Schritt, während der Fokus im Assistenten ist, wandert er zum ersten Feld des neuen Schritts.
  const refocus = useRef(false)
  const keepFocus = () => {
    refocus.current = Boolean(wizardRef.current?.contains(document.activeElement))
  }
  const nameId = useId()
  const percent = completeness(draft)
  const role = findRole(roles, draft.role)
  const demo = !own && !reduceMotion

  // Demo: Beispielprofile bauen sich Schritt für Schritt auf, bis jemand selbst beginnt.
  useEffect(() => {
    if (!demo) return
    let alive = true
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const run = async () => {
      await wait(3800)
      for (let index = 1; alive; index++) {
        const sample = samples[index % samples.length]
        if (!alive) return
        setDraft(EMPTY_DRAFT)
        setStep(0)
        await wait(650)
        for (let length = 1; length <= sample.name.length; length++) {
          if (!alive) return
          setDraft((current) => ({ ...current, name: sample.name.slice(0, length) }))
          await wait(110)
        }
        await wait(500)
        if (!alive) return
        setStep(1)
        await wait(900)
        if (!alive) return
        setDraft((current) => ({ ...current, role: sample.role }))
        await wait(500)
        if (!alive) return
        setStep(2)
        for (const skill of sample.skills) {
          await wait(520)
          if (!alive) return
          setDraft((current) => ({ ...current, skills: [...current.skills, skill] }))
        }
        await wait(600)
        if (!alive) return
        setStep(3)
        await wait(500)
        const from = RATE.start
        for (let frame = 1; frame <= 14; frame++) {
          if (!alive) return
          const value = Math.round((from + ((sample.rate - from) * frame) / 14) / RATE.step) * RATE.step
          setDraft((current) => ({ ...current, rate: value }))
          await wait(45)
        }
        await wait(600)
        if (!alive) return
        setStep(4)
        await wait(850)
        if (!alive) return
        setDraft((current) => ({ ...current, availability: sample.availability }))
        await wait(500)
        if (!alive) return
        setStep(5)
        await wait(850)
        if (!alive) return
        setDraft((current) => ({ ...current, mode: sample.mode }))
        await wait(550)
        if (!alive) return
        setStep(DONE)
        await wait(4600)
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [demo, setDraft, samples])

  // Beginnt jemand selbst, auch über den Abschluss unten, startet der Assistent bei Schritt 1.
  useEffect(() => {
    if (!own) return
    setStep(0)
  }, [own])

  // Profil speichern: Der Entwurf wartet im Browser, bis das Konto bestätigt ist; das Konto legt ihn dann an.
  const save = () => {
    keepPendingProfile(profileFromDraft(draft))
    router.push(`${pagePath('signIn', locale)}?neu=1`)
  }

  const begin = () => {
    if (own) return
    refocus.current = true
    startOwn()
    if (step === 0) requestAnimationFrame(() => nameRef.current?.focus())
  }

  const next = () => {
    if (!stepValid(step, draft)) return
    keepFocus()
    setStep((value) => Math.min(DONE, value + 1))
  }

  // Bei Auswahlfragen geht es nach einem kurzen Moment von selbst weiter.
  const advanceSoon = () => {
    keepFocus()
    setTimeout(() => setStep((value) => Math.min(DONE, value + 1)), reduceMotion ? 0 : 320)
  }

  const toggleSkill = (skill: string) =>
    setDraft((current) => ({
      ...current,
      skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : current.skills.length >= 8 ? current.skills : [...current.skills, skill],
    }))

  const addOwnSkill = () => {
    const skill = ownSkill.trim().replace(/\s+/g, ' ').slice(0, 28)
    if (skill.length < 2) return
    if (!draft.skills.includes(skill)) toggleSkill(skill)
    setOwnSkill('')
  }

  const onEnter = (event: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    action()
  }

  const current = copy.steps[Math.min(step, STEP_COUNT - 1)]
  const suggestions = role ? role.skills : roles.flatMap((item) => item.skills.slice(0, 1))
  const extraSkills = draft.skills.filter((skill) => !suggestions.includes(skill))

  return (
    <MotionConfig reducedMotion="user">
      <section id={ids.profile} className="relative overflow-x-clip" aria-labelledby="profil-title">
        <Container className="grid min-h-[calc(100svh-4rem)] grid-cols-[minmax(0,1fr)] content-center gap-8 pb-16 pt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-10 lg:pb-16 lg:pt-6">
          <div className="flex flex-col">
            <h1 id="profil-title" className="text-[clamp(2.9rem,6.4vw,6rem)] font-medium leading-[0.94] tracking-[-0.045em] text-ink">
              <span className="block text-[#7c847f]">{copy.titleGray}</span>
              <span className="block">{copy.title}</span>
            </h1>

            {/* Handy: die Karte über dem Assistenten, damit man sieht, was entsteht. */}
            <div className="mt-8 lg:hidden">
              <ProfileCard draft={draft} compact />
            </div>

            <div
              ref={wizardRef}
              className="relative mt-6 w-full max-w-[600px] rounded-[26px] border border-line-strong bg-white p-5 shadow-field sm:p-6 lg:mt-10"
              onPointerDownCapture={begin}
              onFocusCapture={begin}
            >
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="text-faint">{step < DONE ? fill(copy.stepOf, { n: step + 1, total: STEP_COUNT }) : copy.done}<span className="max-sm:hidden">{step < DONE ? ` · ${current.label}` : ''}</span></span>
                {!own ? (
                  <button type="button" onClick={begin} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 font-medium text-brand-ink">
                    <span className="size-1.5 rounded-full bg-brand" />
                    <span className="max-sm:hidden">{copy.demoRunning}</span> {copy.startOwn}
                  </button>
                ) : (
                  <span className="tabular-nums text-muted">{fill(dict.common.percent, { n: percent })}</span>
                )}
              </div>
              <ol className="mt-3 flex gap-1.5" aria-hidden>
                {copy.steps.map((item, index) => (
                  <li key={item.label} className="flex-1">
                    <span className={`block h-1 rounded-full transition-colors duration-300 ${index < step || step === DONE ? 'bg-brand' : index === step ? 'bg-ink' : 'bg-surface-2'}`} />
                  </li>
                ))}
              </ol>

              <div className="mt-6 min-h-[292px] sm:min-h-[240px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    ref={contentRef}
                    onAnimationComplete={(definition) => {
                      if ((definition as { opacity?: number }).opacity !== 1 || !refocus.current) return
                      refocus.current = false
                      contentRef.current?.querySelector<HTMLElement>('input, button')?.focus()
                    }}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {step < DONE ? <p className="text-[22px] font-medium tracking-[-0.015em] text-ink md:text-[24px]">{current.question}</p> : null}

                    {step === 0 ? (
                      <div className="mt-4">
                        <label htmlFor={nameId} className="sr-only">
                          {copy.nameLabel}
                        </label>
                        <input
                          ref={nameRef}
                          id={nameId}
                          value={draft.name}
                          maxLength={40}
                          autoComplete="given-name"
                          enterKeyHint="next"
                          placeholder={copy.namePlaceholder}
                          onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))}
                          onKeyDown={(event) => onEnter(event, next)}
                          className="h-14 w-full border-b-2 border-line-strong bg-transparent text-[24px] text-ink outline-none transition-colors placeholder:text-[#b4bab6] focus:border-ink"
                        />
                        <p className="mt-3 text-[13.5px] text-muted">{copy.nameHint}</p>
                      </div>
                    ) : null}

                    {step === 1 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {roles.map((item) => (
                          <Chip
                            key={item.id}
                            selected={draft.role === item.id}
                            onClick={() => {
                              setDraft((value) => ({ ...value, role: item.id, skills: value.role === item.id ? value.skills : value.skills.filter((skill) => item.skills.includes(skill)) }))
                              advanceSoon()
                            }}
                          >
                            {item.label}
                          </Chip>
                        ))}
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                          {[...suggestions, ...extraSkills].map((skill) => (
                            <Chip key={skill} selected={draft.skills.includes(skill)} onClick={() => toggleSkill(skill)}>
                              {skill}
                            </Chip>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="sr-only" htmlFor={`${nameId}-skill`}>
                            {copy.ownSkillLabel}
                          </label>
                          <input
                            id={`${nameId}-skill`}
                            value={ownSkill}
                            maxLength={28}
                            placeholder={copy.ownSkillPlaceholder}
                            onChange={(event) => setOwnSkill(event.target.value)}
                            onKeyDown={(event) => onEnter(event, addOwnSkill)}
                            className="h-11 min-w-0 flex-1 rounded-full border border-dashed border-line-strong bg-white px-4 text-[15px] text-ink outline-none placeholder:text-faint focus:border-ink/50"
                          />
                          <button type="button" onClick={addOwnSkill} aria-label={copy.ownSkillAdd} className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-ink hover:border-ink/40">
                            <Plus aria-hidden size={18} strokeWidth={2} />
                          </button>
                        </div>
                        <p className="text-[13.5px] text-muted">{copy.skillsHint}</p>
                      </div>
                    ) : null}

                    {step === 3 ? (
                      <div className="mt-3">
                        <p className="text-[44px] font-medium leading-none tracking-[-0.03em] text-ink tabular-nums">
                          {euro(draft.rate, locale)}
                          <span className="ml-2 text-[16px] font-normal tracking-normal text-muted">{copy.perDay}</span>
                        </p>
                        <label className="sr-only" htmlFor={`${nameId}-rate`}>
                          {copy.rateLabel}
                        </label>
                        <input
                          id={`${nameId}-rate`}
                          type="range"
                          min={RATE.min}
                          max={RATE.max}
                          step={RATE.step}
                          value={draft.rate}
                          onChange={(event) => setDraft((value) => ({ ...value, rate: Number(event.target.value) }))}
                          onKeyDown={(event) => onEnter(event, next)}
                          className="mt-5 h-2 w-full cursor-pointer accent-[#17643b]"
                        />
                        <div className="mt-1 flex justify-between text-[12.5px] tabular-nums text-faint">
                          <span>{euro(RATE.min, locale)}</span>
                          <span>{euro(RATE.max, locale)}</span>
                        </div>
                        <p className="mt-3 text-[13.5px] text-muted">{copy.rateHint}</p>
                      </div>
                    ) : null}

                    {step === 4 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {availability.map((item) => (
                          <Chip
                            key={item.id}
                            selected={draft.availability === item.id}
                            onClick={() => {
                              setDraft((value) => ({ ...value, availability: item.id }))
                              advanceSoon()
                            }}
                          >
                            {item.label}
                          </Chip>
                        ))}
                      </div>
                    ) : null}

                    {step === 5 ? (
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {workModes.map((item) => {
                          const selected = draft.mode === item.id
                          return (
                            <button
                              key={item.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                setDraft((value) => ({ ...value, mode: item.id }))
                                advanceSoon()
                              }}
                              className={`flex flex-col items-start rounded-2xl px-4 py-3 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                                selected ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink hover:border-ink/40'
                              }`}
                            >
                              <span className="text-[15px] font-medium">{item.label}</span>
                              <span className={`text-[13px] ${selected ? 'text-white/70' : 'text-muted'}`}>{item.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    ) : null}

                    {step === DONE ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-[22px] font-medium tracking-[-0.015em] text-ink md:text-[24px]">
                          {percent >= 100 ? copy.readyTitle : fill(copy.partialTitle, { percent })}
                        </p>
                        <p className="text-[15px] text-muted">
                          {percent >= 100 ? copy.readyText : copy.partialText}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              // Der Assistent startet schon beim Drücken (onPointerDownCapture); gespeichert wird erst ein ausgefülltes Profil.
                              onClick={() => (own && stepValid(0, draft) ? save() : begin())}
                              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            >
                              {own && stepValid(0, draft) ? copy.create : copy.createOwn}
                              <ArrowRight aria-hidden size={17} strokeWidth={2} />
                            </button>
                            {own ? (
                              <button
                                type="button"
                                onClick={() => {
                                  keepFocus()
                                  setStep(0)
                                }}
                                className="text-[14px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
                                {copy.edit}
                              </button>
                            ) : null}
                          </div>
                        {own ? <p className="text-[13px] text-muted">{copy.saveHint}</p> : null}
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {step < DONE ? (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      keepFocus()
                      setStep((value) => Math.max(0, value - 1))
                    }}
                    disabled={step === 0}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-[15px] text-muted transition-colors hover:text-ink disabled:invisible"
                  >
                    <ArrowLeft aria-hidden size={16} strokeWidth={2} />
                    {copy.back}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!stepValid(step, draft)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-white transition-colors hover:bg-brand disabled:bg-surface-2 disabled:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {step === STEP_COUNT - 1 ? copy.finish : copy.next}
                    <ArrowRight aria-hidden size={16} strokeWidth={2} />
                  </button>
                </div>
              ) : (
                // Gleiche Höhe wie mit Zurück und Weiter, damit nichts springt.
                <div aria-hidden className="mt-6 h-11" />
              )}
            </div>

            <p className="mt-5 text-[14px] text-muted">{copy.footnote}</p>
          </div>

          <div aria-hidden className="relative hidden lg:block lg:h-[640px]">
            <div className="absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,#e8f2ec,transparent)]" />
            {POOL.map((spot, index) => {
              const talent = TALENTS.find((item) => item.id === spot.id)!
              return (
                <span
                  key={spot.id}
                  className="float absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--dx': `${5 + index}px`, '--dy': `${7 + (index % 4)}px`, animationDuration: `${9 + index}s` } as CSSProperties}
                >
                  <span
                    className={`grid place-items-center rounded-full font-semibold opacity-60 ${toneClass[talent.tone]}`}
                    style={{ width: spot.size, height: spot.size, fontSize: Math.round(spot.size * 0.34), filter: spot.size < 34 ? 'blur(0.6px)' : 'none' }}
                  >
                    {talent.initials}
                  </span>
                </span>
              )
            })}
            <div className="absolute left-1/2 top-[44%] w-[min(420px,100%)] -translate-x-1/2 -translate-y-1/2">
              <div className="bob" style={{ animationDuration: '7s' }}>
                <ProfileCard draft={draft} />
              </div>
              <AnimatePresence>
                {percent >= 100 ? (
                  <motion.div
                    key="match"
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.25 }}
                    className="absolute left-12 right-[-28px] top-[calc(100%+18px)]"
                  >
                    <div className="bob" style={{ animationDuration: '6s', animationDelay: '-2s' }}>
                      <MatchTeaser draft={draft} />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </section>
    </MotionConfig>
  )
}
