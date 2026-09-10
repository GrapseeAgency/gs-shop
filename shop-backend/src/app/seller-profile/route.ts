import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/seller-profile Return seller profile with products and reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Seller slug is required' },
        { status: 400 }
      )
    }

    const seller = await prisma.seller.findUnique({
      where: { slug },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        rating: true,
        reviewCount: true,
        discount: true,
        category: { select: { name: true } },
      },
      take: seller.productCount || 10,
      orderBy: { rating: 'desc' },
    })

    const productIds = products.map(p => p.id)
    const dbReviews = productIds.length > 0
      ? await prisma.review.findMany({
          where: { productId: { in: productIds } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : []

    const reviews = dbReviews.map(r => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,
    }))

    const avgReviewRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length * 10) / 10
      : seller.rating

    const monthlyRevenue: Array<{ month: string; revenue: number }> = []

    return NextResponse.json({
      seller: {
        id: seller.id,
        slug: seller.slug,
        name: seller.name,
        email: seller.email,
        avatar: seller.avatar,
        coverImage: seller.coverImage,
        bio: seller.bio,
        joinedAt: seller.joinedAt,
      },
      stats: {
        totalSales: seller.totalSales,
        revenue: seller.revenue,
        rating: avgReviewRating,
        productCount: seller.productCount,
        avgOrderValue: seller.totalSales > 0 ? Math.round(seller.revenue / seller.totalSales) : 0,
        reviewCount: reviews.length,
      },
      products: products.map(p => ({
        ...p,
        category: (p.category as Record<string, string>)?.name || null,
      })),
      reviews,
      monthlyRevenue,
    })
  } catch (error) {
    console.error('Seller profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller profile' },
      { status: 500 }
    )
  }
}
