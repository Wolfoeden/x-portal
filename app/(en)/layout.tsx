import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../globals.css'
import { inter } from '@/lib/fonts'
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <LocaleProvider locale="en" dict={en}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
