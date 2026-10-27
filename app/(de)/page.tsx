import { HomePage } from '@/components/pages/home-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('home', 'de')

export default function Page() {
  return <HomePage locale="de" />
}
