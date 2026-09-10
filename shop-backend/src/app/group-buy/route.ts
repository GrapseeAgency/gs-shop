import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/group-buy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    // Generate group buy deals from products
    const products = await prisma.product.findMany({
      where: { isActive: true },
            take: 8,
      include: { category: true },
      orderBy: { price: 'desc' },
    })

    const groupBuys = products.map((product, index) => {
      const minBuyers = 5 + (index % 4) * 3
      const currentBuyers = Math.floor(minBuyers * (0.3 + Math.random() * 0.6))
      const savingsPercent = 15 + (index % 5) * 5
      const hoursRemaining = 6 + index * 8

      const isActive = status === 'active' ? currentBuyers < minBuyers : currentBuyers >= minBuyers
      const expiresAt = new Date(Date.now() + hoursRemaining * 3600000).toISOString()

      return {
        id: `gb-${product.id}`,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        category: product.category?.name || 'General',
        originalPrice: product.price,
        groupPrice: Math.round(product.price * (1 - savingsPercent / 100) * 100) / 100,
        savingsPercent,
        minBuyers,
        currentBuyers,
        expiresAt,
        status: isActive ? 'active' : 'completed',
        participants: Array.from({ length: Math.min(currentBuyers, 6) }, (_, i) => ({
          id: `user-${i + 1}`,
          name: ['Alex', 'Sam', 'Jordan', 'Riley', 'Morgan', 'Taylor'][i],
          avatar: null,
          joinedAt: new Date(Date.now() - (currentBuyers - i) * 3600000).toISOString(),
        })),
      }
    })

    return NextResponse.json({
      data: status === 'active' ? groupBuys.filter(g => g.status === 'active') : groupBuys,
      total: groupBuys.length,
    })
  } catch (error) {
    console.error('Error fetching group buys:', error)
    return NextResponse.json({ error: 'Failed to fetch group buys' }, { status: 500 })
  }
}

// POST /api/group-buy Join a group buy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupBuyId, userId = 'guest' } = body

    if (!groupBuyId) {
      return NextResponse.json({ error: 'Group buy ID is required' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the group buy!',
      groupBuyId,
      userId,
      joinedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error joining group buy:', error)
    return NextResponse.json({ error: 'Failed to join group buy' }, { status: 500 })
  }
}
