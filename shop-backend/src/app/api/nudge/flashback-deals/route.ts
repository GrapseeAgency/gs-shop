import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get flashback deals (previously browsed items now on sale)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ deals: [] })
    }

    // Get user's view history from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const viewedProducts = await prisma.productView.findMany({
      where: {
        userId,
        viewedAt: { gte: thirtyDaysAgo }
      },
      include: { product: true },
      orderBy: { viewedAt: 'desc' },
      take: 50
    })

    // Check which viewed products are now on sale
    const flashbackDeals = []

    for (const view of viewedProducts) {
      const product = view.product
      if (!product) continue

      // Check if price dropped
      const oldPrice = await prisma.priceHistory.findFirst({
        where: {
          productId: product.id,
          recordedAt: { gte: thirtyDaysAgo }
        },
        orderBy: { recordedAt: 'asc' }
      })

      if (oldPrice && product.price < oldPrice.price) {
        const discount = Math.round(((oldPrice.price - product.price) / oldPrice.price) * 100)
        
        if (discount >= 10) {
          flashbackDeals.push({
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            viewedAt: view.viewedAt,
            daysAgo: Math.floor((Date.now() - view.viewedAt.getTime()) / (1000 * 60 * 60 * 24)),
            oldPrice: oldPrice.price,
            newPrice: product.price,
            discount,
            message: `You viewed this ${Math.floor((Date.now() - view.viewedAt.getTime()) / (1000 * 60 * 60 * 24))} days ago. Now ${discount}% off!`
          })
        }
      }
    }

    // Remove duplicates
    const unique = flashbackDeals.filter((d, i, arr) => 
      arr.findIndex(t => t.productId === d.productId) === i
    )

    return NextResponse.json({
      deals: unique.slice(0, 10),
      total: unique.length,
      message: unique.length > 0 
        ? `Found ${unique.length} items you viewed that are now on sale!`
        : 'No flashback deals right now. Keep browsing!'
    })
  } catch (error) {
    console.error('Flashback deals error:', error)
    return NextResponse.json({ deals: [] })
  }
}
