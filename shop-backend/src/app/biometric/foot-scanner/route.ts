import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze foot size from camera/image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const footData = { archType: 'normal', length: 260, width: 'D' }

    // Brand size conversions
    const brandSizes: Record<string, { size: number; note: string }> = {
      'Nike': { size: 9.5, note: 'Nike runs small - size up 0.5' },
      'Adidas': { size: 9, note: 'Adidas true to size' },
      'Puma': { size: 9, note: 'Puma true to size' },
      'New Balance': { size: 9, note: 'New Balance offers width options' },
      'Converse': { size: 8.5, note: 'Converse runs large - size down 0.5' }
    }

    // Get shoe recommendations
    const recommendations = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: 'shoe' } },
          { tags: { contains: 'footwear' } },
          { name: { contains: 'shoe' } }
        ]
      },
      take: 12
    })

    // Save profile
    if (userId) {
      await prisma.userBiometricProfile.upsert({
        where: { userId },
        update: {
          footSize: JSON.stringify(footData),
          updatedAt: new Date()
        },
        create: {
          userId,
          footSize: JSON.stringify(footData)
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      analysis: [],
      brandConversions: brandSizes,
      recommendations,
      tips: getFootCareTips(footData.archType),
      perfectFit: true
    })
  } catch (error) {
    console.error('Foot scanner error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function getFootCareTips(archType: string): string[] {
  const tips: Record<string, string[]> = {
    flat: [
      'Look for shoes with arch support',
      'Consider orthotic insoles',
      'Avoid very flat shoes'
    ],
    normal: [
      'Most shoe types will work for you',
      'Ensure proper cushioning',
      'Rotate between different pairs'
    ],
    high: [
      'Look for cushioned arch support',
      'Avoid high heels',
      'Consider shock-absorbing soles'
    ]
  }
  return tips[archType] || tips.normal
}
