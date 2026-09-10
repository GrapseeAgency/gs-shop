import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Deterministic hash for consistent trending score
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '8')))
    const categoryId = searchParams.get('categoryId') || undefined

    const where: Record<string, unknown> = {
      isActive: true,
      isTrending: true,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { reviewCount: 'desc' },
      take: limit,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    // Enrich with computed fields and trending score
    const enriched = products.map((product) => {
      const discountPercentage =
        product.comparePrice && product.comparePrice > product.price
          ? Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) * 100
            )
          : 0

      // Compute average from actual reviews
      const reviewRatings = product.reviews.map((r) => r.rating)
      const averageRating =
        reviewRatings.length > 0
          ? Math.round(
              (reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length) * 10
            ) / 10
          : product.rating

      // Trending score: composite of reviewCount, rating, and recency
      const trendingScore = Math.round(
        product.reviewCount * 2 +
        averageRating * 10 +
        (hashString(product.id) % 20) + // Simulated view velocity
        (product.isFlashDeal ? 15 : 0)
      )

      const { reviews, ...rest } = product
      return {
        ...rest,
        discountPercentage,
        averageRating,
        trendingScore,
        isOnSale: discountPercentage > 0,
      }
    })

    // Sort by trending score descending
    enriched.sort((a, b) => b.trendingScore - a.trendingScore)

    return NextResponse.json({
      products: enriched,
      total: enriched.length,
    })
  } catch (error) {
    console.error('Error fetching trending products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending products' },
      { status: 500 }
    )
  }
}
