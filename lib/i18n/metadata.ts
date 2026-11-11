import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n/dictionary'
import { PAGES, type Locale, type PageKey } from '@/lib/i18n/routes'
import { SITE_INDEXABLE, SITE_URL } from '@/lib/site'

/** Titel, Beschreibung, Canonical und hreflang einer Seite. x-default zeigt auf Deutsch. */
export function pageMetadata(page: PageKey, locale: Locale): Metadata {
  const meta = getDictionary(locale).meta[page]
  const paths = PAGES[page]
  // Vorschaubild beim Teilen (WhatsApp, LinkedIn, Telegram …): für Orte das Drohnenbild, sonst das Logo. Erzeugt als feste Bilder in public/og.
  const image = { url: `/og/${page === 'places' ? 'orte' : 'xportal'}-${locale}.jpg`, width: 1200, height: 630, alt: meta.title }
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: paths[locale],
      languages: { de: paths.de, en: paths.en, 'x-default': paths.de },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: paths[locale],
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      siteName: 'XPORTAL',
      type: 'website',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description, images: [image.url] },
  }
}

/** Gemeinsame Basis beider Root-Layouts. Vorschau und Staging bleiben noindex. */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(SITE_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
}
