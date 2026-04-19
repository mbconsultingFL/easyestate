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
          // TEMPORARY diagnostic: log the real cause and surface it to the client
      // so a misconfigured Blobs store / env var is visible from the browser.
      // Revert this block to `return NextResponse.json({ error: 'Registration failed' }, { status: 500 })`
      // once registration works end-to-end.
      console.error('[api/auth/register] failed:', error)
          const detail = {
                  name: error instanceof Error ? error.name : 'UnknownError',
                  message: error instanceof Error ? error.message : String(error),
          }
          return NextResponse.json({ error: 'Registration failed', detail }, { status: 500 })
    }
}
