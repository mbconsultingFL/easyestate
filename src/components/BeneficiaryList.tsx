'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BeneficiaryAccount } from '@/lib/db'

interface BeneficiaryListProps {
  accounts: BeneficiaryAccount[]
  onDelete: (id: string) => Promise<void>
  onMarkReviewed: (id: string) => Promise<void>
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
  money_market: 'Money Market',
  cd: 'CD',
  investment: 'Investment',
  brokerage: 'Brokerage',
  ira: 'IRA',
  roth_ira: 'Roth IRA',
  '401k': '401(k)',
  '403b': '403(b)',
  life_insurance: 'Life Insurance',
  annuity: 'Annuity',
  pension: 'Pension',
  hsa: 'HSA',
  trust: 'Trust',
  other: 'Other',
}

function isOverdue(nextReviewDueAt: string | null): boolean {
  if (!nextReviewDueAt) return false
  return new Date(nextReviewDueAt) <= new Date()
}

export default function BeneficiaryList({ accounts, onDelete, onMarkReviewed }: BeneficiaryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this account from your tracker?')) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleMarkReviewed = async (id: string) => {
    setMarkingId(id)
    try {
      await onMarkReviewed(id)
    } finally {
      setMarkingId(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
        <p className="text-sm text-gray-500 mb-6">
          Start tracking your beneficiary designations by adding your first account.
        </p>
        <Link
          href="/beneficiaries/new"
          className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Add Your First Account
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((acct) => {
        const primaries = acct.beneficiaries.filter((b) => b.type === 'primary')
        const contingents = acct.beneficiaries.filter((b) => b.type === 'contingent')
        const overdue = isOverdue(acct.nextReviewDueAt)
        const typeLabel = ACCOUNT_TYPE_LABELS[acct.accountType] || acct.accountType

        return (
          <div
            key={acct.id}
            className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
              overdue ? 'border-red-200' : 'border-gray-200'
            }`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{acct.institutionName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {typeLabel}
                  </span>
                </div>
                {acct.accountNickname && (
                  <p className="text-xs text-gray-500 mt-0.5">{acct.accountNickname}</p>
                )}
              </div>
              {overdue && (
                <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  Review Due
                </span>
              )}
            </div>

            {/* Beneficiaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Primaries */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Primary {primaries.length > 1 ? `(${primaries.length})` : ''}
                </p>
                {primaries.map((b, i) => (
                  <div key={i} className="text-sm text-gray-900">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-gray-500"> · {b.relationship} · {b.percentage}%</span>
                  </div>
                ))}
              </div>

              {/* Contingents */}
              {contingents.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Contingent {contingents.length > 1 ? `(${contingents.length})` : ''}
                  </p>
                  {contingents.map((b, i) => (
                    <div key={i} className="text-sm text-gray-900">
                      <span className="font-medium">{b.name}</span>
                      <span className="text-gray-500"> · {b.relationship} · {b.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <span>
                Reviewed: {acct.lastReviewedAt ? new Date(acct.lastReviewedAt).toLocaleDateString() : 'Never'}
              </span>
              <span>·</span>
              <span>
                Next: {acct.nextReviewDueAt ? new Date(acct.nextReviewDueAt).toLocaleDateString() : '—'}
              </span>
              <span>·</span>
              <span className="capitalize">
                {acct.designationType === 'per_stirpes' ? 'Per Stirpes' : 'Per Capita'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link
                href={`/beneficiaries/${acct.id}/edit`}
                className="flex-1 text-center py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleMarkReviewed(acct.id)}
                disabled={markingId === acct.id}
                className="flex-1 py-2 text-sm text-green-600 font-medium hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {markingId === acct.id ? 'Saving...' : 'Mark Reviewed'}
              </button>
              <button
                onClick={() => handleDelete(acct.id)}
                disabled={deletingId === acct.id}
                className="flex-1 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId === acct.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
