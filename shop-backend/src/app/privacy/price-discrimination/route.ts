import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check for price discrimination
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, priceShown } = await req.json()

    // Get price shown to other users
    const priceChecks = await prisma.priceCheck.findMany({
      where: {
        productId,
        userId: { not: userId || 'none' }
      },
      orderBy: { checkedAt: 'desc' },
      take: 20
    })

    if (priceChecks.length === 0) {
      return NextResponse.json({
        checked: false,
        message: 'Not enough data to compare prices'
      })
    }

    const prices = priceChecks.map(p => p.priceShown)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const variance = ((priceShown - avgPrice) / avgPrice) * 100

    let discrimination = false
    let severity = 'none'
    let message = 'Prices appear fair'

    if (variance > 15) {
      discrimination = true
      severity = 'high'
      message = ` You're seeing prices ${variance.toFixed(1)}% higher than average!`
    } else if (variance > 5) {
      discrimination = true
      severity = 'medium'
      message = `Prices are ${variance.toFixed(1)}% above average. Check other browsers.`
    } else if (variance < -10) {
      message = `You're getting a ${Math.abs(variance).toFixed(1)}% better deal than average!`
    }

    // Log this check
    await prisma.priceCheck.create({
      data: {
        userId: userId || 'anonymous',
        productId,
        price: priceShown || 0,
        priceShown,
        checkedAt: new Date()
      }
    }).catch(() => {})

    return NextResponse.json({
      checked: true,
      discrimination,
      severity,
      message,
      yourPrice: priceShown,
      averagePrice: avgPrice.toFixed(2),
      lowestPrice: minPrice,
      variance: variance.toFixed(1) + '%',
      suggestions: discrimination ? [
        'Try incognito/private browsing mode',
        'Clear cookies and cache',
        'Use a VPN to check prices from other locations',
        'Compare on mobile vs desktop'
      ] : []
    })
  } catch (error) {
    console.error('Price discrimination error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
