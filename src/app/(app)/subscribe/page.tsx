'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SubscribePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Auth is enforced by middleware (src/middleware.ts).
  if (!session) return null

  const handleSubscribe = async () => {
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingInterval }),
      })
      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setMessage(
          'Stripe integration is being configured. Subscription will be available soon.'
        )
      }
    } catch {
      setMessage('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const features = [
    'E-sign documents via DocuSign',
    'Online notarization — no leaving home',
    'All estate planning document types',
    'HIPAA Authorization',
    'Advance Directive / Living Will',
    'Durable Financial Power of Attorney',
    'Beneficiary Tracker with review reminders',
    'Digital Asset Inventory',
    'Letter of Instruction to Executor',
    'Secure document storage',
    'Unlimited re-downloads',
    'Annual review reminders tied to life events',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EasyEstatePlan" width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold text-gray-900">EasyEstatePlan</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock EasyEstatePlan Pro
          </h1>
          <p className="text-gray-500">
            Complete your estate plan with all document types.
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-indigo-600 p-8">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingInterval === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                Save 17%
              </span>
            </button>
          </div>

          <div className="text-center mb-6">
            {billingInterval === 'monthly' ? (
              <>
                <p className="text-4xl font-bold text-gray-900">
                  $9.99
                  <span className="text-base font-normal text-gray-500">/month</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Cancel anytime</p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold text-gray-900">
                  $99.99
                  <span className="text-base font-normal text-gray-500">/year</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  That&apos;s ~$8.33/mo — save $19.89 vs monthly
                </p>
              </>
            )}
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {message && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 mb-4">
              {message}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            {loading ? 'Processing...' : 'Subscribe now'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Payments processed securely via Stripe. Your Healthcare POA remains
            free regardless of subscription status.
          </p>
        </div>
      </main>
    </div>
  )
}
