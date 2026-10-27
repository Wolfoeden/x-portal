'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Check } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Card, inkButton } from '@/components/account/fields'
import { DataCard } from '@/components/account/data-card'
import { FilesCard, type CvFile } from '@/components/account/files-card'
import { ImportsCard } from '@/components/account/imports-card'
import { ProfileForm } from '@/components/account/profile-form'
import { ProjectsEditor, withKeys, withoutKeys, type EditableProject } from '@/components/account/projects-editor'
import { VisibilityCard } from '@/components/account/visibility-card'
import { chapterTitle } from '@/components/story/talent-avatar'
import { fill } from '@/lib/i18n/format'
import { initialsOf } from '@/lib/freelancer/profile'
import { mergeDraft, type ImportDraft } from '@/lib/profile/draft'
import { dropPendingProfile, readPendingProfile } from '@/lib/profile/pending'
import { ProfileInput, ProjectInput, missingForPublish } from '@/lib/profile/schema'
import type { AccountData } from '@/lib/profile/server'
import type { OAuthProvider } from '@/lib/supabase/env'

type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'invalid' | 'incomplete'
type Status = 'draft' | 'published' | 'paused'

const Projects = z.array(ProjectInput)

function blankProfile(data: AccountData): ProfileInput {
  const first = data.linkedin?.firstName ?? data.fullName?.trim().split(/\s+/)[0] ?? ''
  return { firstName: first.slice(0, 60), lastName: null, roleKey: null, roleTitle: null, headline: null, about: null, skills: [], languages: [], dayRate: null, availability: null, workMode: null, location: null, links: [] }
}

const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)

