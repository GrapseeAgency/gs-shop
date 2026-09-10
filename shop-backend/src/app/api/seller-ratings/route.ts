import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get seller ratings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')
    const userId = searchParams.get('userId')

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 })
    }

    const where: any = { sellerId }
    if (userId) {
      where.userId = userId
    }

    const [ratings, stats] = await Promise.all([
      prisma.sellerRating.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.sellerRating.groupBy({
        by: ['rating'],
        where: { sellerId },
        _count: { rating: true }
      })
    ])

    // Calculate average and distribution
    const total = stats.reduce((sum, s) => sum + (s._count?.rating || 0), 0)
    const sum = stats.reduce((sum, s) => sum + (s.rating * (s._count?.rating || 0)), 0)
    const average = total > 0 ? sum / total : 0

    const distribution = [5, 4, 3, 2, 1].map(star => {
      const stat = stats.find(s => s.rating === star)
      const count = stat?._count?.rating || 0
      return {
        star,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }
    })

    return NextResponse.json({
      ratings,
      summary: {
        average: Math.round(average * 10) / 10,
        total,
        distribution
      }
    })
  } catch (error) {
    console.error('Seller ratings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

// POST - Create seller rating
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sellerId, rating, review, aspects } = await req.json()

    if (!sellerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 })
    }

    // Check if user already rated this seller
    const existing = await prisma.sellerRating.findFirst({
      where: { sellerId, userId }
    })

    if (existing) {
      // Update existing
      const updated = await prisma.sellerRating.update({
        where: { id: existing.id },
        data: {
          rating,
          review,
          aspects: aspects ? JSON.stringify(aspects) : null
        }
      })
      return NextResponse.json({ success: true, rating: updated, updated: true })
    }

    // Create new rating
    const newRating = await prisma.sellerRating.create({
      data: {
        sellerId,
        userId,
        rating,
        review,
        aspects: aspects ? JSON.stringify(aspects) : null
      }
    })

    return NextResponse.json({ success: true, rating: newRating })
  } catch (error) {
    console.error('Seller rating creation error:', error)
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 })
  }
}

// PUT - Update rating helpful count
export async function PUT(req: NextRequest) {
  try {
    const { ratingId, helpful } = await req.json()

    const rating = await prisma.sellerRating.update({
      where: { id: ratingId },
      data: {
        helpfulCount: { increment: helpful ? 1 : -1 }
      }
    })

    return NextResponse.json({ success: true, helpfulCount: rating.helpfulCount })
  } catch (error) {
    console.error('Rating update error:', error)
    return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 })
  }
}
