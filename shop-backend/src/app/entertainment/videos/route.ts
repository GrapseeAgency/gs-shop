import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get product videos (unboxing, reviews, BTS)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type') || 'all'

    const where: any = {}
    if (productId) where.productId = productId
    if (type !== 'all') where.type = type

    const videos = await prisma.videoContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({
      videos: videos.map(v => ({
        ...v,
        engagement: {
          views: v.views,
          likes: v.likes,
          comments: 0
        }
      })),
      categories: ['unboxing', 'review', 'documentary', 'bts', 'tutorial']
    })
  } catch (error) {
    console.error('Videos fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

// POST - Upload video
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, type, title, description, videoUrl, thumbnailUrl } = await req.json()

    const video = await prisma.videoContent.create({
      data: {
        productId,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        category: type || 'review'
      }
    })

    // Award points for content creation
    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { increment: 25 } }
    })

    return NextResponse.json({
      success: true,
      video,
      message: 'Video uploaded! Pending review before publication.'
    })
  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}

// PUT - Update video engagement
export async function PUT(req: NextRequest) {
  try {
    const { videoId, action } = await req.json()

    if (action === 'view') {
      await prisma.videoContent.update({
        where: { id: videoId },
        data: { views: { increment: 1 } }
      })
    } else if (action === 'like') {
      await prisma.videoContent.update({
        where: { id: videoId },
        data: { likes: { increment: 1 } }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Video engagement error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
