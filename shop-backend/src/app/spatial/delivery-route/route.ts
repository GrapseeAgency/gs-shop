import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get delivery route visualization
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        delivery: true,
        items: {
          include: { product: { include: { seller: true } } }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate delivery route visualization data
    const route = generateDeliveryRoute(order)

    return NextResponse.json({
      orderId,
      status: order.delivery?.status || 'pending',
      route,
      estimatedArrival: order.delivery?.estimatedArrival,
      currentLocation: order.delivery?.currentLocation,
      stops: [
        { type: 'warehouse', name: 'Fulfillment Center', status: 'completed' },
        { type: 'transit', name: 'In Transit', status: 'in_progress' },
        { type: 'delivery', name: 'Your Location', status: 'pending' }
      ],
      environmentalImpact: {
        distance: Math.floor(Math.random() * 50) + 10, // km
        co2: (Math.random() * 2 + 0.5).toFixed(1), // kg
        packaging: 'recyclable'
      }
    })
  } catch (error) {
    console.error('Delivery route error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateDeliveryRoute(order: any) {
    const origin = { lat: 19.0760, lng: 72.8777 } // Mumbai example
  const destination = { lat: 19.1000 + Math.random() * 0.1, lng: 72.9000 + Math.random() * 0.1 }
  
  // Generate waypoints
  const waypoints = []
  const steps = 5
  for (let i = 1; i < steps; i++) {
    waypoints.push({
      lat: origin.lat + (destination.lat - origin.lat) * (i / steps),
      lng: origin.lng + (destination.lng - origin.lng) * (i / steps),
      completed: i < 3
    })
  }

  return {
    origin,
    destination,
    waypoints,
    progress: 60, // percent
    currentPosition: waypoints[2]   }
}

// POST - Update delivery location (driver side)
export async function POST(req: NextRequest) {
  try {
    const { orderId, latitude, longitude, status } = await req.json()

    await prisma.delivery.updateMany({
      where: { orderId },
      data: {
        currentLocation: JSON.stringify({ lat: latitude, lng: longitude }),
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Location updated'
    })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
