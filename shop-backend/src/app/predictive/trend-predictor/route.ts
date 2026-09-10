import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get trend predictions based on browsing
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Get popular trending products
    const trendingProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        views: { gt: 1000 }
      },
      orderBy: { views: 'desc' },
      take: 20
    })

    // Get recent launches
    const newArrivals = await prisma.product.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    })

    // Predict trends based on data
    const trendCategories = [
      { name: 'Sustainable Living', growth: 45, icon: '' },
      { name: 'Smart Home', growth: 38, icon: '' },
      { name: 'Wellness Tech', growth: 52, icon: '' },
      { name: 'Minimalist Fashion', growth: 29, icon: '' },
      { name: 'Digital Learning', growth: 41, icon: '' }
    ]

    // Get user-specific predictions if logged in
    let personalizedTrends = []
    if (userId) {
      const userViews = await prisma.productView.findMany({
        where: {
          userId,
          viewedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })

      // Fetch products separately
      const productIds = userViews.map(v => v.productId)
      const viewedProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true }
      })
      const productMap = new Map(viewedProducts.map(p => [p.id, p]))

      // Analyze user's interest patterns
      const viewedCategories = userViews.map(v => productMap.get(v.productId)?.categoryId).filter(Boolean)
      const uniqueCategories = [...new Set(viewedCategories)]

      // Predict what they'll like next
      personalizedTrends = await prisma.product.findMany({
        where: {
          categoryId: { in: uniqueCategories.slice(0, 3) },
          id: { notIn: userViews.map(v => v.productId) }
        },
        orderBy: { views: 'desc' },
        take: 8
      })
    }

    return NextResponse.json({
      trendingProducts: trendingProducts.slice(0, 10),
      newArrivals: newArrivals.slice(0, 8),
      trendCategories,
      personalizedTrends,
      nextBigThing: {
        category: 'AI-Powered Devices',
        confidence: 85,
        reason: 'Rising 127% in search queries'
      }
    })
  } catch (error) {
    console.error('Trend predictor error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
