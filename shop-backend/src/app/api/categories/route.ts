import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const featured = searchParams.get('featured') === 'true'

    const where = featured
      ? { products: { some: { isActive: true, isFeatured: true } } }
      : {}

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    let products: Record<string, any[]> = {}
    if (includeProducts) {
      const allProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { rating: 'desc' },
        select: {
          id: true, name: true, slug: true, price: true,
          comparePrice: true, imageUrl: true, rating: true,
          reviewCount: true, isFeatured: true, isNew: true,
          isTrending: true, isFlashDeal: true, discount: true,
          categoryId: true
        }
      })
      products = {}
      allProducts.forEach(p => {
        if (!products[p.categoryId]) products[p.categoryId] = []
        if (products[p.categoryId].length < 3) products[p.categoryId].push(p)
      })
    }

    // Add computed discountPercentage to included products
    const result = categories.map((category) => {
      const catProducts = includeProducts ? products[category.id] || [] : []
      const enrichedProducts = catProducts.map((product: any) => ({
        ...product,
        discountPercentage:
          product.comparePrice && product.comparePrice > product.price
            ? Math.round(
                ((product.comparePrice - product.price) / product.comparePrice) * 100
              )
            : 0
      }))

      return { ...category, products: enrichedProducts }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
