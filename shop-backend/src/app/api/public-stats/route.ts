import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
  try {
    const [products, users, reviewAgg] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: true
      })
    ])

    return NextResponse.json({
      products,
      users,
      averageRating: reviewAgg._avg.rating || 0,
      totalReviews: reviewAgg._count || 0
    }, { headers: CORS_HEADERS })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
