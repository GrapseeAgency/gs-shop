import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

// GET /api/shipping/methods Returns available shipping methods
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const cartValue = parseFloat(searchParams.get('cartValue') || '0')
    const location = searchParams.get('location')
    const weight = parseFloat(searchParams.get('weight') || '1')

    // Get available shipping methods from database
    const shippingMethods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // If no shipping methods exist, create default ones
    if (shippingMethods.length === 0) {
      const defaultMethods = [
        {
          name: 'Standard Delivery',
          description: '3-5 business days delivery',
          price: 50,
          estimatedDays: '3-5',
          isActive: true,
          order: 1
        },
        {
          name: 'Express Delivery',
          description: '1-2 business days delivery',
          price: 120,
          estimatedDays: '1-2',
          isActive: true,
          order: 2
        },
        {
          name: 'Same Day Delivery',
          description: 'Get it today! Order before 12 PM',
          price: 200,
          estimatedDays: '0-1',
          isActive: true,
          order: 3
        },
        {
          name: 'Pick Up from Store',
          description: 'Collect from our store - FREE',
          price: 0,
          estimatedDays: '0',
          isActive: true,
          order: 4
        }
      ]

      await prisma.shippingMethod.createMany({
        data: defaultMethods,
      })
    }

    // Fetch shipping methods again
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // Process methods with cart value and location logic
    const processedMethods = methods.map(method => {
      let finalPrice = method.price
      let isAvailable = true
      let availabilityReason = null

      // Note: freeAbove doesn't exist in schema, shipping is never free based on cart value

      // Note: maxWeight doesn't exist in schema, no weight restrictions

      // Note: regions doesn't exist in schema, no location restrictions

      // Check same day delivery time restriction
      if (method.name.includes('Same Day')) {
        const now = new Date()
        const cutoffTime = new Date()
        cutoffTime.setHours(12, 0, 0, 0) // 12 PM cutoff
        
        if (now > cutoffTime) {
          isAvailable = false
          availabilityReason = 'Order before 12 PM for same day delivery'
        }
      }

      return {
        id: method.id,
        name: method.name,
        description: method.description,
        price: finalPrice,
        originalPrice: method.price,
        estimatedDays: method.estimatedDays,
        freeAbove: null, // Not available in schema
        isActive: method.isActive && isAvailable,
        order: method.order,
        icon: '', // Default icon since it doesn't exist in schema
        isAvailable,
        availabilityReason,
        savings: 0, // No savings since freeAbove doesn't exist
        savingsMessage: null // No free shipping since freeAbove doesn't exist in schema
      }
    })

    // Filter out unavailable methods
    const availableMethods = processedMethods.filter(method => method.isActive && method.isAvailable)

    return NextResponse.json({
      success: true,
      data: availableMethods,
      summary: {
        totalMethods: processedMethods.length,
        availableMethods: availableMethods.length,
        cartValue,
        location: location || 'Not specified',
        weight,
        freeShippingAvailable: availableMethods.some(m => m.price === 0),
        cheapestOption: availableMethods.length > 0 
          ? availableMethods.reduce((min, curr) => curr.price < min.price ? curr : min)
          : null
      }
    })
  } catch (error) {
    console.error('Error fetching shipping methods:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping methods' },
      { status: 500 }
    )
  }
}

// POST /api/shipping/methods Create or update shipping methods (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, estimatedDays, isActive = true, order } = body

    if (!name || !description || price === undefined || !estimatedDays) {
      return NextResponse.json({ success: false, error: 'Name, description, price, and estimated days are required' }, { status: 400 })
    }

    if (price < 0) {
      return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 })
    }

    const shippingMethod = await prisma.shippingMethod.create({
      data: {
        name,
        description,
        price,
        estimatedDays,
        isActive,
        order: order || 999
        // Note: freeAbove, icon, regions, maxWeight don't exist in schema
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...shippingMethod,
        regions: null // Not available in schema
      },
      message: 'Shipping method created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating shipping method:', error)
    return NextResponse.json({ success: false, error: 'Failed to create shipping method' }, { status: 500 })
  }
}

// PUT /api/shipping/methods Update shipping method (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { methodId, name, description, price, estimatedDays, isActive, order } = body

    if (!methodId) {
      return NextResponse.json({ success: false, error: 'Method ID is required' }, { status: 400 })
    }

    const existingMethod = await prisma.shippingMethod.findUnique({
      where: { id: methodId }
    })

    if (!existingMethod) {
      return NextResponse.json({ success: false, error: 'Shipping method not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) {
      if (price < 0) {
        return NextResponse.json({ success: false, error: 'Price cannot be negative' }, { status: 400 })
      }
      updateData.price = price
    }
    if (estimatedDays !== undefined) updateData.estimatedDays = estimatedDays
    if (isActive !== undefined) updateData.isActive = isActive
    if (order !== undefined) updateData.order = order
    // Note: freeAbove, icon, regions, maxWeight don't exist in schema

    const updatedMethod = await prisma.shippingMethod.update({
      where: { id: methodId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedMethod,
        regions: null // Not available in schema
      },
      message: 'Shipping method updated successfully'
    })
  } catch (error) {
    console.error('Error updating shipping method:', error)
    return NextResponse.json({ success: false, error: 'Failed to update shipping method' }, { status: 500 })
  }
}
