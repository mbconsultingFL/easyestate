import StatePOALanding from '@/components/StatePOALanding'
import { STATE_POA_DATA } from '@/lib/state-poa-data'

export const metadata = {
  title: 'Free California Advance Health Care Directive — EasyEstatePlan',
  description:
    'Create a state-correct California Advance Health Care Directive in minutes. Free, attorney-reviewed template that meets Probate Code §4670 et seq.',
}

export default function Page() {
  return <StatePOALanding info={STATE_POA_DATA.california} />
}
