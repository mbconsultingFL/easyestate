'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

interface DocumentStatus {
  type: string
  label: string
  description: string
  status: 'free' | 'locked' | 'not_started' | 'in_progress' | 'ready_to_sign' | 'complete' | 'needs_update'
  icon: string
  generatedAt?: string
  completedAt?: string
}

const DOCUMENT_TYPES: DocumentStatus[] = [
  { type: 'medical_poa', label: 'Healthcare Power of Attorney', description: 'Designate who makes medical decisions for you', status: 'not_started', icon: '🏥' },
  { type: 'hipaa_auth', label: 'HIPAA Authorization', description: 'Allow others to access your medical records', status: 'locked', icon: '📋' },
  { type: 'advance_directive', label: 'Advance Directive / Living Will', description: 'Specify your end-of-life care wishes', status: 'locked', icon: '📄' },
  { type: 'financial_poa', label: 'Durable Financial POA', description: 'Designate who manages your finances', status: 'locked', icon: '💰' },
  { type: 'beneficiary_checklist', label: 'Beneficiary Designation Checklist', description: 'Review and update all your beneficiaries', status: 'locked', icon: '✅' },
  { type: 'digital_assets', label: 'Digital Asset Inventory', description: 'Catalog your online accounts and digital property', status: 'locked', icon: '💻' },
  { type: 'letter_of_instruction', label: 'Letter of Instruction', description: 'Guide your executor through your wishes', status: 'locked', icon: '✉️' },
]

