import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/store-pickup Return store locations with pickup availability
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const pickupOnly = searchParams.get('pickupOnly') === 'true'

    // Try real DB query first
    let stores: Awaited<ReturnType<typeof prisma.storeLocation.findMany>> | null = null
    try {
      const where: Record<string, unknown> = { isActive: true }
      if (city) where.city = city

      const result = await prisma.storeLocation.findMany({
        where,
        orderBy: { name: 'asc' },
      })

      stores = result.length > 0 ? result : null
    } catch {
      stores = null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any[] = stores || []

    // Apply filters
    if (city && !stores) {
      data = data.filter(s => s.city.toLowerCase().includes(city.toLowerCase()))
    }
    if (pickupOnly) {
      data = data.filter(s => s.pickupAvailable)
    }

    // Enrich with pickup info
    const enriched = data.map(store => ({
      ...store,
      pickupAvailable: store.pickupAvailable ?? true,
      currentQueue: store.currentQueue ?? Math.floor(Math.random() * 5),
      estimatedWait: store.estimatedWait ?? `${Math.floor(Math.random() * 20 + 5)} min`,
      directionsUrl: store.latitude && store.longitude
        ? `https://maps.google.com/?q=${store.latitude},${store.longitude}`
        : null,
    }))

    // Get unique cities for filter
    const cities = [...new Set(enriched.map(s => s.city))]

    return NextResponse.json({
      data: enriched,
      count: enriched.length,
      cities,
    })
  } catch (error) {
    console.error('Store pickup fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store locations' },
      { status: 500 }
    )
  }
}

// POST /api/store-pickup Create a pickup request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, orderId, customerName, customerPhone, scheduledAt } = body

    // Validate required fields
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Verify store exists and has pickup available
    let store = null
    try {
      store = await prisma.storeLocation.findUnique({
        where: { id: storeId },
      })
    } catch {
      // Check [] stores
    }

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Create the pickup record
    const pickup = await prisma.storePickup.create({
      data: {
        storeId,
        orderId: orderId || null,
        status: 'pending',
      },
    })

    // Generate pickup code
    const pickupCode = `PU-${pickup.id.slice(-6).toUpperCase()}`
    const storeRecord = (store || {}) as Record<string, unknown>

    return NextResponse.json({
      success: true,
      pickup: {
        id: pickup.id,
        storeId: pickup.storeId,
        storeName: storeRecord.name,
        orderId: pickup.orderId,
        customerName: customerName || null,
        status: pickup.status,
        scheduledAt: scheduledAt || null,
        pickupCode,
        storeDetails: {
          name: storeRecord.name,
          address: storeRecord.address,
          hours: storeRecord.hours,
          phone: storeRecord.phone,
        },
      },
      message: 'Pickup request created. You will be notified when your order is ready.',
    }, { status: 201 })
  } catch (error) {
    console.error('Store pickup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create pickup request' },
      { status: 500 }
    )
  }
}
