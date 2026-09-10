import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/product-videos?productId=xxx List product videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (productId) {
      where.productId = productId
    }
    if (type) {
      where.type = type
    }

    const [videos, total] = await Promise.all([
      prisma.productVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              price: true,
            },
          },
        },
      }),
      prisma.productVideo.count({ where }),
    ])

    return NextResponse.json({
      data: videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching product videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product videos' },
      { status: 500 }
    )
  }
}

// POST /api/product-videos Increment play count of a video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    const updatedVideo = await prisma.productVideo.update({
      where: { id: videoId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ success: true, video: updatedVideo })
  } catch (error) {
    console.error('Error incrementing video views:', error)
    return NextResponse.json({ error: 'Failed to increment video views' }, { status: 500 })
  }
}
