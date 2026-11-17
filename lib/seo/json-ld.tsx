import { getDictionary } from '@/lib/i18n/dictionary'
import { PAGES, type Locale, type PageKey } from '@/lib/i18n/routes'
import { SITE_URL } from '@/lib/site'

// Strukturierte Daten (schema.org) für Suchmaschinen und KI-Systeme, nach node_modules/next/dist/docs/01-app/02-guides/json-ld.md.
// Bewusst schlicht: Organisation, Website, Seite und FAQ. Kein Produkt- und kein Investment-Schema, keine genaue Lage von Node001.

type Thing = Record<string, unknown>
const abs = (path: string) => new URL(path, SITE_URL).toString()
const ORG_ID = `${SITE_URL.replace(/\/$/, '')}/#organisation`

/** Als <script type="application/ld+json">; „<“ wird maskiert, damit kein Text das Skript beenden kann. */
export function JsonLd({ data }: { data: Thing | Thing[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function siteLd(locale: Locale): Thing[] {
  const dict = getDictionary(locale)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'XPORTAL',
      url: abs('/'),
      logo: abs('/brand/xportal-wordmark.svg'),
      description: dict.seo.definition,
      knowsAbout: locale === 'de' ? ['KI-Projekte', 'KI-Freelancer', 'KI-Schulung nach EU AI Act', 'ISMS nach ISO 27001', 'Wohnen und Arbeiten in den Karpaten'] : ['AI projects', 'AI freelancers', 'AI training under the EU AI Act', 'ISMS to ISO 27001', 'Living and working in the Carpathians'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'XPORTAL',
      url: abs(PAGES.home[locale]),
      inLanguage: locale,
      publisher: { '@id': ORG_ID },
    },
  ]
}

/** Seite mit Titel, Beschreibung und Sprache; auf Orte und Freelancer zusätzlich die häufigen Fragen als FAQPage. */
export function pageLd(page: PageKey, locale: Locale): Thing[] {
  const dict = getDictionary(locale)
  const meta = dict.meta[page]
  const out: Thing[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      description: meta.description,
      url: abs(PAGES[page][locale]),
      inLanguage: locale,
      isPartOf: { '@type': 'WebSite', url: abs(PAGES.home[locale]) },
      about: { '@id': ORG_ID },
    },
  ]
  const faq = page === 'places' ? dict.places.faq.items : page === 'freelancer' ? dict.freelancer.faq.items : null
  if (faq) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: locale,
      mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    })
  }
  return out
}
