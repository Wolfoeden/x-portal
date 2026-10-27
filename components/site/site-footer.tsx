import Link from 'next/link'
import { Wordmark } from '@/components/brand/logo'
import { Container } from '@/components/ui/primitives'
import { LanguageLink } from '@/components/i18n/language-link'
import { getDictionary } from '@/lib/i18n/dictionary'
import { pageHref, type Locale } from '@/lib/i18n/routes'

export function SiteFooter({ locale }: { locale: Locale }) {
  const text = getDictionary(locale).footer
  return (
    <footer id="site-footer" className="border-t border-line">
      <Container className="flex flex-col gap-14 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <Wordmark className="h-[17px] w-[120px] text-ink" title="XPORTAL" />
            <p className="max-w-[280px] text-[14px] leading-relaxed text-muted">{text.tagline}</p>
          </div>
          {text.columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2.5">
              <p className="text-[14px] font-medium text-ink">{column.title}</p>
              {column.links.map((link) => (
                <Link key={link.label} href={pageHref(link.page, locale, link.anchor)} className="text-[14px] text-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[13px] text-faint">
          <p>{text.legal}</p>
          <LanguageLink className="transition-colors hover:text-ink">{text.otherLanguage}</LanguageLink>
        </div>
      </Container>
    </footer>
  )
}
