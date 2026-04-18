import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { beneficiaryAccounts, pickBeneficiaryFields, users } from '@/lib/db'

export async function GET(
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

  return NextResponse.json({ account })
}

export async function PATCH(
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

  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Whitelist — id, userId, timestamps, and review-due must never be
    // writable from a request body.
    const fields = pickBeneficiaryFields(body)
    const updated = await beneficiaryAccounts.update(id, fields)
    return NextResponse.json({ account: updated })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
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

  await beneficiaryAccounts.delete(id)
  return NextResponse.json({ success: true })
}
