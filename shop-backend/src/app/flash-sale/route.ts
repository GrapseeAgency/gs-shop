import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

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
        endTime: { gt: now },
      },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          },
        },
      },
      orderBy: { endTime: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const totalCount = await prisma.flashSale.count({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now },
      },
    })

    // Find the earliest ending flash sale for the countdown timer
    const earliestFlashSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gt: now },
      },
      orderBy: { endTime: 'asc' },
    })

    const endsAt = earliestFlashSale ? earliestFlashSale.endTime : new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const timeRemaining = Math.max(0, endsAt.getTime() - now.getTime())

    // Enrich flash products with real inventory data
    const enrichedProducts = flashSales.map((flashSale) => {
      const product = flashSale.product
      const originalPrice = product.comparePrice || product.price
      const salePrice = flashSale.salePrice
      const savings = originalPrice - salePrice
      const savingsPercent = Math.round((savings / originalPrice) * 100)

      // Use real inventory data from FlashSale model
      const maxQuantity = flashSale.maxQuantity || product.stock || 100
      const soldCount = flashSale.soldCount
      const stockRemaining = Math.max(0, maxQuantity - soldCount)
      const totalStock = maxQuantity

      // Calculate claimed percentage based on real sales
      const claimedPercent = totalStock > 0
        ? Math.round((soldCount / totalStock) * 100)
        : 0

      return {
        id: product.id,
        flashSaleId: flashSale.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        category: product.category,
originalPrice: product.comparePrice || product.price,
        salePrice,
        savings: Math.round(savings * 100) / 100,
        savingsPercent,
        discount: product.discount,
        stockRemaining,
        totalStock,
        claimedPercent,
        rating: product.rating,
        reviewCount: product.reviewCount,
        deliveryTime: product.deliveryTime,
        features: product.features ? JSON.parse(product.features) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        isFeatured: product.isFeatured,
      }
    })

    // Flash sale metadata
    const flashSaleMeta = {
      title: ' Flash Sale',
      subtitle: 'Grab deals before they\'re gone!',
      endsAt: endsAt.toISOString(),
      timeRemaining,
      totalDeals: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      banner: {
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        icon: '',
        tagline: 'Up to 70% OFF  Limited Time Only!',
      },
      rules: [
        'Flash deals are available while stock lasts',
        'Prices revert after the sale ends',
        'No stacking with other coupons unless stated',
        'Max 3 units per customer per deal',
      ],
    }

    return NextResponse.json({
      success: true,
      meta: flashSaleMeta,
      products: enrichedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error('[FLASH-SALE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flash sale products' },
      { status: 500 }
    )
  }
}
