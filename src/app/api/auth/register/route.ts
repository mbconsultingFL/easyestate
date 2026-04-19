import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { users } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const existing = await users.findByEmail(email)
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await users.create({ email, passwordHash, name: name || null })

    // Fire-and-forget welcome email. If Resend is misconfigured or down, the
    // helper logs it and swallows the error — never let a transactional mail
    // failure break an otherwise-successful signup.
    void sendWelcomeEmail(user.email, user.name).then((result) => {
      if (!result.ok && !('skipped' in result && result.skipped)) {
        console.error('[api/auth/register] welcome email failed:', result.error)
      }
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (error) {
    // Real cause is logged to the Netlify function log; the client only ever
    // sees a generic message so error details don't leak to end users.
    console.error('[api/auth/register] failed:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