/** Das eigene Konto. Der Server liest mit der Sitzung (RLS); hier wird bearbeitet, gespeichert wird über die Profil-Routen. */
export function AccountView({ data, providers, error }: { data: AccountData; providers: OAuthProvider[]; error: string | null }) {
  const router = useRouter()
  const { dict } = useLocale()
  const copy = dict.account
  const exists = Boolean(data.freelancer)

  const initialProfile = data.freelancer?.profile ?? blankProfile(data)
  const [saved, setSaved] = useState<{ profile: ProfileInput; projects: ProjectInput[] }>({ profile: initialProfile, projects: data.projects.map(({ id: _id, ...project }) => project) })
  const [profile, setProfile] = useState<ProfileInput>(initialProfile)
  const [projects, setProjects] = useState<EditableProject[]>(() => withKeys(data.projects.map(({ id: _id, ...project }) => project)))
  const [status, setStatus] = useState<Status>(data.freelancer?.status ?? 'draft')
  const [visible, setVisible] = useState(data.freelancer?.visible ?? false)
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl)
  const [cv, setCv] = useState<CvFile | null>(data.cv)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [tried, setTried] = useState(false)
  const [revision, setRevision] = useState(0)
  const [pending, setPending] = useState<'none' | 'saving' | 'failed'>('none')

  const plainProjects = useMemo(() => withoutKeys(projects), [projects])
  const profileCheck = ProfileInput.safeParse(profile)
  const projectsCheck = Projects.safeParse(plainProjects)
  const profileDirty = !same(profile, saved.profile)
  const projectsDirty = !same(plainProjects, saved.projects)
  const dirty = profileDirty || projectsDirty

  const invalid = useMemo(() => {
    if (!tried) return new Set<string>()
    const fields = new Set<string>()
    for (const issue of profileCheck.error?.issues ?? []) fields.add(String(issue.path[0]))
    for (const issue of projectsCheck.error?.issues ?? []) fields.add(`${String(issue.path[0])}.${String(issue.path[1])}`)
    return fields
  }, [tried, profileCheck.error, projectsCheck.error])

  // Profil aus dem Assistenten (/freelancer → Konto bestätigen): einmal anlegen, dann den Entwurf vergessen.
  const startedPending = useRef(false)
  useEffect(() => {
    if (startedPending.current) return
    startedPending.current = true
    if (exists) return dropPendingProfile()
    const draft = readPendingProfile()
    if (!draft) return
    const named = { ...draft, firstName: draft.firstName || profile.firstName }
    setProfile(named)
    setPending('saving')
    fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(named) })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        dropPendingProfile()
        router.refresh()
      })
      .catch(() => setPending('failed'))
  }, [exists, profile.firstName, router])

  // Ungespeichertes nicht stillschweigend verlieren.
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const edit = (patch: Partial<ProfileInput>) => {
    setProfile((current) => ({ ...current, ...patch }))
    setSaveState((state) => (state === 'saved' ? 'idle' : state))
  }
  const editProjects = (next: EditableProject[]) => {
    setProjects(next)
    setSaveState((state) => (state === 'saved' ? 'idle' : state))
  }

  const save = async () => {
    setTried(true)
    if (!profileCheck.success || !projectsCheck.success) return setSaveState('invalid')
    if (status === 'published' && missingForPublish(profileCheck.data).length) return setSaveState('incomplete')
    setSaveState('saving')
    try {
      if (profileDirty || !exists) {
        const response = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profileCheck.data) })
        if (!response.ok) return setSaveState(response.status === 422 ? 'incomplete' : 'failed')
        if (!exists) {
          // Neu angelegt: Der Server liefert Profil-ID und Schalter, die Seite baut sich damit neu auf.
          dropPendingProfile()
          router.refresh()
          return
        }
      }
      if (projectsDirty) {
        const response = await fetch('/api/profile/projects', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ projects: projectsCheck.data }) })
        if (!response.ok) return setSaveState('failed')
      }
      setProfile(profileCheck.data)
      setProjects(projects.map((project, index) => ({ ...projectsCheck.data[index], key: project.key })))
      setSaved({ profile: profileCheck.data, projects: projectsCheck.data })
      setTried(false)
      setSaveState('saved')
    } catch {
      setSaveState('failed')
    }
  }

  const discard = () => {
    setProfile(saved.profile)
    setProjects(withKeys(saved.projects))
    setTried(false)
    setSaveState('idle')
    setRevision((value) => value + 1)
  }

  const applyDraft = (draft: ImportDraft) => {
    const merged = mergeDraft(profile, projects, draft)
    setProfile(merged.profile)
    setProjects(withKeys(merged.projects))
    setSaveState('idle')
    return merged.taken
  }

  const takeLinkedinName = () => {
    if (!data.linkedin) return
    edit({
      firstName: (data.linkedin.firstName ?? profile.firstName).slice(0, 60),
      lastName: data.linkedin.lastName ? data.linkedin.lastName.slice(0, 80) : profile.lastName,
    })
  }

  const name = (exists ? saved.profile.firstName : null) || data.fullName?.trim().split(/\s+/)[0] || null
  const initials = initialsOf(`${profile.firstName} ${profile.lastName ?? ''}`) || '·'
  const notice =
    saveState === 'invalid' ? copy.invalid : saveState === 'incomplete' ? copy.incomplete : saveState === 'failed' ? copy.saveFailed : null
  const showBar = dirty || saveState === 'saving' || saveState === 'saved' || notice !== null

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex flex-col gap-5">
        <p className="text-[14px] text-faint">{copy.label}</p>
        <h1 id="konto-title" className={`${chapterTitle} text-ink`}>
          {name ? fill(copy.hello, { name }) : copy.helloPlain}
        </h1>
        {exists ? (
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${status === 'published' ? 'bg-brand-soft text-brand-ink' : 'bg-surface text-muted'}`}>{copy.status[status]}</span>
            {visible && status === 'published' ? <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-medium text-brand-ink">{copy.visibleBadge}</span> : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-amber-soft px-4 py-3 text-[14px] text-amber-ink">
          {copy.imports.errors[error] ?? copy.imports.errors.failed}
        </p>
      ) : null}

      {exists ? (
        <>
          <VisibilityCard
            status={status}
            visible={visible}
            missing={missingForPublish(saved.profile)}
            dirty={dirty}
            onStatus={setStatus}
            onVisible={setVisible}
          />
          <FilesCard userId={data.userId} avatarUrl={avatarUrl} initials={initials} cv={cv} onAvatar={setAvatarUrl} onCv={setCv} />
          <ImportsCard
            hasCv={Boolean(cv)}
            github={data.github}
            linkedin={data.linkedin}
            canUnlink={data.canUnlink}
            providers={providers}
            onDraft={applyDraft}
            onLinkedinName={takeLinkedinName}
            onAvatar={setAvatarUrl}
          />
          <Card id="profil" title={copy.profile.title}>
            <ProfileForm key={revision} profile={profile} onChange={edit} invalid={invalid} />
          </Card>
          <Card id="projekte" title={copy.projects.title} text={copy.projects.text}>
            <ProjectsEditor projects={projects} onChange={editProjects} invalid={invalid} />
          </Card>
        </>
      ) : (
        <Card id="profil" title={copy.create.title} text={copy.create.text}>
          {pending === 'saving' ? (
            <p role="status" className="text-[15px] text-muted">
              {copy.create.fromBuilder}
            </p>
          ) : (
            <div className="flex flex-col gap-6">
              {pending === 'failed' ? (
                <p role="alert" className="rounded-2xl bg-amber-soft px-4 py-3 text-[14px] text-amber-ink">
                  {copy.create.fromBuilderFailed}
                </p>
              ) : null}
              <ProfileForm key={revision} profile={profile} onChange={edit} invalid={invalid} />
              <button type="button" onClick={save} disabled={saveState === 'saving'} className={`${inkButton} w-fit`}>
                {saveState === 'saving' ? copy.saving : copy.create.submit}
              </button>
              {notice ? (
                <p role="alert" className="text-[13.5px] text-amber-ink">
                  {notice}
                </p>
              ) : null}
            </div>
          )}
        </Card>
      )}

      <DataCard email={data.email} methods={data.methods} />

      {exists && showBar ? (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div role="region" aria-label={copy.unsaved} className="flex w-full max-w-[640px] flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-white/95 px-5 py-3 shadow-[0_20px_50px_-20px_rgb(14_20_17/0.35)] backdrop-blur">
            <p role={notice ? 'alert' : 'status'} className={`min-w-0 text-[14px] ${notice ? 'text-amber-ink' : 'text-muted'}`}>
              {notice ??
                (saveState === 'saved' && !dirty ? (
                  <span className="inline-flex items-center gap-1.5 text-brand-ink">
                    <Check aria-hidden size={15} strokeWidth={2.5} />
                    {copy.saved}
                  </span>
                ) : (
                  copy.unsaved
                ))}
            </p>
            {dirty ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={discard} disabled={saveState === 'saving'} className="h-10 rounded-full px-3 text-[14.5px] text-muted hover:text-ink disabled:opacity-50">
                  {copy.discard}
                </button>
                <button type="button" onClick={save} disabled={saveState === 'saving'} className={inkButton}>
                  {saveState === 'saving' ? copy.saving : copy.save}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
