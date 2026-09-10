import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get AI-powered recommendations for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    let recommendations: any[] = []
    let reason = 'Based on popular services'

    if (userId) {
      // Get user's browsing history
      const recentViews = await prisma.product.findMany({
        where: {
          id: {
            in: await getRecentlyViewed(userId)
          }
        }
      })

      // Get user's orders
      const userOrders = await prisma.order.findMany({
        where: { 
          // Would need proper user linkage
        },
        include: { items: true },
        take: 5
      })

      // Get categories from user's history
      const categoryIds = recentViews.map(p => p.categoryId)
      const orderedCategories = userOrders.flatMap(o => o.items.map(i => i.productId))

      if (categoryIds.length > 0 || orderedCategories.length > 0) {
        // Find similar products
        const similarProducts = await prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            isActive: true
          },
          take: limit
        })

        recommendations = similarProducts
        reason = 'Based on your browsing history'
      }
    }

    // Fallback to trending if no personalization
    if (recommendations.length === 0) {
      recommendations = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: [
          { isTrending: 'desc' },
          { rating: 'desc' }
        ],
        take: limit
      })
      reason = 'Trending now'
    }

    // Store recommendations for analytics
    if (userId) {
      for (const product of recommendations) {
        await prisma.aIRecommendation.create({
          data: {
            userId,
            productId: product.id,
            score: 0.5,
            reason
          }
        }).catch(() => {}) // Ignore duplicates
      }
    }

    return NextResponse.json({
      recommendations: recommendations.map(r => ({
        ...r,
        reason: `Recommended: ${reason}`,
      })),
      reason
    })
  } catch (error) {
    console.error('AI recommendations error:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

// POST - Track recommendation click
export async function POST(req: NextRequest) {
  try {
    const { recommendationId } = await req.json()

    await prisma.aIRecommendation.updateMany({
      where: { productId: recommendationId },
      data: { clicked: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recommendation tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

async function getRecentlyViewed(userId: string): Promise<string[]> {
  // In a real app, this would query a view history table
  // For now, return empty array
  return []
}
