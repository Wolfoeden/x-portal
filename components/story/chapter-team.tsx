import Image from 'next/image'
import { LinkedInLogo } from '@/components/brand/channel-logos'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { fill } from '@/lib/i18n/format'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Fotos der übrigen Rollen liefert der Nutzer nach. Mit LinkedIn-Adresse verlinkt das Foto dorthin.

/** „Pavel J.“ → „PJ“ */
function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, '').charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ChapterTeam({ locale, number = '07' }: { locale: Locale; number?: string }) {
  const copy = getDictionary(locale).team
  return (
    <section id={IDS[locale].team} className="scroll-mt-16 pb-28 pt-12 md:pb-36" aria-labelledby="team-title">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-5">
          <ChapterLabel number={number}>{copy.label}</ChapterLabel>
          <h2 id="team-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {copy.people.map((person) => (
            <li key={person.role} className="flex flex-col gap-3">
              {person.photo && person.linkedin ? (
                // Mit LinkedIn: Das Foto ist der Link. Beim Darüberfahren wird es farbig und zeigt den Hinweis.
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={fill(copy.linkedinLabel, { name: person.name })}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <Image src={person.photo} alt={person.name} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0" />
                  <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-white/95 px-3 py-2 text-[13.5px] font-medium text-ink opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <LinkedInLogo className="size-4" />
                    LinkedIn
                  </span>
                </a>
              ) : (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-surface">
                  {person.photo ? (
                    <Image src={person.photo} alt={person.name} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover grayscale" />
                  ) : (
                    // Bis das Foto da ist: Initialen in Markengrün statt eines leeren Kastens.
                    <div aria-hidden className="grid size-full place-items-center bg-brand-soft">
                      <span className="text-[clamp(2.5rem,6vw,4rem)] font-medium tracking-[-0.04em] text-brand-ink">{initials(person.name)}</span>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className={`text-[16px] font-medium ${person.pending ? 'text-faint' : 'text-ink'}`}>{person.name}</p>
                <p className="text-[14px] text-muted">{person.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
