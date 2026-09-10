import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prefs = await prisma.userPreference.findUnique({ where: { userId } })

    return NextResponse.json({
      onboardingComplete: prefs?.onboardingComplete ?? false,
      interests: prefs?.interests ? JSON.parse(prefs.interests) : [],
      shopStyle: prefs?.shopStyle ?? null,
    })
  } catch (error) {
    console.error('[USER_PREFS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { interests, shopStyle, onboardingComplete } = body

    const data: Record<string, unknown> = {}
    if (interests !== undefined) data.interests = JSON.stringify(interests)
    if (shopStyle !== undefined) data.shopStyle = shopStyle
    if (onboardingComplete !== undefined) data.onboardingComplete = onboardingComplete

    const prefs = await prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })

    return NextResponse.json({ success: true, data: prefs })
  } catch (error) {
    console.error('[USER_PREFS_PUT]', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
