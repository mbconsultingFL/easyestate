import StatePOALanding from '@/components/StatePOALanding'
import { STATE_POA_DATA } from '@/lib/state-poa-data'

export const metadata = {
  title: 'Free New York Health Care Proxy — EasyEstatePlan',
  description:
    'Create a state-correct New York Health Care Proxy in minutes. Free, attorney-reviewed template that meets N.Y. Public Health Law §2981.',
}

export default function Page() {
  return <StatePOALanding info={STATE_POA_DATA['new-york']} />
}
