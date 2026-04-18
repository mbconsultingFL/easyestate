import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { users, documents } from '@/lib/db'

// Documents that require a subscription
const PAID_DOCUMENT_TYPES = ['hipaa_auth', 'advance_directive', 'financial_poa', 'digital_assets', 'beneficiary_checklist', 'letter_of_instruction']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await users.findById(session.user.id)
  const docs = await documents.findByUser(session.user.id)
  const subscription = user?.subscriptionStatus || 'free'

  // For subscribers, unlock paid document types that don't have a status yet
  const enrichedDocs = docs.map(d => d)

  // If subscriber, add 'not_started' entries for paid docs they haven't started
  if (subscription === 'active') {
    for (const type of PAID_DOCUMENT_TYPES) {
      const existing = docs.find(d => d.type === type)
      if (!existing) {
        enrichedDocs.push({
          id: '',
          userId: session.user.id,
          type,
          status: 'not_started',
          state: null,
          data: null,
          pdfPath: null,
          completedAt: null,
          createdAt: '',
          updatedAt: '',
        })
      }
    }
  }

  return NextResponse.json({ documents: enrichedDocs, subscription })
}
