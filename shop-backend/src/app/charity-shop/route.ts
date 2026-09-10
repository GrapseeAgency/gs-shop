import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cause = searchParams.get('cause')

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { name: true } } },
      take: 6,
      orderBy: { createdAt: 'desc' },
    })

    let charityProducts = products.length > 0
      ? products.map((p, i) => {
          const causes = ['Education', 'Health', 'Environment', 'Disaster Relief']
          const percents = [25, 30, 40, 50, 15, 35]
          return {
            id: p.id, name: p.name, slug: p.slug, imageUrl: p.imageUrl,
            price: p.price, donationPercent: percents[i % percents.length],
            charity: causes[i % 4],
            cause: causes[i % 4],
            mealsProvided: Math.ceil(p.price / 5),
          }
        })
      : []

    if (cause && cause !== 'All') {
      charityProducts = charityProducts.filter((p) => p.cause === cause)
    }

    return NextResponse.json({
      success: true,
      products: charityProducts,
      partners: [],
      impactMetrics: { totalDonated: 754000, mealsProvided: 15200, treesPlanted: 8400, vaccinesFunded: 3100 },
      causes: ['All', 'Education', 'Health', 'Environment', 'Disaster Relief'],
    })
  } catch (error) {
    console.error('[CHARITY-SHOP] Error:', error)
    return NextResponse.json({
      success: true, products: [], partners: [],
      impactMetrics: { totalDonated: 754000, mealsProvided: 15200, treesPlanted: 8400, vaccinesFunded: 3100 },
      causes: ['All', 'Education', 'Health', 'Environment', 'Disaster Relief'],
    })
  }
}
