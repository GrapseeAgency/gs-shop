import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get social proof display preferences
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ showSocialProof: true })
    }

    const prefs = await prisma.userPreference.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      showSocialProof: prefs?.showSocialProof !== false,
      showReviews: prefs?.showReviews !== false,
      showPopularity: prefs?.showPopularity !== false,
      showNotifications: prefs?.showNotifications !== false
    })
  } catch (error) {
    console.error('Social proof toggle error:', error)
    return NextResponse.json({ showSocialProof: true })
  }
}

// POST - Toggle social proof display
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { showSocialProof, showReviews, showPopularity, showNotifications } = await req.json()

    await prisma.userPreference.upsert({
      where: { userId },
      update: {
        showSocialProof,
        showReviews,
        showPopularity,
        showNotifications,
        updatedAt: new Date()
      },
      create: {
        userId,
        showSocialProof: showSocialProof ?? true,
        showReviews: showReviews ?? true,
        showPopularity: showPopularity ?? true,
        showNotifications: showNotifications ?? true
      }
    })

    const message = !showSocialProof
      ? 'Social proof hidden. Shop without influence!'
      : 'Social proof enabled. See what others are doing.'

    return NextResponse.json({
      success: true,
      settings: {
        showSocialProof,
        showReviews,
        showPopularity,
        showNotifications
      },
      message,
      impact: !showSocialProof
        ? 'You may make more independent choices'
        : 'You can see trends and popular items'
    })
  } catch (error) {
    console.error('Toggle error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
