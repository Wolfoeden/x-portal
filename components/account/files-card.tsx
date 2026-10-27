'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { FileText } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Card, smallButton } from '@/components/account/fields'
import { fill } from '@/lib/i18n/format'
import { browserSupabase } from '@/lib/supabase/browser'

export type CvFile = { path: string; fileName: string; uploadedAt: string }

const PHOTO = { bucket: 'avatars', maxBytes: 5 * 1024 * 1024, types: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string> }
const CV = { bucket: 'cvs', maxBytes: 10 * 1024 * 1024 }

type Busy = 'photo' | 'cv' | null

/** Foto und Lebenslauf: Der Browser lädt in den eigenen Ordner, der Server prüft und trägt ein. */
export function FilesCard({
  userId,
  avatarUrl,
  initials,
  cv,
  onAvatar,
  onCv,
}: {
  userId: string
  avatarUrl: string | null
  initials: string
  cv: CvFile | null
  onAvatar: (url: string | null) => void
  onCv: (cv: CvFile | null) => void
}) {
  const { dict, locale } = useLocale()
  const copy = dict.account.files
  const photoInput = useRef<HTMLInputElement>(null)
  const cvInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)

  const register = (body: object, method: 'POST' | 'DELETE' = 'POST') =>
    fetch('/api/profile/files', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

  const upload = async (kind: 'avatar' | 'cv', file: File) => {
    const supabase = browserSupabase()
    if (!supabase) return setError(copy.failed)
    const extension = kind === 'cv' ? 'pdf' : PHOTO.types[file.type]
    const path = `${userId}/${crypto.randomUUID()}.${extension}`
    const bucket = kind === 'cv' ? CV.bucket : PHOTO.bucket
    const stored = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false })
    if (stored.error) return setError(copy.failed)
    const response = await register({ kind, path, ...(kind === 'cv' ? { fileName: file.name.slice(0, 200) } : {}) })
    if (!response.ok) return setError(response.status === 422 ? copy.wrongType : copy.failed)
    if (kind === 'avatar') onAvatar(URL.createObjectURL(file))
    else onCv({ path, fileName: file.name.slice(0, 200), uploadedAt: new Date().toISOString() })
  }

  const pick = (kind: 'avatar' | 'cv') => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(null)
    const okType = kind === 'cv' ? file.type === 'application/pdf' : Boolean(PHOTO.types[file.type])
    if (!okType) return setError(copy.wrongType)
    if (file.size > (kind === 'cv' ? CV.maxBytes : PHOTO.maxBytes)) return setError(copy.tooLarge)
    setBusy(kind === 'cv' ? 'cv' : 'photo')
    try {
      await upload(kind, file)
    } catch {
      setError(copy.failed)
    } finally {
      setBusy(null)
    }
  }

  const remove = async (kind: 'avatar' | 'cv') => {
    setError(null)
    setBusy(kind === 'cv' ? 'cv' : 'photo')
    try {
      const response = await register({ kind }, 'DELETE')
      if (!response.ok) return setError(copy.failed)
      if (kind === 'avatar') onAvatar(null)
      else onCv(null)
    } catch {
      setError(copy.failed)
    } finally {
      setBusy(null)
    }
  }

  const openCv = async () => {
    const supabase = browserSupabase()
    if (!supabase || !cv) return
    // Neues Fenster sofort öffnen, sonst blockiert der Browser es nach dem Warten.
    const opened = window.open('', '_blank')
    if (opened) opened.opener = null
    const { data } = await supabase.storage.from(CV.bucket).createSignedUrl(cv.path, 60)
    if (data?.signedUrl && opened) opened.location.href = data.signedUrl
    else if (data?.signedUrl) window.location.href = data.signedUrl
    else opened?.close()
  }

  const date = cv ? new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(cv.uploadedAt)) : ''

  return (
    <Card id="dateien" title={copy.title}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="text-[16px] font-medium text-ink">{copy.photo}</p>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // Signierter Link aus dem privaten Bucket, deshalb ein schlichtes img.
              <img src={avatarUrl} alt={copy.photoAlt} className="size-20 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="grid size-20 place-items-center rounded-full bg-surface text-[22px] font-medium text-muted">
                {initials}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => photoInput.current?.click()} disabled={busy !== null} className={smallButton}>
                {busy === 'photo' ? copy.uploading : avatarUrl ? copy.replace : copy.upload}
              </button>
              {avatarUrl ? (
                <button type="button" onClick={() => remove('avatar')} disabled={busy !== null} className={smallButton}>
                  {copy.remove}
                </button>
              ) : null}
            </div>
          </div>
          <p className="text-[13px] text-muted">{copy.photoHint}</p>
          <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick('avatar')} className="sr-only" tabIndex={-1} aria-hidden />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[16px] font-medium text-ink">{copy.cv}</p>
          {cv ? (
            <div className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <FileText aria-hidden size={20} strokeWidth={1.75} className="shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="truncate text-[15px] text-ink">{cv.fileName}</p>
                <p className="text-[13px] text-muted">{fill(copy.uploadedOn, { date })}</p>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {cv ? (
              <button type="button" onClick={openCv} className={smallButton}>
                {copy.open}
              </button>
            ) : null}
            <button type="button" onClick={() => cvInput.current?.click()} disabled={busy !== null} className={smallButton}>
              {busy === 'cv' ? copy.uploading : cv ? copy.replace : copy.upload}
            </button>
            {cv ? (
              <button type="button" onClick={() => remove('cv')} disabled={busy !== null} className={smallButton}>
                {copy.remove}
              </button>
            ) : null}
          </div>
          <p className="text-[13px] text-muted">{copy.cvHint}</p>
          <input ref={cvInput} type="file" accept="application/pdf" onChange={pick('cv')} className="sr-only" tabIndex={-1} aria-hidden />
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-[13.5px] text-amber-ink">
          {error}
        </p>
      ) : null}
    </Card>
  )
}
