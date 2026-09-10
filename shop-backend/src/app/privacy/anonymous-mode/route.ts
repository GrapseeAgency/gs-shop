import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enable anonymous browsing
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enable } = await req.json()

    await prisma.privacySettings.upsert({
      where: { userId },
      update: {
        anonymousMode: enable,
        disableTracking: enable,
        updatedAt: new Date()
      },
      create: {
        userId,
        anonymousMode: enable,
        disableTracking: enable
      }
    })

    if (enable) {
      // Clear recent tracking data
      await prisma.searchQuery.deleteMany({
        where: { userId }
      }).catch(() => {})
      
      await prisma.productView.deleteMany({
        where: { userId }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      anonymousMode: enable,
      message: enable 
        ? 'Anonymous mode enabled. Your browsing will not be tracked or saved.'
        : 'Anonymous mode disabled. Normal tracking resumed.',
      features: {
        noRecommendations: enable,
        noHistory: enable,
        noPersonalization: enable,
        cookiesCleared: enable
      }
    })
  } catch (error) {
    console.error('Anonymous mode error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// GET - Check anonymous mode status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ anonymousMode: false })
    }

    const settings = await prisma.privacySettings.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      anonymousMode: settings?.anonymousMode || false,
      disableTracking: settings?.disableTracking || false,
      autoDeleteHistory: settings?.autoDeleteHistory || false,
      deleteAfterDays: settings?.deleteAfterDays || 30
    })
  } catch (error) {
    console.error('Privacy settings error:', error)
    return NextResponse.json({ anonymousMode: false })
  }
}
