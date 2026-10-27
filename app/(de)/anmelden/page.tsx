import type { Metadata } from 'next'
import { SignInPage } from '@/components/pages/sign-in-page'
import { pageMetadata } from '@/lib/i18n/metadata'

// Anmelden und Konto sind nie in Suchmaschinen.
export const metadata: Metadata = { ...pageMetadata('signIn', 'de'), robots: { index: false, follow: false } }

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <SignInPage locale="de" searchParams={searchParams} />
}
