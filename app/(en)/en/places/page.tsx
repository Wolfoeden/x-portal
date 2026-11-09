import { PlacesPage } from '@/components/places/places-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('places', 'en')

export default function Page() {
  return <PlacesPage locale="en" />
}
