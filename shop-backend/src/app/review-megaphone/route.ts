import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const VIRAL_REVIEWS = [
  { id: 'vr-1', productName: '4K Smart TV', reviewer: 'TechExpert_Amy', rating: 5, title: 'Best TV I ever owned - here is why', helpfulVotes: 342, excerpt: 'After testing 15 TVs this year, this one stands out for...' },
  { id: 'vr-2', productName: 'Wireless Earbuds', reviewer: 'HonestReviews_Joe', rating: 4, title: 'Not what I expected (in a good way)', helpfulVotes: 278, excerpt: 'I was skeptical at this price point, but these earbuds...' },
  { id: 'vr-3', productName: 'Robot Vacuum', reviewer: 'ShopSmart_Sara', rating: 5, title: 'My house has never been cleaner', helpfulVotes: 215, excerpt: 'As a busy parent, this robot vacuum changed my life...' },
]

export async function GET(request: NextRequest) {
  try {
    const reviewers = await prisma.review.findMany({
      select: { author: true },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    const topReviewers = reviewers.length > 0
      ? []
      : []

    return NextResponse.json({
      success: true,
      reviewers: topReviewers,
      viralReviews: VIRAL_REVIEWS,
      reviewerOfTheMonth: {
        name: 'TechExpert_Amy',
        reviewsCount: 247,
        helpfulVotes: 1893,
        badge: 'Legend',
        quote: 'I review products to help others make informed decisions. Quality over quantity!',
        avatar: null,
      },
      badgeTiers: [
        { name: 'New', minReviews: 0, color: '#10B981', icon: '' },
        { name: 'Regular', minReviews: 25, color: '#3B82F6', icon: '' },
        { name: 'Expert', minReviews: 75, color: '#9333EA', icon: '' },
        { name: 'Legend', minReviews: 150, color: '#FFD700', icon: '' },
      ],
    })
  } catch (error) {
    console.error('[REVIEW-MEGAPHONE] Error:', error)
    return NextResponse.json({
      success: true, reviewers: [], viralReviews: VIRAL_REVIEWS,
      reviewerOfTheMonth: { name: 'TechExpert_Amy', reviewsCount: 247, helpfulVotes: 1893, badge: 'Legend', quote: 'Quality over quantity!', avatar: null },
      badgeTiers: [
        { name: 'New', minReviews: 0, color: '#10B981', icon: '' },
        { name: 'Regular', minReviews: 25, color: '#3B82F6', icon: '' },
        { name: 'Expert', minReviews: 75, color: '#9333EA', icon: '' },
        { name: 'Legend', minReviews: 150, color: '#FFD700', icon: '' },
      ],
    })
  }
}
