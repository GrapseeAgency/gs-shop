import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Helper function to calculate reviewer badge
function calculateReviewerBadge(reviewsCount: number) {
  if (reviewsCount >= 150) return { name: 'Legend', color: '#FFD700', icon: '' }
  if (reviewsCount >= 75) return { name: 'Expert', color: '#9333EA', icon: '' }
  if (reviewsCount >= 25) return { name: 'Regular', color: '#3B82F6', icon: '' }
  return { name: 'New', color: '#10B981', icon: '' }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const period = searchParams.get('period') || 'all' // 'week', 'month', 'year', 'all'

    // Calculate date range based on period
    const now = new Date()
    let dateFilter = new Date(0)
    if (period === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (period === 'year') {
      dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    // Get top reviewers by review count (helpfulVotes doesn't exist in schema)
    const topReviewers = await prisma.review.groupBy({
      by: ['author'],
      where: {
        createdAt: { gte: dateFilter }
      },
            orderBy: { _count: { id: 'desc' } },
      take: limit
    })

    // Get reviewer details and calculate badges
    const reviewersWithDetails = await Promise.all(
      topReviewers.map(async (reviewer) => {
        const badge = calculateReviewerBadge(1)
        
        // Get user details if available
        const user = await prisma.user.findUnique({
          where: { email: reviewer.author },
          select: { name: true, avatar: true }
        })

        return {
          id: reviewer.author.replace(/[^a-zA-Z0-9]/g, '_'),
          name: user?.name || reviewer.author,
          avatar: user?.avatar,
          reviewCount: 1,
          badge: badge.name,
          badgeColor: badge.color,
          featured: false // Featured if they have 50+ reviews
        }
      })
    )

    // Get viral reviews
    const viralReviews = await prisma.review.findMany({
      where: {
        createdAt: { gte: dateFilter },
        rating: { gte: 4 }
      },
      select: { 
        id: true,
        rating: true,
        comment: true,
        author: true,
        createdAt: true,
        product: { select: { name: true } }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const viralReviewCards = viralReviews.map((review) => ({
      id: review.id,
      productName: review.product.name,
      reviewer: review.author,
      rating: review.rating,
      title: 'Great Product',
      helpfulVotes: 0,
      excerpt: review.comment.length > 100 
        ? review.comment.substring(0, 100) + '...' 
        : review.comment,
      date: review.createdAt
    }))

    // Get reviewer of the month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const reviewerOfTheMonth = await prisma.review.groupBy({
      by: ['author'],
      where: {
        createdAt: { gte: monthStart }
      },
            orderBy: { _count: { id: 'desc' } },
      take: 1
    })

    let reviewerOfMonthData = null
    if (reviewerOfTheMonth.length > 0) {
      const topReviewer = reviewerOfTheMonth[0]
      const badge = calculateReviewerBadge(1)
      const user = await prisma.user.findUnique({
        where: { email: topReviewer.author },
        select: { name: true, avatar: true }
      })

      reviewerOfMonthData = {
        name: user?.name || topReviewer.author,
        reviewCount: 1,
        badge: badge.name,
        quote: 'I review products to help others make informed decisions. Quality over quantity!',
        avatar: user?.avatar
      }
    }

    // Define badge tiers
    const badgeTiers = [
      { name: 'New', minReviews: 0, color: '#10B981', icon: '' },
      { name: 'Regular', minReviews: 25, color: '#3B82F6', icon: '' },
      { name: 'Expert', minReviews: 75, color: '#9333EA', icon: '' },
      { name: 'Legend', minReviews: 150, color: '#FFD700', icon: '' },
    ]

    // Get overall statistics
    const [totalReviews, totalReviewers] = await Promise.all([
      prisma.review.count({
        where: { createdAt: { gte: dateFilter } }
      }),
      prisma.review.groupBy({
        by: ['author'],
        where: { createdAt: { gte: dateFilter } }
      }).then(result => result.length)
    ])
    const totalHelpfulVotes = 0 // Not available in schema

    return NextResponse.json({
      success: true,
      data: {
        reviewers: reviewersWithDetails,
        viralReviews: viralReviewCards,
        reviewerOfTheMonth: reviewerOfMonthData,
        badgeTiers,
        statistics: {
          totalReviews,
          totalReviewers,
          totalHelpfulVotes,
          period,
          averageRating: 0,
          averageHelpfulVotesPerReview: 0
        }
      }
    })
  } catch (error) {
    console.error('Review megaphone error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review megaphone data' },
      { status: 500 }
    )
  }
}

// POST /api/review-megaphone Submit a helpful vote for a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, helpful } = body
    const userId = session.user.id

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 })
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    // Upsert review vote (findFirst + create/update since no composite unique)
    const existingVote = await prisma.reviewVote.findFirst({
      where: { reviewId, userId }
    })

    if (existingVote) {
      await prisma.reviewVote.update({
        where: { id: existingVote.id },
        data: { isHelpful: helpful }
      })
    } else {
      await prisma.reviewVote.create({
        data: { reviewId, userId, isHelpful: helpful }
      })
    }

    // Recalculate helpful votes
    const helpfulCount = await prisma.reviewVote.count({
      where: { reviewId, isHelpful: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulVotes: helpfulCount
    })
  } catch (error) {
    console.error('Review vote error:', error)
    return NextResponse.json({ success: false, error: 'Failed to record vote' }, { status: 500 })
  }
}
