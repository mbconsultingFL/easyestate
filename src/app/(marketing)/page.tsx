import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-full px-4 py-1.5 text-sm font-medium mb-5 sm:mb-6">
          Healthcare POA — completely free
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Estate planning documents
          <br />
          <span className="text-indigo-600">in minutes, not months</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Answer a few simple questions and get a filled, state-correct legal
          document ready for signature. No lawyer needed to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-2 sm:px-0">
          <Link
            href="/register"
            className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Create your free Healthcare POA
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-base font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-t border-b border-gray-200 py-12 sm:py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Answer questions
              </h3>
              <p className="text-sm text-gray-500">
                Tap through a short, guided chat. Most questions are
                multiple-choice — just tap to answer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Get your document
              </h3>
              <p className="text-sm text-gray-500">
                We generate a filled, state-correct PDF instantly. Review it
                before you sign.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Sign and notarize
              </h3>
              <p className="text-sm text-gray-500">
                E-sign via DocuSign and notarize online where required — all
                without leaving home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported states */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Currently available in
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {[
              { name: "California", slug: "california" },
              { name: "Texas", slug: "texas" },
              { name: "Florida", slug: "florida" },
              { name: "New York", slug: "new-york" },
              { name: "Illinois", slug: "illinois" },
            ].map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}-healthcare-poa`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {s.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            More states coming soon after per-state legal review.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white border-t border-gray-200 py-12 sm:py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            Simple pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-1">Free</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$0</p>
              <p className="text-sm text-gray-500 mb-6">
                Healthcare Power of Attorney — one complete document,
                absolutely free.
              </p>
              <Link
                href="/register"
                className="block text-center py-2.5 border border-indigo-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50"
              >
                Get started
              </Link>
            </div>
            <div className="border-2 border-indigo-600 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                Full access
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                EasyEstatePlan Pro
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">
                $9.99
                <span className="text-base font-normal text-gray-500">
                  /mo
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                All document types, secure storage, re-downloads, and annual
                review reminders.
              </p>
              <Link
                href="/register"
                className="block text-center py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                Start free, upgrade later
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
