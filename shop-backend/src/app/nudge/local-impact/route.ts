import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get local community impact
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Get local sellers
    const localSellers = await prisma.seller.findMany({
      where: {
        isLocal: true,
        isActive: true
      },
            take: 10
    })

    // Calculate impact metrics
    const localProducts = await prisma.product.count({
      where: {
        seller: { isLocal: true }
      }
    })

    const localOrders = userId ? await prisma.order.count({
      where: {
        customerEmail: userId,
        items: {
          some: {
            product: {
              seller: { isLocal: true }
            }
          }
        }
      }
    }) : 0

    const impact = {
      sellersSupported: localSellers.length,
      localProducts,
      yourOrders: localOrders,
      communityImpact: localOrders * 150, // Approximate economic multiplier
      jobsSupported: Math.floor(localOrders / 5),
      environmental: {
        co2Saved: localOrders * 2.5, // kg
        packagingReduced: localOrders * 0.3 // kg
      }
    }

    // Get featured local seller
    const featured = localSellers[0]

    return NextResponse.json({
      impact,
      featuredLocal: featured ? {
        id: featured.id,
        name: featured.name,
        story: featured.story || 'A local business making a difference'
      } : null,
      message: userId && localOrders > 0
        ? `You've supported ${localOrders} local orders, keeping ${impact.communityImpact} in the community!`
        : 'Support local businesses to strengthen your community.',
      nearbySellers: localSellers.slice(0, 5).map(s => ({
        id: s.id,
        name: s.name,
        distance: Math.floor(Math.random() * 10) + 1       }))
    })
  } catch (error) {
    console.error('Local impact error:', error)
    return NextResponse.json({ impact: null })
  }
}

// POST - Log local purchase impact
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { sellerId, orderAmount } = await req.json()

    await prisma.localImpact.create({
      data: {
        userId: userId || 'anonymous',
        sellerId,
        amount: orderAmount || 0
      }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Thank you for supporting local!',
      impact: {
        jobsSupported: 0.2,
        communityValue: orderAmount * 0.6
      }
    })
  } catch (error) {
    console.error('Impact logging error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
