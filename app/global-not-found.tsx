import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { inter } from '@/lib/fonts'
import { Wordmark } from '@/components/brand/logo'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden · Page not found · XPORTAL',
}

// Gilt für beide Sprachen, weil es zwei Root-Layouts gibt; deshalb zweisprachig.
export default function GlobalNotFound() {
  return (
    <html lang="de" className={inter.variable}>
      <body className="font-sans">
        <main className="mx-auto flex min-h-svh w-full max-w-[720px] flex-col justify-center gap-10 px-5 py-16 md:px-8">
          <Wordmark className="h-7 w-auto self-start text-ink" title="XPORTAL" />
          <div className="flex flex-col gap-4">
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.04em] text-ink">Diese Seite gibt es nicht.</h1>
            <p lang="en" className="text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight tracking-[-0.02em] text-muted">
              This page doesn’t exist.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex h-12 items-center rounded-full bg-brand px-6 text-[15px] font-medium text-white transition-colors hover:bg-brand-hover">
              Zur Startseite
            </Link>
            <Link href="/en" hrefLang="en" lang="en" className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-[15px] font-medium text-ink transition-colors hover:border-ink/40">
              Go to the English site
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
