import { de } from '@/lib/i18n/de'
import { en } from '@/lib/i18n/en'
import { PAGES, type PageKey } from '@/lib/i18n/routes'
import { SITE_URL } from '@/lib/site'

// /llms.txt: kurze Einordnung für KI-Systeme (Vorschlag llmstxt.org), deutsch und englisch.
// Erzeugt aus den Wörterbüchern, damit Definition, Seiten und Fakten nicht von der Website abweichen.
export const dynamic = 'force-static'

const PAGES_LISTED: PageKey[] = ['home', 'freelancer', 'investors', 'places', 'contact', 'imprint', 'privacy']

function block(dict: typeof de, locale: 'de' | 'en') {
  const abs = (path: string) => new URL(path, SITE_URL).toString()
  return [
    `> ${dict.seo.definition}`,
    '',
    `## ${dict.seo.factsTitle}`,
    ...dict.seo.facts.map((fact) => `- ${fact}`),
    '',
    `## ${dict.seo.pagesTitle}`,
    ...PAGES_LISTED.map((page) => `- [${dict.meta[page].title}](${abs(PAGES[page][locale])}): ${dict.meta[page].description}`),
    '',
    dict.seo.asOf,
  ].join('\n')
}

export function GET() {
  const body = ['# XPORTAL', '', block(de, 'de'), '', '---', '', '# XPORTAL (English)', '', block(en, 'en'), ''].join('\n')
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
