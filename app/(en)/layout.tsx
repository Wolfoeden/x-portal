import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../globals.css'
import { inter } from '@/lib/fonts'
import { AuthStateScript } from '@/components/auth/auth-state-script'
import { LocaleProvider } from '@/components/i18n/locale-provider'
import { en } from '@/lib/i18n/en'
import { siteMetadata } from '@/lib/i18n/metadata'

export const metadata: Metadata = {
  ...siteMetadata,
  title: en.meta.home.title,
  description: en.meta.home.description,
}

// Root-Layout für Englisch unter /en. Nur das englische Wörterbuch geht an den Browser.
export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    // data-auth setzt das Skript vor dem Hydrieren, deshalb suppressHydrationWarning am <html>.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <AuthStateScript />
      </head>
      <body className="font-sans">
        <LocaleProvider locale="en" dict={en}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
