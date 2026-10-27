'use client'

import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowUp } from 'lucide-react'
import { Container } from '@/components/ui/primitives'
import { useDraft } from '@/components/freelancer/draft-context'
import { ProfileCard } from '@/components/freelancer/profile-card'
import { completeness } from '@/lib/freelancer/profile'
import { useLocale } from '@/components/i18n/locale-provider'
import { fill } from '@/lib/i18n/format'

/** Abschluss: greift den eigenen Stand auf und führt zurück zum Assistenten. */
export function Closer() {
  const { draft, own, startOwn } = useDraft()
  const reduceMotion = useReducedMotion()
  const { dict, ids } = useLocale()
  const copy = dict.freelancer.closer
  const percent = completeness(draft)
  const title = !own ? copy.titleStart : percent >= 100 ? copy.titleReady : fill(copy.titlePartial, { percent })
  const action = !own || percent >= 100 ? copy.create : copy.continue

  const go = () => {
    startOwn()
    document.getElementById(ids.profile)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <section className="pb-28 md:pb-36" aria-labelledby="abschluss-title">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 overflow-hidden rounded-[36px] bg-brand-deep p-8 text-white sm:p-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:p-16">
          <div className="flex flex-col gap-6">
            <h2 id="abschluss-title" className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-balance">
              {title}
            </h2>
            <p className="max-w-[420px] text-[17px] leading-relaxed text-[#bfd8c8]">{copy.text}</p>
            <button
              type="button"
              onClick={go}
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-ink transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {action}
              <ArrowUp aria-hidden size={17} strokeWidth={2} />
            </button>
          </div>
          <div aria-hidden className="hidden rotate-[-2deg] lg:block">
            <ProfileCard draft={draft} />
          </div>
        </div>
      </Container>
    </section>
  )
}
