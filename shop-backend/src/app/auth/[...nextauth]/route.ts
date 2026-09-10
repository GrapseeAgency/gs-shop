/**
 * Grapsee SSO Auth
 *
 * Primary login: "Login with Grapsee" button  redirects to grapsee.com/login?callback=...
 * grapsee.com issues a short-lived token and redirects back to /api/auth/callback/grapsee
 * This CredentialsProvider validates that token against the Grapsee API.
 *
 * TODO: Replace the CredentialsProvider below with a proper OAuth2/OIDC provider
 * once grapsee.com exposes its OAuth endpoints. The rest of the callback
 * logic (upsert user, set session) stays the same.
 */
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

// Grapsee.com base URL  change to production URL when ready
const GRAPSEE_URL = process.env.GRAPSEE_URL || 'https://grapsee.com'

async function verifyGrapseeToken(token: string): Promise<{
  id: string; name: string; email: string; avatar?: string; role?: string
} | null> {
  try {
    // TODO: Replace with real grapsee.com token validation endpoint
    // e.g. GET https://grapsee.com/api/auth/me with Authorization: Bearer <token>
    const res = await fetch(`${GRAPSEE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      id: 'grapsee',
      name: 'Grapsee',
      credentials: {
        // The token returned by grapsee.com after successful login
        token: { label: 'Grapsee Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        const grapseeUser = await verifyGrapseeToken(credentials.token)
        if (!grapseeUser) return null

        // Upsert user in local DB
        const user = await db.user.upsert({
          where: { email: grapseeUser.email },
          update: {
            name: grapseeUser.name,
            avatar: grapseeUser.avatar || null,
          },
          create: {
            name: grapseeUser.name,
            email: grapseeUser.email,
            avatar: grapseeUser.avatar || null,
            role: grapseeUser.role || 'customer',
            loyaltyTier: 'bronze',
            rewardsPoints: 100,
          },
        })

        // Create wallet if not exists
        const existingWallet = await db.wallet.findUnique({ where: { userId: user.id } })
        if (!existingWallet) {
          await db.wallet.create({ data: { userId: user.id, balance: 0, currency: 'BDT' } })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || 'customer'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
export { GRAPSEE_URL }
