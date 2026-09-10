import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - List old product on multiple platforms
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productName, category, condition, age, photos } = await req.json()

    // Estimate resale value
    const categoryDepreciation: Record<string, number> = {
      'electronics': 0.6,
      'phones': 0.5,
      'laptops': 0.55,
      'furniture': 0.7,
      'clothing': 0.3,
      'books': 0.4
    }

    const baseValue = 10000
    const depreciation = categoryDepreciation[category] || 0.5
    const ageFactor = Math.max(0.2, 1 - (age * 0.1))
    const conditionMultiplier = condition === 'excellent' ? 1 : condition === 'good' ? 0.8 : 0.6

    const estimatedValue = Math.round(baseValue * depreciation * ageFactor * conditionMultiplier)

    // Create liquidation request
    const liquidation = await prisma.productLiquidation.create({
      data: {
        userId,
        productName,
        category,
        condition,
        age,
        estimatedValue,
        photos: JSON.stringify(photos),
        status: 'listed',
        listedAt: new Date(),
        platforms: JSON.stringify(['grapsee_marketplace', 'local_classifieds', 'recycling_partner'])
      }
    })

    // Auto-list on platforms
    const listings = [
      {
        platform: 'Grapsee Marketplace',
        price: estimatedValue,
        fee: 0,
        eta: '1-3 days',
        url: `/marketplace/liquidation/${liquidation.id}`
      },
      {
        platform: 'Local Buyers',
        price: Math.round(estimatedValue * 0.9),
        fee: 0,
        eta: 'Same day',
        url: '#local'
      },
      {
        platform: 'Recycle & Earn',
        price: Math.round(estimatedValue * 0.5),
        fee: 0,
        eta: 'Instant',
        url: '#recycle'
      }
    ]

    return NextResponse.json({
      success: true,
      liquidation,
      estimatedValue,
      listings,
      pickupArranged: true,
      message: `Your ${productName} listed on ${listings.length} platforms! Best offer auto-accepted.`,
      nextSteps: [
        'Listings are live',
        'Pickup will be arranged with buyer',
        'Payment released after product verification'
      ]
    })
  } catch (error) {
    console.error('Liquidation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Check liquidation status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ liquidations: [] })
    }

    const liquidations = await prisma.productLiquidation.findMany({
      where: { userId },
      orderBy: { listedAt: 'desc' }
    })

    return NextResponse.json({
      liquidations,
      active: liquidations.filter(l => l.status === 'listed').length,
      sold: liquidations.filter(l => l.status === 'sold').length,
      totalEarned: liquidations
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + (l.finalPrice || 0), 0)
    })
  } catch (error) {
    console.error('Liquidation status error:', error)
    return NextResponse.json({ liquidations: [] })
  }
}
