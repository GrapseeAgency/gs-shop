import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }
    const days = daysMap[period] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Get seller's product IDs first
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true, name: true },
    })
    const sellerProductIds = sellerProducts.map(p => p.id)
    const productNameMap = Object.fromEntries(sellerProducts.map(p => [p.id, p.name]))

    // Get orders in date range that contain seller's products
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        items: {
          some: {
            productId: { in: sellerProductIds },
          },
        },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate daily stats
    const dailyStats: Record<string, {
      date: string
      revenue: number
      orders: number
      units: number
    }> = {}

    // Product performance
    const productStats: Record<string, {
      id: string
      name: string
      sales: number
      revenue: number
    }> = {}

    let totalRevenue = 0
    let totalOrders = 0
    let totalUnits = 0

    // Initialize daily buckets
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = d.toISOString().split('T')[0]
      dailyStats[dateKey] = {
        date: dateKey,
        revenue: 0,
        orders: 0,
        units: 0,
      }
    }

    // Process orders
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const sellerItems = order.items.filter(i => sellerProductIds.includes(i.productId))
      
      sellerItems.forEach(item => {
        const itemRevenue = item.price * item.quantity
        totalRevenue += itemRevenue
        totalUnits += item.quantity

        // Daily stats
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].revenue += itemRevenue
          dailyStats[dateKey].units += item.quantity
        }

        // Product stats
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: productNameMap[item.productId] || item.productName,
            sales: 0,
            revenue: 0,
          }
        }
        productStats[item.productId].sales += item.quantity
        productStats[item.productId].revenue += itemRevenue
      })

      // Count unique orders
      if (sellerItems.length > 0) {
        totalOrders++
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].orders++
        }
      }
    })

    // Convert to array and sort by date
    const timeSeriesData = Object.values(dailyStats).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Top products
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate metrics
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Compare with previous period
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
    const prevOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
        items: {
          some: {
            productId: { in: sellerProductIds },
          },
        },
      },
      include: {
        items: true,
      },
    })

    let prevRevenue = 0
    let prevOrdersCount = 0
    prevOrders.forEach(order => {
      const sellerItems = order.items.filter(i => sellerProductIds.includes(i.productId))
      if (sellerItems.length > 0) {
        prevOrdersCount++
        sellerItems.forEach(item => {
          prevRevenue += item.price * item.quantity
        })
      }
    })

    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : '0'
    const ordersGrowth = prevOrdersCount > 0
      ? ((totalOrders - prevOrdersCount) / prevOrdersCount * 100).toFixed(1)
      : '0'

    // Store analytics snapshot
    // Note: SellerAnalytics model only has: totalSales, totalRevenue, avgOrderValue, topProducts, monthlyData
    await prisma.sellerAnalytics.create({
      data: {
        sellerId: seller.id,
        totalSales: totalOrders,
        totalRevenue,
        avgOrderValue: averageOrderValue,
        topProducts: JSON.stringify(topProducts.slice(0, 5))
      }
    })

    return NextResponse.json({
      period,
      summary: {
        totalRevenue,
        totalOrders,
        totalUnits,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        revenueGrowth: parseFloat(revenueGrowth),
        ordersGrowth: parseFloat(ordersGrowth),
      },
      timeSeries: timeSeriesData,
      topProducts,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
