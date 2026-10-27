import { z } from 'zod'
import { MAX_PROJECTS, ProjectInput } from '@/lib/profile/schema'
import { loadFreelancer, sessionUser, unauthorized } from '@/lib/profile/server'
import { isSameOrigin, readJson } from '@/lib/server/request'

// Referenzprojekte: Die Liste wird als Ganzes gespeichert, in der gezeigten Reihenfolge.

const Body = z.object({ projects: z.array(ProjectInput).max(MAX_PROJECTS) })
const noStore = { 'cache-control': 'no-store' }

const toDate = (month: string | null) => (month ? `${month}-01` : null)

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'origin' }, { status: 403, headers: noStore })
  const session = await sessionUser()
  if (!session) return unauthorized()
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await readJson(request, 64_000))
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400, headers: noStore })
  }
  const { supabase, user } = session
  const freelancer = await loadFreelancer(supabase, user.id)
  if (!freelancer) return Response.json({ error: 'no_profile' }, { status: 404, headers: noStore })

  const removed = await supabase.from('freelancer_projects').delete().eq('freelancer_id', freelancer.id)
  if (removed.error) return Response.json({ error: 'failed' }, { status: 500, headers: noStore })
  if (body.projects.length) {
    const { error } = await supabase.from('freelancer_projects').insert(
      body.projects.map((project, position) => ({
        freelancer_id: freelancer.id,
        position,
        title: project.title,
        client_label: project.client,
        project_role: project.role,
        started_on: toDate(project.startedOn),
        ended_on: project.ongoing ? null : toDate(project.endedOn),
        ongoing: project.ongoing,
        technologies: project.technologies,
        outcome: project.outcome,
        link_url: project.link,
      })),
    )
    if (error) {
      console.error(JSON.stringify({ event: 'profile_projects_failed', code: error.code }))
      return Response.json({ error: 'failed' }, { status: 500, headers: noStore })
    }
  }
  return Response.json({ ok: true }, { headers: noStore })
}
