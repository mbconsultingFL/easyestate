import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { users } from './db'

// Boot-time guard — refuse to start production with an obviously unsafe
// NEXTAUTH_SECRET. This runs once when the auth module is imported.
const PLACEHOLDER_SECRETS = new Set([
  '',
  'dev-secret-change-in-production',
  'replace-me-with-a-random-32-byte-base64-string',
])
const secret = process.env.NEXTAUTH_SECRET ?? ''
if (process.env.NODE_ENV === 'production') {
  if (PLACEHOLDER_SECRETS.has(secret) || secret.length < 32) {
    throw new Error(
      'NEXTAUTH_SECRET must be set to a random 32+ byte string in production. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    )
  }
}

export const authOptions: NextAuthOptions = {
  secret,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await users.findByEmail(credentials.email)
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string
      return session
    },
  },
  pages: { signIn: '/login' },
}
