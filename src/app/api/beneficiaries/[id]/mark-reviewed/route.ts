import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { beneficiaryAccounts, users } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await users.findById(session.user.id)
  if (user?.subscriptionStatus === 'free') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  const { id } = await params
  const account = await beneficiaryAccounts.findByUserAndId(session.user.id, id)
  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await beneficiaryAccounts.markReviewed(id)
  return NextResponse.json({ account: updated })
}
