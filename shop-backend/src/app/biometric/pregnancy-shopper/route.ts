import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get pregnancy-stage based recommendations
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { weeks, dueDate, symptoms } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save pregnancy profile
    await prisma.pregnancyProfile.upsert({
      where: { userId },
      update: {
        dueDate: new Date(dueDate),
        preferences: JSON.stringify({ weeks, symptoms })
      },
      create: {
        userId,
        dueDate: new Date(dueDate),
        preferences: JSON.stringify({ weeks, symptoms })
      }
    }).catch(() => {})

    const recommendations: Array<{stage: string; message: string; products: any[]; tips?: string[]}> = []

    // First trimester (0-12 weeks)
    if (weeks <= 12) {
      const firstTrimProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'maternity' } },
            { tags: { contains: 'prenatal vitamin' } },
            { tags: { contains: 'morning sickness' } },
            { name: { contains: 'pregnancy pillow' } }
          ]
        },
        take: 8
      })

      recommendations.push({
        stage: 'first_trimester',
        message: `Congratulations! Week ${weeks} - Here are essentials for your first trimester.`,
        products: firstTrimProducts,
        tips: [
          'Take prenatal vitamins daily',
          'Stay hydrated',
          'Rest when you need to',
          'Avoid raw foods'
        ]
      })
    }

    // Second trimester (13-27 weeks)
    if (weeks > 12 && weeks <= 27) {
      const secondTrimProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'maternity wear' } },
            { tags: { contains: 'stretch mark' } },
            { tags: { contains: 'pregnancy support' } }
          ]
        },
        take: 8
      })

      recommendations.push({
        stage: 'second_trimester',
        message: `Week ${weeks} - The comfortable phase! Maternity essentials for you.`,
        products: secondTrimProducts,
        tips: [
          'Stay active with light exercise',
          'Moisturize to prevent stretch marks',
          'Shop for maternity clothes'
        ]
      })
    }

    // Third trimester (28+ weeks)
    if (weeks > 27) {
      const thirdTrimProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'nursery' } },
            { tags: { contains: 'baby essentials' } },
            { tags: { contains: 'hospital bag' } },
            { tags: { contains: 'newborn' } }
          ]
        },
        take: 10
      })

      recommendations.push({
        stage: 'third_trimester',
        message: `Week ${weeks} - Almost there! Preparing for baby arrival.`,
        products: thirdTrimProducts,
        tips: [
          'Pack your hospital bag',
          'Set up the nursery',
          'Install car seat',
          'Finalize baby name'
        ]
      })
    }

    // Symptom-based suggestions
    if (symptoms?.includes('nausea')) {
      const nauseaProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'ginger' } },
            { tags: { contains: 'acupressure' } },
            { name: { contains: 'nausea relief' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        stage: 'symptom_relief',
        message: 'Morning sickness remedies',
        products: nauseaProducts
      })
    }

    return NextResponse.json({
      weeks,
      stage: weeks <= 12 ? 'first' : weeks <= 27 ? 'second' : 'third',
      recommendations,
      countdown: Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      checklist: generatePregnancyChecklist(weeks)
    })
  } catch (error) {
    console.error('Pregnancy shopper error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generatePregnancyChecklist(weeks: number): string[] {
  if (weeks <= 12) {
    return [
      'Schedule first prenatal visit',
      'Start taking prenatal vitamins',
      'Research healthcare providers',
      'Announce pregnancy (optional)'
    ]
  } else if (weeks <= 27) {
    return [
      'Gender reveal ultrasound',
      'Register for baby shower',
      'Buy maternity clothes',
      'Plan baby nursery'
    ]
  } else {
    return [
      'Pack hospital bag',
      'Install car seat',
      'Wash baby clothes',
      'Prep freezer meals',
      'Final nursery touches'
    ]
  }
}
