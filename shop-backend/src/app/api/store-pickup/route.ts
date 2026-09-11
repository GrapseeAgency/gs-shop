import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

// Default store locations to create if database is empty
const DEFAULT_STORES = [
  {
    id: 'store-1',
    name: 'Grapsee Flagship Store  Gulshan',
    address: 'House 45, Road 11, Gulshan-2',
    city: 'Dhaka',
    phone: '+880 1712-345678',
    hours: '10:00 AM - 9:00 PM (Sat-Thu)',
    latitude: 23.7935,
    longitude: 90.4143,
    isActive: true,
    pickupAvailable: true,
  },
  {
    id: 'store-2',
    name: 'Grapsee Express  Banani',
    address: 'House 12, Road 27, Banani',
    city: 'Dhaka',
    phone: '+880 1812-345678',
    hours: '10:00 AM - 8:00 PM (Sat-Thu)',
    latitude: 23.7943,
    longitude: 90.4066,
    isActive: true,
    pickupAvailable: true,
  },
  {
    id: 'store-3',
    name: 'Grapsee Outlet  Chattogram',
    address: 'CDA Avenue, GEC Circle',
    city: 'Chattogram',
    phone: '+880 1912-345678',
    hours: '10:00 AM - 8:00 PM (Sat-Thu)',
    latitude: 22.3569,
    longitude: 91.7832,
    isActive: true,
    pickupAvailable: true,
  },
  {
    id: 'store-4',
    name: 'Grapsee Pop-up  Sylhet',
    address: 'Zindabazar Road, Sylhet',
    city: 'Sylhet',
    phone: '+880 1612-345678',
    hours: '11:00 AM - 7:00 PM (Sat-Thu)',
    latitude: 24.8949,
    longitude: 91.8687,
    isActive: false,
    pickupAvailable: false,
  },
]

// GET /api/store-pickup Return store locations with pickup availability
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const pickupOnly = searchParams.get('pickupOnly') === 'true'

    // Check if stores exist in database, create default ones if empty
    let stores = await prisma.storeLocation.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    if (stores.length === 0) {
      await prisma.storeLocation.createMany({
        data: DEFAULT_STORES
      })
      
      stores = await prisma.storeLocation.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      })
    }

    // Build where clause for filtering
    const whereClause: any = { isActive: true }
    if (city) whereClause.city = { contains: city }
    if (pickupOnly) whereClause.pickupAvailable = true

    const filteredStores = await prisma.storeLocation.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    })

    // Get current pickup queue information for each store
    const enrichedStores = await Promise.all(
      filteredStores.map(async (store) => {
        const [currentPickups, todayPickups] = await Promise.all([
          prisma.storePickup.count({
            where: {
              storeId: store.id,
              status: 'pending'
            }
          }),
          prisma.storePickup.count({
            where: {
              storeId: store.id,
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          })
        ])

        const estimatedWait = currentPickups > 0 
          ? `${Math.ceil(currentPickups * 5)} min` 
          : 'Ready'

        return {
          ...store,
          currentQueue: currentPickups,
          todayPickups,
          estimatedWait,
          directionsUrl: store.latitude && store.longitude
            ? `https://maps.google.com/?q=${store.latitude},${store.longitude}`
            : null,
        }
      })
    )

    // Get unique cities for filter
    const cities = [...new Set(enrichedStores.map(s => s.city))]

    return NextResponse.json({
      success: true,
      data: enrichedStores,
      count: enrichedStores.length,
      cities,
    })
  } catch (error) {
    console.error('Store pickup fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store locations' },
      { status: 500 }
    )
  }
}

// POST /api/store-pickup Create a pickup request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { storeId, orderId, customerName, customerPhone, scheduledAt, userId } = body

    const targetUserId = userId || session?.user?.id

    // Validate required fields
    if (!storeId) {
      return NextResponse.json(
        { success: false, error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Verify store exists and has pickup available
    const store = await prisma.storeLocation.findUnique({
      where: { id: storeId, isActive: true },
    })

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found or not available' },
        { status: 404 }
      )
    }

    // Note: pickupAvailable field doesn't exist in schema
    // Assume all stores support pickup for now

    // If orderId provided, verify it exists and belongs to user
    let order = null
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, customerEmail: true, status: true, total: true }
      })

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }

      if (targetUserId && order.customerEmail !== targetUserId) {
        return NextResponse.json(
          { success: false, error: 'Order does not belong to this user' },
          { status: 403 }
        )
      }
    }

    // Create the pickup record
    const pickup = await prisma.storePickup.create({
      data: {
        storeId,
        orderId: orderId || null,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: pickup.id,
        storeId: pickup.storeId,
        storeName: store.name,
        orderId: pickup.orderId,
        status: pickup.status,
        createdAt: pickup.createdAt,
        storeDetails: {
          name: store.name,
          address: store.address,
          hours: store.hours,
          phone: store.phone,
          latitude: store.latitude,
          longitude: store.longitude
        },
        orderDetails: order ? {
          id: order.id,
          total: order.total,
          status: order.status
        } : null
      },
      message: 'Pickup request created. You will be notified when your order is ready.',
    }, { status: 201 })
  } catch (error) {
    console.error('Store pickup creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create pickup request' },
      { status: 500 }
    )
  }
}
