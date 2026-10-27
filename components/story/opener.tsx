'use client'

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowDown, ArrowRight, Check, Plus } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useStory } from '@/components/story/story-context'
import { ModelPicker } from '@/components/story/model-picker'
import { AvatarFace, avatarClass, memberBadge } from '@/components/story/talent-avatar'
import { useAutoHeight } from '@/lib/use-auto-height'
import { TALENTS, kindOf, matchScenario, reviewerOf, roleOf, talentOf, teamMix, type Scenario, type Talent } from '@/lib/demo/scenarios'
import { analyseOnServer } from '@/lib/matching/client'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'
import { pagePath } from '@/lib/i18n/routes'
import type { ModelChoice } from '@/lib/story/choices'

type Phase = 'team' | 'clearing' | 'typing' | 'matching'

const FIRST_HOLD = 3200
const HOLD = 5200
const TYPE_SPEED = 32
// Gleiche Schrift und Abstände für Textfeld und getippte Vorschau, damit beide gleich umbrechen.
const FIELD_TEXT = 'py-3 text-[17px] leading-[27px] md:text-[19px] md:leading-[28px]'

// Lage der Talente rund um das Team (Prozent der Bühne, ab lg) und ihre Tiefe:
// 0 hinten (klein, blass, leicht unscharf), 2 vorne.
const SPOTS: { x: number; y: number; depth: 0 | 1 | 2 }[] = [
  { x: 8, y: 8, depth: 1 }, { x: 27, y: 3, depth: 0 }, { x: 47, y: 5, depth: 2 }, { x: 67, y: 1, depth: 0 },
  { x: 85, y: 8, depth: 1 }, { x: 97, y: 24, depth: 0 }, { x: 94, y: 45, depth: 2 }, { x: 99, y: 66, depth: 0 },
  { x: 91, y: 86, depth: 1 }, { x: 72, y: 97, depth: 0 }, { x: 50, y: 95, depth: 2 }, { x: 29, y: 99, depth: 0 },
  { x: 9, y: 90, depth: 1 }, { x: 2, y: 73, depth: 0 }, { x: 5, y: 31, depth: 1 }, { x: 39, y: 92, depth: 0 },
]
const DEPTHS = [0, 1, 2] as const
const DEPTH_LOOK = [
  { size: 30, opacity: 0.45, filter: 'blur(1.2px)', parallax: 6 },
  { size: 40, opacity: 0.7, filter: 'none', parallax: 12 },
  { size: 52, opacity: 0.95, filter: 'none', parallax: 20 },
]
// Teamkarten liegen leicht versetzt übereinander.
const CARD_OFFSETS = [0, 28, -6, 16]

