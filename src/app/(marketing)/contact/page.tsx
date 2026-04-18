import ContentPage from '@/components/ContentPage'

export const metadata = {
  title: 'Contact — EasyEstatePlan',
  description:
    'Get in touch with the EasyEstatePlan team. Support, privacy, and press inquiries.',
}

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact us"
      subtitle="A real person reads every message."
    >
      <p>
        We are a small team and try to respond within one business day. For
        anything urgent related to your account, please include your registered
        email address in the first line of your message.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 not-prose my-8">
        <a
          href="mailto:support@easyestateplan.com"
          className="block p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition"
        >
          <h3 className="font-semibold text-gray-900 mb-1">General support</h3>
          <p className="text-sm text-gray-500 mb-2">Account, billing, document questions.</p>
          <p className="text-sm text-indigo-600 font-medium">support@easyestateplan.com</p>
        </a>
        <a
          href="mailto:privacy@easyestateplan.com"
          className="block p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Privacy & data</h3>
          <p className="text-sm text-gray-500 mb-2">Data access, deletion, and privacy-law requests.</p>
          <p className="text-sm text-indigo-600 font-medium">privacy@easyestateplan.com</p>
        </a>
        <a
          href="mailto:security@easyestateplan.com"
          className="block p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Security reports</h3>
          <p className="text-sm text-gray-500 mb-2">Responsible disclosure of vulnerabilities.</p>
          <p className="text-sm text-indigo-600 font-medium">security@easyestateplan.com</p>
        </a>
        <a
          href="mailto:press@easyestateplan.com"
          className="block p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm transition"
        >
          <h3 className="font-semibold text-gray-900 mb-1">Press & partnerships</h3>
          <p className="text-sm text-gray-500 mb-2">Interviews, collaborations, or bulk accounts.</p>
          <p className="text-sm text-indigo-600 font-medium">press@easyestateplan.com</p>
        </a>
      </div>

      <h2>Need legal advice?</h2>
      <p>
        We can't give it — we are not a law firm. If your situation is complex,
        the American Bar Association maintains a directory of state and local
        bar associations, most of which operate lawyer referral services.
      </p>

      <h2>Emergencies</h2>
      <p>
        EasyEstatePlan cannot intervene in medical or legal emergencies. If you
        or someone you know is experiencing a crisis, contact local emergency
        services or 911 (U.S.) immediately.
      </p>
    </ContentPage>
  )
}
