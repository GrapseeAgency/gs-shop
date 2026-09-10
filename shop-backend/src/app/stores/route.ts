import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Haversine formula to calculate distance between two coordinates (in km)
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')
    const hasCoords = !isNaN(lat) && !isNaN(lng)

    let stores = await prisma.storeLocation.findMany({
      where: {
        isActive: true,
        ...(city ? { city: { contains: city } } : {}),
      },
      orderBy: { name: 'asc' },
    })

    // If no stores in DB, return empty
    if (stores.length === 0) {
      return NextResponse.json({ data: [], total: 0 })
    }

    // Add distance if coordinates provided
    let result = stores.map((store) => {
      const storeLat = store.latitude
      const storeLng = store.longitude

      const distance =
        hasCoords && storeLat != null && storeLng != null
          ? haversineDistance(lat, lng, storeLat, storeLng)
          : null

      return {
        ...store,
        distance,
      }
    })

    // Sort by distance if coordinates provided
    if (hasCoords) {
      result = result
        .filter((s) => s.distance !== null)
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }

    return NextResponse.json({ data: result, total: result.length })
  } catch (error) {
    console.error('[STORES_GET]', error)
    // Return empty data on error
    return NextResponse.json({ data: [], total: 0 })
  }
}
