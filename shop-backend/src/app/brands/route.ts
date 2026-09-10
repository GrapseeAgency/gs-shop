import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Deterministic hash for consistent product-brand assignment
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // Get all active products to compute brand product counts
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
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
        discount: true,
        tags: true,
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
      },
    })

    // Assign products to brands using deterministic hash on product name
    // Each product gets assigned to a brand based on hash
    const brandProductMap = new Map<string, typeof allProducts>()

    for (const product of allProducts) {
      const hash = hashString(product.name)
      const brandIndex = hash % Math.max(1, brands.length)
      const brand = brands[brandIndex]
      if (!brand) continue

      if (!brandProductMap.has(brand.id)) {
        brandProductMap.set(brand.id, [])
      }
      brandProductMap.get(brand.id)!.push(product)
    }

    // Build enriched brands with product counts and top products
    const enrichedBrands = brands.map((brand) => {
      const brandProducts = brandProductMap.get(brand.id) || []
      const productCount = brandProducts.length

      // Top 3 products by rating
      const topProducts = brandProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map((p) => ({
          ...p,
          discountPercentage:
            p.comparePrice && p.comparePrice > p.price
              ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
              : 0,
        }))

      return {
        ...brand,
        productCount,
        topProducts,
      }
    })

    // Filter for featured (brands with featured products)
    const result = featured
      ? enrichedBrands.filter((b) => b.topProducts.some((p) => p.isFeatured))
      : enrichedBrands

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}
