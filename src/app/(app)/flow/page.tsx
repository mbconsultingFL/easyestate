'use client'

import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ChatFlow from '@/components/ChatFlow'
import { FLOW_DISPLAY_NAMES } from '@/lib/flow-engine'

function FlowContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const flowType = searchParams.get('type') || 'medical_poa'
  const displayName = FLOW_DISPLAY_NAMES[flowType] || 'Document'

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Auth is enforced by middleware (src/middleware.ts). This guard only runs
  // in the unlikely case the session is briefly missing client-side.
  if (!session) return null

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', background: '#FAFAFA', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <header className="shrink-0 z-10" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F0F0F0' }}>
        <div className="max-w-[680px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <a href="/dashboard" className="text-[13px] px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100" style={{ color: '#6B6B6B', textDecoration: 'none' }}>
            ← Back
          </a>
          <span className="text-[15px] font-semibold tracking-tight">{displayName}</span>
          <div className="w-16" /> {/* spacer for centering */}
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col min-h-0">
        <ChatFlow flowType={flowType} />
      </main>

      {/* Footer */}
      <footer className="shrink-0 safe-bottom px-4 py-2" style={{ background: '#fff', borderTop: '1px solid #F0F0F0' }}>
        <p className="text-center text-[11px] max-w-[680px] mx-auto" style={{ color: '#9A9A9A' }}>
          EasyEstatePlan assembles documents only and does not provide legal advice.
        </p>
      </footer>
    </div>
  )
}

export default function FlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <FlowContent />
    </Suspense>
  )
}
