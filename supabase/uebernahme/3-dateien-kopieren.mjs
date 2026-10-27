// Schritt 3: Fotos und Lebensläufe der übernommenen Freelancer vom alten ins neue Projekt kopieren.
// Läuft lokal mit Node 22, ohne Abhängigkeiten. Die Schlüssel kommen nur aus Umgebungsvariablen und werden nie ausgegeben:
//   OLD_SUPABASE_URL, OLD_SERVICE_ROLE_KEY, NEW_SUPABASE_URL, NEW_SERVICE_ROLE_KEY
// Zielpfade wie in 2-import-neu.sql: avatars/<Konto-ID>/avatar.<endung>, cvs/<Konto-ID>/lebenslauf.pdf

const env = (name) => {
  const value = process.env[name]
  if (!value) throw new Error(`Umgebungsvariable ${name} fehlt`)
  return value.replace(/\/$/, '')
}

const OLD = { url: env('OLD_SUPABASE_URL'), key: env('OLD_SERVICE_ROLE_KEY') }
const NEW = { url: env('NEW_SUPABASE_URL'), key: env('NEW_SERVICE_ROLE_KEY') }

const headers = ({ key }) => ({ apikey: key, ...(key.startsWith('eyJ') ? { authorization: `Bearer ${key}` } : {}) })
const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/')

async function rest(project, query) {
  const response = await fetch(`${project.url}/rest/v1/${query}`, { headers: headers(project) })
  if (!response.ok) throw new Error(`REST ${response.status} für ${query.split('?')[0]}`)
  return response.json()
}

async function copy(fromBucket, fromPath, toBucket, toPath) {
  const download = await fetch(`${OLD.url}/storage/v1/object/${fromBucket}/${encodePath(fromPath)}`, { headers: headers(OLD) })
  if (!download.ok) throw new Error(`Download ${download.status}: ${fromBucket}/…`)
  const body = Buffer.from(await download.arrayBuffer())
  const upload = await fetch(`${NEW.url}/storage/v1/object/${toBucket}/${encodePath(toPath)}`, {
    method: 'POST',
    headers: { ...headers(NEW), 'content-type': download.headers.get('content-type') ?? 'application/octet-stream', 'x-upsert': 'true' },
    body,
  })
  if (!upload.ok) throw new Error(`Upload ${upload.status}: ${toBucket}/…`)
  return body.length
}

const profiles = await rest(OLD, 'freelancer_profiles?select=id,owner_user_id,avatar_path&owner_user_id=not.is.null')
const owners = new Map(profiles.map((profile) => [profile.id, profile.owner_user_id]))

let avatars = 0
for (const profile of profiles.filter((item) => item.avatar_path)) {
  const extension = (profile.avatar_path.match(/\.([A-Za-z0-9]+)$/)?.[1] ?? 'jpg').toLowerCase()
  await copy('freelancer-avatars', profile.avatar_path, 'avatars', `${profile.owner_user_id}/avatar.${extension}`)
  avatars += 1
}

const ids = [...owners.keys()]
const cvs = ids.length
  ? await rest(OLD, `freelancer_cv_documents?select=profile_id,storage_bucket,storage_path,mime_type&profile_id=in.(${ids.join(',')})`)
  : []
let documents = 0
for (const cv of cvs.filter((item) => item.mime_type === 'application/pdf')) {
  await copy(cv.storage_bucket, cv.storage_path, 'cvs', `${owners.get(cv.profile_id)}/lebenslauf.pdf`)
  documents += 1
}

console.log(`Fotos kopiert: ${avatars}, Lebensläufe kopiert: ${documents}`)
