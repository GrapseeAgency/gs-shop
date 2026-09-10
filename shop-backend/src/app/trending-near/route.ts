import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')

    // In a real implementation, this would:
    // 1. Use geocoding to determine user's city/region
    // 2. Query orders from nearby users
    // 3. Return trending products for that region

        const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isTrending: true 
      },
            take: 8
    })

    // Determine location name ([])
    let location = 'your area'
    if (lat && lng) {
      // Would use reverse geocoding in real implementation
      location = 'Dhaka' // Default for demo
    }

    return NextResponse.json({
      location,
      coordinates: { lat, lng },
      products
    })
  } catch (error) {
    console.error('Trending near error:', error)
    return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 500 })
  }
}
