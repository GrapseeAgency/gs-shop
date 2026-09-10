import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Adapt UI based on noise level
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { noiseLevel } = await req.json() // 0-100

    let adaptation: { mode?: string; changes?: Record<string, unknown>; message?: string } = {}

    if (noiseLevel > 70) {
      // Loud environment - simplify UI
      adaptation = {
        mode: 'distraction_free',
        changes: {
          fontSize: 'larger',
          contrast: 'high',
          animations: 'reduced',
          autoPlay: false,
          notifications: 'silent',
          voiceEnabled: true // Voice navigation helpful in loud places
        },
        message: 'Noisy environment detected. UI simplified for focus.'
      }
    } else if (noiseLevel < 20) {
      // Quiet environment - full features
      adaptation = {
        mode: 'full_experience',
        changes: {
          fontSize: 'normal',
          contrast: 'normal',
          animations: 'full',
          autoPlay: true,
          notifications: 'enabled',
          voiceEnabled: false
        },
        message: 'Quiet environment. Full experience enabled.'
      }
    } else {
      // Normal
      adaptation = {
        mode: 'standard',
        changes: {
          fontSize: 'normal',
          contrast: 'normal',
          animations: 'normal'
        }
      }
    }

    // Save preference
    if (userId) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: {
          noiseAdaptation: adaptation.mode,
          updatedAt: new Date()
        },
        create: {
          userId,
          noiseAdaptation: adaptation.mode
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      noiseLevel,
      adaptation,
      accessibility: noiseLevel > 70 ? [
        'Voice navigation available',
        'Large touch targets enabled',
        'High contrast mode active'
      ] : []
    })
  } catch (error) {
    console.error('Noise adaptation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
