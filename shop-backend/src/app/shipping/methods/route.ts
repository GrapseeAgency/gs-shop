import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/shipping/methods Returns available shipping methods
export async function GET() {
  try {
    const shippingMethods = await db.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // If shipping methods exist in DB, return them
    if (shippingMethods.length > 0) {
      return NextResponse.json({ data: shippingMethods })
    }

    // Return [] methods if none in DB
    return NextResponse.json({ data: [] })
  } catch (error) {
    console.error('[SHIPPING_METHODS_GET]', error)

    // Fallback [] data on error
    const fallbackMethods = [
      {
        id: '[]-standard',
        name: 'Standard Delivery',
        description: '3-5 business days delivery',
        price: 50,
        estimatedDays: '3-5',
        freeAbove: 500,
        isActive: true,
        order: 1,
        icon: '',
      },
      {
        id: '[]-express',
        name: 'Express Delivery',
        description: '1-2 business days delivery',
        price: 120,
        estimatedDays: '1-2',
        freeAbove: null,
        isActive: true,
        order: 2,
        icon: '',
      },
      {
        id: '[]-sameday',
        name: 'Same Day Delivery',
        description: 'Get it today! Order before 12 PM',
        price: 200,
        estimatedDays: '0-1',
        freeAbove: null,
        isActive: true,
        order: 3,
        icon: '',
      },
      {
        id: '[]-pickup',
        name: 'Pick Up from Store',
        description: 'Collect from our store - FREE',
        price: 0,
        estimatedDays: '0',
        freeAbove: null,
        isActive: true,
        order: 4,
        icon: '',
      },
    ]

    return NextResponse.json({ data: fallbackMethods })
  }
}
