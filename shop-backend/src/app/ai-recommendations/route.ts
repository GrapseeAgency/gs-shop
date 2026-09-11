import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// GET - Get AI-powered recommendations for user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    let recommendations: any[] = []
    let reason = 'Based on popular services'

    if (userId) {
      // Get user's browsing history from ProductView
      const recentViews = await prisma.productView.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: 20,
        include: { product: { select: { categoryId: true } } }
      })

      // Get user's orders with proper userId filter
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      // Get categories from user's history
      const viewedCategoryIds = recentViews.map(v => v.product.categoryId).filter(Boolean)
      const orderedProductIds = userOrders.flatMap(o => o.items.map(i => i.productId))
      
      // Get categories from ordered products
      const orderedProducts = await prisma.product.findMany({
        where: { id: { in: orderedProductIds } },
        select: { categoryId: true }
      })
      const orderedCategoryIds = orderedProducts.map(p => p.categoryId)

      // Combine unique category IDs
      const categoryIds = [...new Set([...viewedCategoryIds, ...orderedCategoryIds])]

      if (categoryIds.length > 0) {
        // Find similar products from user's preferred categories
        // Exclude products they've already ordered
        const similarProducts = await prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            isActive: true,
            id: { notIn: orderedProductIds },
          },
          take: limit
        })

        if (similarProducts.length > 0) {
          recommendations = similarProducts
          reason = userOrders.length > 0 
            ? 'Based on your purchase history' 
            : 'Based on your browsing history'
        }
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

    // Store recommendations for analytics (only if we have a user)
    if (userId) {
      for (const [index, product] of recommendations.entries()) {
        // Calculate deterministic score based on position (higher score for earlier items)
        const score = Math.round((1 - (index / recommendations.length)) * 50 + 50) / 100 // 0.5-1.0
        
        await prisma.aIRecommendation.create({
          data: {
            userId,
            productId: product.id,
            score,
            reason
          }
        }).catch(() => {}) // Ignore duplicates
      }
    }

    return NextResponse.json({
      recommendations: recommendations.map((r, index) => ({
        ...r,
        reason: `Recommended: ${reason}`,
        // Deterministic confidence based on position (earlier items = higher confidence)
        confidence: Math.round((1 - (index / recommendations.length)) * 30 + 70)
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
