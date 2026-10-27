'use client'

import { useId } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Field, TagInput, inputClass, smallButton, textareaClass } from '@/components/account/fields'
import { MAX_PROJECTS, type ProjectInput } from '@/lib/profile/schema'

/** Projekt im Editor: mit festem Schlüssel, damit Felder beim Tippen und Verschieben den Fokus behalten. */
export type EditableProject = ProjectInput & { key: string }

export const projectKey = () => Math.random().toString(36).slice(2, 10)
export const withKeys = (projects: (ProjectInput | EditableProject)[]): EditableProject[] =>
  projects.map((project) => ('key' in project ? project : { ...project, key: projectKey() }))
export const withoutKeys = (projects: EditableProject[]): ProjectInput[] => projects.map(({ key: _key, ...project }) => project)

const EMPTY: ProjectInput = { title: '', client: null, role: null, startedOn: null, endedOn: null, ongoing: false, technologies: [], outcome: null, link: null }

function ProjectFields({
  project,
  index,
  count,
  onChange,
  onMove,
  onRemove,
  invalid,
}: {
  project: ProjectInput
  index: number
  count: number
  onChange: (patch: Partial<ProjectInput>) => void
  onMove: (by: -1 | 1) => void
  onRemove: () => void
  invalid: ReadonlySet<string>
}) {
  const id = useId()
  const { dict } = useLocale()
  const copy = dict.account.projects
  const words = dict.account.profile
  const text = (value: string) => value || null
  const bad = (field: keyof ProjectInput) => invalid.has(`${index}.${field}`)
  const iconButton =
    'grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand disabled:invisible'

  return (
    <li className="rounded-[22px] border border-line p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[16px] font-medium text-ink">{project.title.trim() || copy.untitled}</p>
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={copy.up} className={iconButton}>
            <ArrowUp aria-hidden size={17} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={copy.down} className={iconButton}>
            <ArrowDown aria-hidden size={17} strokeWidth={1.75} />
          </button>
          <button type="button" onClick={onRemove} aria-label={copy.remove} className={iconButton}>
            <Trash2 aria-hidden size={17} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label={copy.projectTitle} htmlFor={`${id}-title`}>
            <input id={`${id}-title`} value={project.title} onChange={(event) => onChange({ title: event.target.value })} maxLength={160} aria-invalid={bad('title')} className={inputClass} />
          </Field>
        </div>
        <Field label={copy.client} optional={words.optional} htmlFor={`${id}-client`}>
          <input id={`${id}-client`} value={project.client ?? ''} onChange={(event) => onChange({ client: text(event.target.value) })} maxLength={160} className={inputClass} />
        </Field>
        <Field label={copy.role} optional={words.optional} htmlFor={`${id}-role`}>
          <input id={`${id}-role`} value={project.role ?? ''} onChange={(event) => onChange({ role: text(event.target.value) })} maxLength={120} className={inputClass} />
        </Field>
        <Field label={copy.start} optional={words.optional} htmlFor={`${id}-start`}>
          <input id={`${id}-start`} type="month" value={project.startedOn ?? ''} onChange={(event) => onChange({ startedOn: text(event.target.value) })} placeholder="2025-01" aria-invalid={bad('startedOn')} className={inputClass} />
        </Field>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Field label={copy.end} optional={words.optional} htmlFor={`${id}-end`}>
            <input
              id={`${id}-end`}
              type="month"
              value={project.ongoing ? '' : (project.endedOn ?? '')}
              disabled={project.ongoing}
              onChange={(event) => onChange({ endedOn: text(event.target.value) })}
              placeholder="2025-06"
              aria-invalid={bad('endedOn')}
              className={`${inputClass} disabled:bg-surface`}
            />
          </Field>
          <label className="inline-flex items-center gap-2 text-[14px] text-muted">
            <input type="checkbox" checked={project.ongoing} onChange={(event) => onChange({ ongoing: event.target.checked, endedOn: event.target.checked ? null : project.endedOn })} className="size-4 accent-[var(--color-brand)]" />
            {copy.ongoing}
          </label>
        </div>
        <div className="sm:col-span-2">
          <Field label={copy.technologies} optional={words.optional} htmlFor={`${id}-tech`}>
            <TagInput id={`${id}-tech`} values={project.technologies} onChange={(technologies) => onChange({ technologies })} max={30} maxLength={60} addLabel={words.add} removeLabel={words.remove} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={copy.outcome} optional={words.optional} htmlFor={`${id}-outcome`}>
            <textarea id={`${id}-outcome`} value={project.outcome ?? ''} onChange={(event) => onChange({ outcome: text(event.target.value) })} rows={3} maxLength={2_000} className={textareaClass} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={copy.link} optional={words.optional} htmlFor={`${id}-link`}>
            <input id={`${id}-link`} type="url" value={project.link ?? ''} onChange={(event) => onChange({ link: text(event.target.value.trim()) })} placeholder="https://" maxLength={500} aria-invalid={bad('link')} className={inputClass} />
          </Field>
        </div>
      </div>
    </li>
  )
}

/** Referenzprojekte in der gezeigten Reihenfolge. Gespeichert wird über die Leiste unten im Konto. */
export function ProjectsEditor({ projects, onChange, invalid }: { projects: EditableProject[]; onChange: (next: EditableProject[]) => void; invalid: ReadonlySet<string> }) {
  const { dict } = useLocale()
  const copy = dict.account.projects
  const update = (index: number, patch: Partial<ProjectInput>) => onChange(projects.map((project, position) => (position === index ? { ...project, ...patch } : project)))
  const move = (index: number, by: -1 | 1) => {
    const target = index + by
    if (target < 0 || target >= projects.length) return
    const next = [...projects]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {projects.length ? (
        <ol className="flex flex-col gap-4">
          {projects.map((project, index) => (
            <ProjectFields
              key={project.key}
              project={project}
              index={index}
              count={projects.length}
              onChange={(patch) => update(index, patch)}
              onMove={(by) => move(index, by)}
              onRemove={() => onChange(projects.filter((_, position) => position !== index))}
              invalid={invalid}
            />
          ))}
        </ol>
      ) : (
        <p className="text-[15px] text-muted">{copy.empty}</p>
      )}
      {projects.length < MAX_PROJECTS ? (
        <button type="button" onClick={() => onChange([...projects, { ...EMPTY, key: projectKey() }])} className={`${smallButton} w-fit`}>
          <Plus aria-hidden size={16} strokeWidth={2} />
          {copy.add}
        </button>
      ) : null}
    </div>
  )
}
