// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Side-by-side specification comparison
export async function POST(req: NextRequest) {
  try {
    const { productIds, useCase } = await req.json()

    if (!productIds || productIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 products required' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true, specs: true }
    })

    // Get all unique spec keys
    const allSpecs = new Set<string>()
    products.forEach(p => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach(k => allSpecs.add(k))
      }
    })

    // Compare specs
    const comparison = Array.from(allSpecs).map(spec => {
      const values = products.map(p => ({
        productId: p.id,
        productName: p.name,
        value: p.specifications?.[spec] || 'N/A'
      }))

      // Determine best value (simplified)
      const bestValue = values.reduce((best, current) => {
        const bestNum = parseFloat(best.value)
        const currentNum = parseFloat(current.value)
        
        if (!isNaN(bestNum) && !isNaN(currentNum)) {
          // Higher is better for most specs, lower for price/weight
          const higherBetter = !['price', 'weight'].includes(spec.toLowerCase())
          return higherBetter 
            ? (currentNum > bestNum ? current : best)
            : (currentNum < bestNum ? current : best)
        }
        return best
      })

      return {
        spec,
        values,
        best: bestValue.productId,
        difference: 'highlighted' // Would calculate actual difference
      }
    })

    // Calculate winner per use case
    const useCaseScores: Record<string, number[]> = {
      'gaming': [],
      'work': [],
      'budget': [],
      'premium': []
    }

    // Simple scoring
    products.forEach((p, i) => {
      const score = p.rating || 4 // Default score
      useCaseScores['gaming'].push(score)
      useCaseScores['work'].push(score)
      useCaseScores['budget'].push(10 - (p.price / 1000)) // Lower price = higher score
      useCaseScores['premium'].push(p.price / 1000) // Higher price = higher scoreviews
      })

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        rating: p.rating,
        imageUrl: p.imageUrl
      })),
      comparison,
      winner: {
        overall: products[0]?.id, // Would calculate properly
        byUseCase: {
          gaming: products[0]?.id,
          work: products[0]?.id,
          budget: products.sort((a, b) => a.price - b.price)[0]?.id,
          premium: products.sort((a, b) => b.price - a.price)[0]?.id
        }
      },
      recommendation: `For ${useCase || 'general use'}, ${products[0]?.name} is recommended.`
    })
  } catch (error) {
    console.error('Spec compare error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
