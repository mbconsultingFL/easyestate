'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BeneficiaryForm from '@/components/BeneficiaryForm'
import type { BeneficiaryAccount } from '@/lib/db'

export default function NewBeneficiaryPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth is enforced by middleware (src/middleware.ts).

  const handleSubmit = async (data: Partial<BeneficiaryAccount>) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 403) {
        setError('Pro subscription required')
        return
      }
      if (!res.ok) throw new Error('Failed to save')
      router.push('/beneficiaries')
    } catch (err) {
      setError('Failed to save account. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link href="/beneficiaries" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Beneficiary Tracker
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Add Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a financial account and specify who should receive its assets.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <BeneficiaryForm onSubmit={handleSubmit} isLoading={submitting} />
        </div>
      </main>
    </div>
  )
}
