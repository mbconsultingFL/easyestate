'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import BeneficiaryForm from '@/components/BeneficiaryForm'
import type { BeneficiaryAccount } from '@/lib/db'

export default function EditBeneficiaryPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [account, setAccount] = useState<BeneficiaryAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth is enforced by middleware (src/middleware.ts).
  useEffect(() => {
    if (session?.user?.id && id) fetchAccount()
  }, [session, id])

  const fetchAccount = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/beneficiaries/${id}`)
      if (res.status === 404) {
        setError('Account not found')
        return
      }
      if (res.status === 403) {
        setError('Pro subscription required')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAccount(data.account)
    } catch (err) {
      setError('Failed to load account')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Partial<BeneficiaryAccount>) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/beneficiaries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update')
      router.push('/beneficiaries')
    } catch (err) {
      setError('Failed to update account. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (authStatus === 'loading' || loading) {
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
          <h1 className="text-xl font-bold text-gray-900">Edit Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your account details and beneficiary designations.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
            {error === 'Account not found' && (
              <Link href="/beneficiaries" className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                Return to Beneficiary Tracker
              </Link>
            )}
          </div>
        )}

        {account && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <BeneficiaryForm account={account} onSubmit={handleSubmit} isLoading={submitting} />
          </div>
        )}
      </main>
    </div>
  )
}
