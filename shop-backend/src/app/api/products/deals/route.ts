import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Deterministic hash for consistent claim count simulation
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Get daily rotation seed based on current date (changes every 24 hours)
function getDailySeed(): number {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  return hashString(dateStr) % 100
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const type = searchParams.get('type') // flash | bundle | bogo

    // Build where clause: products on sale (isFlashDeal or comparePrice > price)
    const where = {
      isActive: true,
      OR: [
        { isFlashDeal: true },
        { comparePrice: { gt: prisma.product.fields.price } },
      ],
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { discount: 'desc' },
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
      },
    })

    // Enrich with computed fields
    const now = new Date()
    const enriched = products
      .map((product) => {
        const discountPercentage =
          product.comparePrice && product.comparePrice > product.price
            ? Math.round(
                ((product.comparePrice - product.price) / product.comparePrice) * 100
              )
            : product.discount

        // Daily rotation seed
        const dailySeed = getDailySeed()

        // Simulated claim count (deterministic based on product id + daily seed)
        const claimCount = (hashString(product.id + dailySeed) % 47) + 3 // 3-49 range

        // Determine deal type
        let dealType: 'flash' | 'bundle' | 'bogo' | 'discount' = 'discount'
        if (product.isFlashDeal) {
          dealType = 'flash'
        } else if (discountPercentage >= 30) {
          dealType = 'bundle'
        } else if (discountPercentage >= 15) {
          dealType = 'bogo'
        }

        // Smart deal score: discount % + daily rotation
        const dealScore = discountPercentage * 3 + (hashString(product.id + dailySeed) % 20)

        // Flash deal time remaining (simulated: ends at midnight)
        const flashDealEnds = product.isFlashDeal
          ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
          : null

        return {
          ...product,
          discountPercentage,
          dealType,
          claimCount,
          dealScore,
          isOnSale: discountPercentage > 0,
          flashDealEnds: flashDealEnds ? flashDealEnds.toISOString() : null,
        }
      })
      // Sort by dealScore descending for 24h rotation
      .sort((a, b) => b.dealScore - a.dealScore)
      .filter((product) => {
        // Apply type filter if specified
        if (!type) return true
        if (type === 'flash') return product.dealType === 'flash'
        if (type === 'bundle') return product.dealType === 'bundle'
        if (type === 'bogo') return product.dealType === 'bogo'
        return true
      })

    // Summary stats
    const totalDeals = enriched.length
    const maxDiscount = enriched.length > 0
      ? Math.max(...enriched.map((p) => p.discountPercentage))
      : 0
    const avgDiscount = enriched.length > 0
      ? Math.round(enriched.reduce((sum, p) => sum + p.discountPercentage, 0) / enriched.length)
      : 0

    return NextResponse.json({
      products: enriched,
      summary: {
        totalDeals,
        maxDiscount,
        avgDiscount,
        flashDealCount: enriched.filter((p) => p.dealType === 'flash').length,
        bundleDealCount: enriched.filter((p) => p.dealType === 'bundle').length,
        bogoDealCount: enriched.filter((p) => p.dealType === 'bogo').length,
      },
    })
  } catch (error) {
    console.error('Error fetching deal products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal products' },
      { status: 500 }
    )
  }
}
