import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { users } from '@/lib/db'

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
              return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
      } catch (error) {
              // Real cause is logged to the Netlify function log; the client only ever
        // sees a generic message so error details don't leak to end users.
        console.error('[api/auth/register] failed:', error)
              return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
      }
}
