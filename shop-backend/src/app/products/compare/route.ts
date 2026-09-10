import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      return NextResponse.json({ error: 'Provide 2-4 product IDs' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { category: { select: { id: true, name: true, slug: true } } }
    })

    const compared = products.map(p => {
      const discountPercentage = p.comparePrice && p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 0
      const isOnSale = discountPercentage > 0
      const valueScore = p.price > 0 ? Math.round((p.rating / p.price) * 1000) / 1000 : 0

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        discountPercentage,
        isOnSale,
        valueScore,
        rating: p.rating,
        reviewCount: p.reviewCount,
        deliveryTime: p.deliveryTime,
        imageUrl: p.imageUrl,
        features: p.features ? JSON.parse(p.features) : [],
        techStack: p.techStack ? JSON.parse(p.techStack) : [],
        category: p.category,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        isTrending: p.isTrending,
      }
    })

    return NextResponse.json({ products: compared })
  } catch (error) {
    console.error('Compare error:', error)
    return NextResponse.json({ error: 'Failed to compare products' }, { status: 500 })
  }
}
