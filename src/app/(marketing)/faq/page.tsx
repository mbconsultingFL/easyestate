import ContentPage from '@/components/ContentPage'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ — EasyEstatePlan',
  description:
    'Answers to common questions about using EasyEstatePlan, document validity, pricing, and privacy.',
}

interface QA {
  q: string
  a: React.ReactNode
}

const faqs: QA[] = [
  {
    q: 'Is the Healthcare Power of Attorney really free?',
    a: (
      <p>
        Yes. The Healthcare Power of Attorney is completely free, with no
        credit card required. You can assemble it, download it, and print it
        without paying anything. We make money from Pro subscribers who want
        access to additional document types and features.
      </p>
    ),
  },
  {
    q: 'Is this legally binding? Do I need a lawyer?',
    a: (
      <>
        <p>
          The documents we generate are state-correct templates reviewed by
          counsel. When executed properly — signed, witnessed, and/or notarized
          according to your state's rules — they are intended to be legally
          effective.
        </p>
        <p>
          That said, we are not a law firm and cannot guarantee the outcome in
          any particular situation. If your estate involves business interests,
          a special-needs beneficiary, blended-family disputes, or cross-border
          assets, consult a licensed attorney. See our{' '}
          <Link href="/disclaimer">Legal Disclaimer</Link> for the full picture.
        </p>
      </>
    ),
  },
  {
    q: 'Which states do you support?',
    a: (
      <p>
        We currently support California, Texas, Florida, New York, and
        Illinois. We are adding more states after per-state legal review — our
        goal is nationwide coverage by end of year.
      </p>
    ),
  },
  {
    q: 'How long does it take to create a document?',
    a: (
      <p>
        Most people finish in 10–15 minutes. The flow is primarily
        multiple-choice, so you rarely have to type. You can pause and resume
        at any time.
      </p>
    ),
  },
  {
    q: 'Do I need to print and sign, or can I sign digitally?',
    a: (
      <p>
        Most healthcare and advance-directive documents still require physical
        witnesses or notarization in most states. Where permitted, you can
        e-sign through DocuSign directly from your dashboard. Your document's
        signing guide explains exactly what your state requires.
      </p>
    ),
  },
  {
    q: 'What happens to my documents after I create them?',
    a: (
      <p>
        Free-tier documents remain available in your account so you can
        re-download them as needed. Pro subscribers also get secure long-term
        storage, version history, and annual review reminders. You can delete
        a document or your entire account at any time from your dashboard.
      </p>
    ),
  },
  {
    q: 'Can I share my document with my doctor or agent?',
    a: (
      <p>
        Yes. Once generated, you can download the PDF and share it directly
        with your chosen agents, your primary care physician, or your hospital
        of record. We recommend giving a signed copy to every person named in
        the document.
      </p>
    ),
  },
  {
    q: 'What if I change my mind? Can I update the document later?',
    a: (
      <p>
        Absolutely. You can revise your document at any time — changes of
        address, agent, or preferences are common. In most states, executing
        a new document revokes all previous versions. Destroy any old signed
        originals and distribute the new one to everyone who had the old one.
      </p>
    ),
  },
  {
    q: 'Do you store my Social Security Number or financial account numbers?',
    a: (
      <p>
        No. A Healthcare Power of Attorney does not require your SSN or
        account numbers, and we never ask for them. For Pro features like the
        beneficiary tracker, we only store the last four digits of any
        account number — enough to identify it, not enough to access it.
      </p>
    ),
  },
  {
    q: 'Will my family know how to use this document?',
    a: (
      <p>
        Each document ships with a plain-English signing guide for you and a
        one-page summary you can give to the people you name as agents. The
        summary explains what they can and cannot do on your behalf, and when
        their authority begins and ends.
      </p>
    ),
  },
  {
    q: 'What does EasyEstatePlan Pro include?',
    a: (
      <p>
        Pro unlocks additional document types (financial power of attorney,
        living will, simple will, and more as we roll them out), secure
        long-term storage, unlimited re-downloads, annual review reminders,
        and a beneficiary tracker that consolidates your accounts and
        designated beneficiaries in one place. It is $9.99/month or $89/year.
      </p>
    ),
  },
  {
    q: 'How do I cancel?',
    a: (
      <p>
        From your dashboard, go to Account → Subscription → Cancel. Cancellation
        takes effect at the end of your current billing period and you keep
        access to Pro features until then. Your free Healthcare POA remains
        available either way.
      </p>
    ),
  },
  {
    q: 'How do I delete my account and data?',
    a: (
      <p>
        Email <a href="mailto:privacy@easyestateplan.com">privacy@easyestateplan.com</a>{' '}
        from your registered address and we will confirm and delete within 30
        days. See our <Link href="/privacy">Privacy Policy</Link> for the full
        data-lifecycle details.
      </p>
    ),
  },
]

export default function FaqPage() {
  return (
    <ContentPage
      title="Frequently asked questions"
      subtitle="Short answers to the questions we hear most often. Still stuck? Email support@easyestateplan.com."
    >
      <div className="not-prose space-y-4">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-gray-200 bg-white open:bg-white open:shadow-sm transition"
          >
            <summary className="list-none flex items-start justify-between gap-4 cursor-pointer px-5 py-4">
              <span className="font-medium text-gray-900 text-[15px] sm:text-base">
                {item.q}
              </span>
              <span
                aria-hidden
                className="shrink-0 mt-1 w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 group-open:rotate-45 transition"
              >
                +
              </span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-600 text-[15px] space-y-3 leading-relaxed">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </ContentPage>
  )
}
