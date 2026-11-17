import { LegalPage } from '@/components/legal/legal-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('imprint', 'de')

export default function Page() {
  return <LegalPage locale="de" kind="imprint" />
}
