import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [products, users, orders, pendingChats] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({ select: { total: true } }),
      prisma.chatMessage.count({ where: { sender: 'USER', read: false } })
    ])

    const revenue = orders.reduce((sum, order) => sum + order.total, 0)

    return NextResponse.json({
      success: true,
      stats: {
        products,
        users,
        orders: orders.length,
        revenue,
        pendingChats
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
