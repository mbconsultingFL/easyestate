import Link from 'next/link'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto safe-bottom">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-sm font-bold text-gray-900">EasyEstatePlan</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs">
              Estate planning documents in minutes. State-correct, attorney-reviewed templates.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/#how" className="hover:text-gray-900">How it works</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
              <li><Link href="/security" className="hover:text-gray-900">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-900">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-gray-900">Legal Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            EasyEstatePlan is not a law firm, is not a substitute for the advice of an attorney, and
            does not provide legal advice. The information and documents provided are for general
            informational purposes only. Consult a licensed attorney for guidance specific to your
            situation.
          </p>
          <p className="text-xs text-gray-400 shrink-0">© {year} EasyEstatePlan</p>
        </div>
      </div>
    </footer>
  )
}
