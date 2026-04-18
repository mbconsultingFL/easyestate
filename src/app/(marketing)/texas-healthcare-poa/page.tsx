import StatePOALanding from '@/components/StatePOALanding'
import { STATE_POA_DATA } from '@/lib/state-poa-data'

export const metadata = {
  title: 'Free Texas Medical Power of Attorney — EasyEstatePlan',
  description:
    'Create a state-correct Texas Medical Power of Attorney in minutes. Free, attorney-reviewed template that meets the Texas Advance Directives Act.',
}

export default function Page() {
  return <StatePOALanding info={STATE_POA_DATA.texas} />
}
