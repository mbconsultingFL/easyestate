'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import BeneficiaryList from '@/components/BeneficiaryList'
import type { BeneficiaryAccount } from '@/lib/db'

export default function BeneficiariesPage() {
  const { data: session, status: authStatus } = useSession()
  const [accounts, setAccounts] = useState<BeneficiaryAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [dueForReviewCount, setDueForReviewCount] = useState(0)

  // Auth is enforced by middleware (src/middleware.ts).
  useEffect(() => {
    if (session?.user?.id) fetchAccounts()
  }, [session])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/beneficiaries')
      if (res.status === 403) {
        setError('pro_required')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAccounts(data.accounts || [])
      setDueForReviewCount(data.dueForReviewCount || 0)
    } catch (err) {
      setError('load_failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    setDueForReviewCount((prev) => {
      const deleted = accounts.find((a) => a.id === id)
      if (deleted?.nextReviewDueAt && new Date(deleted.nextReviewDueAt) <= new Date()) {
        return Math.max(0, prev - 1)
      }
      return prev
    })
  }

  const handleMarkReviewed = async (id: string) => {
    const res = await fetch(`/api/beneficiaries/${id}/mark-reviewed`, { method: 'POST' })
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    setAccounts((prev) => prev.map((a) => (a.id === id ? data.account : a)))
    // Recalculate overdue count
    const wasOverdue = accounts.find((a) => a.id === id)
    if (wasOverdue?.nextReviewDueAt && new Date(wasOverdue.nextReviewDueAt) <= new Date()) {
      setDueForReviewCount((prev) => Math.max(0, prev - 1))
    }
  }

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      const res = await fetch('/api/beneficiaries/export/pdf')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beneficiary-list-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Failed to export PDF. Please try again.')
      console.error(err)
    } finally {
      setExporting(false)
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo.svg" alt="EasyEstatePlan" width={36} height={36} className="rounded-lg" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">EasyEstatePlan</h1>
                <p className="text-xs text-gray-500">Beneficiary Tracker</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pro required error */}
        {error === 'pro_required' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <h2 className="text-lg font-semibold mb-1">Beneficiary Tracker requires Pro</h2>
            <p className="text-indigo-100 text-sm mb-4">
              Track all your financial accounts, manage beneficiary designations, and get review reminders — all in one place.
            </p>
            <Link
              href="/subscribe"
              className="inline-flex px-5 py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors"
            >
              Subscribe — $9.99/mo
            </Link>
          </div>
        )}

        {error === 'load_failed' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">Failed to load your accounts. Please refresh the page.</p>
          </div>
        )}

        {/* Page header */}
        {error !== 'pro_required' && (
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Beneficiary Tracker</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage beneficiary designations across all your financial accounts.
                </p>
              </div>
              <div className="flex gap-3">
                {accounts.length > 0 && (
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                )}
                <Link
                  href="/beneficiaries/new"
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Add Account
                </Link>
              </div>
            </div>

            {/* Review reminder banner */}
            {dueForReviewCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 font-medium text-sm">
                  {dueForReviewCount} account{dueForReviewCount !== 1 ? 's' : ''} due for review
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Review your beneficiary designations regularly to make sure they reflect your current wishes.
                </p>
              </div>
            )}

            {/* Account list */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <BeneficiaryList
                accounts={accounts}
                onDelete={handleDelete}
                onMarkReviewed={handleMarkReviewed}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
