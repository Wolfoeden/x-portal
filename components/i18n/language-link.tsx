'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent, ReactNode } from 'react'
import { useLocale } from '@/components/i18n/locale-provider'
import { pageOf, pagePath, translateAnchor, translateTopic, type Locale } from '@/lib/i18n/routes'

/** Ziel des Sprachwechsels: dieselbe Seite in der anderen Sprache; ein bekannter Anker und das Kontaktthema werden mit übersetzt. */
export function useLanguageSwitch() {
  const pathname = usePathname()
  const { locale } = useLocale()
  const other: Locale = locale === 'de' ? 'en' : 'de'
  const href = pagePath(pageOf(pathname)?.page ?? 'home', other)
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const topic = translateTopic(window.location.search, locale, other)
    const anchor = translateAnchor(window.location.hash, locale, other)
    if (!topic && !anchor) return
    event.preventDefault()
    window.location.assign(`${href}${topic}${anchor}`)
  }
  return { href, other, onClick }
}

export function LanguageLink({ className, children }: { className?: string; children: ReactNode }) {
  const { href, other, onClick } = useLanguageSwitch()
  return (
    <Link href={href} onClick={onClick} hrefLang={other} lang={other} className={className}>
      {children}
    </Link>
  )
}
