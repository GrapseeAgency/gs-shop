import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId parameter is required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, rating: true, reviewCount: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get all reviews
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })

    // Calculate distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const review of reviews) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1
    }

    // Calculate average
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      averageRating,
      totalReviews: reviews.length,
      distribution,
      recentReviews,
    })
  } catch (error) {
    console.error('Error fetching review summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review summary' },
      { status: 500 }
    )
  }
}
