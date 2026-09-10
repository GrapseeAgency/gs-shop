import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get eco-friendly purchase points
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ points: 0, level: 'seedling' })
    }

    const ecoPurchases = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        items: {
          some: {
            product: {
              OR: [
                { tags: { contains: 'eco' } },
                { tags: { contains: 'sustainable' } },
                { tags: { contains: 'organic' } },
                { isEcoFriendly: true }
              ]
            }
          }
        }
      },
      include: { items: { include: { product: true } } }
    })

    const points = ecoPurchases.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        const product = item.product
        if (!product) return itemSum
        
        let itemPoints = item.quantity * 10 // Base points
        if (product.tags?.includes('eco')) itemPoints += 20
        if (product.tags?.includes('organic')) itemPoints += 15
        if (product.isLocal) itemPoints += 10
        
        return itemSum + itemPoints
      }, 0)
    }, 0)

    const level = points < 100 ? 'seedling' : points < 500 ? 'sprout' : points < 1000 ? 'sapling' : 'forest'

    return NextResponse.json({
      points,
      level,
      ecoPurchases: ecoPurchases.length,
      nextLevel: points < 100 ? 100 - points : points < 500 ? 500 - points : points < 1000 ? 1000 - points : 0,
      benefits: getEcoBenefits(level),
      impact: {
        co2Saved: Math.round(points * 0.5),
        treesEquivalent: Math.round(points / 100)
      }
    })
  } catch (error) {
    console.error('Green points error:', error)
    return NextResponse.json({ points: 0 })
  }
}

function getEcoBenefits(level: string) {
  const benefits: Record<string, string[]> = {
    seedling: ['5% off eco products', 'Eco badge on profile'],
    sprout: ['10% off eco products', 'Early access to sustainable collections'],
    sapling: ['15% off eco products', 'Free eco shipping', 'Exclusive green rewards'],
    forest: ['20% off eco products', 'VIP eco events', 'Plant a tree per order']
  }
  return benefits[level] || benefits.seedling
}
