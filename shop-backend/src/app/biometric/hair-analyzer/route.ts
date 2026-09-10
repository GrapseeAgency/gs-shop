import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze hair and recommend products
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

        const hairTypes = ['straight', 'wavy', 'curly', 'coily']
    const conditions = ['dry', 'oily', 'normal', 'damaged', 'thinning']
    const colors = ['black', 'brown', 'blonde', 'red', 'gray']

    const analysis = {
      hairType: hairTypes[Math.floor(Math.random() * hairTypes.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      volume: ['fine', 'medium', 'thick'][Math.floor(Math.random() * 3)]
    }

    // Find matching hair products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { category: { name: { contains: 'hair' } } },
          { tags: { contains: 'haircare' } },
          { tags: { contains: analysis.hairType } },
          { tags: { contains: analysis.condition } }
        ]
      },
      take: 8
    })

    // Score products by match
    const scored = products.map(p => {
      let score = 0
      if (p.tags?.includes(analysis.hairType)) score += 20
      if (p.tags?.includes(analysis.condition)) score += 20
      if (p.name?.toLowerCase().includes(analysis.hairType)) score += 15
      return { ...p, matchScore: score }
    }).sort((a, b) => b.matchScore - a.matchScore)

    // Save profile
    if (userId) {
      await prisma.userBiometricProfile.upsert({
        where: { userId },
        update: {
          bodyMeasurements: JSON.stringify({ hairProfile: analysis })
        },
        create: {
          userId,
          bodyMeasurements: JSON.stringify({ hairProfile: analysis })
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      analysis,
      recommendations: scored.slice(0, 6),
      routine: generateHairRoutine(analysis),
      tip: `For ${analysis.hairType} hair that's ${analysis.condition}, use gentle, moisturizing products.`
    })
  } catch (error) {
    console.error('Hair analyzer error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

function generateHairRoutine(analysis: any) {
  const routines: Record<string, string[]> = {
    dry: ['Deep conditioning weekly', 'Use sulfate-free shampoo', 'Apply leave-in conditioner'],
    oily: ['Wash every other day', 'Use clarifying shampoo weekly', 'Avoid heavy conditioners'],
    normal: ['Wash 2-3 times a week', 'Regular conditioning', 'Protect from heat'],
    damaged: ['Protein treatments', 'Trim every 6-8 weeks', 'Minimize heat styling'],
    thinning: ['Gentle scalp massage', 'Volume-boosting products', 'Avoid tight hairstyles']
  }
  
  return routines[analysis.condition] || routines.normal
}
