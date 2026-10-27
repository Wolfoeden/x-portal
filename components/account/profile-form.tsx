'use client'

import { useId, useState } from 'react'
import { useLocale } from '@/components/i18n/locale-provider'
import { Field, TagInput, inputClass, textareaClass } from '@/components/account/fields'
import { AVAILABILITY, ROLE_KEYS, WORK_MODES, type ProfileInput } from '@/lib/profile/schema'

/** Alle Profilfelder. Gespeichert wird über die Leiste unten im Konto. */
export function ProfileForm({
  profile,
  onChange,
  invalid,
}: {
  profile: ProfileInput
  onChange: (patch: Partial<ProfileInput>) => void
  invalid: ReadonlySet<string>
}) {
  const id = useId()
  const { dict } = useLocale()
  const copy = dict.account.profile
  const { roles, availability, workModes } = dict.freelancer
  const role = roles.find((item) => item.id === profile.roleKey) ?? null
  // Links als Text, damit Leerzeilen beim Tippen stehen bleiben.
  const [linksText, setLinksText] = useState(profile.links.join('\n'))
  const text = (value: string) => value || null
  const bad = (field: keyof ProfileInput) => invalid.has(field)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
      <Field label={copy.firstName} htmlFor={`${id}-first`}>
        <input id={`${id}-first`} value={profile.firstName} onChange={(event) => onChange({ firstName: event.target.value })} autoComplete="given-name" maxLength={60} aria-invalid={bad('firstName')} className={inputClass} />
      </Field>
      <Field label={copy.lastName} optional={copy.optional} hint={copy.lastNameHint} htmlFor={`${id}-last`}>
        <input id={`${id}-last`} value={profile.lastName ?? ''} onChange={(event) => onChange({ lastName: text(event.target.value) })} autoComplete="family-name" maxLength={80} aria-invalid={bad('lastName')} className={inputClass} />
      </Field>

      <Field label={copy.role} htmlFor={`${id}-role`}>
        <select
          id={`${id}-role`}
          value={profile.roleKey ?? ''}
          onChange={(event) => onChange({ roleKey: (event.target.value || null) as ProfileInput['roleKey'] })}
          aria-invalid={bad('roleKey')}
          className={`${inputClass} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`}
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%230e1411%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")' }}
        >
          <option value="">{copy.rolePick}</option>
          {ROLE_KEYS.map((key) => (
            <option key={key} value={key}>
              {roles.find((item) => item.id === key)?.label ?? key}
            </option>
          ))}
        </select>
      </Field>
      <Field label={copy.roleTitle} optional={copy.optional} htmlFor={`${id}-title`}>
        <input id={`${id}-title`} value={profile.roleTitle ?? ''} onChange={(event) => onChange({ roleTitle: text(event.target.value) })} placeholder={copy.roleTitlePlaceholder} maxLength={120} aria-invalid={bad('roleTitle')} className={inputClass} />
      </Field>

      <div className="sm:col-span-2">
        <Field label={copy.headline} optional={copy.optional} htmlFor={`${id}-headline`}>
          <input id={`${id}-headline`} value={profile.headline ?? ''} onChange={(event) => onChange({ headline: text(event.target.value) })} placeholder={copy.headlinePlaceholder} maxLength={160} aria-invalid={bad('headline')} className={inputClass} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label={copy.skills} hint={copy.skillsHint} htmlFor={`${id}-skills`}>
          <TagInput
            id={`${id}-skills`}
            values={profile.skills}
            onChange={(skills) => onChange({ skills })}
            max={30}
            maxLength={60}
            suggestions={role?.skills ?? []}
            suggestionsLabel={copy.suggestions}
            addLabel={copy.add}
            removeLabel={copy.remove}
            invalid={bad('skills')}
          />
        </Field>
      </div>

      <Field label={copy.dayRate} hint={copy.dayRateHint} htmlFor={`${id}-rate`}>
        <input
          id={`${id}-rate`}
          type="number"
          inputMode="numeric"
          min={100}
          max={5_000}
          step={10}
          value={profile.dayRate ?? ''}
          onChange={(event) => onChange({ dayRate: event.target.value === '' ? null : Math.round(Number(event.target.value)) })}
          aria-invalid={bad('dayRate')}
          className={inputClass}
        />
      </Field>
      <Field label={copy.location} optional={copy.optional} htmlFor={`${id}-location`}>
        <input id={`${id}-location`} value={profile.location ?? ''} onChange={(event) => onChange({ location: text(event.target.value) })} placeholder={copy.locationPlaceholder} maxLength={120} autoComplete="address-level2" aria-invalid={bad('location')} className={inputClass} />
      </Field>

      <fieldset className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <legend className="mb-1.5 text-[14px] font-medium text-ink">{copy.availability}</legend>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY.map((value) => {
            const selected = profile.availability === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ availability: selected ? null : value })}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  selected ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink hover:border-ink/40'
                }`}
              >
                {availability.find((item) => item.id === value)?.label ?? value}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-2 sm:col-span-2">
        <legend className={`mb-1.5 text-[14px] font-medium ${bad('workMode') ? 'text-amber-ink' : 'text-ink'}`}>{copy.workMode}</legend>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
          {WORK_MODES.map((value) => {
            const mode = workModes.find((item) => item.id === value)
            const selected = profile.workMode === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ workMode: selected ? null : value })}
                className={`flex flex-col items-start rounded-2xl px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  selected ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink hover:border-ink/40'
                }`}
              >
                <span className="text-[15px] font-medium">{mode?.label ?? value}</span>
                <span className={`text-[13px] ${selected ? 'text-white/70' : 'text-muted'}`}>{mode?.text}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <Field label={copy.about} optional={copy.optional} htmlFor={`${id}-about`}>
          <textarea id={`${id}-about`} value={profile.about ?? ''} onChange={(event) => onChange({ about: text(event.target.value) })} rows={6} maxLength={4_000} aria-invalid={bad('about')} className={textareaClass} />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label={copy.languages} optional={copy.optional} htmlFor={`${id}-languages`}>
          <TagInput
            id={`${id}-languages`}
            values={profile.languages}
            onChange={(languages) => onChange({ languages })}
            max={12}
            maxLength={40}
            placeholder={copy.languagesPlaceholder}
            addLabel={copy.add}
            removeLabel={copy.remove}
            invalid={bad('languages')}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Field label={copy.links} optional={copy.optional} hint={copy.linksHint} htmlFor={`${id}-links`}>
          <textarea
            id={`${id}-links`}
            value={linksText}
            onChange={(event) => {
              setLinksText(event.target.value)
              onChange({ links: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })
            }}
            rows={3}
            placeholder="https://"
            spellCheck={false}
            aria-invalid={bad('links')}
            className={textareaClass}
          />
        </Field>
      </div>
    </div>
  )
}
