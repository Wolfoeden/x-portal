import { LegalPage } from '@/components/legal/legal-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('imprint', 'en')

export default function Page() {
  return <LegalPage locale="en" kind="imprint" />
}
