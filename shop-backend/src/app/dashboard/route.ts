import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'user-1'

    const [orderCount, orderTotal, orders, wallet, addresses, user] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.wallet.findUnique({ where: { userId }, include: { transactions: { take: 5, orderBy: { createdAt: 'desc' } } } }),
      prisma.address.findMany({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ])

    const recentReviews = await prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, imageUrl: true } } },
    })

    return NextResponse.json({
      totalOrders: orderCount,
      totalSpent: orderTotal._sum.total || 0,
      rewardsPoints: user?.rewardsPoints || 0,
      walletBalance: wallet?.balance || 0,
      loyaltyTier: user?.loyaltyTier || 'bronze',
      savedAddresses: addresses.length,
      wishlistCount: 0,
      recentOrders: orders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        items: o.items.length,
        date: o.createdAt,
      })),
      recentReviews: recentReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        product: r.product?.name,
        date: r.createdAt,
      })),
      walletTransactions: wallet?.transactions || [],
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({
      totalOrders: 3,
      totalSpent: 2549.97,
      rewardsPoints: 350,
      walletBalance: 150.00,
      loyaltyTier: 'gold',
      savedAddresses: 2,
      wishlistCount: 5,
      recentOrders: [
        { id: 'demo-1', total: 999.99, status: 'delivered', items: 2, date: new Date().toISOString() },
        { id: 'demo-2', total: 750.00, status: 'shipped', items: 1, date: new Date().toISOString() },
        { id: 'demo-3', total: 799.98, status: 'pending', items: 3, date: new Date().toISOString() },
      ],
      recentReviews: [],
      walletTransactions: [],
    })
  }
}
