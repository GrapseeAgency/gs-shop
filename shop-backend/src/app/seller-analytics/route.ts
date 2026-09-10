import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get seller by userId (assuming seller is linked to user)
    const seller = await prisma.seller.findFirst({
      where: { id: userId }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'quarter') {
      startDate.setMonth(now.getMonth() - 3)
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Get orders in period
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            // This would need proper seller linkage in real scenario
          }
        },
        createdAt: { gte: startDate }
      }
    })

    // Get or create analytics
    let analytics = await prisma.sellerAnalytics.findUnique({
      where: { sellerId: seller.id }
    })

    if (!analytics) {
      analytics = await prisma.sellerAnalytics.create({
        data: {
          sellerId: seller.id,
          totalSales: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        }
      })
    }

    // Calculate metrics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Generate daily chart data
    const dailyData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOrders = orders.filter(o => 
        new Date(o.createdAt).toDateString() === date.toDateString()
      )
      dailyData.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0)
      })
    }

    return NextResponse.json({
      seller: {
        id: seller.id,
        name: seller.name,
        rating: seller.rating,
        productCount: seller.productCount,
        totalSales: seller.totalSales
      },
      analytics: {
        ...analytics,
        periodOrders: totalOrders,
        periodRevenue: totalRevenue,
        avgOrderValue,
        conversionRate: seller.conversionRate
      },
      chartData: dailyData,
      topProducts: analytics.topProducts ? JSON.parse(analytics.topProducts) : []
    })
  } catch (error) {
    console.error('Seller analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

// POST - Update analytics
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sellerId, topProducts, monthlyData } = await req.json()

    const analytics = await prisma.sellerAnalytics.upsert({
      where: { sellerId },
      update: {
        topProducts: topProducts ? JSON.stringify(topProducts) : undefined,
        monthlyData: monthlyData ? JSON.stringify(monthlyData) : undefined,
        updatedAt: new Date()
      },
      create: {
        sellerId,
        topProducts: topProducts ? JSON.stringify(topProducts) : '[]',
        monthlyData: monthlyData ? JSON.stringify(monthlyData) : '[]'
      }
    })

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    console.error('Analytics update error:', error)
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 })
  }
}
