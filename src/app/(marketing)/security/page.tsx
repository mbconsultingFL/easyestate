import ContentPage from '@/components/ContentPage'

export const metadata = {
  title: 'Security — EasyEstatePlan',
  description:
    'How EasyEstatePlan protects your account and your estate planning documents.',
}

export default function SecurityPage() {
  return (
    <ContentPage
      title="Security"
      subtitle="How we protect your account and your documents."
    >
      <p>
        Your estate planning documents are among the most sensitive records you
        will ever create. We treat them that way. This page describes the
        controls we have in place today and the ones we are working toward.
      </p>

      <h2>Transport and storage</h2>
      <ul>
        <li>All traffic between your browser and our servers is encrypted over TLS 1.2+.</li>
        <li>Stored documents and database records are encrypted at rest.</li>
        <li>Generated PDFs are kept in a private, access-controlled object store.</li>
      </ul>

      <h2>Authentication</h2>
      <ul>
        <li>Passwords are hashed using bcrypt with a per-account salt. Plain-text passwords are never stored or logged.</li>
        <li>Session cookies are HTTP-only, Secure, and scoped to our domain.</li>
        <li>Two-factor authentication (TOTP) is on our near-term roadmap.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Card processing is handled by Stripe. Full card numbers never touch our
        servers. We keep only the subscription metadata needed to operate your
        Pro account.
      </p>

      <h2>Access and separation of duties</h2>
      <ul>
        <li>Only a limited number of engineers have access to production systems, and access is logged.</li>
        <li>We do not read the contents of your documents for any purpose other than generating, delivering, or troubleshooting them at your request.</li>
        <li>We do not share your information with advertisers or data brokers.</li>
      </ul>

      <h2>Backups and availability</h2>
      <p>
        Account and document data is backed up on a rolling basis to a
        geographically separate region. Backups are encrypted with keys we
        manage, and restoration procedures are tested periodically.
      </p>

      <h2>Vulnerability disclosure</h2>
      <p>
        If you believe you have discovered a security vulnerability in
        EasyEstatePlan, please email{' '}
        <a href="mailto:security@easyestateplan.com">security@easyestateplan.com</a>.
        We commit to acknowledging reports within two business days and to
        keeping researchers informed as we investigate. Please give us a
        reasonable window to remediate before publishing details.
      </p>

      <h2>What we ask of you</h2>
      <ul>
        <li>Use a strong, unique password. A password manager helps.</li>
        <li>Keep your email account secure, since password resets land there.</li>
        <li>Sign out of shared or public devices when you finish.</li>
      </ul>
    </ContentPage>
  )
}
