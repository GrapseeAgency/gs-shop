import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true, imageUrl: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        questions: {
          select: { id: true },
        },
        priceHistory: {
          where: {
            recordedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { recordedAt: 'asc' },
        },
        videos: {
          select: { id: true, title: true, thumbnailUrl: true, type: true, duration: true },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Compute discount percentage
    const discountPercentage =
      product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0

    // Computed fields
    const isOnSale = discountPercentage > 0
    const isFlashDeal = product.isFlashDeal

    // Average rating from reviews
    const allReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    })
    const averageRating =
      allReviews.length > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
        : product.rating

    // Related products (same category, limit 4, exclude current)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: id },
      },
      take: 4,
      orderBy: { rating: 'desc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
      },
    })

    // Format price history
    const priceHistory = product.priceHistory.map((ph) => ({
      price: ph.price,
      date: ph.recordedAt.toISOString(),
    }))

    // Questions count
    const questionsCount = product.questions.length

    // Video count
    const videoCount = product.videos.length

    return NextResponse.json({
      ...product,
      discountPercentage,
      isOnSale,
      isFlashDeal,
      averageRating,
      questionsCount,
      videoCount,
      priceHistory,
      relatedProducts,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
