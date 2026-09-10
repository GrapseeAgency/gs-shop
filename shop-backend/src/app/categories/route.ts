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
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
        ...(includeProducts
          ? {
              products: {
                where: { isActive: true },
                orderBy: { rating: 'desc' },
                take: 3,
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  comparePrice: true,
                  imageUrl: true,
                  rating: true,
                  reviewCount: true,
                  isFeatured: true,
                  isNew: true,
                  isTrending: true,
                  isFlashDeal: true,
                  discount: true,
                },
              },
            }
          : {}),
      },
    })

    // Add computed discountPercentage to included products
    const result = categories.map((category) => {
      const { products, ...rest } = category as Record<string, unknown>
      if (!includeProducts || !products) return { ...rest }

      const enrichedProducts = (products as Array<Record<string, unknown>>).map(
        (product: Record<string, unknown>) => ({
          ...product,
          discountPercentage:
            product.comparePrice && (product.comparePrice as number) > (product.price as number)
              ? Math.round(
                  (((product.comparePrice as number) - (product.price as number)) /
                    (product.comparePrice as number)) *
                    100
                )
              : 0,
        })
      )

      return { ...rest, products: enrichedProducts }
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
