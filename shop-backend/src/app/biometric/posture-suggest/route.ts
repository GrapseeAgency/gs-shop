import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get posture-based product suggestions
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { postureData, workHours } = await req.json()

    // Analyze posture issues
    const issues: string[] = []
    const recommendations: Array<{type: string; issue: string; message: string; products: any[]; priority: string; tips?: string[]}> = []

    if (postureData?.slouching > 60) {
      issues.push('slouching')
      
      const postureProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'posture corrector' } },
            { tags: { contains: 'back support' } },
            { tags: { contains: 'ergonomic' } },
            { name: { contains: 'lumbar' } }
          ]
        },
        take: 5
      })

      recommendations.push({
        type: 'posture_correction',
        issue: 'Frequent slouching detected',
        message: 'Your posture needs support. These products can help.',
        products: postureProducts,
        priority: 'high'
      })
    }

    if (workHours > 8) {
      const deskProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'standing desk' } },
            { tags: { contains: 'desk converter' } },
            { tags: { contains: 'monitor stand' } },
            { name: { contains: 'ergonomic chair' } }
          ]
        },
        take: 5
      })

      recommendations.push({
        type: 'work_setup',
        issue: 'Long work hours detected',
        message: 'You work over 8 hours daily. Upgrade your workspace ergonomics.',
        products: deskProducts,
        priority: 'high',
        tips: [
          'Take standing breaks every 30 minutes',
          'Position monitor at eye level',
          'Keep feet flat on floor'
        ]
      })
    }

    if (postureData?.neckStrain > 50) {
      const neckProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'neck pillow' } },
            { tags: { contains: 'cervical' } },
            { name: { contains: 'neck support' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'neck_care',
        issue: 'Neck strain detected',
        message: 'Your neck needs relief. Consider these supportive products.',
        products: neckProducts,
        priority: 'medium'
      })
    }

    // Save health profile
    if (userId) {
      await prisma.healthProfile.upsert({
        where: { userId },
        update: {
          recommendations: JSON.stringify({ postureData, workHours })
        },
        create: {
          userId,
          recommendations: JSON.stringify({ postureData, workHours })
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      issues,
      recommendations,
      healthScore: calculatePostureScore(postureData, workHours),
      alert: issues.length > 0 ? 'Posture improvement recommended' : null
    })
  } catch (error) {
    console.error('Posture suggest error:', error)
    return NextResponse.json({ recommendations: [] })
  }
}

function calculatePostureScore(data: any, hours: number): number {
  let score = 100
  
  if (data?.slouching) score -= data.slouching * 0.5
  if (data?.neckStrain) score -= data.neckStrain * 0.3
  if (hours > 8) score -= (hours - 8) * 2
  
  return Math.max(0, Math.round(score))
}
