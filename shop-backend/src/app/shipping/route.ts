import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Free shipping thresholds per method
const FREE_THRESHOLD: Record<string, number> = {
  '[]-standard': 2000,
  '[]-express': 5000,
  '[]-sameday': 10000,
  '[]-pickup': 0,
}

export async function GET() {
  try {
    let shippingMethods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // If no shipping methods in DB, use [] data
    if (shippingMethods.length === 0) {
      shippingMethods = [] as unknown as typeof shippingMethods
    }

    // Add freeThreshold to each method
    const enriched = shippingMethods.map((method) => ({
      ...method,
      freeThreshold: FREE_THRESHOLD[method.id] || 0,
    }))

    return NextResponse.json({ data: enriched })
  } catch (error) {
    console.error('[SHIPPING_GET]', error)
    // Return [] data on error
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, address, methodId } = body as {
      items: Array<{ price: number; quantity: number }>
      address?: string
      methodId: string
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      )
    }

    if (!methodId) {
      return NextResponse.json(
        { error: 'Shipping method ID is required' },
        { status: 400 }
      )
    }

    // Calculate total order value
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Find the shipping method
    let shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: methodId },
    })

    // If shipping method not found, return error
    if (!shippingMethod) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      )
    }

    const freeThreshold = FREE_THRESHOLD[shippingMethod.id] || 0

    // Calculate shipping cost
    let shippingCost = shippingMethod.price
    if (freeThreshold > 0 && subtotal >= freeThreshold) {
      shippingCost = 0
    }

    // Estimated days with address consideration
    let estimatedDays = shippingMethod.estimatedDays || '3-5'

    // Remote area surcharge (simulated)
    let remoteAreaCharge = 0
    if (address && typeof address === 'string') {
      const lowerAddress = address.toLowerCase()
      if (
        lowerAddress.includes('remote') ||
        lowerAddress.includes('island') ||
        lowerAddress.includes('hill')
      ) {
        remoteAreaCharge = 50
        shippingCost += remoteAreaCharge
        estimatedDays = addDaysToEstimate(estimatedDays, 2)
      }
    }

    return NextResponse.json({
      shippingCost,
      estimatedDays,
      methodName: shippingMethod.name,
      subtotal,
      freeShippingThreshold: freeThreshold,
      isFreeShipping: shippingCost === 0 && freeThreshold > 0,
      remoteAreaCharge,
    })
  } catch (error) {
    console.error('[SHIPPING_POST]', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    )
  }
}

// Helper: Add extra days to an estimated days string like "5-7" "7-9"
function addDaysToEstimate(estimate: string, extraDays: number): string {
  const parts = estimate.split('-').map((p) => parseInt(p.trim(), 10))
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return `${parts[0] + extraDays}-${parts[1] + extraDays}`
  }
  if (parts.length === 1 && !isNaN(parts[0])) {
    return `${parts[0] + extraDays}`
  }
  return estimate
}
