import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const badgeColors: Record<string, string> = {
  organic: 'emerald',
  recycled: 'sky',
  sustainable: 'teal',
  'carbon-neutral': 'lime',
  'fair-trade': 'amber',
}

const badgeIcons: Record<string, string> = {
  organic: '',
  recycled: '',
  sustainable: '',
  'carbon-neutral': '',
  'fair-trade': '',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const badge = searchParams.get('badge')
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const sort = searchParams.get('sort') || 'score'
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (badge) where.ecoBadge = badge
    if (minScore > 0) where.ecoScore = { gte: minScore }

    let ecoProducts = await prisma.ecoProduct.findMany({
      where,
      orderBy: sort === 'score' ? { ecoScore: 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    // Enrich with product details if available
    const enrichedProducts = await Promise.all(
      ecoProducts.map(async (ep) => {
        const product = await prisma.product.findUnique({
          where: { id: ep.productId },
          select: { name: true, price: true, imageUrl: true, slug: true },
        })
        return {
          ...ep,
          product: product || { name: 'Unknown Product', price: 0, imageUrl: null },
        }
      })
    )

    let result = enrichedProducts.length > 0 ? enrichedProducts : [] as any

    // Apply client-side filters
    if (badge && result.length > 0) {
      result = result.filter((p: any) => p.ecoBadge === badge)
    }
    if (minScore > 0 && result.length > 0) {
      result = result.filter((p: any) => p.ecoScore >= minScore)
    }

    // Add visual metadata
    const finalResult = result.map((p: any) => ({
      ...p,
      badgeColor: badgeColors[p.ecoBadge] || 'gray',
      badgeIcon: badgeIcons[p.ecoBadge] || '',
      scoreLevel: p.ecoScore >= 90 ? 'excellent' : p.ecoScore >= 75 ? 'great' : p.ecoScore >= 60 ? 'good' : 'fair',
      totalImpact: {
        co2Saved: p.co2Saved || 0,
        waterSaved: p.waterSaved || 0,
        treesEquivalent: Math.round((p.co2Saved || 0) / 22),
      },
    }))

    // Summary stats
    const totalCo2 = finalResult.reduce((sum: number, p: any) => sum + (p.co2Saved || 0), 0)
    const totalWater = finalResult.reduce((sum: number, p: any) => sum + (p.waterSaved || 0), 0)
    const avgScore = finalResult.length > 0
      ? Math.round(finalResult.reduce((sum: number, p: any) => sum + p.ecoScore, 0) / finalResult.length)
      : 0

    return NextResponse.json({
      ecoProducts: finalResult,
      total: finalResult.length,
      summary: { totalCo2, totalWater, avgScore, badgeTypes: Object.keys(badgeColors) },
    })
  } catch (error) {
    console.error('Eco shop list error:', error)
    return NextResponse.json(
      {
        ecoProducts: [].map(p => ({
          ...p,
          badgeColor: badgeColors[p.ecoBadge] || 'gray',
          badgeIcon: badgeIcons[p.ecoBadge] || '',
          scoreLevel: p.ecoScore >= 90 ? 'excellent' : p.ecoScore >= 75 ? 'great' : 'good',
          totalImpact: {
            co2Saved: p.co2Saved || 0,
            waterSaved: p.waterSaved || 0,
            treesEquivalent: Math.round((p.co2Saved || 0) / 22),
          },
        })),
        total: [].length,
        summary: {
          totalCo2: [].reduce((s, p) => s + (p.co2Saved || 0), 0),
          totalWater: [].reduce((s, p) => s + (p.waterSaved || 0), 0),
          avgScore: Math.round([].reduce((s, p) => s + p.ecoScore, 0) / [].length),
          badgeTypes: Object.keys(badgeColors),
        },
      },
      { status: 200 }
    )
  }
}
