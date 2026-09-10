import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Find alternatives to current product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Find cheaper alternatives with similar specs
    const alternatives = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        price: { lt: product.price },
        isActive: true
      },
      orderBy: { price: 'desc' },
      take: 5
    })

    // Calculate savings
    const enriched = alternatives.map(alt => ({
      ...alt,
      savings: product.price - alt.price,
      savingsPercent: Math.round(((product.price - alt.price) / product.price) * 100),
      similarSpecs: alt.rating && product.rating 
        ? Math.abs(alt.rating - product.rating) < 0.5 
        : true
    }))

    const bestAlternative = enriched[0]

    return NextResponse.json({
      currentProduct: {
        id: product.id,
        name: product.name,
        price: product.price
      },
      alternatives: enriched,
      bestAlternative: bestAlternative ? {
        ...bestAlternative,
        message: `Save ${bestAlternative.savings} (${bestAlternative.savingsPercent}%) with ${bestAlternative.name}`
      } : null,
      totalOptions: alternatives.length,
      recommendation: bestAlternative
        ? `${bestAlternative.name} offers similar quality for ${bestAlternative.savings} less!`
        : 'No cheaper alternatives found with similar specs.'
    })
  } catch (error) {
    console.error('Alternative finder error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
