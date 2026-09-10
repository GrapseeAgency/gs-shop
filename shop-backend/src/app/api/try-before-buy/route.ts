import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Trial eligibility: products with comparePrice (on sale) and price between 500-50000
const TRIAL_ELIGIBLE_CATEGORIES = ['electronics', 'furniture', 'clothing', 'shoes', 'jewelry', 'appliances']
const MIN_TRIAL_PRICE = 500
const MAX_TRIAL_PRICE = 50000
const TRIAL_DAYS = 7
const MAX_TRIAL_ITEMS = 3

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'eligible'
    const userId = searchParams.get('userId')

    // Get user's active trials if userId provided
    let userTrials = []
    if (userId) {
      userTrials = await prisma.trialOrder.findMany({
        where: {
          userId,
          status: { in: ['pending', 'active', 'shipped'] },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    // Get eligible products for trial (products on sale with comparePrice)
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        comparePrice: { not: null },
        price: { gte: MIN_TRIAL_PRICE, lte: MAX_TRIAL_PRICE },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 12,
      orderBy: { price: 'desc' },
    })

    // Filter to only products where comparePrice > price (on sale)
    const onSaleProducts = products.filter(p => p.comparePrice && p.comparePrice > p.price)

    // Map trial products with category info
    const trialProducts = onSaleProducts
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        price: p.price,
        comparePrice: p.comparePrice,
        category: p.category,
        trialDays: TRIAL_DAYS,
        trialStatus: status,
        stockAvailable: p.isActive,
        trialPrice: Math.round(p.price * 0.1 * 100) / 100, // 10% to try
        deposit: Math.round(p.price * 0.3), // 30% deposit
      }))

    return NextResponse.json({
      success: true,
      products: trialProducts,
      userTrials: userTrials.map(t => ({
        id: t.id,
        productId: t.productId,
        status: t.status,
        deposit: t.deposit,
        trialStart: t.trialStart,
        trialEnd: t.trialEnd,
      })),
      maxTrialItems: MAX_TRIAL_ITEMS,
      trialPeriod: TRIAL_DAYS,
      faq: [
        { q: 'How does Try Before You Buy work?', a: 'Select up to 3 items, pay a small trial fee (10%) + deposit (30%). We ship them for a 7-day trial. Keep what you love, return the rest for a full deposit refund.' },
        { q: 'Is there a fee for the trial?', a: 'You pay 10% of the item price as a trial fee. This is non-refundable. The 30% deposit is fully refunded for returned items.' },
        { q: 'How do I return items?', a: 'Use the prepaid return label in your package. Schedule a pickup or drop off at any location. Returns are free!' },
        { q: 'What happens after 7 days?', a: 'Items not returned within 7 days are automatically charged (remaining 60% of price). Your deposit is applied to the purchase.' },
        { q: 'Can I trial multiple items?', a: `Yes! You can trial up to ${MAX_TRIAL_ITEMS} items at once.` },
      ],
    })
  } catch (error) {
    console.error('[TRY-BEFORE-BUY] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch trial products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { productIds, returnMethod = 'home_pickup' } = body

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ success: false, error: 'Product IDs required' }, { status: 400 })
    }

    if (productIds.length > MAX_TRIAL_ITEMS) {
      return NextResponse.json({ success: false, error: `Maximum ${MAX_TRIAL_ITEMS} items for trial` }, { status: 400 })
    }

    // Check user's existing active trials
    const existingTrials = await prisma.trialOrder.count({
      where: {
        userId,
        status: { in: ['pending', 'active', 'shipped'] },
      },
    })

    if (existingTrials + productIds.length > MAX_TRIAL_ITEMS) {
      return NextResponse.json({
        success: false,
        error: `You can only have ${MAX_TRIAL_ITEMS} active trials. You currently have ${existingTrials}.`,
      }, { status: 400 })
    }

    // Get product details
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      // Note: isActive doesn't exist in Product schema
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ success: false, error: 'Some products not found or unavailable' }, { status: 404 })
    }

    // Create trial orders
    const trials = await Promise.all(
      products.map(async (product) => {
        const trialPrice = Math.round(product.price * 0.1 * 100) / 100
        const deposit = Math.round(product.price * 0.3)

        const trialEndDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
        return prisma.trialOrder.create({
          data: {
            userId,
            productId: product.id,
            deposit,
            returnMethod,
            status: 'pending',
            trialEnd: trialEndDate,
            endsAt: trialEndDate
          }
        })
      })
    )

    const totalTrialFee = products.reduce((sum, p) => sum + Math.round(p.price * 0.1 * 100) / 100, 0)
    const totalDeposit = trials.reduce((sum, t) => sum + t.deposit, 0)

    return NextResponse.json({
      success: true,
      message: `${trials.length} trial order(s) created successfully`,
      trials: trials.map((t, i) => ({
        id: t.id,
        productId: t.productId,
        trialPrice: Math.round(products[i].price * 0.1 * 100) / 100,
        deposit: t.deposit,
      })),
      totalTrialFee,
      totalDeposit,
      status: 'pending_payment',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      trackingSteps: [
        { step: 'Selected', completed: true, date: new Date().toISOString() },
        { step: 'Payment', completed: false },
        { step: 'Shipped', completed: false },
        { step: 'Trying', completed: false },
        { step: 'Decide', completed: false },
        { step: 'Return/Keep', completed: false },
      ],
      paymentUrl: `/checkout?trials=${trials.map(t => t.id).join(',')}`,
    })
  } catch (error) {
    console.error('[TRY-BEFORE-BUY] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create trial order' }, { status: 500 })
  }
}
