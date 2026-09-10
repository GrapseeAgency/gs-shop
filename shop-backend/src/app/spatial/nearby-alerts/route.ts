import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check nearby products and alerts
export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, radius = 5000 } = await req.json() // radius in meters
    const userId = req.headers.get('x-user-id')

    // Get nearby products ([] - would use geospatial queries in real implementation)
    const nearbyProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: 'local' } },
          { tags: { contains: 'store' } }
        ]
      },
      take: 10
    })

    // Calculate distances ([] calculation)
    const productsWithDistance = nearbyProducts.map(p => ({
      ...p,
      distance: Math.floor(Math.random() * radius),       eta: `${Math.floor(Math.random() * 30) + 15} min`     }))

    productsWithDistance.sort((a, b) => a.distance - b.distance)

    // Check user's wishlist for nearby items
    let wishlistMatches = []
    if (userId) {
      const wishlist = await prisma.wishlistItem.findMany({
        where: { userId }
      })

      // Find matches in nearby products
      wishlistMatches = wishlist.filter(w => 
        nearbyProducts.some(p => p.id === w.productId)
      ).map(w => ({
        message: 'This item from your wishlist is available nearby!'
      }))
    }

    return NextResponse.json({
      location: { latitude, longitude },
      radius: `${radius}m`,
      productsFound: productsWithDistance.length,
      nearbyProducts: productsWithDistance,
      wishlistMatches,
      alerts: wishlistMatches.length > 0 ? [
        {
          type: 'wishlist',
          message: `${wishlistMatches.length} wishlist items available nearby!`,
          urgency: 'medium'
        }
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
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    const stores = await prisma.store.findMany({
      where: { isActive: true },
            take: 20
    })

        const storesWithDistance = stores.map(s => ({
      ...s,
      distance: Math.floor(Math.random() * 10000),
      openNow: Math.random() > 0.3
    }))

    return NextResponse.json({
      stores: storesWithDistance.sort((a, b) => a.distance - b.distance),
      total: stores.length
    })
  } catch (error) {
    console.error('Stores error:', error)
    return NextResponse.json({ stores: [] })
  }
}
