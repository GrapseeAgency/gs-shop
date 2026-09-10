import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Track screen time and suggest products
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { screenTimeMinutes, deviceType } = await req.json()

    if (!userId) {
      return NextResponse.json({ suggestions: [] })
    }

    // Save screen time data
    await prisma.healthProfile.upsert({
      where: { userId },
      update: {
        screenTime: screenTimeMinutes,
        lastEyeCheck: new Date()
      },
      create: {
        userId,
        screenTime: screenTimeMinutes
      }
    }).catch(() => {})

    const suggestions = []
    
    // If screen time > 2 hours (120 minutes)
    if (screenTimeMinutes > 120) {
      const eyeCareProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'blue-light' } },
            { tags: { contains: 'eye-care' } },
            { tags: { contains: 'screen-protection' } },
            { name: { contains: 'glasses' } }
          ]
        },
        take: 6
      })

      suggestions.push({
        type: 'eye_strain',
        message: `You've been on screen for ${Math.floor(screenTimeMinutes / 60)} hours. Protect your eyes!`,
        urgency: screenTimeMinutes > 240 ? 'high' : 'medium',
        products: eyeCareProducts,
        tips: [
          'Take 20-20-20 breaks: Every 20 min, look 20 feet away for 20 sec',
          'Adjust screen brightness to match surroundings',
          'Position screen at arm\'s length and slightly below eye level'
        ]
      })
    }

    // Posture suggestions after 3+ hours
    if (screenTimeMinutes > 180) {
      const ergonomicProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'ergonomic' } },
            { tags: { contains: 'posture' } },
            { tags: { contains: 'stand' } },
            { name: { contains: 'laptop stand' } }
          ]
        },
        take: 4
      })

      suggestions.push({
        type: 'posture',
        message: `${Math.floor(screenTimeMinutes / 60)} hours on device - check your posture!`,
        products: ergonomicProducts,
        tips: [
          'Sit with feet flat on floor',
          'Keep shoulders relaxed',
          'Take standing breaks every hour'
        ]
      })
    }

    return NextResponse.json({
      screenTime: screenTimeMinutes,
      suggestions,
      healthScore: Math.max(0, 100 - (screenTimeMinutes / 10)),
      alert: screenTimeMinutes > 300 ? ' Extended screen time detected' : null
    })
  } catch (error) {
    console.error('Eye strain error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}
