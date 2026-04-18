import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { flowSessions } from '@/lib/db'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId, answers } = await request.json()
  if (typeof sessionId !== 'string' || !sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }
  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: 'Missing answers' }, { status: 400 })
  }

  // Ownership check — prevent IDOR. Without this, any authenticated user
  // could overwrite any other user's flow session by guessing/leaking an id.
  const owned = await flowSessions.findByUserAndId(session.user.id, sessionId)
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await flowSessions.update(sessionId, {
    answers: JSON.stringify(answers),
    ageRange: answers.age_range || null,
    familySituation: answers.family_situation || null,
  })
  return NextResponse.json({ ok: true })
}
