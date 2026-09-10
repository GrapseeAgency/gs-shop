import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface TrackingStep {
  status: string
  label: string
  location: string
  date: string
  completed: boolean
  current: boolean
}

// Maps DB order status which steps are completed/current
const STATUS_STEP_INDEX: Record<string, number> = {
  pending: 0,
  processing: 1,
  confirmed: 1,
  shipped: 2,
  in_transit: 3,
  out_for_delivery: 4,
  completed: 5,
  delivered: 5,
  cancelled: -1,
}

function buildStepsFromOrder(order: {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  shippingAddress: string | null
  trackingSteps: string | null
}): TrackingStep[] {
  // If real tracking steps stored, use them
  if (order.trackingSteps) {
    try {
      const stored = JSON.parse(order.trackingSteps) as TrackingStep[]
      if (Array.isArray(stored) && stored.length > 0) return stored
    } catch {
      // fall through to derived steps
    }
  }

  const day = 86400000
  const created = order.createdAt.getTime()
  const addr = order.shippingAddress || 'Dhaka, Bangladesh'
  const stepIndex = STATUS_STEP_INDEX[order.status] ?? 0

  const PIPELINE: Array<{ status: string; label: string; location: string; offsetMs: number }> = [
    { status: 'order_placed',      label: 'Order Placed',      location: 'Grapsee Online',             offsetMs: 0 },
    { status: 'processing',        label: 'Processing',        location: 'Grapsee Warehouse, Dhaka',   offsetMs: 0.5 * day },
    { status: 'shipped',           label: 'Shipped',           location: 'Distribution Center, Dhaka', offsetMs: 1.5 * day },
    { status: 'in_transit',        label: 'In Transit',        location: 'Sorting Facility, Dhaka',    offsetMs: 2.5 * day },
    { status: 'out_for_delivery',  label: 'Out for Delivery',  location: 'Local Hub',                  offsetMs: 3.5 * day },
    { status: 'delivered',         label: 'Delivered',         location: addr,                         offsetMs: 4 * day },
  ]

  return PIPELINE.map((step, idx) => {
    const completed = stepIndex === -1 ? false : idx <= stepIndex
    const current = idx === stepIndex
    return {
      status: step.status,
      label: step.label,
      location: step.location,
      date: new Date(created + step.offsetMs).toISOString(),
      completed,
      current,
    }
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch real order from DB
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        trackingNumber: true,
        trackingSteps: true,
        customerName: true,
        customerEmail: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const steps = buildStepsFromOrder(order)
    const currentStep = steps.find(s => s.current)
    const deliveredStep = steps.find(s => s.status === 'delivered')

    const trackingNumber = order.trackingNumber
      || `GRPS-${order.id.slice(-8).toUpperCase()}`

    const carrier = {
      name: 'Grapsee Express',
      logo: '',
      phone: '+880-1800-GRAPSEE',
    }

    return NextResponse.json({
      trackingNumber,
      carrier,
      deliveryAddress: order.shippingAddress || 'Dhaka, Bangladesh',
      steps,
      estimatedDelivery: deliveredStep?.date || new Date(Date.now() + 4 * 86400000).toISOString(),
      currentStatus: currentStep?.status || 'order_placed',
      orderStatus: order.status,
    })
  } catch (error) {
    console.error('Error fetching order tracking:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking info' }, { status: 500 })
  }
}
