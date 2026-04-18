import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { users } from '@/lib/db'

// STUB: DocuSign integration
// In production, replace with actual DocuSign eSignature API calls
// See: https://developers.docusign.com/docs/esign-rest-api/

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // E-signing requires an active Pro subscription
  const user = await users.findById(session.user.id)
  if (!user || user.subscriptionStatus !== 'active') {
    return NextResponse.json(
      { error: 'Pro subscription required', requiresSubscription: true },
      { status: 403 }
    )
  }

  const { documentId } = await request.json()

  // STUB: In production, this would:
  // 1. Create a DocuSign envelope with the PDF
  // 2. Add signing recipients (principal + witnesses)
  // 3. Return the signing URL for embedded signing

  return NextResponse.json({
    stub: true,
    message: 'DocuSign integration ready for API key configuration',
    signingUrl: null,
    envelopeId: `stub-envelope-${Date.now()}`,
    instructions: 'Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_ACCOUNT_ID, and DOCUSIGN_RSA_PRIVATE_KEY in .env to activate',
  })
}