function Avatar({ talent, size, highlighted = false, lifted = false }: { talent: Talent; size: number; highlighted?: boolean; lifted?: boolean }) {
  return (
    <motion.span
      layoutId={`talent-${talent.id}`}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${avatarClass(talent)} ${highlighted ? 'ring-2 ring-brand ring-offset-2 ring-offset-white' : ''} ${lifted ? 'shadow-[0_14px_30px_-14px_rgb(14_20_17/0.35)]' : ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      <AvatarFace talent={talent} size={size} />
    </motion.span>
  )
}

export function Opener({ pool = [] }: { pool?: Talent[] }) {
  const reduceMotion = useReducedMotion()
  const inputId = useId()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const story = useStory()
  const { setStory, ask } = story
  const { locale, dict, ids } = useLocale()
  const copy = dict.home.opener
  const scenarios = dict.scenarios
  // Echte Profile übernehmen die Plätze der Beispielprofile, die in keinem Beispielteam vorkommen.
  const talents = useMemo(() => {
    const used = new Set(scenarios.flatMap((item) => item.team.map((member) => member.id)))
    let next = 0
    return TALENTS.map((talent) => (!used.has(talent.id) && next < pool.length ? pool[next++] : talent))
  }, [pool, scenarios])

  const [scenario, setScenario] = useState<Scenario>(scenarios[0])
  const [nextIndex, setNextIndex] = useState(1)
  const [text, setText] = useState(scenarios[0].sentence)
  const [phase, setPhase] = useState<Phase>('team')
  const [shown, setShown] = useState(scenarios[0].team.length)
  const [auto, setAuto] = useState(true)
  const [focused, setFocused] = useState(false)
  const [userQuery, setUserQuery] = useState<string | null>(null)
  const [firstHold, setFirstHold] = useState(true)
  // Wartet auf /api/analyse; bis dahin bleibt die Prüfung sichtbar.
  const [waiting, setWaiting] = useState(false)
  const runId = useRef(0)

  const autoRunning = auto && !reduceMotion
  useAutoHeight(inputRef, text)

  // Parallaxe: Profile weiter vorn folgen der Maus stärker.
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 18 })
  const smoothY = useSpring(pointerY, { stiffness: 50, damping: 18 })
  const farX = useTransform(smoothX, (value) => value * DEPTH_LOOK[0].parallax)
  const midX = useTransform(smoothX, (value) => value * DEPTH_LOOK[1].parallax)
  const nearX = useTransform(smoothX, (value) => value * DEPTH_LOOK[2].parallax)
  const farY = useTransform(smoothY, (value) => value * DEPTH_LOOK[0].parallax)
  const midY = useTransform(smoothY, (value) => value * DEPTH_LOOK[1].parallax)
  const nearY = useTransform(smoothY, (value) => value * DEPTH_LOOK[2].parallax)
  const layerX = [farX, midX, nearX]
  const layerY = [farY, midY, nearY]

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || reduceMotion) return
    const box = event.currentTarget.getBoundingClientRect()
    pointerX.set(Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1)))
    pointerY.set(Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1)))
  }

  // Ablauf der Live-Demo: Team zeigen, auflösen, nächsten Satz tippen, prüfen, Team bilden.
  useEffect(() => {
    if (phase === 'team') {
      if (shown < scenario.team.length) {
        const timer = setTimeout(() => setShown((value) => value + 1), 170)
        return () => clearTimeout(timer)
      }
      if (!autoRunning) return
      const timer = setTimeout(() => {
        setFirstHold(false)
        setShown(0)
        setPhase('clearing')
      }, firstHold ? FIRST_HOLD : HOLD)
      return () => clearTimeout(timer)
    }
    if (phase === 'clearing') {
      const timer = setTimeout(() => {
        setText('')
        setPhase('typing')
      }, 520)
      return () => clearTimeout(timer)
    }
    if (phase === 'typing') {
      const target = scenarios[nextIndex].sentence
      if (text.length < target.length) {
        const timer = setTimeout(() => setText(target.slice(0, text.length + 1)), TYPE_SPEED)
        return () => clearTimeout(timer)
      }
      const timer = setTimeout(() => {
        setScenario(scenarios[nextIndex])
        setNextIndex((nextIndex + 1) % scenarios.length)
        setPhase('matching')
      }, 350)
      return () => clearTimeout(timer)
    }
    if (phase === 'matching') {
      if (waiting) return
      const timer = setTimeout(() => setPhase('team'), 750)
      return () => clearTimeout(timer)
    }
  }, [phase, shown, scenario, text, nextIndex, autoRunning, firstHold, scenarios, waiting])

  const stopAuto = () => {
    if (!auto) return
    setAuto(false)
    if (phase !== 'team') {
      setText(scenario.sentence)
      setPhase('team')
    }
  }

  // Beispiele bleiben Demo; eigene Sätze fragt der Server. Ohne Server, bei Limit oder Fehler antwortet die Demo.
  const run = (sentence: string, example?: Scenario) => {
    const id = ++runId.current
    const demo = example ?? matchScenario(sentence, scenarios)
    setAuto(false)
    setText(sentence)
    setUserQuery(sentence)
    setShown(0)
    setPhase('matching')
    if (example || sentence.length < 10) {
      setWaiting(false)
      setScenario(demo)
      setStory(demo, sentence)
      return
    }
    setWaiting(true)
    void analyseOnServer(sentence, locale).then((live) => {
      if (runId.current !== id) return
      const next = live ?? demo
      setScenario(next)
      setStory(next, sentence)
      setWaiting(false)
    })
  }

  // Eingaben aus der schwebenden Eingabeleiste laufen hier oben ein.
  const handledAsk = useRef<number | null>(null)
  useEffect(() => {
    if (!ask || handledAsk.current === ask.id) return
    handledAsk.current = ask.id
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
    run(ask.sentence)
    // run setzt nur Zustand; die Abhängigkeiten sind bewusst auf die neue Eingabe begrenzt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const sentence = text.trim()
    if (sentence.length < 3) {
      inputRef.current?.focus()
      return
    }
    run(sentence)
  }

  const teamIds = scenario.team.slice(0, phase === 'team' ? shown : 0).map((member) => member.id)
  const candidates = phase === 'matching' && !waiting ? scenario.team.map((member) => member.id) : []
  const showCaret = autoRunning && !focused

  // Festlegungen des Auftraggebers gelten auch hier oben, sobald dieses Projekt die Story ist.
  const isStory = scenario.id === story.base.id
  const view = isStory ? story.scenario : scenario
  const teamReady = phase === 'team' && shown === scenario.team.length
  const showModel = Boolean(view.ai) && teamReady
  const chooseModel = (model: ModelChoice) => {
    stopAuto()
    if (!isStory) setStory(scenario, userQuery)
    story.setModel(model)
  }

  return (
    <MotionConfig reducedMotion="user">
      <section id={ids.project} className="relative overflow-x-clip" aria-labelledby="opener-title">
        <Container className="grid min-h-[calc(100svh-4rem)] grid-cols-[minmax(0,1fr)] content-center gap-8 pb-16 pt-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-10 lg:gap-y-0 lg:pb-16 lg:pt-4">
          <div className="flex flex-col lg:col-start-1 lg:row-start-1 lg:self-end">
            {/* „One sentence.“ ist breiter als „Ein Satz.“: auf schmalen Handys (360 px) wird Englisch etwas kleiner, Deutsch bleibt gleich. */}
            <h1
              id="opener-title"
              className={`${locale === 'en' ? 'text-[clamp(min(3.25rem,13.5vw),7.2vw,6.5rem)]' : 'text-[clamp(3.25rem,7.2vw,6.5rem)]'} font-medium leading-[0.94] tracking-[-0.045em] text-ink`}
            >
              <span className="block text-[#7c847f]">{copy.titleGray}</span>
              <span className="block">{copy.title}</span>
            </h1>

            <form onSubmit={onSubmit} className="mt-10 w-full max-w-[600px] lg:mt-12">
              <label htmlFor={inputId} className="sr-only">
                {copy.fieldLabel}
              </label>
              <div className="relative flex items-end gap-2 rounded-[22px] border border-line-strong bg-white p-2 pl-5 shadow-field transition-colors focus-within:border-ink/50">
                <div className="relative min-w-0 flex-1">
                  <textarea
                    ref={inputRef}
                    id={inputId}
                    rows={2}
                    value={text}
                    onChange={(event) => setText(event.target.value.replace(/\s*\n\s*/g, ' '))}
                    onKeyDown={(event) => {
                      // Ein Satz, keine Absätze: Enter schickt ab.
                      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                    onFocus={(event) => {
                      setFocused(true)
                      stopAuto()
                      event.currentTarget.select()
                    }}
                    onBlur={() => setFocused(false)}
                    autoComplete="off"
                    enterKeyHint="send"
                    placeholder={copy.placeholder}
                    className={`${FIELD_TEXT} block max-h-[40svh] w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-faint ${showCaret ? 'text-transparent' : 'text-ink'}`}
                  />
                  {showCaret ? (
                    <span aria-hidden className={`${FIELD_TEXT} pointer-events-none absolute inset-0 whitespace-pre-wrap break-words text-ink`}>
                      {text}
                      <span className="caret ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.18em] bg-brand" />
                    </span>
                  ) : null}
                </div>
                <button
                  type="submit"
                  className="inline-flex h-[52px] shrink-0 items-center gap-2 rounded-2xl bg-ink px-4 text-[15px] font-medium text-white transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-5"
                >
                  <span className="hidden sm:inline">{copy.submit}</span>
                  <ArrowRight aria-hidden size={18} strokeWidth={2} />
                  <span className="sr-only sm:hidden">{copy.submit}</span>
                </button>
              </div>
            </form>

          </div>

          <LayoutGroup>
            <div
              className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-[660px] lg:self-center"
              onPointerMove={onPointerMove}
              onPointerLeave={() => {
                pointerX.set(0)
                pointerY.set(0)
              }}
            >
              {/* Die Wege der Talente kreuzen sich im Team: das X der Marke. */}
              <svg aria-hidden className="pointer-events-none absolute inset-0 hidden size-full lg:block" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line x1="4" y1="6" x2="96" y2="94" stroke="#e3e8e4" strokeWidth="0.12" strokeDasharray="0.5 1.4" />
                <line x1="96" y1="6" x2="4" y2="94" stroke="#e3e8e4" strokeWidth="0.12" strokeDasharray="0.5 1.4" />
              </svg>

              <div aria-hidden className="mb-6 flex flex-nowrap items-center justify-center gap-2 lg:mb-0 lg:block">
                {DEPTHS.map((depth) => (
                  <motion.div
                    key={depth}
                    className="contents lg:pointer-events-none lg:absolute lg:inset-0 lg:block"
                    style={{ x: layerX[depth], y: layerY[depth] }}
                  >
                    {talents.map((talent, index) => {
                      const spot = SPOTS[index]
                      if (spot.depth !== depth) return null
                      const look = DEPTH_LOOK[depth]
                      const inTeam = teamIds.includes(talent.id)
                      const isCandidate = candidates.includes(talent.id)
                      return (
                        <div
                          key={talent.id}
                          className="relative shrink-0 lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:-translate-x-1/2 lg:-translate-y-1/2"
                          style={{ '--x': `${spot.x}%`, '--y': `${spot.y}%`, width: look.size, height: look.size } as CSSProperties}
                        >
                          <span
                            className="float absolute inset-0 grid place-items-center"
                            style={{
                              '--dx': `${4 + ((index * 7) % 9)}px`,
                              '--dy': `${6 + ((index * 5) % 8)}px`,
                              animationDuration: `${8 + ((index * 3) % 9)}s`,
                              animationDelay: `${-((index * 1.7) % 9)}s`,
                            } as CSSProperties}
                          >
                            {inTeam ? (
                              <span className="size-full rounded-full border border-dashed border-line-strong" />
                            ) : (
                              <span
                                className="transition-[opacity,filter] duration-500"
                                style={{ opacity: isCandidate ? 1 : look.opacity, filter: isCandidate ? 'none' : look.filter }}
                              >
                                <Avatar talent={talent} size={look.size} highlighted={isCandidate} lifted={depth === 2} />
                              </span>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>
                ))}
              </div>

              <div className="relative mx-auto w-full max-w-[400px] lg:absolute lg:left-[53%] lg:top-1/2 lg:w-[78%] lg:max-w-[390px] lg:-translate-x-1/2 lg:-translate-y-1/2">
                <div className="flex items-center justify-between gap-3 px-1">
                  <p className="text-[13px] text-faint">{copy.yourTeam}</p>
                  <p className="text-[13px] text-faint">{scenario.source === 'live' ? dict.live.label : copy.demo}</p>
                </div>
                <p aria-live={auto ? 'off' : 'polite'} className="mt-1 min-h-[56px] px-1 text-[21px] font-medium leading-tight tracking-[-0.015em] text-ink">
                  {phase === 'team' ? scenario.title : phase === 'matching' ? copy.matching : copy.reading}
                </p>
                {userQuery && phase === 'team' ? <p className="truncate px-1 text-[13.5px] text-muted">{fill(dict.common.quote, { text: userQuery })}</p> : null}

                <ul className="mt-4 flex min-h-[296px] flex-col gap-3">
                  {view.team.map((member, index) => {
                    const talent = talentOf(member)
                    const badge = memberBadge(member, dict)
                    const visible = phase === 'team' && index < shown
                    const offset = CARD_OFFSETS[index % CARD_OFFSETS.length]
                    return (
                      <li
                        key={`${scenario.id}-${member.id}`}
                        className="ml-[calc(var(--off)*0.35)] lg:ml-[var(--off)]"
                        style={{ '--off': `${offset}px` } as CSSProperties}
                      >
                        <div>
                          {visible ? (
                            <div className="flex h-16 items-center gap-3 rounded-2xl border border-line bg-white px-3.5 shadow-[0_1px_2px_rgb(14_20_17/0.05),0_22px_44px_-22px_rgb(14_20_17/0.32)]">
                              <Avatar talent={talent} size={40} />
                              <motion.div
                                className="flex min-w-0 flex-1 items-center gap-3"
                                initial={firstHold ? false : { opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.18 }}
                              >
                                <div className="min-w-0 flex-1">
                                  {/* Agenten: Zeichen und Schild sagen schon „KI-Agent“; die zweite Zeile nennt, wer prüft. */}
                                  <p className="truncate text-[15px] text-ink">
                                    <span className="font-medium">{talent.name}</span>
                                    {kindOf(member) === 'agent' ? null : <span className="text-faint"> · {roleOf(member, dict.talentRoles)}</span>}
                                  </p>
                                  <p className="flex gap-x-2.5 overflow-hidden whitespace-nowrap text-[12.5px] text-brand-ink">
                                    {kindOf(member) === 'agent' ? (
                                      <span className="truncate text-muted">{fill(dict.agents.reviewer, { name: reviewerOf(member, view.team, dict.choices.ownTeam) })}</span>
                                    ) : (
                                      member.why.map((reason) => (
                                        <span key={reason} className="inline-flex items-center gap-1">
                                          <Check aria-hidden size={12} strokeWidth={2.5} />
                                          {reason}
                                        </span>
                                      ))
                                    )}
                                  </p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-1 text-[11.5px] font-medium ${badge.className}`}>{badge.label}</span>
                              </motion.div>
                            </div>
                          ) : (
                            <div className="flex h-16 items-center gap-3 rounded-2xl border border-dashed border-line-strong px-3.5">
                              <span className="size-10 shrink-0 rounded-full border border-dashed border-line-strong" />
                              <span className={`h-2.5 flex-1 rounded-full bg-surface ${phase === 'matching' ? 'animate-pulse' : ''}`} />
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-5 flex items-center justify-between gap-3 px-1">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={teamReady ? scenario.id : 'pending'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="min-w-0 text-[13.5px] text-muted"
                    >
                      {teamReady ? teamMix(view.team, dict.common.mix) : copy.forming}
                    </motion.p>
                  </AnimatePresence>
                  <a
                    href={`#${ids.reasons}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-medium text-ink transition-colors hover:text-brand"
                  >
                    {copy.why}
                    <ArrowDown aria-hidden size={15} strokeWidth={2} />
                  </a>
                </div>

                {/* Bei KI-Projekten wählt der Auftraggeber das Modell. Der Platz bleibt reserviert, damit nichts springt. */}
                <div inert={!showModel} className={`mt-3 flex min-h-9 flex-wrap items-center gap-x-3 gap-y-2 px-1 transition-opacity duration-300 ${showModel ? 'opacity-100' : 'opacity-0'}`}>
                  <ModelPicker compact value={isStory ? story.choices.model : null} onChange={chooseModel} />
                </div>
              </div>

              <a
                href={pagePath('freelancer', locale)}
                className="group mt-6 flex items-center justify-center gap-2.5 text-[14px] text-muted transition-colors hover:text-ink lg:absolute lg:left-[-2%] lg:top-[52%] lg:mt-0 lg:-translate-y-1/2 lg:flex-col lg:gap-1.5 lg:text-[12px]"
              >
                <span className="grid size-10 place-items-center rounded-full border border-dashed border-brand/60 bg-white text-brand transition-colors group-hover:bg-brand-soft">
                  <Plus aria-hidden size={16} strokeWidth={2} />
                </span>
                <span className="lg:hidden">{copy.freelancerMobile}</span>
                <span className="hidden lg:inline">{copy.freelancerDesktop}</span>
              </a>
            </div>
          </LayoutGroup>

          <div className="flex flex-col lg:col-start-1 lg:row-start-2 lg:self-start">
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[14px] text-faint">{copy.or}</span>
              {scenarios.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => run(item.sentence, item)}
                  aria-pressed={!auto && scenario.id === item.id}
                  className={`h-9 rounded-full border px-3.5 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    !auto && scenario.id === item.id ? 'border-ink bg-ink text-white' : 'border-line-strong text-body hover:border-ink/50'
                  }`}
                >
                  {item.chip}
                </button>
              ))}
            </div>

            <p className="mt-10 max-w-[440px] text-[16px] leading-relaxed text-muted lg:mt-14">
              {copy.note}
            </p>
          </div>
        </Container>
      </section>
    </MotionConfig>
  )
}
