import Link from 'next/link'
import type { StatePOAInfo } from '@/lib/state-poa-data'

export default function StatePOALanding({ info }: { info: StatePOAInfo }) {
  return (
    <div className="max-w-4xl mx-auto px-5 py-10 sm:py-14">
      {/* Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3.5 py-1 text-xs font-medium mb-4">
          {info.state} · {info.docName}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
          Free {info.state} {info.docName}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
          Assemble a state-correct {info.docName.toLowerCase()} in minutes.
          No lawyer required to get started, and the document is free — always.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
          <Link
            href="/register"
            className="px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start your {info.state} {info.docName.split(' ').slice(-1)[0]}
          </Link>
          <Link
            href="/faq"
            className="px-6 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
          >
            Read the FAQ
          </Link>
        </div>
      </div>

      {/* At-a-glance */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <Fact label="Statute" value={info.statuteCitation} />
        <Fact label="Witnesses required" value={info.execution.witnesses.split('.')[0] + '.'} />
        <Fact
          label="Notary required?"
          value={info.execution.notary.toLowerCase().includes('not required') ? 'No' : 'Alternative'}
        />
      </div>

      {/* Quick facts */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          The basics, plainly
        </h2>
        <ul className="space-y-2.5 text-gray-700 text-[15px] leading-relaxed">
          {info.quickFacts.map((fact, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Execution rules */}
      <section className="mb-12 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
          How to make it valid in {info.state}
        </h2>
        <dl className="space-y-5 text-[15px]">
          <div>
            <dt className="font-semibold text-gray-900 mb-1">Witnesses</dt>
            <dd className="text-gray-600 leading-relaxed">{info.execution.witnesses}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 mb-1">Notarization</dt>
            <dd className="text-gray-600 leading-relaxed">{info.execution.notary}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 mb-1">Who can be your agent</dt>
            <dd className="text-gray-600 leading-relaxed">{info.execution.whoCanBeAgent}</dd>
          </div>
        </dl>
      </section>

      {/* Common uses */}
      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          What people use this document for
        </h2>
        <ul className="space-y-2.5 text-gray-700 text-[15px] leading-relaxed">
          {info.commonUses.map((use, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
              <span>{use}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 sm:p-10 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Ready to create yours?
        </h2>
        <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
          Most people finish in 10 to 15 minutes. You get a filled, state-correct
          PDF and a plain-English signing guide for {info.state}.
        </p>
        <Link
          href="/register"
          className="inline-block px-7 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
        >
          Start for free
        </Link>
      </section>

      {/* Legal footer */}
      <p className="mt-10 text-xs text-gray-400 leading-relaxed text-center">
        This page summarizes {info.statuteLabel} for general information only.
        Laws change; always confirm the current requirements before signing.
        EasyEstatePlan is not a law firm and does not provide legal advice —
        see our <Link href="/disclaimer" className="underline">Legal Disclaimer</Link>.
      </p>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className="text-sm text-gray-900 leading-snug">{value}</div>
    </div>
  )
}
