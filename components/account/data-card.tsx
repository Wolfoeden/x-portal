'use client'

import { useId, useState } from 'react'
import { Download, LogOut, Trash2 } from 'lucide-react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Card, inputClass, smallButton } from '@/components/account/fields'
import { fill } from '@/lib/i18n/format'
import { pagePath } from '@/lib/i18n/routes'

/** Konto und Daten: Anmeldewege, Export (Art. 20 DSGVO), Löschen (Art. 17 DSGVO), Abmelden. */
export function DataCard({ email, methods }: { email: string | null; methods: string[] }) {
  const id = useId()
  const { dict, locale } = useLocale()
  const copy = dict.account.data
  const account = dict.account
  const [confirming, setConfirming] = useState(false)
  const [word, setWord] = useState('')
  const [state, setState] = useState<'idle' | 'deleting' | 'failed'>('idle')

  const remove = async () => {
    if (word.trim().toUpperCase() !== copy.deleteWord) return
    setState('deleting')
    try {
      const response = await fetch('/api/profile/delete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ confirm: true }) })
      if (!response.ok) return setState('failed')
      window.location.assign(pagePath('home', locale))
    } catch {
      setState('failed')
    }
  }

  return (
    <Card id="konto-daten" title={copy.title}>
      <dl className="divide-y divide-line">
        <div className="flex flex-col gap-1 pb-4 sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="w-40 shrink-0 text-[14px] text-faint">{account.email}</dt>
          <dd className="min-w-0 text-[16px] text-ink [overflow-wrap:anywhere]">{email ?? '–'}</dd>
        </div>
        <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="w-40 shrink-0 text-[14px] text-faint">{account.methods}</dt>
          <dd className="min-w-0 text-[16px] text-ink">{methods.length ? methods.map((method) => account.methodNames[method] ?? method).join(' · ') : '–'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-6 border-t border-line pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14.5px] text-muted">{copy.exportText}</p>
          <a href="/api/profile/export" download className={`${smallButton} w-fit`}>
            <Download aria-hidden size={16} strokeWidth={1.75} />
            {copy.export}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[460px] text-[14.5px] text-muted">{copy.deleteText}</p>
            {!confirming ? (
              <button type="button" onClick={() => setConfirming(true)} className={`${smallButton} w-fit text-amber-ink`}>
                <Trash2 aria-hidden size={16} strokeWidth={1.75} />
                {copy.delete}
              </button>
            ) : null}
          </div>
          {confirming ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                remove()
              }}
              className="flex flex-col gap-3 rounded-2xl bg-amber-soft p-4"
            >
              <label htmlFor={`${id}-word`} className="text-[14px] font-medium text-amber-ink">
                {fill(copy.deleteConfirm, { word: copy.deleteWord })}
              </label>
              <input id={`${id}-word`} value={word} onChange={(event) => setWord(event.target.value)} autoComplete="off" spellCheck={false} className={inputClass} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={word.trim().toUpperCase() !== copy.deleteWord || state === 'deleting'}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-amber-ink px-4 text-[14.5px] font-medium text-white disabled:opacity-50"
                >
                  {state === 'deleting' ? copy.deleting : copy.deleteSubmit}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false)
                    setWord('')
                    setState('idle')
                  }}
                  className={smallButton}
                >
                  {copy.deleteCancel}
                </button>
              </div>
              {state === 'failed' ? (
                <p role="alert" className="text-[13.5px] text-amber-ink">
                  {copy.deleteFailed}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>

        <form action="/auth/sign-out" method="post">
          <input type="hidden" name="lang" value={locale} />
          <button type="submit" className={smallButton}>
            <LogOut aria-hidden size={16} strokeWidth={1.75} />
            {account.signOut}
          </button>
        </form>
      </div>
    </Card>
  )
}
