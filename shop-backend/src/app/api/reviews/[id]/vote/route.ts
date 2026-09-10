import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/reviews/[id]/vote
 * Increment helpful votes for a review
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'anonymous'
    const voteType = searchParams.get('type') || 'helpful' // 'helpful' or 'unhelpful'

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findFirst({
      where: {
        reviewId,
        userId
      }
    })

    if (existingVote) {
      return NextResponse.json({
        success: false,
        error: 'Already voted on this review'
      }, { status: 400 })
    }
    
    // Record the vote
    await prisma.reviewVote.create({
      data: {
        reviewId,
        userId,
        isHelpful: voteType === 'helpful'
      }
    })

    // Update review helpful votes count
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulVotes: {
          increment: voteType === 'helpful' ? 1 : 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        helpfulVotes: updatedReview.helpfulVotes
      },
      message: voteType === 'helpful' ? 'Marked as helpful' : 'Marked as unhelpful'
    })

  } catch (error) {
    console.error('Review vote error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to vote on review'
    }, { status: 500 })
  }
}
