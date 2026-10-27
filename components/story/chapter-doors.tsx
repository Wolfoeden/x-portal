import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { ChapterLabel, chapterTitle } from '@/components/story/talent-avatar'
import { getDictionary } from '@/lib/i18n/dictionary'
import { IDS, pageHref, type IdKey, type Locale, type PageKey } from '@/lib/i18n/routes'
import type { Door } from '@/lib/i18n/types'

// Gestaltung je Tür; die Texte stehen im Wörterbuch.
const looks = {
  companies: { page: 'home', anchor: 'project', look: 'border border-line bg-white text-ink', sub: 'text-muted', button: 'bg-ink text-white group-hover:bg-brand' },
  freelancers: { page: 'freelancer', look: 'bg-brand-soft text-ink', sub: 'text-brand-ink/80', button: 'bg-brand text-white group-hover:bg-brand-hover' },
  investors: { page: 'investors', anchor: 'deck', look: 'bg-brand-deep text-white', sub: 'text-[#bfd8c8]', button: 'bg-white text-ink group-hover:bg-brand-soft' },
} satisfies Record<Door['key'], { page: PageKey; anchor?: IdKey; look: string; sub: string; button: string }>

export function ChapterDoors({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).home.doors
  const ids = IDS[locale]
  return (
    <section id={ids.start} className="scroll-mt-16 py-28 md:py-36" aria-labelledby="einstieg-title">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col gap-5">
          <ChapterLabel number="06">{copy.label}</ChapterLabel>
          <h2 id="einstieg-title" className={`${chapterTitle} text-ink`}>
            {copy.title}
          </h2>
        </div>
        <ul className="flex flex-col gap-3 lg:h-[460px] lg:flex-row">
          {copy.doors.map((door) => {
            const look = looks[door.key]
            const anchor: IdKey | undefined = 'anchor' in look ? look.anchor : undefined
            const id = ids[door.key === 'companies' ? 'doorCompanies' : door.key === 'freelancers' ? 'doorFreelancers' : 'doorInvestors']
            return (
            <li key={door.key} id={id} className="scroll-mt-24 lg:flex-1 lg:transition-[flex-grow] lg:duration-500 lg:ease-out lg:hover:flex-[1.35]">
              <Link
                href={pageHref(look.page, locale, anchor)}
                className={`group flex h-full min-h-[260px] flex-col justify-between rounded-[28px] p-7 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:p-9 ${look.look}`}
              >
                <p className={`text-[14px] font-medium ${look.sub}`}>{door.who}</p>
                <div className="flex flex-col gap-4">
                  <p className="text-[clamp(2rem,3.4vw,3rem)] font-medium leading-[1.02] tracking-[-0.035em]">{door.title}</p>
                  <p className={`max-w-[320px] text-[16px] leading-relaxed ${look.sub}`}>{door.text}</p>
                  <span className={`mt-2 inline-flex h-11 w-fit items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors ${look.button}`}>
                    {door.action}
                    <ArrowRight aria-hidden size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
