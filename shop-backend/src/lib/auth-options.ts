import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Grapsee.com base URL — change to production URL when ready
export const GRAPSEE_URL = process.env.GRAPSEE_URL || 'https://grapsee.com'

async function verifyGrapseeToken(token: string): Promise<{
  id: string; name: string; email: string; avatar?: string; role?: string
} | null> {
  try {
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

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // Email/Password Credentials Login
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role,
        }
      },
    }),
    // Grapsee SSO Login
    CredentialsProvider({
      id: 'grapsee',
      name: 'Grapsee',
      credentials: {
        token: { label: 'Grapsee Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        const grapseeUser = await verifyGrapseeToken(credentials.token)
        if (!grapseeUser) return null

        const user = await prisma.user.upsert({
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

        const existingWallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
        if (!existingWallet) {
          await prisma.wallet.create({ data: { userId: user.id, balance: 0, currency: 'BDT' } })
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
}
