import StatePOALanding from '@/components/StatePOALanding'
import { STATE_POA_DATA } from '@/lib/state-poa-data'

export const metadata = {
  title: 'Free Illinois Power of Attorney for Health Care — EasyEstatePlan',
  description:
    'Create a state-correct Illinois Power of Attorney for Health Care in minutes. Free, attorney-reviewed template that meets the Illinois Power of Attorney Act.',
}

export default function Page() {
  return <StatePOALanding info={STATE_POA_DATA.illinois} />
}
