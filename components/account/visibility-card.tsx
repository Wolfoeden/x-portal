'use client'

import { useId, useState } from 'react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Card, Switch } from '@/components/account/fields'
import { fill } from '@/lib/i18n/format'

type Status = 'draft' | 'published' | 'paused'

/** Die zwei Schalter: im Matching (anonym) und öffentlich sichtbar (Vorname, Foto, Rolle). */
export function VisibilityCard({
  status,
  visible,
  missing,
  dirty,
  onStatus,
  onVisible,
}: {
  status: Status
  visible: boolean
  missing: string[]
  dirty: boolean
  onStatus: (status: Status) => void
  onVisible: (visible: boolean) => void
}) {
  const id = useId()
  const { dict } = useLocale()
  const copy = dict.account.visibility
  const [busy, setBusy] = useState<'status' | 'visible' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serverMissing, setServerMissing] = useState<string[]>([])
  const available = status === 'published'
  const stillMissing = missing.length ? missing : serverMissing

  const post = async (url: string, body: object) => {
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    return { response, data: (await response.json().catch(() => ({}))) as { status?: Status; missing?: string[] } }
  }

  const toggleAvailable = async (next: boolean) => {
    setBusy('status')
    setError(null)
    try {
      const { response, data } = await post('/api/profile/status', { available: next })
      if (response.ok && data.status) {
        setServerMissing([])
        onStatus(data.status)
      } else if (response.status === 422 && data.missing) setServerMissing(data.missing)
      else setError(copy.failed)
    } catch {
      setError(copy.failed)
    } finally {
      setBusy(null)
    }
  }

  const toggleVisible = async (next: boolean) => {
    setBusy('visible')
    setError(null)
    try {
      const { response } = await post('/api/profile/visibility', { visible: next })
      if (response.ok) onVisible(next)
      else setError(copy.failed)
    } catch {
      setError(copy.failed)
    } finally {
      setBusy(null)
    }
  }

  const missingText = stillMissing.length ? fill(copy.missing, { fields: stillMissing.map((field) => copy.missingFields[field] ?? field).join(', ') }) : null
  const blockAvailable = !available && (dirty || stillMissing.length > 0)

  return (
    <Card id="sichtbarkeit" title={copy.title}>
      <div className="flex flex-col divide-y divide-line">
        <div className="flex items-start justify-between gap-6 pb-6">
          <div className="min-w-0">
            <p className="text-[16px] font-medium text-ink">{copy.available}</p>
            <p id={`${id}-available`} className="mt-1 max-w-[560px] text-[14.5px] leading-relaxed text-muted">
              {copy.availableText}
            </p>
            {!available && dirty ? <p className="mt-2 text-[13.5px] text-amber-ink">{copy.saveFirst}</p> : null}
            {!available && !dirty && missingText ? <p className="mt-2 text-[13.5px] text-amber-ink">{missingText}</p> : null}
          </div>
          <Switch checked={available} onChange={toggleAvailable} disabled={busy !== null || blockAvailable} label={copy.available} describedBy={`${id}-available`} />
        </div>
        <div className="flex items-start justify-between gap-6 pt-6">
          <div className="min-w-0">
            <p className="text-[16px] font-medium text-ink">{copy.visible}</p>
            <p id={`${id}-visible`} className="mt-1 max-w-[560px] text-[14.5px] leading-relaxed text-muted">
              {copy.visibleText}
            </p>
            {visible && !available ? <p className="mt-2 text-[13.5px] text-muted">{copy.visibleNeedsAvailable}</p> : null}
          </div>
          <Switch checked={visible} onChange={toggleVisible} disabled={busy !== null} label={copy.visible} describedBy={`${id}-visible`} />
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
