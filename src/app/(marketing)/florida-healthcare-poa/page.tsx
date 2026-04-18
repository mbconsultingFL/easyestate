import StatePOALanding from '@/components/StatePOALanding'
import { STATE_POA_DATA } from '@/lib/state-poa-data'

export const metadata = {
  title: 'Free Florida Designation of Health Care Surrogate — EasyEstatePlan',
  description:
    'Create a state-correct Florida Designation of Health Care Surrogate in minutes. Free, attorney-reviewed template that meets Fla. Stat. §765.202.',
}

export default function Page() {
  return <StatePOALanding info={STATE_POA_DATA.florida} />
}