const FLOW_TYPES = ['medical_poa', 'hipaa_auth', 'advance_directive', 'financial_poa', 'digital_assets', 'beneficiary_checklist', 'letter_of_instruction']

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const [documents, setDocuments] = useState<DocumentStatus[]>(DOCUMENT_TYPES)
  const [subscription, setSubscription] = useState<string>('free')

  useEffect(() => {
    if (session?.user?.id) fetchDocumentStatuses()
  }, [session])

  const fetchDocumentStatuses = async () => {
    try {
      const res = await fetch('/api/documents/status')
      if (res.ok) {
        const data = await res.json()
        setDocuments(prev =>
          prev.map(doc => {
            const serverDoc = data.documents?.find((d: any) => d.type === doc.type)
            if (serverDoc) return { ...doc, status: serverDoc.status, generatedAt: serverDoc.generatedAt, completedAt: serverDoc.completedAt }
            return doc
          })
        )
        if (data.subscription) setSubscription(data.subscription)
      }
    } catch {}
  }

  const handleMarkSigned = async (type: string) => {
    try {
      const res = await fetch('/api/documents/mark-signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.ok) fetchDocumentStatuses()
    } catch {}
  }

  // Group documents by status
  const groups = useMemo(() => {
    const readyToSign = documents.filter(d => d.status === 'ready_to_sign')
    const signed = documents.filter(d => d.status === 'complete')
    const inProgress = documents.filter(d => d.status === 'in_progress')
    const notStarted = documents.filter(d => d.status === 'not_started' || d.status === 'free')
    const locked = documents.filter(d => d.status === 'locked')
    return { readyToSign, signed, inProgress, notStarted, locked }
  }, [documents])

  const totalDocs = DOCUMENT_TYPES.length
  const signedCount = groups.signed.length
  const readyCount = groups.readyToSign.length
  const progressCount = groups.inProgress.length
  const notStartedCount = groups.notStarted.length + groups.locked.length
  const pct = Math.round((signedCount / totalDocs) * 100)

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Auth is enforced by middleware (src/middleware.ts).
  if (!session) return null

  const isSubscriber = subscription === 'active'
  const firstName = session.user?.name?.split(' ')[0]

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F0F0F0' }}>
        <div className="max-w-[960px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#1A1A1A] flex items-center justify-center text-white font-bold text-[15px]">E</div>
            <span className="text-base font-semibold tracking-tight">EasyEstatePlan</span>
          </div>
          <div className="flex items-center gap-4">
            {isSubscriber && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: '#E8F2FF', color: '#007AFF' }}>
                Subscriber
              </span>
            )}
            <span className="text-[13px] hidden sm:inline" style={{ color: '#9A9A9A' }}>{session.user?.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-[13px] px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: '#6B6B6B' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-6 py-10">
        {/* Subscribe banner — free tier only */}
        {!isSubscriber && (
          <div className="rounded-2xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #1A1A1A, #333)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Unlock all document types</h2>
                <p className="text-sm mt-1" style={{ color: '#9A9A9A' }}>
                  Get access to all 7 estate planning documents, secure storage, and annual review reminders.
                </p>
              </div>
              <Link href="/subscribe" className="px-5 py-2.5 bg-white rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap text-center" style={{ color: '#1A1A1A' }}>
                Subscribe — $9.99/mo
              </Link>
            </div>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-[26px] font-bold tracking-tight" style={{ color: '#1A1A1A' }}>
            {firstName ? `${firstName}'s estate plan` : 'Your estate plan'}
          </h2>
          <p className="text-[15px] mt-1.5" style={{ color: '#6B6B6B' }}>
            {readyCount > 0
              ? `${readyCount} document${readyCount > 1 ? 's' : ''} need${readyCount === 1 ? 's' : ''} your signature.`
              : signedCount > 0
              ? 'Looking good. Keep going!'
              : 'Start with your free Healthcare Power of Attorney.'}
          </p>
        </div>

        {/* Stats row */}
        {(signedCount > 0 || readyCount > 0 || progressCount > 0) && (
          <div className="flex gap-4 mb-8 flex-wrap">
            <StatCard value={signedCount} label="Signed" color="#34C759" />
            <StatCard value={readyCount} label="Ready to sign" color="#007AFF" />
            <StatCard value={progressCount} label="In progress" color="#FF9F0A" />
            <StatCard value={notStartedCount} label="Not started" color="#1A1A1A" />
          </div>
        )}

        {/* Progress bar */}
        {signedCount > 0 && (
          <div className="flex items-center gap-5 p-5 mb-10 rounded-[14px]" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
            <div className="shrink-0">
              <h3 className="text-sm font-semibold">Estate plan</h3>
              <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>{signedCount} of {totalDocs} signed</p>
            </div>
            <div className="flex-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #34C759, #007AFF)' }} />
              </div>
              <p className="text-xs mt-1.5 text-right font-medium" style={{ color: '#6B6B6B' }}>{pct}% complete</p>
            </div>
          </div>
        )}

        {/* Ready to Sign section */}
        {groups.readyToSign.length > 0 && (
          <Section label="Ready to sign">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {groups.readyToSign.map(doc => (
                <div key={doc.type} className="rounded-2xl p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: '#E8F2FF' }}>{doc.icon}</div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xl" style={{ background: '#E8F2FF', color: '#007AFF' }}>Awaiting signature</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1A1A1A' }}>{doc.label}</h3>
                  <p className="text-[11px] mb-5 leading-relaxed" style={{ color: '#9A9A9A' }}>
                    {doc.generatedAt ? `Generated ${new Date(doc.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Draft ready'}
                  </p>
                  <div className="mt-auto pt-3.5 flex flex-col gap-2" style={{ borderTop: '1px solid #F0F0F0' }}>
                    <button className="w-full text-xs font-semibold py-2.5 rounded-lg text-white flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 active:scale-[0.98]" style={{ background: '#007AFF' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 2.5l2 2M6 8l5.5-5.5 2 2L8 10l-2.5.5L6 8z"/><path d="M3 13h10"/></svg>
                      Sign via DocuSign
                    </button>
                    <div className="flex justify-center gap-0.5">
                      <a href={`/api/documents/download-latest?type=${doc.type}&direct=1`} className="text-[11px] font-medium px-2 py-1 rounded transition-colors hover:text-[#007AFF] hover:bg-[#E8F2FF]" style={{ color: '#9A9A9A' }}>
                        Download draft
                      </a>
                      <div className="w-px h-3.5 my-auto" style={{ background: '#F0F0F0' }} />
                      <button onClick={() => handleMarkSigned(doc.type)} className="text-[11px] font-medium px-2 py-1 rounded transition-colors hover:text-[#007AFF] hover:bg-[#E8F2FF]" style={{ color: '#9A9A9A' }}>
                        I signed on paper
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Signed section */}
        {groups.signed.length > 0 && (
          <Section label="Signed">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {groups.signed.map(doc => (
                <div key={doc.type} className="rounded-2xl p-5 flex flex-col" style={{ background: '#FCFCFC', border: '1px solid #F0F0F0' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: '#F0FDF4' }}>{doc.icon}</div>
                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ background: '#34C759' }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 8.5 7 11.5 12 5"/></svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#6B6B6B' }}>{doc.label}</h3>
                  <p className="text-[11px] mb-4 leading-relaxed" style={{ color: '#9A9A9A' }}>
                    {doc.completedAt ? `Signed ${new Date(doc.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Complete'}
                  </p>
                  <div className="mt-auto pt-2.5 flex justify-center">
                    <a href={`/api/documents/download-latest?type=${doc.type}&direct=1`} className="text-[11px] font-medium px-2 py-1 rounded transition-colors hover:text-[#007AFF] hover:bg-[#E8F2FF] inline-flex items-center gap-1" style={{ color: '#9A9A9A' }}>
                      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M4.5 7.5 8 11l3.5-3.5M3 14h10"/></svg>
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* In Progress section */}
        {groups.inProgress.length > 0 && (
          <Section label="In progress">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F0F0' }}>
              {groups.inProgress.map((doc, i) => (
                <Link key={doc.type} href={`/flow?type=${doc.type}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FCFCFC]"
                  style={{ background: '#fff', borderTop: i > 0 ? '1px solid #F0F0F0' : 'none' }}
                >
                  <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-[19px] shrink-0" style={{ background: '#FFF8EB' }}>{doc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight">{doc.label}</h3>
                    <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>{doc.description}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: '#FFF8EB', color: '#B45309' }}>Continue</span>
                  <span className="text-base" style={{ color: '#9A9A9A' }}>›</span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Not Started section */}
        {(groups.notStarted.length > 0 || groups.locked.length > 0) && (
          <Section label="Not started">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0F0F0' }}>
              {[...groups.notStarted, ...groups.locked].map((doc, i) => {
                const isLocked = doc.status === 'locked'
                const canStart = !isLocked || isSubscriber
                const Comp = canStart ? Link : 'div' as any
                const compProps = canStart ? { href: `/flow?type=${doc.type}` } : {}
                return (
                  <Comp key={doc.type} {...compProps}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${canStart ? 'hover:bg-[#FCFCFC] cursor-pointer' : 'opacity-60'}`}
                    style={{ background: '#fff', borderTop: i > 0 ? '1px solid #F0F0F0' : 'none', textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-[19px] shrink-0" style={{ background: '#F5F5F5' }}>{doc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold tracking-tight">{doc.label}</h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B6B' }}>{doc.description}</p>
                    </div>
                    {canStart ? (
                      <>
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                          {doc.type === 'medical_poa' && !isSubscriber ? 'Free' : 'Start'}
                        </span>
                        <span className="text-base" style={{ color: '#9A9A9A' }}>›</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-medium shrink-0" style={{ color: '#9A9A9A' }}>Requires subscription</span>
                    )}
                  </Comp>
                )
              })}
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <div className="mt-10 p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
          <p className="text-xs leading-relaxed" style={{ color: '#9A9A9A' }}>
            <strong style={{ color: '#6B6B6B', fontWeight: 500 }}>Important:</strong> EasyEstatePlan assembles documents based on your inputs and does not provide legal advice.
            Documents are based on standard state templates. We recommend attorney review. EasyEstatePlan is not a law firm.
          </p>
        </div>
      </main>
    </div>
  )
}

// --- Sub-components ---

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 min-w-[120px] p-5 rounded-[14px]" style={{ background: '#fff', border: '1px solid #F0F0F0' }}>
      <div className="text-[28px] font-bold tracking-tight leading-none" style={{ color }}>{value}</div>
      <div className="text-xs font-medium mt-1.5" style={{ color: '#9A9A9A' }}>{label}</div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#9A9A9A' }}>{label}</div>
      {children}
    </div>
  )
}
