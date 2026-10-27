import Image from 'next/image'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, type Locale } from '@/lib/i18n/routes'

// Namen und Fotos der übrigen Rollen liefert der Nutzer nach.
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
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
          {copy.people.map((person) => (
            <li key={person.role} className="flex flex-col gap-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-surface">
                {person.photo ? (
                  <Image src={person.photo} alt={person.name} fill sizes="(min-width: 1024px) 240px, 50vw" className="object-cover grayscale" />
                ) : (
                  <div className="grid size-full place-items-center">
                    <span className="text-[13px] text-faint">{copy.photoPending}</span>
                  </div>
                )}
              </div>
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
