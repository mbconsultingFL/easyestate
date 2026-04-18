import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { documents } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { type } = await request.json()
    if (!type) return NextResponse.json({ error: 'Document type required' }, { status: 400 })

    const doc = await documents.findByUserAndType(session.user.id, type)
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    if (doc.status !== 'ready_to_sign') {
      return NextResponse.json({ error: 'Document is not ready to sign' }, { status: 400 })
    }

    await documents.update(doc.id, {
      status: 'complete',
      completedAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mark signed error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}
