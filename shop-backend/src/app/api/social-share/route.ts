import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Track social share
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, platform } = await req.json()

    if (!productId || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create share record
    const share = await prisma.socialShare.create({
      data: {
        userId: userId || 'anonymous',
        productId,
        platform
      }
    })

    // Generate share URL
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=Check%20out%20this%20product%20from%20Grapsee%20Shop!`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=`,
      twitter: `https://twitter.com/intent/tweet?text=`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=`,
      email: `mailto:?subject=Check%20out%20this%20product&body=`
    }

    return NextResponse.json({
      success: true,
      shareId: share.id,
      shareUrl: shareUrls[platform] || '',
      message: `Shared to ${platform}`
    })
  } catch (error) {
    console.error('Social share error:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }
}

// PUT - Track share click (when someone clicks the shared link)
export async function PUT(req: NextRequest) {
  try {
    const { shareId } = await req.json()

    await prisma.socialShare.update({
      where: { id: shareId },
      data: { clicks: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share click tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

// GET - Get share analytics for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const shares = await prisma.socialShare.groupBy({
      by: ['platform'],
      where: { productId },
            _sum: { clicks: true }
    })

    return NextResponse.json({
      productId,
      shares: shares.map(s => ({
        platform: s.platform,
        count: 1,
        clicks: 0
      })),
      totalShares: shares.length,
      totalClicks: 0
    })
  } catch (error) {
    console.error('Share analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
