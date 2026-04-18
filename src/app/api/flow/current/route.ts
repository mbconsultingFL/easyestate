import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { flowSessions } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const documentType = searchParams.get('type') || 'medical_poa'

  const flowSession = await flowSessions.findActiveByUser(session.user.id, documentType)
  return NextResponse.json({ session: flowSession || null })
}
