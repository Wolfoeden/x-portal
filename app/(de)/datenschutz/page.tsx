import { LegalPage } from '@/components/legal/legal-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('privacy', 'de')

export default function Page() {
  return <LegalPage locale="de" kind="privacy" />
}
