import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { users } from '@/lib/db'

// STUB: Notarize.com integration
// In production, replace with actual Notarize.com API calls
// See: https://www.notarize.com/business/api

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Online notarization requires an active Pro subscription
  const user = await users.findById(session.user.id)
  if (!user || user.subscriptionStatus !== 'active') {
    return NextResponse.json(
      { error: 'Pro subscription required', requiresSubscription: true },
      { status: 403 }
    )
  }

  const { documentId, state } = await request.json()

  // STUB: In production, this would:
  // 1. Upload the signed document to Notarize.com
  // 2. Create a notarization session
  // 3. Return the notarization session URL for the user

  return NextResponse.json({
    stub: true,
    message: 'Notarize.com integration ready for API key configuration',
    notarizationUrl: null,
    sessionId: `stub-notarize-${Date.now()}`,
    instructions: 'Set NOTARIZE_API_KEY and NOTARIZE_ORGANIZATION_ID in .env to activate',
  })
}
