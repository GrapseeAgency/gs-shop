import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '8')))

    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { order: 'asc' },
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

    // Enrich with computed fields
    const enriched = products.map((product) => {
      const discountPercentage =
        product.comparePrice && product.comparePrice > product.price
          ? Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) * 100
            )
          : 0

      // Compute average from actual reviews
      const reviewRatings = product.reviews.map((r: any) => r.rating)
      const averageRating =
        reviewRatings.length > 0
          ? Math.round(
              (reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length) * 10
            ) / 10
          : product.rating

      const { reviews, ...rest } = product
      return {
        ...rest,
        discountPercentage,
        averageRating,
        isOnSale: discountPercentage > 0,
      }
    })

    return NextResponse.json({
      products: enriched,
      total: enriched.length,
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
