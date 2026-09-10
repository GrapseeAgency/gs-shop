// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get autocomplete suggestions based on partial input
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partial = searchParams.get('q') || ''
    const userId = req.headers.get('x-user-id')

    if (partial.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get user's purchase history for personalization
    let frequentlyBought: string[] = []
    if (userId) {
      const orders = await prisma.order.findMany({
        where: {
          customerEmail: userId,
          createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        },
        include: { items: { include: { product: true } } }
      })
      
      frequentlyBought = orders.flatMap(o => 
        o.items.map(i => i.product?.name).filter(Boolean)
      ) as string[]
    }

    // Search products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { startsWith: partial } },
          { name: { contains: partial } },
          { tags: { contains: partial.toLowerCase() } }
        ]
      },
      take: 10
    })

    // Enhance with purchase history context
    const enhanced = products.map(p => {
      const lastBought = frequentlyBought.find(name => 
        name?.toLowerCase().includes(p.name.toLowerCase())
      )
      
      // Calculate typical consumption period
      const typicalPeriod = p.category?.name?.includes('grocery') ? 20 : 30
      
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        context: lastBought 
          ? 'Bought before'
          : `Usually lasts ${typicalPeriod} days`,
        oneTapAdd: true
      }
    })

    return NextResponse.json({
      query: partial,
      suggestions: enhanced,
      quickAdd: enhanced.length > 0 ? enhanced[0] : null,
      message: enhanced.length > 0
        ? `Found ${enhanced.length} items. Tap to add instantly.`
        : 'No matches. Try a different search.'
    })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}
