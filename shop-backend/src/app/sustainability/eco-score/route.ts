import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get eco score for product or user's carbon footprint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const userId = req.headers.get('x-user-id')

    if (productId) {
      // Get product eco score
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          ecoScore: true,
          packagingType: true,
          isRecyclable: true,
          carbonFootprint: true,
          materials: true
        }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({
        product: {
          ...product,
          ecoRating: calculateEcoRating(product.ecoScore),
          sustainabilityBadges: getSustainabilityBadges(product)
        },
        tips: getEcoTips(product)
      })
    }

    // Get user's carbon footprint
    if (userId) {
      const footprint = await prisma.carbonFootprint.findUnique({
        where: { userId }
      })

      const orders = await prisma.order.findMany({
        where: {
          // user link
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      })

      const totalEmissions = orders.reduce((sum, o) => 
        sum + o.items.reduce((itemSum, item) => 
          itemSum + (item.product?.carbonFootprint || 0) * item.quantity, 0
        ), 0
      )

      const treesNeeded = Math.ceil(totalEmissions / 20) // 1 tree absorbs ~20kg CO2/year

      return NextResponse.json({
        totalEmissions: Math.round(totalEmissions),
        unit: 'kg CO2',
        comparison: {
          carMiles: Math.round(totalEmissions * 2.5),
          treesNeeded
        },
        breakdown: {
          packaging: Math.round(totalEmissions * 0.15),
          shipping: Math.round(totalEmissions * 0.35),
          product: Math.round(totalEmissions * 0.5)
        },
        suggestions: getCarbonReductionTips(totalEmissions)
      })
    }

    return NextResponse.json({ error: 'Specify productId or login' }, { status: 400 })
  } catch (error) {
    console.error('Eco score error:', error)
    return NextResponse.json({ error: 'Failed to fetch eco data' }, { status: 500 })
  }
}

// POST - Report packaging return for recycling
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, packagingReturned } = await req.json()

    // Award points for returning packaging
    const points = packagingReturned * 10 // 10 points per item

    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { increment: points } }
    })

    // Log the return
    await prisma.packagingReturn.create({
      data: {
        userId,
        orderId,
        itemsReturned: packagingReturned,
        pointsAwarded: points
      }
    })

    return NextResponse.json({
      success: true,
      pointsAwarded: points,
      message: `Thank you for returning packaging! +${points} eco points!`
    })
  } catch (error) {
    console.error('Packaging return error:', error)
    return NextResponse.json({ error: 'Failed to process return' }, { status: 500 })
  }
}

function calculateEcoRating(score?: number) {
  if (!score) return { letter: 'N/A', color: 'gray' }
  if (score >= 90) return { letter: 'A+', color: 'emerald' }
  if (score >= 80) return { letter: 'A', color: 'green' }
  if (score >= 70) return { letter: 'B', color: 'yellow' }
  if (score >= 60) return { letter: 'C', color: 'orange' }
  return { letter: 'D', color: 'red' }
}

function getSustainabilityBadges(product: any) {
  const badges = []
  if (product.isRecyclable) badges.push({ name: 'Recyclable', icon: '' })
  if (product.packagingType === 'biodegradable') badges.push({ name: 'Biodegradable', icon: '' })
  if (product.carbonFootprint && product.carbonFootprint < 5) badges.push({ name: 'Low Carbon', icon: '' })
  if (product.materials?.includes('organic')) badges.push({ name: 'Organic', icon: '' })
  return badges
}

function getEcoTips(product: any) {
  return [
    'Recycle packaging after use',
    'Consider the product lifecycle',
    'Choose eco-friendly alternatives when available'
  ]
}

function getCarbonReductionTips(emissions: number) {
  const tips = []
  if (emissions > 50) {
    tips.push('Consider bundling orders to reduce shipping emissions')
    tips.push('Choose local sellers when possible')
  }
  tips.push('Return packaging for recycling and earn points')
  tips.push('Look for products with A+ eco ratings')
  return tips
}
