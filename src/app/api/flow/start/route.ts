import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { flowSessions, documents } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const documentType = body.documentType || 'medical_poa'

  const flowSession = await flowSessions.create({ userId: session.user.id, documentType })
  const existingDoc = await documents.findByUserAndType(session.user.id, documentType)
  if (!existingDoc) {
    await documents.create({ userId: session.user.id, type: documentType, status: 'in_progress' })
  } else {
    await documents.update(existingDoc.id, { status: 'in_progress' })
  }
  return NextResponse.json({ id: flowSession.id })
}
