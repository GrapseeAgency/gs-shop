import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

/**
 * Cleanup API - Delete all test data
 * This deletes products, categories, brands, coupons, gift cards in the correct order
 * to handle foreign key constraints
 */

export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, { success: boolean; count: number; error?: string }> = {}

  try {
    // 1. Delete Today's Picks (references products)
    try {
      const { count } = await prisma.todaysPick.deleteMany({})
      results.todaysPicks = { success: true, count }
    } catch (e: any) {
      results.todaysPicks = { success: false, count: 0, error: e.message }
    }

    // 2. Skip New Arrivals (model doesn't exist)
    results.newArrivals = { success: true, count: 0, error: 'Skipped - model does not exist' }

    // 3. Delete Product Reviews
    try {
      const { count } = await prisma.review.deleteMany({})
      results.reviews = { success: true, count }
    } catch (e: any) {
      results.reviews = { success: false, count: 0, error: e.message }
    }

    // 4. Delete Flash Sales
    try {
      const { count } = await prisma.flashSale.deleteMany({})
      results.flashSales = { success: true, count }
    } catch (e: any) {
      results.flashSales = { success: false, count: 0, error: e.message }
    }

    // 5. Delete Auctions
    try {
      const { count } = await prisma.auction.deleteMany({})
      results.auctions = { success: true, count }
    } catch (e: any) {
      results.auctions = { success: false, count: 0, error: e.message }
    }

    // 6. Delete Flashback Products
    try {
      const { count } = await prisma.flashbackProduct.deleteMany({})
      results.flashbackProducts = { success: true, count }
    } catch (e: any) {
      results.flashbackProducts = { success: false, count: 0, error: e.message }
    }

    // 7. Delete Luxury Products (mark as not luxury first)
    try {
      await prisma.product.updateMany({
        where: { isLuxury: true },
        data: { isLuxury: false, luxuryExpiresAt: null }
      })
      results.luxuryProducts = { success: true, count: 0 }
    } catch (e: any) {
      results.luxuryProducts = { success: false, count: 0, error: e.message }
    }

    // 8. Delete Gift Cards
    try {
      const { count } = await prisma.giftCard.deleteMany({})
      results.giftCards = { success: true, count }
    } catch (e: any) {
      results.giftCards = { success: false, count: 0, error: e.message }
    }

    // 9. Delete Coupons
    try {
      const { count } = await prisma.coupon.deleteMany({})
      results.coupons = { success: true, count }
    } catch (e: any) {
      results.coupons = { success: false, count: 0, error: e.message }
    }

    // 10. Delete Placements
    try {
      const { count } = await prisma.customPlacement.deleteMany({})
      results.placements = { success: true, count }
    } catch (e: any) {
      results.placements = { success: false, count: 0, error: e.message }
    }

    // 11. Delete Products (this is the main one!)
    try {
      const { count } = await prisma.product.deleteMany({})
      results.products = { success: true, count }
    } catch (e: any) {
      results.products = { success: false, count: 0, error: e.message }
    }

    // 12. Delete Brands
    try {
      const { count } = await prisma.brand.deleteMany({})
      results.brands = { success: true, count }
    } catch (e: any) {
      results.brands = { success: false, count: 0, error: e.message }
    }

    // 13. Delete Categories
    try {
      const { count } = await prisma.category.deleteMany({})
      results.categories = { success: true, count }
    } catch (e: any) {
      results.categories = { success: false, count: 0, error: e.message }
    }

    // 14. Delete Events
    try {
      const { count } = await prisma.event.deleteMany({})
      results.events = { success: true, count }
    } catch (e: any) {
      results.events = { success: false, count: 0, error: e.message }
    }

    // 15. Delete Orders (if any test orders)
    try {
      const { count } = await prisma.order.deleteMany({})
      results.orders = { success: true, count }
    } catch (e: any) {
      results.orders = { success: false, count: 0, error: e.message }
    }

    // 16. Delete Users (except admin)
    try {
      const { count } = await prisma.user.deleteMany({
        where: { role: { not: 'ADMIN' } }
      })
      results.users = { success: false, count: 0, error: 'Skipped - keeping admin users' }
    } catch (e: any) {
      results.users = { success: false, count: 0, error: e.message }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      results
    })

  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      details: error.message
    }, { status: 500 })
  }
}

// GET - Show what would be deleted (dry run)
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const counts = await prisma.$transaction([
      prisma.todaysPick.count(),
      prisma.review.count(),
      prisma.flashSale.count(),
      prisma.auction.count(),
      prisma.flashbackProduct.count(),
      prisma.giftCard.count(),
      prisma.coupon.count(),
      prisma.customPlacement.count(),
      prisma.product.count(),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.event.count(),
      prisma.order.count(),
      prisma.user.count(),
    ])

    return NextResponse.json({
      success: true,
      message: 'Current record counts (what would be deleted)',
      counts: {
        todaysPicks: counts[0],
        newArrivals: counts[1],
        reviews: counts[2],
        flashSales: counts[3],
        auctions: counts[4],
        flashbackProducts: counts[5],
        giftCards: counts[6],
        coupons: counts[7],
        placements: counts[8],
        products: counts[9],
        brands: counts[10],
        categories: counts[11],
        events: counts[12],
        orders: counts[13],
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
