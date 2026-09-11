import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// Rental-eligible categories and price range
const RENTAL_ELIGIBLE_CATEGORIES = ['electronics', 'cameras', 'tools', 'gaming', 'events', 'appliances', 'sports']
const MIN_RENTAL_PRICE = 1000
const MAX_RENTAL_PRICE = 100000

// Rental pricing: 5% daily, 25% weekly, 70% monthly of product price
const DAILY_RATE_MULTIPLIER = 0.05
const WEEKLY_RATE_MULTIPLIER = 0.25
const MONTHLY_RATE_MULTIPLIER = 0.70
const DEPOSIT_MULTIPLIER = 0.5

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    // Get user's active rentals
    let userRentals = []
    if (userId) {
      userRentals = await prisma.rental.findMany({
        where: {
          userId,
          status: { in: ['pending', 'active', 'confirmed'] },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Get eligible products from RentalProduct table or calculate from products
    let rentalProducts = []

    // First check for dedicated rental products
    const dedicatedRentals = await prisma.rentalProduct.findMany({
      where: { isActive: true },
            take: 20,
    })

    if (dedicatedRentals.length > 0) {
      rentalProducts = dedicatedRentals.map(rp => ({
        id: rp.id,
        rentalId: rp.id,
        name: rp.productName,
        imageUrl: rp.imageUrl,
        dailyRate: rp.dailyRate,
        weeklyRate: rp.weeklyRate,
        monthlyRate: rp.monthlyRate,
        securityDeposit: rp.securityDeposit,
                available: true,
        description: 'Available for rent',
        stock: 1,
      }))
    } else {
      // Calculate rental rates from regular products
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          price: { gte: MIN_RENTAL_PRICE, lte: MAX_RENTAL_PRICE }
        },
        take: 12,
        orderBy: { price: 'desc' }
      })

      rentalProducts = products
        .filter(p => RENTAL_ELIGIBLE_CATEGORIES.some(cat =>
          p.tags?.toLowerCase().includes(cat)
        ))
        .map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          dailyRate: Math.round(p.price * DAILY_RATE_MULTIPLIER * 100) / 100,
          weeklyRate: Math.round(p.price * WEEKLY_RATE_MULTIPLIER * 100) / 100,
          monthlyRate: Math.round(p.price * MONTHLY_RATE_MULTIPLIER * 100) / 100,
          securityDeposit: Math.round(p.price * DEPOSIT_MULTIPLIER),
                    available: p.isActive,
          description: p.description?.substring(0, 80) + '...' || 'Available for rent',
          stock: null, // Note: Product model doesn't have stock field
        }))
    }

    const filtered = category && category !== 'All'
      ? rentalProducts.filter((p) => p.category === category || p.category?.toLowerCase().includes(category.toLowerCase()))
      : rentalProducts

    // Get unique categories
    const categories = [].slice(0, 10)

    return NextResponse.json({
      success: true,
      products: filtered,
      userRentals: userRentals.map(r => ({
        id: r.id,
        productId: r.productId,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        totalPrice: r.totalPrice,
      })),
      categories,
      rentalTerms: {
        minDuration: '1 day',
        maxDuration: '3 months',
        freeDelivery: true,
        insuranceIncluded: true,
        damageProtection: 'Available for +15%',
        securityDepositRequired: true,
        depositRefundDays: 3,
      },
    })
  } catch (error) {
    console.error('[RENTAL] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch rental products' }, { status: 500 })
  }
}

// POST - Create rental booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { rentalProductId, productId, startDate, endDate, durationType = 'daily' } = body

    if (!productId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Product ID, start date, and end date are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (days < 1) {
      return NextResponse.json({ success: false, error: 'Minimum rental is 1 day' }, { status: 400 })
    }

    // Get product pricing
    let rentalRate, totalPrice, securityDeposit

    if (rentalProductId) {
      const rentalProduct = await prisma.rentalProduct.findUnique({
        where: { id: rentalProductId }
      })
      if (!rentalProduct) {
        return NextResponse.json({ success: false, error: 'Rental product not found' }, { status: 404 })
      }
      rentalRate = rentalProduct.dailyRate
      securityDeposit = rentalProduct.securityDeposit
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
      }
      rentalRate = Math.round(product.price * DAILY_RATE_MULTIPLIER * 100) / 100
      securityDeposit = Math.round(product.price * DEPOSIT_MULTIPLIER)
    }

    // Calculate total
    totalPrice = Math.round(rentalRate * days * 100) / 100

    // Create rental record
    const rental = await prisma.rental.create({
      data: {
        userId,
        productId,
        rentalProductId: rentalProductId || productId,
        startDate: start,
        endDate: end,
        totalPrice,
        securityDeposit,
        status: 'pending',
        durationType: durationType || 'daily',
        duration: days
      }
    })

    return NextResponse.json({
      success: true,
      rental: {
        id: rental.id,
        productId,
        startDate,
        endDate,
        days,
        rentalRate,
        totalPrice,
        securityDeposit,
        status: rental.status,
      },
      paymentUrl: `/checkout?rental=${rental.id}`,
      message: 'Rental booking created! Complete payment to confirm.',
    })
  } catch (error) {
    console.error('[RENTAL] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create rental' }, { status: 500 })
  }
}
