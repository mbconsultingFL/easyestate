'use client'

import { useState } from 'react'
import type { BeneficiaryAccount, BeneficiaryPerson } from '@/lib/db'

interface BeneficiaryFormProps {
  account?: BeneficiaryAccount
  onSubmit: (data: Partial<BeneficiaryAccount>) => Promise<void>
  isLoading?: boolean
}

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'money_market', label: 'Money Market Account' },
  { value: 'cd', label: 'Certificate of Deposit (CD)' },
  { value: 'investment', label: 'Investment Account' },
  { value: 'brokerage', label: 'Brokerage Account' },
  { value: 'ira', label: 'IRA' },
  { value: 'roth_ira', label: 'Roth IRA' },
  { value: '401k', label: '401(k)' },
  { value: '403b', label: '403(b)' },
  { value: 'life_insurance', label: 'Life Insurance' },
  { value: 'annuity', label: 'Annuity' },
  { value: 'pension', label: 'Pension' },
  { value: 'hsa', label: 'Health Savings Account (HSA)' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' },
]

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse / Partner' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'friend', label: 'Friend' },
  { value: 'trust', label: 'Trust' },
  { value: 'charity', label: 'Charity / Organization' },
  { value: 'estate', label: 'Estate' },
  { value: 'other', label: 'Other' },
]

const REVIEW_FREQUENCIES = [
  { value: 'quarterly', label: 'Every 3 months' },
  { value: 'semi_annual', label: 'Every 6 months' },
  { value: 'yearly', label: 'Once a year' },
]

function emptyBeneficiary(type: 'primary' | 'contingent'): BeneficiaryPerson {
  return { name: '', relationship: '', percentage: 0, type }
}

