import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// In-memory wishboard storage (no Wishboard model in Prisma)
const wishboardStore = new Map<string, {
  userId: string
  categories: WishboardCategory[]
  updatedAt: string
}>()

interface WishboardCategory {
  id: string
  name: string
  color: string
  icon: string
  productIds: string[]
}

const defaultCategories: WishboardCategory[] = [
  { id: 'wb-cat-1', name: 'Must Have', color: '#ef4444', icon: '', productIds: [] },
  { id: 'wb-cat-2', name: 'Nice to Have', color: '#f59e0b', icon: '', productIds: [] },
  { id: 'wb-cat-3', name: 'Gift Ideas', color: '#8b5cf6', icon: '', productIds: [] },
  { id: 'wb-cat-4', name: 'Later', color: '#6b7280', icon: '', productIds: [] },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'guest'

    // Get or create wishboard for user
    let wishboard = wishboardStore.get(userId)
    if (!wishboard) {
      wishboard = {
        userId,
        categories: defaultCategories.map((cat) => ({ ...cat, productIds: [] })),
        updatedAt: new Date().toISOString(),
      }
      wishboardStore.set(userId, wishboard)
    }

    // Fetch product details for items in each category
    const allProductIds = wishboard.categories.flatMap((c) => c.productIds)
    const uniqueProductIds = [...new Set(allProductIds)]

    const products = uniqueProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: uniqueProductIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            imageUrl: true,
            discount: true,
            rating: true,
            reviewCount: true,
            isActive: true,
            category: { select: { name: true, slug: true } },
          },
        })
      : []

    const productMap = new Map(products.map((p) => [p.id, p]))

    // Build enriched categories with product details
    const enrichedCategories = wishboard.categories.map((cat) => ({
      ...cat,
      products: cat.productIds
        .map((pid) => productMap.get(pid))
        .filter(Boolean),
    }))

    // Summary stats
    const totalItems = allProductIds.length
    const totalValue = products.reduce(
      (sum, p) => sum + p.price,
      0
    )
    const totalSavings = products.reduce(
      (sum, p) => sum + ((p.comparePrice || p.price) - p.price),
      0
    )

    return NextResponse.json({
      success: true,
      wishboard: {
        userId: wishboard.userId,
        categories: enrichedCategories,
        updatedAt: wishboard.updatedAt,
      },
      stats: {
        totalItems,
        totalValue: Math.round(totalValue * 100) / 100,
        totalSavings: Math.round(totalSavings * 100) / 100,
        categoriesCount: wishboard.categories.length,
        availableCategories: defaultCategories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
        })),
      },
      meta: {
        title: ' Wishboard',
        subtitle: 'Organize your wishlist into categories',
        maxItemsPerCategory: 20,
        maxCategories: 8,
      },
    })
  } catch (error) {
    console.error('[WISHBOARD] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishboard data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, categories } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'Categories array is required' },
        { status: 400 }
      )
    }

    // Validate categories structure
    for (const cat of categories) {
      if (!cat.id || !cat.name) {
        return NextResponse.json(
          { success: false, error: 'Each category must have id and name' },
          { status: 400 }
        )
      }
      if (cat.productIds && !Array.isArray(cat.productIds)) {
        return NextResponse.json(
          { success: false, error: 'productIds must be an array' },
          { status: 400 }
        )
      }
    }

    // Validate max categories
    if (categories.length > 8) {
      return NextResponse.json(
        { success: false, error: 'Maximum 8 categories allowed' },
        { status: 400 }
      )
    }

    // Validate product IDs exist if any are provided
    const allProductIds = categories.flatMap(
      (c: WishboardCategory) => c.productIds || []
    )
    if (allProductIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: allProductIds } },
        select: { id: true },
      })
      const existingIds = new Set(existingProducts.map((p) => p.id))
      const invalidIds = allProductIds.filter((id: string) => !existingIds.has(id))
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { success: false, error: `Invalid product IDs: ${invalidIds.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Save the wishboard layout
    const savedCategories = categories.map((cat: WishboardCategory) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color || '#6b7280',
      icon: cat.icon || '',
      productIds: cat.productIds || [],
    }))

    wishboardStore.set(userId, {
      userId,
      categories: savedCategories,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Wishboard layout saved successfully',
      wishboard: {
        userId,
        categories: savedCategories,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[WISHBOARD] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save wishboard layout' },
      { status: 500 }
    )
  }
}
