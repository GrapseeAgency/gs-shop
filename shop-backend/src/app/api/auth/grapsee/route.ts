import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Grapsee OAuth Configuration
const GRAPSEE_AUTH_URL = process.env.GRAPSEE_AUTH_URL || 'https://grapsee.com/api/auth/oauth'
const GRAPSEE_CLIENT_ID = process.env.GRAPSEE_CLIENT_ID || 'grapsee-shop-client'
const GRAPSEE_CLIENT_SECRET = process.env.GRAPSEE_CLIENT_SECRET

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code) {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/grapsee`
    const authUrl = `${GRAPSEE_AUTH_URL}/authorize?client_id=${GRAPSEE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid profile email&state=${state || 'random-state'}`
    
    return NextResponse.redirect(authUrl)
  }
  
  // Exchange code for tokens
  try {
    const tokenResponse = await fetch(`${GRAPSEE_AUTH_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: GRAPSEE_CLIENT_ID,
        client_secret: GRAPSEE_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/grapsee`
      })
    })
    
    const tokens = await tokenResponse.json()
    
    // Get user info from Grapsee
    const userResponse = await fetch(`${GRAPSEE_AUTH_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    
    const grapseeUser = await userResponse.json()
    
    // Create or update user in Grapsee Shop
    let user = await prisma.user.findUnique({
      where: { grapseeId: grapseeUser.sub }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: grapseeUser.name || 'Grapsee User',
          email: grapseeUser.email || `user_${grapseeUser.sub}@grapsee.local`,
          grapseeId: grapseeUser.sub,
          role: 'customer'
        }
      })
    } else {
      // Update Grapsee ID if not set
      if (!user.grapseeId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { grapseeId: grapseeUser.sub }
        })
      }
    }
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sessionToken: tokens.access_token
      }
    })
    
    // Set session cookie
    const redirectPath = state && state.startsWith('/') ? state : '/'
    const response = NextResponse.redirect(new URL(redirectPath, req.url))
    response.cookies.set('grapsee-shop-session', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })
    
    return response
    
  } catch (error) {
    console.error('Grapsee auth error:', error)
    return NextResponse.redirect('/login?error=grapsee_auth_failed')
  }
}
