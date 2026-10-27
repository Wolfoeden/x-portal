import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../globals.css'
import { inter } from '@/lib/fonts'
import { AuthStateScript } from '@/components/auth/auth-state-script'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { de } from '@/lib/i18n/de'
import { siteMetadata } from '@/lib/i18n/metadata'

export const metadata: Metadata = {
  ...siteMetadata,
  title: de.meta.home.title,
  description: de.meta.home.description,
}

// Root-Layout für Deutsch unter /. Nur das deutsche Wörterbuch geht an den Browser.
export default function GermanLayout({ children }: { children: ReactNode }) {
  return (
    // data-auth setzt das Skript vor dem Hydrieren, deshalb suppressHydrationWarning am <html>.
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <head>
        <AuthStateScript />
      </head>
      <body className="font-sans">
        <LocaleProvider locale="de" dict={de}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
