import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Deterministic hash for consistent pick selection
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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '8')))

    const dailySeed = getDailySeed()

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    // Smart pick score: featured weight + review count + daily rotation
    const enriched = products.map((product) => {
      const reviewRatings = product.reviews.map((r: any) => r.rating)
      const averageRating =
        reviewRatings.length > 0
          ? Math.round(
              (reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length) * 10
            ) / 10
          : product.rating

      const discountPercentage =
        product.comparePrice && product.comparePrice > product.price
          ? Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) * 100
            )
          : 0

      // Pick score algorithm: featured + review count + random daily factor
      const pickScore = Math.round(
        (product.isFeatured ? 50 : 0) + // Featured products get big boost
        product.reviewCount * 3 +
        averageRating * 5 +
        (hashString(product.id + dailySeed) % 25) // Daily rotation
      )

      const { reviews, ...rest } = product
      return {
        ...rest,
        averageRating,
        discountPercentage,
        pickScore,
        isOnSale: discountPercentage > 0,
      }
    })

    // Sort by pick score descending and take top N
    enriched.sort((a, b) => b.pickScore - a.pickScore)

    // Take top products based on limit
    const picks = enriched.slice(0, limit)

    return NextResponse.json({
      products: picks,
      total: picks.length,
      date: new Date().toISOString().split('T')[0], // Current date for reference
    })
  } catch (error) {
    console.error('Error fetching daily picks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily picks' },
      { status: 500 }
    )
  }
}
