import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/group-buy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    // Fetch active group buy deals from DB
    let dbGroupBuys = await prisma.groupBuy.findMany({
      where: {
        status: status === 'active' ? 'active' : undefined,
        endsAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Seed group buy deals persistently if DB has none
    if (dbGroupBuys.length === 0) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
      take: 5,
      orderBy: { price: 'desc' },
      })

      if (products.length > 0) {
        const seedData = products.map((product, index) => {
          const savingsPercent = 15 + (index % 3) * 5
          const groupPrice = Math.round(product.price * (1 - savingsPercent / 100) * 100) / 100
          const minBuyers = 5 + index * 2
          const currentBuyers = Math.floor(minBuyers * 0.4)

          return {
            productId: product.id,
            productName: product.name,
            originalPrice: product.price,
            groupPrice,
            minBuyers,
            currentBuyers,
            savingsPercent,
            status: 'active',
            endsAt: new Date(Date.now() + (24 + index * 12) * 3600000), // 24-72 hours remaining
            imageUrl: product.imageUrl,
          }
        })

        // Bulk insert
        await prisma.groupBuy.createMany({ data: seedData })

        // Re-fetch
        dbGroupBuys = await prisma.groupBuy.findMany({
          where: {
            status: status === 'active' ? 'active' : undefined,
            endsAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    }

    // Map DB objects to match expected frontend structure including participants
    const data = dbGroupBuys.map((gb) => ({
      id: gb.id,
      productId: gb.productId,
      productName: gb.productName,
      productImage: gb.imageUrl,
      originalPrice: gb.originalPrice,
      groupPrice: gb.groupPrice,
      savingsPercent: gb.savingsPercent,
      minBuyers: gb.minBuyers,
      currentBuyers: gb.currentBuyers,
      expiresAt: gb.endsAt.toISOString(),
      status: gb.status,
      participants: Array.from({ length: Math.min(gb.currentBuyers, 6) }, (_, i) => ({
        id: `user-part-${i + 1}`,
        name: ['Arafat', 'Alex', 'Sam', 'Jordan', 'Riley', 'Morgan'][i % 6],
        avatar: null,
        joinedAt: new Date(Date.now() - (gb.currentBuyers - i) * 3600000).toISOString(),
      })),
    }))

    return NextResponse.json({
      data,
      total: data.length,
    })
  } catch (error) {
    console.error('Error fetching group buys:', error)
    return NextResponse.json({ error: 'Failed to fetch group buys' }, { status: 500 })
  }
}

// POST /api/group-buy Join a group buy persistently in DB
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id || 'guest'

    const body = await request.json()
    const { groupBuyId } = body

    if (!groupBuyId) {
      return NextResponse.json({ error: 'Group buy ID is required' }, { status: 400 })
    }

    // Verify group buy exists and is active
    const groupBuy = await prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
    })

    if (!groupBuy) {
      return NextResponse.json({ error: 'Group buy deal not found' }, { status: 404 })
    }

    if (groupBuy.status !== 'active') {
      return NextResponse.json({ error: 'This group buy is already closed or completed' }, { status: 400 })
    }

    // Increment buyer count persistently
    const updated = await prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentBuyers: { increment: 1 },
        status: groupBuy.currentBuyers + 1 >= groupBuy.minBuyers ? 'completed' : 'active',
      },
    })

    return NextResponse.json({
      success: true,
      message: updated.status === 'completed' ? 'Deal completed! Product unlocked! ' : 'Successfully joined the group buy!',
      groupBuyId,
      userId,
      currentBuyers: updated.currentBuyers,
      minBuyers: updated.minBuyers,
      isCompleted: updated.status === 'completed',
      joinedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error joining group buy:', error)
    return NextResponse.json({ error: 'Failed to join group buy' }, { status: 500 })
  }
}
