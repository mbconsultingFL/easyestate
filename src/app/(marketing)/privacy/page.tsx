import ContentPage from '@/components/ContentPage'

export const metadata = {
  title: 'Privacy Policy — EasyEstatePlan',
  description:
    'How EasyEstatePlan collects, uses, and protects your personal information when you create estate planning documents.',
}

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      subtitle="How we handle your personal information when you create estate planning documents with EasyEstatePlan."
      lastUpdated="April 17, 2026"
    >
      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4">
        <strong>Draft notice:</strong> This policy is a working draft pending
        review by counsel. The operating practices it describes are accurate,
        but the legal language will be finalized before public launch.
      </div>

      <h2>Overview</h2>
      <p>
        EasyEstatePlan ("we," "us," or "the Service") helps individuals assemble
        personal estate planning documents such as healthcare powers of attorney.
        Because these documents are intimate and legally significant, we treat
        the information you share with us with a high degree of care. This
        policy explains what we collect, why we collect it, and the choices you
        have.
      </p>

      <h2>Information we collect</h2>
      <h3>Account information</h3>
      <p>
        When you register we collect your name, email address, and a hashed
        password. We never store passwords in plain text.
      </p>

      <h3>Document information</h3>
      <p>
        To generate your documents we ask you questions about your health care
        preferences, agents, and beneficiaries. This may include the names and
        contact information of people you designate, details about your medical
        wishes, and the state in which your document should be valid. You provide
        this information voluntarily and can delete it from your account at any
        time.
      </p>

      <h3>Billing information</h3>
      <p>
        If you subscribe to EasyEstatePlan Pro, payment is processed by Stripe.
        We receive a limited record of your subscription status and the last
        four digits of your payment method for support purposes, but we do not
        store full payment card numbers on our systems.
      </p>

      <h3>Technical information</h3>
      <p>
        We collect standard server logs (IP address, browser, timestamps) and
        use first-party cookies strictly necessary for authentication. We do
        not use third-party advertising cookies.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To generate and deliver the documents you request.</li>
        <li>To authenticate your account and prevent unauthorized access.</li>
        <li>To process subscription payments and provide customer support.</li>
        <li>To send transactional emails (such as document-ready notifications or review reminders).</li>
        <li>To improve the service and diagnose technical issues.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information, and we do not
        use the contents of your estate planning documents for marketing or
        training machine-learning models.
      </p>

      <h2>Sharing</h2>
      <p>We share information only with the limited set of vendors needed to run the service:</p>
      <ul>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>DocuSign</strong> — electronic signature, when you choose to use it.</li>
        <li><strong>Our hosting and email providers</strong> — solely to deliver the service.</li>
      </ul>
      <p>
        We may also disclose information if required by law, to comply with
        valid legal process, or to protect the rights, property, or safety of
        our users or the public.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>You can access, update, or delete the information in your account at any time from your dashboard.</li>
        <li>You can request a full export or deletion by emailing <a href="mailto:privacy@easyestateplan.com">privacy@easyestateplan.com</a>.</li>
        <li>If you are a California, Virginia, Colorado, or Connecticut resident, you have additional rights under applicable state privacy laws, including the right to opt out of certain processing.</li>
      </ul>

      <h2>Retention</h2>
      <p>
        We retain your documents and account data for as long as you maintain
        an active account so you can re-download or revise them. If you delete
        your account we remove your personal data within 30 days, except where
        we are required to retain records (for example, payment records) to
        comply with law.
      </p>

      <h2>Security</h2>
      <p>
        We encrypt data in transit with TLS and at rest, scope access within
        our team to personnel who need it, and review our security practices
        regularly. No system is perfectly secure, but we work continuously to
        harden ours. See our <a href="/security">Security</a> page for more
        detail.
      </p>

      <h2>Children</h2>
      <p>
        EasyEstatePlan is intended for adults 18 years of age or older. We do
        not knowingly collect information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We will post updates to this page and, for material changes, notify
        account holders by email at least 30 days before the change takes
        effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be directed to{' '}
        <a href="mailto:privacy@easyestateplan.com">privacy@easyestateplan.com</a>.
      </p>
    </ContentPage>
  )
}
