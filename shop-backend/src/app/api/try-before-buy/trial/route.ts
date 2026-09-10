// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get trial options for product
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

    // Check if product is eligible for trial
    const trialEligible = isTrialEligible(product)

    if (!trialEligible.eligible) {
      return NextResponse.json({
        eligible: false,
        reason: trialEligible.reason
      })
    }

    return NextResponse.json({
      eligible: true,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        trialPrice: Math.round(product.price * 0.1) // 10% to try
      },
      trialDuration: 7, // days
      deposit: Math.round(product.price * 0.3), // 30% deposit
      returnOptions: [
        { name: 'Home pickup', fee: 0 },
        { name: 'Drop at store', fee: 0 },
        { name: 'Courier return', fee: 99 }
      ],
      conditions: [
        'Item must be returned in original condition',
        'Keep all tags and packaging',
        'Maximum 7 days trial period',
        'Deposit refunded minus trial fee if returned'
      ]
    })
  } catch (error) {
    console.error('Trial options error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create trial order
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, duration = 7, returnMethod } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const trialPrice = Math.round(product.price * 0.1)
    const deposit = Math.round(product.price * 0.3)

    const trial = await prisma.trialOrder.create({
      data: {
        userId,
        productId,
        trialPrice,
        deposit,
        duration,
        returnMethod,
        status: 'pending',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      trial: {
        id: trial.id,
        productName: product.name,
        trialPrice,
        deposit,
        duration,
        endsAt: trial.endsAt
      },
      message: 'Trial order created!',
      paymentUrl: `/checkout?trial=${trial.id}`,
      nextSteps: [
        'Complete payment (trial fee + deposit)',
        'Item will be delivered within 2 days',
        'Try it for 7 days',
        'Keep or return - deposit refunded if returned'
      ]
    })
  } catch (error) {
    console.error('Trial creation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function isTrialEligible(product: any): { eligible: boolean; reason?: string } {
  // Check category
  const trialCategories = ['clothing', 'shoes', 'electronics', 'furniture', 'jewelry']
  const category = product.category?.name?.toLowerCase() || ''
  
  if (!trialCategories.some(c => category.includes(c))) {
    return { eligible: false, reason: 'This category is not eligible for trial' }
  }

  // Check price range
  if (product.price < 500) {
    return { eligible: false, reason: 'Item price too low for trial' }
  }

  if (product.price > 50000) {
    return { eligible: false, reason: 'High-value items not available for trial' }
  }

  // Check if digital/download
  if (product.isDigital) {
    return { eligible: false, reason: 'Digital products not eligible for trial' }
  }

  return { eligible: true }
}
