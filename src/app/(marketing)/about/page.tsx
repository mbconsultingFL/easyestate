import ContentPage from '@/components/ContentPage'
import Link from 'next/link'

export const metadata = {
  title: 'About — EasyEstatePlan',
  description:
    'Why EasyEstatePlan exists, who it is for, and how we think about estate planning.',
}

export default function AboutPage() {
  return (
    <ContentPage
      title="About EasyEstatePlan"
      subtitle="Estate planning should be straightforward, affordable, and respectful of the people using it."
    >
      <h2>Why we built this</h2>
      <p>
        Most adults know they should have an advance directive, a power of
        attorney, and a will. Very few actually do. The reason is not
        indifference — it is friction. Attorneys are expensive, calendars fill
        up, forms are intimidating, and the cost of being wrong is high. So the
        documents that matter most often never get made.
      </p>
      <p>
        We started EasyEstatePlan to compress that friction into a conversation
        you can finish on your phone over coffee. Answer a few questions in plain
        English, and get a state-correct document you can sign, notarize, and
        share with the people who need it.
      </p>

      <h2>What we do</h2>
      <p>
        We assemble personal estate planning documents — starting with the
        Healthcare Power of Attorney, free, for anyone who needs one. Pro
        subscribers get additional document types (financial POA, living will,
        simple will, beneficiary tracker), secure storage, and annual review
        reminders.
      </p>

      <h2>What we are not</h2>
      <p>
        We are not a law firm and we do not give legal advice. For simple
        situations our tools are often the fastest and most affordable path to
        a valid document. For complex ones — significant assets, blended
        families, special-needs beneficiaries, business interests — you should
        consult a qualified attorney. We will tell you clearly when that applies.
      </p>

      <h2>How we work</h2>
      <p>
        Our templates are authored with counsel, reviewed state by state before
        a state becomes available, and updated when laws change. Your data is
        encrypted in transit and at rest; we never sell it, and we never use
        the contents of your documents to train anything. More on that on our{' '}
        <Link href="/security">security page</Link>.
      </p>

      <h2>Who we are</h2>
      <p>
        EasyEstatePlan is built by a small team who believe adults should own
        their planning without begging the legal system for permission. We are
        based in the United States. You can reach us anytime at{' '}
        <a href="mailto:hello@easyestateplan.com">hello@easyestateplan.com</a>.
      </p>
    </ContentPage>
  )
}
