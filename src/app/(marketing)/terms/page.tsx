import ContentPage from '@/components/ContentPage'

export const metadata = {
  title: 'Terms of Service — EasyEstatePlan',
  description:
    'The terms and conditions governing your use of EasyEstatePlan.',
}

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      subtitle="The agreement that governs your use of EasyEstatePlan."
      lastUpdated="April 17, 2026"
    >
      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4">
        <strong>Draft notice:</strong> These terms are a working draft pending
        review by counsel before public launch.
      </div>

      <h2>1. Acceptance</h2>
      <p>
        By creating an account or using EasyEstatePlan (the "Service"), you
        agree to these Terms of Service. If you do not agree, do not use the
        Service.
      </p>

      <h2>2. Not legal advice</h2>
      <p>
        EasyEstatePlan is <strong>not a law firm</strong>, is not a substitute
        for the advice of an attorney, and does not provide legal advice. The
        information and documents we provide are for general informational
        purposes only and may not address every nuance of your personal
        situation. Only a licensed attorney in your jurisdiction can advise
        you on legal matters. If your situation is complex (significant assets,
        blended families, special-needs beneficiaries, business interests, or
        cross-border issues) you should consult a qualified attorney.
      </p>

      <h2>3. Eligibility</h2>
      <p>
        You must be at least 18 years old and mentally competent to use the
        Service and to execute the documents it generates.
      </p>

      <h2>4. Your account</h2>
      <p>
        You are responsible for keeping your login credentials confidential and
        for all activity on your account. Notify us immediately at{' '}
        <a href="mailto:support@easyestateplan.com">support@easyestateplan.com</a>{' '}
        if you believe your account has been compromised.
      </p>

      <h2>5. Documents you create</h2>
      <p>
        You are solely responsible for the accuracy of the information you
        provide and for reviewing every document before executing it. You are
        also responsible for executing the document according to the formalities
        required by your state — typically signing in front of a notary or
        witnesses as specified on the document. A document that is unsigned or
        improperly witnessed is not legally effective.
      </p>

      <h2>6. Subscription and payments</h2>
      <p>
        The Healthcare Power of Attorney is free. Additional document types
        and features are available through EasyEstatePlan Pro, a recurring
        subscription. Subscriptions renew automatically until cancelled. You
        can cancel at any time from your dashboard; cancellation takes effect
        at the end of the current billing period.
      </p>
      <p>
        All fees are non-refundable except where required by law. We may change
        pricing with at least 30 days' notice to active subscribers.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service to create documents for anyone other than yourself without their consent.</li>
        <li>Submit false or misleading information.</li>
        <li>Attempt to interfere with, disrupt, or gain unauthorized access to the Service.</li>
        <li>Use the Service in violation of any applicable law.</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        The Service, its software, document templates, and content are owned
        by EasyEstatePlan and protected by applicable intellectual-property
        laws. You retain ownership of the personal information and document
        content you provide, and you grant us a limited license to process it
        for the purpose of operating the Service.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF
        ANY KIND. WE DO NOT GUARANTEE THAT A PARTICULAR DOCUMENT WILL BE
        ACCEPTED BY A SPECIFIC INSTITUTION, HOSPITAL, OR COURT, OR THAT IT WILL
        BE VALID IN ANY PARTICULAR FACT PATTERN.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, EASYESTATEPLAN AND ITS AFFILIATES
        WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
        DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE IS
        LIMITED TO THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE CLAIM
        AROSE.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may close your account at any time. We may suspend or terminate
        access to the Service if you violate these Terms or if required for
        security or legal reasons. Sections intended to survive termination
        (including Sections 2, 8, 9, 10, and 12) will continue to apply.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, without
        regard to its conflict-of-laws rules, and disputes will be resolved in
        the state or federal courts located in Delaware, except where applicable
        consumer-protection law provides otherwise.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these Terms from time to time. We will post the revised
        version on this page and, for material changes, email account holders
        at least 30 days before the change takes effect.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms can be directed to{' '}
        <a href="mailto:support@easyestateplan.com">support@easyestateplan.com</a>.
      </p>
    </ContentPage>
  )
}
