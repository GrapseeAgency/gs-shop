import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const category = await prisma.category.findUnique({
      where: { slug }
    })

    const products = category ? await prisma.product.findMany({
      where: { categoryId: category.id, isActive: true }
    }) : []

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Compute price range
    const prices = products.map((p) => p.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    // Compute average rating
    const ratings = products.map((p) => p.rating).filter((r) => r > 0)
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
        : 0

    // Extract available brands from product tags (since Brand model has no product relation)
    // We'll use product tags to simulate brand data
    const brandSet = new Set<string>()
    products.forEach((product) => {
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags) as string[]
          tags.forEach((tag) => {
            if (tag.startsWith('brand:')) {
              brandSet.add(tag.replace('brand:', ''))
            }
          })
        } catch {
          // ignore parse errors
        }
      }
    })
    // If no brand tags found, generate from product names
    const availableBrands =
      brandSet.size > 0
        ? Array.from(brandSet)
        : [...new Set(products.map((p) => p.name.split(' ')[0]))].slice(0, 8)

    // Collect all unique tags
    const allTags = new Set<string>()
    products.forEach((product) => {
      if (product.tags) {
        try {
          const tags = JSON.parse(product.tags) as string[]
          tags.forEach((tag) => {
            if (!tag.startsWith('brand:')) {
              allTags.add(tag)
            }
          })
        } catch {
          // ignore
        }
      }
    })

    // Enrich products with discountPercentage
    const enrichedProducts = products.map((product) => ({
      ...product,
      discountPercentage:
        product.comparePrice && product.comparePrice > product.price
          ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
          : 0
    }))

    return NextResponse.json({
      ...category,
      products: enrichedProducts,
      priceRange: { min: minPrice, max: maxPrice },
      averageRating,
      filters: {
        brands: availableBrands,
        priceRange: { min: minPrice, max: maxPrice },
        tags: Array.from(allTags),
      },
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}
