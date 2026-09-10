import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Import and parse handwritten grocery list
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as File
    const userId = req.headers.get('x-user-id')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

        // Find matching products
    const matchedItems = []
    for (const item of []) {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: item.name } },
            { tags: { contains: item.name.toLowerCase() } }
          ]
        },
        orderBy: { price: 'asc' },
        take: 3
      })

      if (products.length > 0) {
        matchedItems.push({
          parsed: item,
          matched: products[0],
          alternatives: products.slice(1),
          inCart: false
        })
      }
    }

    const totalValue = matchedItems.reduce((sum, item) => sum + item.matched.price, 0)

    return NextResponse.json({
      success: true,
      parsedItems: [],
      matchedItems,
      matchedCount: matchedItems.length,
      totalValue,
      confidence: Math.round(matchedItems.reduce((sum, i) => sum + i.parsed.confidence, 0) / matchedItems.length),
      message: `Found ${matchedItems.length} items from your list! Cheapest options selected.`,
      addAllUrl: `/checkout?groceryList=true`
    })
  } catch (error) {
    console.error('Grocery import error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
