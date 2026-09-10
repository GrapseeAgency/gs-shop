// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check for duplicate/similar items in user's history
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, productName, productTags } = await req.json()

    if (!userId) {
      return NextResponse.json({ hasDuplicates: false })
    }

    // Get user's past purchases
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    const ownedProducts = orders.flatMap(o => o.items.map(i => i.product))
    const duplicates = []
    const warnings = []

    // Check for exact duplicates
    const exactMatch = ownedProducts.find(p => 
      p?.name?.toLowerCase() === productName?.toLowerCase()
    )
    
    if (exactMatch) {
      duplicates.push({
        type: 'exact',
        product: exactMatch,
        message: `You already own this exact item!`,
        severity: 'high'
      })
    }

    // Check for similar items (same category/tags)
    const similarItems = ownedProducts.filter(p => {
      if (!p || p.id === productId) return false
      const nameWords = productName?.toLowerCase().split(' ') || []
      const productWords = p.name?.toLowerCase().split(' ') || []
      const commonWords = nameWords.filter(w => productWords.includes(w))
      return commonWords.length >= 2
    })

    if (similarItems.length > 0) {
      warnings.push({
        type: 'similar',
        products: similarItems.slice(0, 3),
        message: `You own ${similarItems.length} similar item(s). Are you sure you need another?`,
        severity: 'medium'
      })
    }

    // Check for category duplicates (e.g., 3 black t-shirts)
    const categoryMatches = ownedProducts.filter(p => {
      if (!p) return false
      return productTags?.some((tag: string) => 
        p.tags?.toLowerCase().includes(tag.toLowerCase())
      )
    })

    if (categoryMatches.length >= 3) {
      warnings.push({
        type: 'category_excess',
        count: categoryMatches.length,
        message: `You already own ${categoryMatches.length} items in this category. Consider if you really need more.`,
        severity: 'low'
      })
    }

    // Calculate need vs want score
    const needScore = duplicates.length > 0 ? 0 : similarItems.length > 0 ? 30 : 70
    const wantScore = 100 - needScore

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0 || warnings.length > 0,
      duplicates,
      warnings,
      needVsWant: {
        need: needScore,
        want: wantScore,
        recommendation: needScore < 30 ? 'Consider carefully' : needScore > 70 ? 'Likely a need' : 'Your choice'
      },
      blockPurchase: duplicates.length > 0 && duplicates[0].severity === 'high'
    })
  } catch (error) {
    console.error('Duplication detector error:', error)
    return NextResponse.json({ hasDuplicates: false })
  }
}
