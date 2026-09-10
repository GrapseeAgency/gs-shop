import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products/recommendations?productId=xxx&category=yyy&limit=6
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const category = searchParams.get('category')
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '6')))

    const recommended: Array<{
      id: string
      name: string
      slug: string
      description: string
      price: number
      comparePrice: number | null
      categoryId: string
      imageUrl: string | null
      isFeatured: boolean
      isNew: boolean
      isTrending: boolean
      discount: number
      rating: number
      reviewCount: number
      category: { id: string; name: string; slug: string; icon: string | null; color: string | null } | null
      reason: string
    }> = []

    const excludeIds = new Set<string>()
    if (productId) excludeIds.add(productId)

    // 1. Same category products
    if (category) {
      const sameCategoryProducts = await db.product.findMany({
        where: {
          isActive: true,
          category: { slug: category },
          id: { notIn: [...excludeIds] },
        },
        orderBy: { rating: 'desc' },
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        },
      })

      for (const p of sameCategoryProducts) {
        if (!excludeIds.has(p.id) && recommended.length < limit) {
          excludeIds.add(p.id)
          recommended.push({ ...p, reason: 'Same category' })
        }
      }
    }

    // 2. Similar price range (if we have a productId, find its price first)
    if (productId && recommended.length < limit) {
      const currentProduct = await db.product.findUnique({
        where: { id: productId },
        select: { price: true },
      })

      if (currentProduct) {
        const priceRange = currentProduct.price * 0.5
        const minPrice = currentProduct.price - priceRange
        const maxPrice = currentProduct.price + priceRange

        const similarPriceProducts = await db.product.findMany({
          where: {
            isActive: true,
            price: { gte: minPrice, lte: maxPrice },
            id: { notIn: [...excludeIds] },
          },
          orderBy: { rating: 'desc' },
          take: limit - recommended.length,
          include: {
            category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
          },
        })

        for (const p of similarPriceProducts) {
          if (!excludeIds.has(p.id) && recommended.length < limit) {
            excludeIds.add(p.id)
            recommended.push({ ...p, reason: 'Similar price range' })
          }
        }
      }
    }

    // 3. Trending products as fallback
    if (recommended.length < limit) {
      const trendingProducts = await db.product.findMany({
        where: {
          isActive: true,
          isTrending: true,
          id: { notIn: [...excludeIds] },
        },
        orderBy: { reviewCount: 'desc' },
        take: limit - recommended.length,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        },
      })

      for (const p of trendingProducts) {
        if (!excludeIds.has(p.id) && recommended.length < limit) {
          excludeIds.add(p.id)
          recommended.push({ ...p, reason: 'Trending now' })
        }
      }
    }

    // 4. Featured products as last fallback
    if (recommended.length < limit) {
      const featuredProducts = await db.product.findMany({
        where: {
          isActive: true,
          isFeatured: true,
          id: { notIn: [...excludeIds] },
        },
        orderBy: { rating: 'desc' },
        take: limit - recommended.length,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
        },
      })

      for (const p of featuredProducts) {
        if (!excludeIds.has(p.id) && recommended.length < limit) {
          excludeIds.add(p.id)
          recommended.push({ ...p, reason: 'Popular choice' })
        }
      }
    }

    return NextResponse.json({
      data: recommended,
      total: recommended.length,
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
