import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Request video call verification
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, sellerId, preferredTime } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create video call request
    const videoRequest = await prisma.videoVerification.create({
      data: {
        userId,
        buyerId: userId,
        sellerId: sellerId || product.sellerId,
        productId,
        videoUrl: 'pending',
        status: 'scheduled',
        scheduledTime: preferredTime ? new Date(preferredTime) : new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      request: videoRequest,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl
      },
      seller: {
        name: product.seller?.name,
        isVerified: product.seller?.isVerified
      },
      message: 'Video call requested! Seller will confirm the time.',
      nextSteps: [
        'Wait for seller to accept',
        'Join 2-minute video call',
        'See the actual product in real-time',
        'Buy with confidence'
      ],
      callUrl: `/video-call/${videoRequest.id}`
    })
  } catch (error) {
    console.error('Video verification error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get video verification status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    const request = await prisma.videoVerification.findUnique({
      where: { id: requestId }
    })

    // Fetch related data separately
    let product = null
    let seller = null
    let buyer = null
    if (request?.productId) {
      product = await prisma.product.findUnique({
        where: { id: request.productId },
        select: { id: true, name: true, imageUrl: true }
      })
    }
    if (request?.sellerId) {
      seller = await prisma.seller.findUnique({
        where: { id: request.sellerId },
        select: { name: true, avatar: true, isVerified: true }
      })
    }
    if (request?.buyerId) {
      const buyerUser = await prisma.user.findUnique({
        where: { id: request.buyerId },
        select: { name: true }
      })
      buyer = buyerUser
    }

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({
      request: {
        id: request.id,
        status: request.status,
        scheduledTime: request.scheduledTime,
        completedAt: request.completedAt
      },
      product,
      seller,
      canJoin: request.status === 'scheduled' && request.scheduledTime &&
        Math.abs(new Date(request.scheduledTime).getTime() - Date.now()) < 5 * 60 * 1000 // Within 5 min
    })
  } catch (error) {
    console.error('Video status error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
