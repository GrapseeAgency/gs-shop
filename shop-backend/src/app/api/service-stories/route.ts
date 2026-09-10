import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get active stories
export async function GET(req: NextRequest) {
  try {
    const stories = await prisma.serviceStory.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get seller info for each story
    const storiesWithSellers = await Promise.all(
      stories.map(async (story) => {
        const seller = await prisma.seller.findUnique({
          where: { id: story.sellerId },
          select: { name: true, logo: true }
        })
        return {
          ...story,
          seller
        }
      })
    )

    return NextResponse.json({ stories: storiesWithSellers })
  } catch (error) {
    console.error('Service stories error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}

// POST - Create story
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, mediaUrl, mediaType, caption } = await req.json()

    // Check if seller owns this product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create story (expires in 24 hours)
    const story = await prisma.serviceStory.create({
      data: {
        sellerId: userId,
        productId,
        mediaUrl,
        mediaType: mediaType || 'image',
        caption,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      story,
      message: 'Story created successfully'
    })
  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
  }
}
