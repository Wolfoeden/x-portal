import { Container } from '@/components/ui/primitives'
import { IDS, type IdKey, type Locale } from '@/lib/i18n/routes'

// Sprungleiste unter dem Hero langer Seiten (/investoren, /orte; Navigation vom 17.11.2026).
// Nicht klebend; auf dem Handy seitlich wischbar. Die Anker sind die bestehenden Abschnitts-IDs.
export function SectionNav({ locale, label, items }: { locale: Locale; label: string; items: { label: string; anchor: IdKey }[] }) {
  return (
    <nav aria-label={label} className="border-b border-line">
      <Container className="flex items-center gap-3 py-3">
        <span className="hidden shrink-0 text-[13px] text-faint sm:inline">{label}</span>
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {items.map((item) => (
            <li key={item.anchor} className="shrink-0">
              <a
                href={`#${IDS[locale][item.anchor]}`}
                className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-[14px] text-ink transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  )
}
