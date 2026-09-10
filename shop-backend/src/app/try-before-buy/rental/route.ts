import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get rental options for product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate rental pricing (digital services appropriate)
    const basePrice = product.price
    const rentalOptions = [
      {
        duration: 1,
        unit: 'day',
        price: Math.round(basePrice * 0.15),
        description: 'Try for 1 day',
        bestFor: 'Quick evaluation'
      },
      {
        duration: 3,
        unit: 'days',
        price: Math.round(basePrice * 0.25),
        description: 'Try for 3 days',
        bestFor: 'Full feature testing'
      },
      {
        duration: 7,
        unit: 'days',
        price: Math.round(basePrice * 0.35),
        description: 'Try for 7 days',
        bestFor: 'Complete experience'
      }
    ]

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      },
      rentalOptions,
      terms: {
        refundable: true,
        tryThenBuy: true,
        rentalAppliedToPurchase: true,
        cancellationPolicy: 'Cancel anytime before delivery'
      }
    })
  } catch (error) {
    console.error('Rental options error:', error)
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}

// POST - Create rental order
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, duration, durationUnit } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate rental price
    const multiplier = durationUnit === 'day' ? 0.15 : durationUnit === 'days' && duration === 3 ? 0.25 : 0.35
    const rentalPrice = Math.round(product.price * multiplier)

    const rental = await prisma.productRental.create({
      data: {
        userId,
        productId,
        duration,
        durationUnit: durationUnit || 'days',
        rentalPrice,
        totalCost: rentalPrice + Math.round(product.price * 0.1),
        status: 'pending',
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        deposit: Math.round(product.price * 0.1), // 10% deposit
        tryThenBuy: true
      }
    })

    return NextResponse.json({
      success: true,
      rental: {
        id: rental.id,
        product: product.name,
        duration: `${duration} ${durationUnit}`,
        rentalPrice,
        deposit: rental.deposit,
        total: rentalPrice + rental.deposit,
        message: `Try ${product.name} for ${duration} ${durationUnit}. Love it? Rental fee goes toward purchase!`
      },
      checkoutUrl: `/checkout?rental=${rental.id}`
    })
  } catch (error) {
    console.error('Rental creation error:', error)
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 })
  }
}
