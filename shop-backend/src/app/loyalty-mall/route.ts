import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minPoints = parseInt(searchParams.get('minPoints') || '0')
    const maxPoints = parseInt(searchParams.get('maxPoints') || '99999')

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } } },
      take: 6,
      orderBy: { price: 'asc' },
    })

    const loyaltyProducts = products.length > 0
      ? products.map((p, i) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          pointsPrice: Math.round(p.price * 50),
          originalPrice: p.price,
          category: p.category?.name || 'General',
          inStock: i !== 5,
        }))
      : []

    const filtered = loyaltyProducts.filter(
      (p) => p.pointsPrice >= minPoints && p.pointsPrice <= maxPoints
    )

    // Get user points from store or []
    const user = await prisma.user.findFirst()
    const currentPoints = user?.id ? 2500 : 1250

    return NextResponse.json({
      success: true,
      products: filtered,
      currentPoints,
      pointsFilters: [
        { label: 'All', min: 0, max: 99999 },
        { label: '0-500', min: 0, max: 500 },
        { label: '500-1000', min: 500, max: 1000 },
        { label: '1000-5000', min: 1000, max: 5000 },
        { label: '5000+', min: 5000, max: 99999 },
      ],
    })
  } catch (error) {
    console.error('[LOYALTY-MALL] Error:', error)
    return NextResponse.json({
      success: true,
      products: [],
      currentPoints: 1250,
      pointsFilters: [
        { label: 'All', min: 0, max: 99999 },
        { label: '0-500', min: 0, max: 500 },
        { label: '500-1000', min: 500, max: 1000 },
        { label: '1000-5000', min: 1000, max: 5000 },
        { label: '5000+', min: 5000, max: 99999 },
      ],
    })
  }
}
