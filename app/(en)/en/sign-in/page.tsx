import type { Metadata } from 'next'
import { SignInPage } from '@/components/pages/sign-in-page'
import { pageMetadata } from '@/lib/i18n/metadata'

// Sign-in and account pages are never indexed.
export const metadata: Metadata = { ...pageMetadata('signIn', 'en'), robots: { index: false, follow: false } }

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <SignInPage locale="en" searchParams={searchParams} />
}
