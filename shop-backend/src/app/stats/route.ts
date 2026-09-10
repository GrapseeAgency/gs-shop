import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/stats Get app statistics
export async function GET() {
  try {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalReviews,
      revenueResult,
      ratingResult,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.category.count(),
      db.order.count(),
      db.review.count(),
      db.order.aggregate({
        _sum: { total: true },
      }),
      db.review.aggregate({
        _avg: { rating: true },
      }),
    ])

    const totalRevenue = revenueResult._sum.total || 0
    const avgRating = ratingResult._avg.rating
      ? Math.round(ratingResult._avg.rating * 10) / 10
      : 0

    return NextResponse.json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      totalReviews,
      avgRating,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
