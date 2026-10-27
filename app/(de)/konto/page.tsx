import type { Metadata } from 'next'
import { AccountPage } from '@/components/pages/account-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata: Metadata = { ...pageMetadata('account', 'de'), robots: { index: false, follow: false } }

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <AccountPage locale="de" searchParams={searchParams} />
}
