import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '8')))
    const categoryId = searchParams.get('categoryId') || undefined

    // Products where isNew=true OR createdAt within 3 days (72 hours)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [{ isNew: true }, { createdAt: { gte: threeDaysAgo } }],
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Enrich with computed fields
    const enriched = products.map((product) => {
      const discountPercentage =
        product.comparePrice && product.comparePrice > product.price
          ? Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) * 100
            )
          : 0

      const averageRating = product.rating

      // Days since product was added
      const daysSinceAdded = Math.floor(
        (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        ...product,
        discountPercentage,
        averageRating,
        daysSinceAdded,
        isOnSale: discountPercentage > 0,
        isNewArrival: daysSinceAdded <= 3,
      }
    })

    return NextResponse.json({
      products: enriched,
      total: enriched.length,
    })
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch new arrivals' },
      { status: 500 }
    )
  }
}
