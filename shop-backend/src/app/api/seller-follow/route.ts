import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's followed sellers and followers count
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')

    if (sellerId) {
      // Check if user follows this seller
      const follow = await prisma.sellerFollow.findUnique({
        where: {
          userId_sellerId: {
            userId,
            sellerId
          }
        }
      })

      const followerCount = await prisma.sellerFollow.count({
        where: { sellerId }
      })

      return NextResponse.json({
        isFollowing: !!follow,
        followerCount
      })
    }

    // Get all followed sellers
    const follows = await prisma.sellerFollow.findMany({
      where: { userId },
      orderBy: { followedAt: 'desc' }
    })

    return NextResponse.json({ follows })
  } catch (error) {
    console.error('Seller follow error:', error)
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 })
  }
}

// POST - Follow a seller
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sellerId } = await req.json()

    // Check if already following
    const existing = await prisma.sellerFollow.findUnique({
      where: {
        userId_sellerId: {
          userId,
          sellerId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 })
    }

    // Create follow
    await prisma.sellerFollow.create({
      data: {
        userId,
        sellerId
      }
    })

    // Increment seller follower count
    await prisma.seller.update({
      where: { id: sellerId },
      data: { followerCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      message: 'Following seller'
    })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
  }
}

// DELETE - Unfollow a seller
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 })
    }

    await prisma.sellerFollow.delete({
      where: {
        userId_sellerId: {
          userId,
          sellerId
        }
      }
    })

    // Decrement seller follower count
    await prisma.seller.update({
      where: { id: sellerId },
      data: { followerCount: { decrement: 1 } }
    })

    return NextResponse.json({
      success: true,
      message: 'Unfollowed seller'
    })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
  }
}
