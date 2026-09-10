import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CHARITY_PARTNERS = [
  { id: 'cp-1', name: 'Education First', logo: '', cause: 'Education', description: 'Providing quality education to underprivileged children worldwide', totalRaised: 125000 },
  { id: 'cp-2', name: 'Health For All', logo: '', cause: 'Health', description: 'Making healthcare accessible in rural communities', totalRaised: 89000 },
  { id: 'cp-3', name: 'Green Earth', logo: '', cause: 'Environment', description: 'Planting trees and fighting climate change', totalRaised: 210000 },
  { id: 'cp-4', name: 'Relief Network', logo: '', cause: 'Disaster Relief', description: 'Emergency response and disaster recovery support', totalRaised: 340000 },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cause = searchParams.get('cause')

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { seller: true },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    const causes = ['Education', 'Health', 'Environment', 'Disaster Relief']
    const percents = [25, 30, 40, 50, 15, 35]

    let charityProducts = products.map((p, i) => {
      const selectedCause = causes[i % causes.length]
      const selectedPartner = CHARITY_PARTNERS[i % CHARITY_PARTNERS.length].name
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: p.imageUrl,
        price: p.price,
        donationPercent: percents[i % percents.length],
        charity: selectedPartner,
        partner: selectedPartner,
        cause: selectedCause.toLowerCase().replace(' ', '-'), // Normalizing to match frontend cause types
        mealsProvided: Math.ceil(p.price / 5),
      }
    })

    if (cause && cause !== 'all' && cause !== 'All') {
      charityProducts = charityProducts.filter(
        (p) => p.cause === cause.toLowerCase().replace(' ', '-')
      )
    }

    return NextResponse.json({
      success: true,
      products: charityProducts,
      partners: CHARITY_PARTNERS,
      impactMetrics: { totalDonated: 754000, mealsProvided: 15200, treesPlanted: 8400, vaccinesFunded: 3100 },
      causes: ['All', 'Education', 'Health', 'Environment', 'Disaster Relief'],
    })
  } catch (error) {
    console.error('[CHARITY-API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch charity products' }, { status: 500 })
  }
}
