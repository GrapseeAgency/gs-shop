// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get influencer collaboration details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const influencerId = searchParams.get('influencerId')

    if (!influencerId) {
      // Return list of influencers
      const influencers = await prisma.influencer.findMany({
        where: { isActive: true },
        orderBy: { followers: 'desc' },
        take: 20
      })

      return NextResponse.json({ influencers })
    }

    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
      include: {
        recommendations: {
          include: { product: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({
      influencer: {
        id: influencer.id,
        name: influencer.name,
        handle: influencer.handle,
        followers: influencer.followers,
        avatar: influencer.avatar,
        bio: influencer.bio,
        category: influencer.category
      },
      recommendations: influencer.recommendations,
      discountCode: influencer.discountCode,
      followerDiscount: influencer.followerDiscount
    })
  } catch (error) {
    console.error('Influencer error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Record influencer-driven purchase
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { influencerId, productId, discountCode } = await req.json()

    // Verify discount code
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId }
    })

    const isValidCode = influencer?.discountCode === discountCode
    const discount = isValidCode ? influencer.followerDiscount : 0

    // Record the collaboration
    if (userId) {
      await prisma.influencerPurchase.create({
        data: {
          userId,
          influencerId,
          productId,
          discountCode,
          discountApplied: discount,
          purchasedAt: new Date()
        }
      }).catch(() => {})
    }

    // Update influencer stats
    await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        totalSales: { increment: 1 }
      }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      discountApplied: discount,
      message: isValidCode
        ? `${influencer?.name}'s discount applied! You saved ${discount}%.`
        : 'Purchase recorded. Thanks for shopping!'
    })
  } catch (error) {
    console.error('Influencer purchase error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