export default function BeneficiaryForm({ account, onSubmit, isLoading = false }: BeneficiaryFormProps) {
  const [accountType, setAccountType] = useState(account?.accountType || '')
  const [institutionName, setInstitutionName] = useState(account?.institutionName || '')
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '')
  const [accountNickname, setAccountNickname] = useState(account?.accountNickname || '')
  const [designationType, setDesignationType] = useState(account?.designationType || 'per_stirpes')
  const [reviewFrequency, setReviewFrequency] = useState(account?.reviewFrequency || 'yearly')
  const [notes, setNotes] = useState(account?.notes || '')

  const existingPrimaries = account?.beneficiaries.filter((b) => b.type === 'primary') || []
  const existingContingents = account?.beneficiaries.filter((b) => b.type === 'contingent') || []

  const [primaries, setPrimaries] = useState<BeneficiaryPerson[]>(
    existingPrimaries.length > 0 ? existingPrimaries : [emptyBeneficiary('primary')]
  )
  const [contingents, setContingents] = useState<BeneficiaryPerson[]>(
    existingContingents.length > 0 ? existingContingents : []
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Beneficiary list helpers ──

  function updateBeneficiary(
    list: BeneficiaryPerson[],
    setter: (v: BeneficiaryPerson[]) => void,
    index: number,
    field: keyof BeneficiaryPerson,
    value: string | number
  ) {
    const updated = [...list]
    updated[index] = { ...updated[index], [field]: value }
    setter(updated)
  }

  function addBeneficiary(list: BeneficiaryPerson[], setter: (v: BeneficiaryPerson[]) => void, type: 'primary' | 'contingent') {
    setter([...list, emptyBeneficiary(type)])
  }

  function removeBeneficiary(list: BeneficiaryPerson[], setter: (v: BeneficiaryPerson[]) => void, index: number) {
    setter(list.filter((_, i) => i !== index))
  }

  // ── Validation ──

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!accountType) errs.accountType = 'Required'
    if (!institutionName.trim()) errs.institutionName = 'Required'

    // Must have at least one primary
    if (primaries.length === 0) {
      errs.primaries = 'At least one primary beneficiary is required'
    }

    // Validate each primary
    primaries.forEach((p, i) => {
      if (!p.name.trim()) errs[`primary_${i}_name`] = 'Name is required'
      if (!p.relationship) errs[`primary_${i}_rel`] = 'Required'
      if (p.percentage <= 0) errs[`primary_${i}_pct`] = 'Must be > 0'
    })

    // Primary percentages must sum to 100
    const primarySum = primaries.reduce((s, p) => s + (p.percentage || 0), 0)
    if (primaries.length > 0 && primarySum !== 100) {
      errs.primarySum = `Primary beneficiary percentages must total 100% (currently ${primarySum}%)`
    }

    // Validate contingents (if any)
    contingents.forEach((c, i) => {
      if (!c.name.trim()) errs[`contingent_${i}_name`] = 'Name is required'
      if (!c.relationship) errs[`contingent_${i}_rel`] = 'Required'
      if (c.percentage <= 0) errs[`contingent_${i}_pct`] = 'Must be > 0'
    })

    // Contingent percentages must sum to 100 if any exist
    if (contingents.length > 0) {
      const contingentSum = contingents.reduce((s, c) => s + (c.percentage || 0), 0)
      if (contingentSum !== 100) {
        errs.contingentSum = `Contingent beneficiary percentages must total 100% (currently ${contingentSum}%)`
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    await onSubmit({
      accountType,
      institutionName,
      accountNumber: accountNumber || null,
      accountNickname: accountNickname || null,
      beneficiaries: [...primaries, ...contingents],
      designationType,
      reviewFrequency,
      notes: notes || null,
    })
  }

  // ── Render helpers ──

  function renderBeneficiaryRow(
    person: BeneficiaryPerson,
    index: number,
    list: BeneficiaryPerson[],
    setter: (v: BeneficiaryPerson[]) => void,
    prefix: string
  ) {
    return (
      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {person.type === 'primary' ? 'Primary' : 'Contingent'} #{index + 1}
          </span>
          {list.length > (person.type === 'primary' ? 1 : 0) && (
            <button
              type="button"
              onClick={() => removeBeneficiary(list, setter, index)}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Remove
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Name */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={person.name}
              onChange={(e) => updateBeneficiary(list, setter, index, 'name', e.target.value)}
              placeholder="Jane Doe"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 ${
                errors[`${prefix}_${index}_name`] ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors[`${prefix}_${index}_name`] && (
              <p className="text-xs text-red-500 mt-0.5">{errors[`${prefix}_${index}_name`]}</p>
            )}
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={person.relationship}
              onChange={(e) => updateBeneficiary(list, setter, index, 'relationship', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white ${
                errors[`${prefix}_${index}_rel`] ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select...</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {errors[`${prefix}_${index}_rel`] && (
              <p className="text-xs text-red-500 mt-0.5">{errors[`${prefix}_${index}_rel`]}</p>
            )}
          </div>

          {/* Percentage */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Percentage <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={person.percentage || ''}
                onChange={(e) => updateBeneficiary(list, setter, index, 'percentage', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 pr-8 border rounded-lg text-sm text-gray-900 ${
                  errors[`${prefix}_${index}_pct`] ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-3 top-2 text-sm text-gray-400">%</span>
            </div>
            {errors[`${prefix}_${index}_pct`] && (
              <p className="text-xs text-red-500 mt-0.5">{errors[`${prefix}_${index}_pct`]}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const primarySum = primaries.reduce((s, p) => s + (p.percentage || 0), 0)
  const contingentSum = contingents.reduce((s, c) => s + (c.percentage || 0), 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Account Information ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Account Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white ${
                  errors.accountType ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">Select account type...</option>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.accountType && <p className="text-xs text-red-500 mt-0.5">{errors.accountType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g., Fidelity, Vanguard, State Farm"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 ${
                  errors.institutionName ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.institutionName && <p className="text-xs text-red-500 mt-0.5">{errors.institutionName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Nickname <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={accountNickname}
                onChange={(e) => setAccountNickname(e.target.value)}
                placeholder="e.g., Main retirement fund"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number <span className="text-gray-400 text-xs">(optional — stored securely)</span>
              </label>
              <input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Will be masked"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Primary Beneficiaries ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Primary Beneficiaries</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Must total 100% — currently{' '}
              <span className={primarySum === 100 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                {primarySum}%
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => addBeneficiary(primaries, setPrimaries, 'primary')}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add Primary
          </button>
        </div>
        {errors.primaries && <p className="text-sm text-red-500 mb-3">{errors.primaries}</p>}
        {errors.primarySum && <p className="text-sm text-red-500 mb-3">{errors.primarySum}</p>}
        <div className="space-y-3">
          {primaries.map((p, i) => renderBeneficiaryRow(p, i, primaries, setPrimaries, 'primary'))}
        </div>
      </section>

      {/* ── Contingent Beneficiaries ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contingent Beneficiaries</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Optional backup beneficiaries if primaries cannot receive assets
              {contingents.length > 0 && (
                <>
                  {' '}— currently{' '}
                  <span className={contingentSum === 100 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                    {contingentSum}%
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addBeneficiary(contingents, setContingents, 'contingent')}
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Add Contingent
          </button>
        </div>
        {errors.contingentSum && <p className="text-sm text-red-500 mb-3">{errors.contingentSum}</p>}
        {contingents.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-3">
            No contingent beneficiaries added. Click &quot;+ Add Contingent&quot; to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {contingents.map((c, i) => renderBeneficiaryRow(c, i, contingents, setContingents, 'contingent'))}
          </div>
        )}
      </section>

      {/* ── Settings ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Settings</h3>
        <div className="space-y-4">
          {/* Designation type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Designation Type</label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="designationType"
                  value="per_stirpes"
                  checked={designationType === 'per_stirpes'}
                  onChange={() => setDesignationType('per_stirpes')}
                  className="mt-0.5 h-4 w-4 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Per Stirpes</span>
                  <p className="text-xs text-gray-500">If a beneficiary passes away, their share goes to their descendants</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="designationType"
                  value="per_capita"
                  checked={designationType === 'per_capita'}
                  onChange={() => setDesignationType('per_capita')}
                  className="mt-0.5 h-4 w-4 text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Per Capita</span>
                  <p className="text-xs text-gray-500">If a beneficiary passes away, their share is split equally among remaining beneficiaries</p>
                </div>
              </label>
            </div>
          </div>

          {/* Review frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Frequency</label>
            <select
              value={reviewFrequency}
              onChange={(e) => setReviewFrequency(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
            >
              {REVIEW_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details about this account..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : account ? 'Update Account' : 'Add Account'}
      </button>
    </form>
  )
}
