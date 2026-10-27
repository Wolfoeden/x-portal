import { InvestorsPage } from '@/components/pages/investors-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('investors', 'de')

export default function Page() {
  return <InvestorsPage locale="de" />
}
