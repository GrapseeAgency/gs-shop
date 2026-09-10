import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } } },
      take: 6,
      orderBy: { price: 'desc' },
    })

    const rentalProducts = products.length > 0
      ? products.map((p, i) => ({
          id: p.id, name: p.name, slug: p.slug, imageUrl: p.imageUrl,
          dailyRate: Math.round(p.price * 0.05 * 100) / 100,
          weeklyRate: Math.round(p.price * 0.25 * 100) / 100,
          monthlyRate: Math.round(p.price * 0.7 * 100) / 100,
          securityDeposit: Math.round(p.price * 0.5),
          category: p.category?.name || 'General',
          available: i !== 3,
          description: p.description?.substring(0, 60) + '...' || 'Available for rent',
        }))
      : []

    const filtered = category && category !== 'All'
      ? rentalProducts.filter((p) => p.category === category)
      : rentalProducts

    return NextResponse.json({
      success: true,
      products: filtered,
      categories: ['All', 'Electronics', 'Cameras', 'Tools', 'Gaming', 'Events'],
      rentalTerms: {
        minDuration: '1 day',
        maxDuration: '1 month',
        freeDelivery: true,
        insuranceIncluded: true,
        damageProtection: 'Available for +15%',
      },
    })
  } catch (error) {
    console.error('[RENTAL] Error:', error)
    return NextResponse.json({
      success: true, products: [],
      categories: ['All', 'Electronics', 'Cameras', 'Tools', 'Gaming', 'Events'],
      rentalTerms: { minDuration: '1 day', maxDuration: '1 month', freeDelivery: true, insuranceIncluded: true },
    })
  }
}
