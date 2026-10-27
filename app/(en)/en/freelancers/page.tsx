import { FreelancerPage } from '@/components/pages/freelancer-page'
import { pageMetadata } from '@/lib/i18n/metadata'

export const metadata = pageMetadata('freelancer', 'en')

export default function Page() {
  return <FreelancerPage locale="en" />
}
