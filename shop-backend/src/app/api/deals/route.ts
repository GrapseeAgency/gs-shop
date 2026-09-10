import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { isFlashDeal: true },
          { comparePrice: { gt: prisma.product.fields.price } }
        ]
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true }
        }
      },
      orderBy: { discount: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    console.error('[DEALS-API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}
