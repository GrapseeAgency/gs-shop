import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [products, users, orders, pendingChats, reviewAgg] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true } }),
      prisma.chatMessage.count({ where: { sender: 'USER', read: false } }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: true
      })
    ])

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

    return NextResponse.json({
      products,
      users,
      orders: orders.length,
      totalRevenue,
      pendingChats,
      averageRating: reviewAgg._avg.rating || 0,
      totalReviews: reviewAgg._count || 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
