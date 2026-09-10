import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFlashDeal: false
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    console.error('[REGULAR-API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch regular products' }, { status: 500 })
  }
}
