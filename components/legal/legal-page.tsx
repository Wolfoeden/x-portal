import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Container } from '@/components/ui/primitives'
import { getDictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/routes'
import { JsonLd, pageLd } from '@/lib/seo/json-ld'

/** Platzhalter stehen als ⟦…⟧ im Wörterbuch und werden sichtbar markiert, bis die Daten da sind (scripts/go-live-check.ts findet sie). */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(⟦[^⟧]*⟧)/).map((part, index) =>
        part.startsWith('⟦') ? (
          <mark key={index} className="rounded bg-amber-soft px-1 text-amber-ink">
            {part.slice(1, -1)}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** Impressum und Datenschutz. Inhalt im Wörterbuch unter legal. */
export function LegalPage({ locale, kind }: { locale: Locale; kind: 'imprint' | 'privacy' }) {
  const legal = getDictionary(locale).legal
  const copy = legal[kind]
  return (
    <>
      <JsonLd data={pageLd(kind, locale)} />
      <SiteHeader />
      <main>
        <Container className="max-w-[860px] py-20 md:py-28">
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-medium leading-none tracking-[-0.04em] text-ink">{copy.title}</h1>
          <p className="mt-5 max-w-[640px] text-[17px] leading-relaxed text-muted">{copy.intro}</p>
          <p role="note" className="mt-6 rounded-2xl bg-amber-soft px-4 py-3 text-[14px] text-amber-ink">
            {legal.draft}
          </p>
          <div className="mt-12 flex flex-col">
            {copy.sections.map((section) => (
              <section id={section.title.startsWith('Cookies') ? 'cookies' : undefined} key={section.title} className="grid grid-cols-[minmax(0,1fr)] gap-2 border-t border-line py-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
                <h2 className="text-[16px] font-medium text-ink">{section.title}</h2>
                <div className="flex flex-col gap-3 text-[15.5px] leading-relaxed text-muted">
                  {section.lines.map((line) => (
                    <p key={line}>
                      <Marked text={line} />
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
