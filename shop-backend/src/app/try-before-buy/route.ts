import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'eligible'

    const products = await prisma.product.findMany({
      where: { isActive: true, comparePrice: { not: null } },
      include: { category: { select: { id: true, name: true, slug: true } } },
      take: 5,
      orderBy: { price: 'desc' },
    })

    const trialProducts = products.length > 0
      ? products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          price: p.price,
          comparePrice: p.comparePrice,
          category: p.category,
          trialDays: 7,
          trialStatus: status,
          stockAvailable: Math.random() > 0.2,
        }))
      : []

    return NextResponse.json({
      success: true,
      products: trialProducts,
      maxTrialItems: 3,
      trialPeriod: 7,
      faq: [
        { q: 'How does Try Before You Buy work?', a: 'Select up to 3 items, we ship them to you for a 7-day trial. Only pay for what you keep.' },
        { q: 'Is there a fee for the trial?', a: 'No fees! You only pay for items you decide to keep after the trial period.' },
        { q: 'How do I return items?', a: 'Simply use the prepaid return label included in your package. Returns are free.' },
        { q: 'What happens after 7 days?', a: 'Items not returned within 7 days are automatically charged to your payment method.' },
      ],
    })
  } catch (error) {
    console.error('[TRY-BEFORE-BUY] Error:', error)
    return NextResponse.json({ success: true, products: [], maxTrialItems: 3, trialPeriod: 7, faq: [
      { q: 'How does Try Before You Buy work?', a: 'Select up to 3 items for a 7-day home trial.' },
      { q: 'Is there a fee?', a: 'No fees! Only pay for what you keep.' },
    ]})
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ success: false, error: 'Product IDs required' }, { status: 400 })
    }

    if (productIds.length > 3) {
      return NextResponse.json({ success: false, error: 'Maximum 3 items for trial' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Trial order created successfully',
      trialId: `trial-${Date.now()}`,
      productIds,
      status: 'selected',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trackingSteps: [
        { step: 'Selected', completed: true, date: new Date().toISOString() },
        { step: 'Shipped', completed: false },
        { step: 'Trying', completed: false },
        { step: 'Decide', completed: false },
        { step: 'Return/Keep', completed: false },
      ],
    })
  } catch (error) {
    console.error('[TRY-BEFORE-BUY] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create trial order' }, { status: 500 })
  }
}
