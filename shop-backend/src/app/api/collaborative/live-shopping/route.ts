// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get live shopping session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      // Return active sessions
      const activeSessions = await prisma.liveShopping.findMany({
        where: {
          isLive: true,
          endedAt: null
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: {
          host: { select: { name: true, avatar: true } }
        }
      })

      return NextResponse.json({
        activeSessions,
        featured: activeSessions[0] || null
      })
    }

    const session = await prisma.liveShopping.findUnique({
      where: { id: sessionId },
      include: {
        host: { select: { name: true, avatar: true } },
        product: true,
        viewers: {
          include: { user: { select: { name: true, avatar: true } } }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get recent activity
    const recentPurchases = await prisma.livePurchase.findMany({
      where: { sessionId },
      orderBy: { purchasedAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    })

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        host: session.host,
        product: session.product,
        isLive: session.isLive,
        viewerCount: session.viewers.length,
        startedAt: session.startedAt
      },
      recentActivity: recentPurchases,
      chat: [], // Would fetch from real-time service
      flashDeals: session.flashDeals ? JSON.parse(session.flashDeals) : []
    })
  } catch (error) {
    console.error('Live shopping error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Join live session or make purchase
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { action, sessionId } = await req.json()

    if (action === 'join' && userId) {
      // Add viewer
      await prisma.liveShoppingViewer.create({
        data: {
          sessionId,
          userId,
          joinedAt: new Date()
        }
      }).catch(() => {}) // Ignore duplicates

      return NextResponse.json({
        success: true,
        message: 'Joined live session'
      })
    }

    if (action === 'purchase' && userId) {
      const { productId, quantity, price } = await req.json()

      await prisma.livePurchase.create({
        data: {
          sessionId,
          userId,
          productId,
          quantity,
          price,
          purchasedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Purchase recorded!',
        activity: 'just bought this item!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Live action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
