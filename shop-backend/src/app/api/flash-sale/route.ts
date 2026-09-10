import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/flash-sale
 * Returns active flash sales with time remaining
 * Silent if no active flash sales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    
    const now = new Date()

    // Fetch active flash sales from FlashSale model
    const flashSales = await prisma.flashSale.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now }
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            comparePrice: true,
            price: true,
            rating: true,
            reviewCount: true,
            shortDescription: true,
            category: {
              select: { id: true, name: true, slug: true }
            },
            seller: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      },
      orderBy: { endTime: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalCount = await prisma.flashSale.count({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now }
      }
    })
    
    // If no active flash sales, return empty (silent)
    if (flashSales.length === 0) {
      return NextResponse.json({
        success: true,
        sales: [],
        meta: {
          count: 0,
          message: 'No active flash sales'
        }
      })
    }

    // Calculate time remaining for each sale
    const enrichedSales = flashSales.map((sale) => {
      const timeRemaining = Math.max(0, sale.endTime.getTime() - now.getTime())
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
      
      const originalPrice = sale.product.comparePrice || sale.product.price
      const savings = originalPrice - sale.salePrice
      const savingsPercent = sale.discountPercent || Math.round((savings / originalPrice) * 100)
      
      // Calculate stock remaining
      const maxQuantity = sale.maxQuantity || 100
      const soldCount = sale.soldCount || 0
      const stockRemaining = Math.max(0, maxQuantity - soldCount)
      const claimedPercent = Math.round((soldCount / maxQuantity) * 100)

      return {
        id: sale.id,
        name: sale.name,
        description: sale.description,
        product: sale.product,
        salePrice: sale.salePrice,
        originalPrice,
        savings: Math.round(savings * 100) / 100,
        savingsPercent,
        discountPercent: sale.discountPercent,
        stockRemaining,
        soldCount,
        claimedPercent,
        maxQuantity,
        endsAt: sale.endTime.toISOString(),
        timeRemaining: {
          hours: hoursRemaining,
          minutes: minutesRemaining,
          totalMs: timeRemaining
        }
      }
    })

    // Get the soonest ending sale for overall countdown
    const soonestEnding = enrichedSales[0]

    return NextResponse.json({
      success: true,
      sales: enrichedSales,
      meta: {
        count: enrichedSales.length,
        endsSoonest: soonestEnding?.endsAt,
        timeRemaining: soonestEnding?.timeRemaining,
        totalSavings: enrichedSales.reduce((sum, sale) => sum + (sale.savings * sale.soldCount), 0)
      }
    })
  } catch (error) {
    console.error('[FLASH-SALE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flash sales' },
      { status: 500 }
    )
  }
}
