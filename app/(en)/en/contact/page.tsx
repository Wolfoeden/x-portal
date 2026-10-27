import { ContactPage } from '@/components/pages/contact-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('contact', 'en')

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ContactPage locale="en" searchParams={searchParams} />
}
