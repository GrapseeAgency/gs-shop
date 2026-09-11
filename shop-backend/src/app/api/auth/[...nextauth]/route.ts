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
import { authOptions } from '@/lib/auth-options'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
