import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { ContactSection } from '@/components/contact/contact-section'
import { topicFromSearch } from '@/lib/contact/topics'
import type { Locale } from '@/lib/i18n/routes'

type Search = Record<string, string | string[] | undefined>

export async function ContactPage({ locale, searchParams }: { locale: Locale; searchParams: Promise<Search> }) {
  const search = await searchParams
  const params = new URLSearchParams(Object.entries(search).flatMap(([key, value]) => (typeof value === 'string' ? [[key, value]] : [])))
  return (
    <>
      <SiteHeader />
      <main>
        <ContactSection topic={topicFromSearch(params, locale)} />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
