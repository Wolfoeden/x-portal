import type { MetadataRoute } from 'next'
import { LOCALES, PAGES, type PageKey } from '@/lib/i18n/routes'
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site'

// Öffentliche Seiten in beiden Sprachen mit hreflang. Anmelden und Konto gehören nicht hinein.
// Vorschau und Staging (nicht indexierbar) bekommen eine leere Sitemap.
const PUBLIC: PageKey[] = ['home', 'freelancer', 'investors', 'places', 'contact', 'imprint', 'privacy']

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_INDEXABLE) return []
  const abs = (path: string) => new URL(path, SITE_URL).toString()
  return PUBLIC.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: abs(PAGES[page][locale]),
      alternates: { languages: { de: abs(PAGES[page].de), en: abs(PAGES[page].en) } },
      priority: page === 'home' ? 1 : page === 'imprint' || page === 'privacy' ? 0.2 : 0.8,
    })),
  )
}
