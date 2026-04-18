import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { beneficiaryAccounts, pickBeneficiaryFields, users } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await users.findById(session.user.id)
  if (user?.subscriptionStatus === 'free') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  const accounts = await beneficiaryAccounts.findByUser(session.user.id)
  const dueForReview = await beneficiaryAccounts.findDueForReview(session.user.id)
  return NextResponse.json({ accounts, dueForReviewCount: dueForReview.length })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await users.findById(session.user.id)
  if (user?.subscriptionStatus === 'free') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Whitelist — never trust arbitrary keys from the client; userId is set
    // from the authenticated session only.
    const fields = pickBeneficiaryFields(body)
    if (!fields.accountType || !fields.institutionName) {
      return NextResponse.json(
        { error: 'accountType and institutionName are required' },
        { status: 400 }
      )
    }

    const account = await beneficiaryAccounts.create({
      ...fields,
      userId: session.user.id,
      accountType: fields.accountType,
      institutionName: fields.institutionName,
    })
    return NextResponse.json({ account }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
