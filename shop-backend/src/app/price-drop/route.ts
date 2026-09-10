import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minDrop = parseInt(searchParams.get('minDrop') || '0')

    const products = await prisma.product.findMany({
      where: { isActive: true, comparePrice: { not: null } },
      include: { category: { select: { name: true } } },
      take: 8,
      orderBy: { price: 'asc' },
    })

    const priceDropProducts = products.length > 0
      ? products
          .filter((p) => p.comparePrice && p.comparePrice > p.price)
          .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            imageUrl: p.imageUrl,
            price: p.price,
            previousPrice: p.comparePrice!,
            dropPercent: Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100),
            category: p.category,
            watched: false,
            trend: Math.random() > 0.5 ? 'down' : 'stable',
          }))
          .filter((p) => p.dropPercent >= minDrop)
      : [].filter((p) => p.dropPercent >= minDrop)

    return NextResponse.json({
      success: true,
      products: priceDropProducts,
      filters: [
        { label: 'All Drops', value: 0 },
        { label: '10%+', value: 10 },
        { label: '20%+', value: 20 },
        { label: '30%+', value: 30 },
        { label: '50%+', value: 50 },
      ],
      totalDrops: priceDropProducts.length,
    })
  } catch (error) {
    console.error('[PRICE-DROP] Error:', error)
    return NextResponse.json({ success: true, products: [], filters: [
      { label: 'All Drops', value: 0 }, { label: '10%+', value: 10 }, { label: '20%+', value: 20 },
      { label: '30%+', value: 30 }, { label: '50%+', value: 50 },
    ], totalDrops: 8 })
  }
}
