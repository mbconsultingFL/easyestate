import ContentPage from '@/components/ContentPage'

export const metadata = {
  title: 'Legal Disclaimer — EasyEstatePlan',
  description:
    'EasyEstatePlan is not a law firm and does not provide legal advice.',
}

export default function DisclaimerPage() {
  return (
    <ContentPage
      title="Legal Disclaimer"
      subtitle="Please read this before using EasyEstatePlan."
      lastUpdated="April 17, 2026"
    >
      <h2>Not a law firm</h2>
      <p>
        EasyEstatePlan is an online self-help tool that assembles documents
        based on the information you provide. <strong>We are not a law firm,
        we do not provide legal advice, and using our service does not create
        an attorney–client relationship.</strong> Communications with our
        support team are not protected by attorney–client privilege.
      </p>

      <h2>When you should consult an attorney</h2>
      <p>
        Our documents are designed for typical individual situations. You should
        consult a licensed attorney in your state if any of the following apply:
      </p>
      <ul>
        <li>You have a blended family, estranged children, or anticipate disputes.</li>
        <li>Your estate includes a business interest, substantial real estate, or assets above the federal estate-tax exemption.</li>
        <li>You have a beneficiary with special needs or receiving public benefits.</li>
        <li>You own property in multiple states or countries.</li>
        <li>You are under conservatorship, in the process of divorce, or subject to a court order that affects your property.</li>
        <li>Your health is rapidly declining and you are not certain you have capacity to execute the document.</li>
      </ul>

      <h2>No guarantee of outcome</h2>
      <p>
        State laws vary and change. Our templates are reviewed periodically but
        we cannot guarantee that a given document will be accepted by any
        particular hospital, financial institution, court, or counterparty. The
        document you generate must still be executed (signed, witnessed, and
        notarized as required by your state) to be effective.
      </p>

      <h2>You are responsible for accuracy</h2>
      <p>
        We assemble your document based on the answers you provide. We do not
        verify those answers. You are responsible for ensuring that the names,
        addresses, dates, and instructions in the final document are correct
        before you sign it.
      </p>

      <h2>Document formalities</h2>
      <p>
        Each state has its own rules for how a valid document must be executed.
        Your document will include a signing guide explaining the requirements
        for your state, but ultimately <strong>it is your responsibility</strong>{' '}
        to follow those formalities. An unsigned or improperly witnessed
        document is not legally effective.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about these limits, contact{' '}
        <a href="mailto:support@easyestateplan.com">support@easyestateplan.com</a>{' '}
        before proceeding.
      </p>
    </ContentPage>
  )
}
