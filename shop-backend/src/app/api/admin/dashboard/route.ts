import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get stats
    const [
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders,
      todayOrders,
      totalUsers,
      newUsersToday,
      totalProducts,
      newProductsThisMonth
    ] = await Promise.all([
      // Total revenue
      prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { total: true }
      }),
      // Today's revenue
      prisma.order.aggregate({
        where: { 
          createdAt: { gte: today },
          status: { not: 'cancelled' }
        },
        _sum: { total: true }
      }),
      // This month's revenue
      prisma.order.aggregate({
        where: { 
          createdAt: { gte: thisMonth },
          status: { not: 'cancelled' }
        },
        _sum: { total: true }
      }),
      // Total orders
      prisma.order.count(),
      // Today's orders
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      // Total users
      prisma.user.count(),
      // New users today
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      // Total products
      prisma.product.count(),
      // New products this month
      prisma.product.count({ where: { createdAt: { gte: thisMonth } } })
    ])

    // Get daily revenue for chart (last 30 days)
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayRevenue = await prisma.order.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: { not: 'cancelled' }
        },
        _sum: { total: true },
        _count: { id: true }
      })

      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue._sum.total || 0,
        orders: dayRevenue._count.id
      })
    }

    // Top products
    const topProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { reviewCount: 'desc' },
      take: 5
    })

    // Top sellers
    const topSellers = await prisma.seller.findMany({
      orderBy: { totalSales: 'desc' },
      take: 5
    })

    return NextResponse.json({
      stats: {
        revenue: {
          total: totalRevenue._sum.total || 0,
          today: todayRevenue._sum.total || 0,
          thisMonth: monthRevenue._sum.total || 0
        },
        orders: {
          total: totalOrders,
          today: todayOrders
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday
        },
        products: {
          total: totalProducts,
          newThisMonth: newProductsThisMonth
        }
      },
      chartData: dailyRevenue,
      topProducts,
      topSellers
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
