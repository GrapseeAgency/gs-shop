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

// Default stores to create if database is empty
const defaultStores = [
  {
    name: 'Grapsee Flagship Store - Gulshan',
    address: 'House 45, Road 11, Gulshan-2',
    city: 'Dhaka',
    phone: '+880 1712-345678',
    hours: '10:00 AM - 9:00 PM (Sat-Thu)',
    latitude: 23.7935,
    longitude: 90.4143,
    // Note: isActive doesn't exist in Store schema
  },
  {
    name: 'Grapsee Banani Branch',
    address: 'House 12, Road 27, Banani',
    city: 'Dhaka',
    phone: '+880 1812-345678',
    hours: '10:00 AM - 8:00 PM (Sat-Thu)',
    latitude: 23.7941,
    longitude: 90.4013,
    // Note: isActive doesn't exist in Store schema
  },
  {
    name: 'Grapsee Chattogram Center',
    address: 'CDA Avenue, GEC Circle',
    city: 'Chattogram',
    phone: '+880 1912-345678',
    hours: '10:00 AM - 8:00 PM (Sat-Thu)',
    latitude: 22.3569,
    longitude: 91.8255,
    // Note: isActive doesn't exist in Store schema
  },
  {
    name: 'Grapsee Sylhet Outlet',
    address: 'Zindabazar Road, Sylhet',
    city: 'Sylhet',
    phone: '+880 1612-345678',
    hours: '10:00 AM - 7:00 PM (Sat-Thu)',
    latitude: 24.8949,
    longitude: 91.8687,
    // Note: isActive doesn't exist in Store schema
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')
    const radius = parseFloat(searchParams.get('radius') || '50') // Default 50km radius
    const hasCoords = !isNaN(lat) && !isNaN(lng)

    // Check if stores exist in database, create default ones if empty
    const existingStoresCount = await prisma.storeLocation.count()
    if (existingStoresCount === 0) {
      await prisma.storeLocation.createMany({
        data: defaultStores
      })
    }

    // Build where clause
    const whereClause: any = {
      // Note: isActive doesn't exist in Store schema
    }

    if (city) {
      whereClause.city = {
        contains: city
      }
    }

    let stores = await prisma.storeLocation.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    })

    // Add distance if coordinates provided and filter by radius
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

    // Filter by radius if coordinates provided
    if (hasCoords) {
      result = result.filter((store) => 
        store.distance !== null && store.distance <= radius
      )
    }

    // Sort by distance if coordinates provided, otherwise by name
    if (hasCoords) {
      result = result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    } else {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Add additional store information
    const enrichedResult = result.map(store => ({
      ...store,
      // Calculate if store is currently open (simplified logic)
      isOpen: isStoreOpen(store.hours),
      // Add formatted distance
      formattedDistance: store.distance ? `${store.distance} km` : null
    }))

    return NextResponse.json({
      success: true,
      data: enrichedResult,
      total: enrichedResult.length,
      meta: {
        searchParams: {
          city: city || null,
          coordinates: hasCoords ? { lat, lng } : null,
          radius: hasCoords ? `${radius} km` : null
        },
        hasMore: false // All stores returned for simplicity
      }
    })
  } catch (error) {
    console.error('[STORES_GET]', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch store locations'
    }, { status: 500 })
  }
}

// Helper function to check if store is currently open
function isStoreOpen(hours: string): boolean {
  try {
    // Simple logic - in production, this would parse the hours string properly
    // For now, assume stores are open during business hours
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay()
    
    // Assume stores are closed on Friday (day 5 in JS)
    if (currentDay === 5) return false
    
    // Assume stores are open from 10 AM to 9 PM
    return currentHour >= 10 && currentHour < 21
  } catch (error) {
    return false
  }
}
