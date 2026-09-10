import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check nearby products and alerts
export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, radius = 5000 } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Get active products (note: no geospatial data available in schema)
    const nearbyProducts = await prisma.product.findMany({
      where: { isActive: true },
            take: 10
    })

    // Check user's wishlist for matches (using WishlistBoard model)
    let wishlistMatches: any[] = []
    if (userId) {
      const wishlistBoards = await prisma.wishlistBoard.findMany({
        where: { userId },
        select: { productIds: true }
      })
      const wishlistProductIds = new Set(
        wishlistBoards.flatMap(b => {
          try { return JSON.parse(b.productIds) as string[] } catch { return [] }
        })
      )
      wishlistMatches = nearbyProducts
        .filter(p => wishlistProductIds.has(p.id))
        .map(p => ({ productId: p.id, name: p.name }))
    }

    return NextResponse.json({
      location: { latitude, longitude },
      radius: `${radius}m`,
      productsFound: nearbyProducts.length,
      nearbyProducts: nearbyProducts.map(p => ({ id: p.id, name: p.name, price: p.price })),
      wishlistMatches,
      alerts: wishlistMatches.length > 0 ? [
        { type: 'wishlist', message: `${wishlistMatches.length} wishlist items available nearby!`, urgency: 'medium' }
      ] : []
    })
  } catch (error) {
    console.error('Nearby alerts error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get nearby stores
export async function GET(req: NextRequest) {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
            take: 20
    })

    return NextResponse.json({
      stores: stores.map(s => ({ id: s.id, name: s.name, address: s.address })),
      total: stores.length
    })
  } catch (error) {
    console.error('Stores error:', error)
    return NextResponse.json({ stores: [] })
  }
}
