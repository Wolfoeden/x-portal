import { FreelancerPage } from '@/components/pages/freelancer-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('freelancer', 'de')

export default function Page() {
  return <FreelancerPage locale="de" />
}
