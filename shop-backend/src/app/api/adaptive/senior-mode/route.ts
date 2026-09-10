import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enable senior-friendly shopping mode
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enable, age } = await req.json()

    if (enable) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: {
          seniorMode: true,
          fontSize: 'large',
          highContrast: true,
          voiceEnabled: true,
          simpleCheckout: true,
          updatedAt: new Date()
        },
        create: {
          userId,
          seniorMode: true,
          fontSize: 'large',
          highContrast: true,
          voiceEnabled: true,
          simpleCheckout: true
        }
      })

      return NextResponse.json({
        enabled: true,
        features: {
          fontSize: '24px (large)',
          contrast: 'High contrast mode',
          checkout: 'Simplified - Cash on Delivery default',
          assistance: 'Phone support available',
          delivery: 'Agent will help set up product'
        },
        message: 'Senior mode enabled! Shopping is now simpler and safer.',
        helpLine: 'Call 1800-123-4567 for assistance'
      })
    } else {
      await prisma.userPreference.update({
        where: { userId },
        data: { seniorMode: false }
      }).catch(() => {})

      return NextResponse.json({
        enabled: false,
        message: 'Senior mode disabled. Standard interface restored.'
      })
    }
  } catch (error) {
    console.error('Senior mode error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Check senior mode status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ enabled: false })
    }

    const prefs = await prisma.userPreference.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      enabled: prefs?.seniorMode || false,
      settings: prefs?.seniorMode ? {
        fontSize: prefs.fontSize || 'large',
        highContrast: prefs.highContrast || true,
        voiceEnabled: prefs.voiceEnabled || true,
        simpleCheckout: prefs.simpleCheckout || true
      } : null
    })
  } catch (error) {
    console.error('Senior mode status error:', error)
    return NextResponse.json({ enabled: false })
  }
}
