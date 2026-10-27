import 'server-only'

import type { SupabaseClient, User } from '@supabase/supabase-js'
import { profileFromRow, type FreelancerRow, type ProfileInput, type ProjectInput } from '@/lib/profile/schema'
import { serverSupabase } from '@/lib/supabase/server'

// Konto und Profil des angemeldeten Menschen. Gelesen und geschrieben wird mit seiner Sitzung, RLS begrenzt alles.

/** Textversion der Einwilligung „Öffentlich sichtbar“; ändert sich der Text am Schalter, steigt sie. */
export const SHOWCASE_TEXT_VERSION = 'showcase-2026-10'

export async function sessionUser(): Promise<{ supabase: SupabaseClient; user: User } | null> {
  const supabase = await serverSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user ? { supabase, user } : null
}

export const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401, headers: { 'cache-control': 'no-store' } })

export type FreelancerState = {
  id: string
  slug: string
  status: 'draft' | 'published' | 'paused'
  profile: ProfileInput
  avatarPath: string | null
  visible: boolean
  publishedAt: string | null
}

export type StoredProject = ProjectInput & { id: string }

export type AccountData = {
  userId: string
  email: string | null
  fullName: string | null
  methods: string[]
  github: { login: string } | null
  linkedin: { name: string | null; firstName: string | null; lastName: string | null; picture: string | null } | null
  /** Mehr als ein Anmeldeweg: dann lässt sich GitHub oder LinkedIn wieder trennen. */
  canUnlink: boolean
  freelancer: FreelancerState | null
  /** Signierter Link aufs eigene Foto, eine Stunde gültig. */
  avatarUrl: string | null
  projects: StoredProject[]
  cv: { path: string; fileName: string; uploadedAt: string } | null
}

const FREELANCER_COLUMNS =
  'id, slug, status, first_name, last_name, role_key, role_title, headline, about, skills, languages, day_rate_eur, availability, work_mode, location_text, links, avatar_path, consent_showcase, published_at'

function identityData(user: User, provider: string) {
  return user.identities?.find((identity) => identity.provider === provider)?.identity_data as Record<string, unknown> | undefined
}

const asText = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null)

/** GitHub-Name aus dem verbundenen Konto, sonst null. */
export function githubLoginOf(user: User) {
  const github = identityData(user, 'github')
  return github ? (asText(github.user_name) ?? asText(github.preferred_username)) : null
}

/** Was LinkedIn bei der Anmeldung liefert (OpenID): Name und Bild, mehr nicht. */
export function linkedinOf(user: User) {
  const linkedin = identityData(user, 'linkedin_oidc')
  if (!linkedin) return null
  const name = asText(linkedin.name) ?? asText(linkedin.full_name)
  return {
    name,
    firstName: asText(linkedin.given_name) ?? name?.split(/\s+/)[0] ?? null,
    lastName: asText(linkedin.family_name),
    picture: asText(linkedin.picture) ?? asText(linkedin.avatar_url),
  }
}

export async function loadFreelancer(supabase: SupabaseClient, userId: string): Promise<FreelancerState | null> {
  const { data } = await supabase.from('freelancers').select(FREELANCER_COLUMNS).eq('user_id', userId).maybeSingle()
  if (!data) return null
  return {
    id: data.id as string,
    slug: data.slug as string,
    status: data.status as FreelancerState['status'],
    profile: profileFromRow(data as unknown as FreelancerRow),
    avatarPath: (data.avatar_path as string | null) ?? null,
    visible: data.consent_showcase === true,
    publishedAt: (data.published_at as string | null) ?? null,
  }
}

export async function loadAccount(supabase: SupabaseClient, user: User): Promise<AccountData> {
  const [profile, freelancer] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    loadFreelancer(supabase, user.id),
  ])
  let projects: StoredProject[] = []
  let cv: AccountData['cv'] = null
  if (freelancer) {
    const [projectRows, documents] = await Promise.all([
      supabase
        .from('freelancer_projects')
        .select('id, title, client_label, project_role, started_on, ended_on, ongoing, technologies, outcome, link_url')
        .eq('freelancer_id', freelancer.id)
        .order('position'),
      supabase.from('freelancer_documents').select('storage_path, file_name, uploaded_at').eq('freelancer_id', freelancer.id).order('uploaded_at', { ascending: false }).limit(1),
    ])
    projects = (projectRows.data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      client: (row.client_label as string | null) ?? null,
      role: (row.project_role as string | null) ?? null,
      startedOn: typeof row.started_on === 'string' ? row.started_on.slice(0, 7) : null,
      endedOn: typeof row.ended_on === 'string' ? row.ended_on.slice(0, 7) : null,
      ongoing: row.ongoing === true,
      technologies: (row.technologies as string[] | null) ?? [],
      outcome: (row.outcome as string | null) ?? null,
      link: (row.link_url as string | null) ?? null,
    }))
    const document = documents.data?.[0]
    cv = document ? { path: document.storage_path as string, fileName: document.file_name as string, uploadedAt: document.uploaded_at as string } : null
  }

  const github = githubLoginOf(user)
  const linkedin = linkedinOf(user)
  const avatar = freelancer?.avatarPath ? await supabase.storage.from('avatars').createSignedUrl(freelancer.avatarPath, 3_600) : null
  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: (profile.data?.full_name as string | null) ?? null,
    methods: [...new Set((user.identities ?? []).map((identity) => identity.provider))],
    github: user.identities?.some((identity) => identity.provider === 'github') ? { login: github ?? '' } : null,
    linkedin,
    canUnlink: (user.identities ?? []).length > 1,
    freelancer,
    avatarUrl: avatar?.data?.signedUrl ?? null,
    projects,
    cv,
  }
}
