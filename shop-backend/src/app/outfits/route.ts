import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/outfits Return saved outfit combinations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const style = searchParams.get('style')
    const season = searchParams.get('season')
    const createdBy = searchParams.get('createdBy')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Try real DB query first
    let outfits = null
    try {
      const where: Record<string, unknown> = {}
      if (style) where.style = style
      if (season) where.season = season
      if (createdBy) where.createdBy = createdBy

      outfits = await prisma.outfit.findMany({
        where,
        orderBy: { likes: 'desc' },
        take: limit,
      })

      if (outfits.length === 0) {
        outfits = null // Trigger [] fallback
      }
    } catch {
      outfits = null
    }

    let data = outfits || []

    // Apply filters to [] data if needed
    if (!outfits) {
      if (style) data = data.filter(o => o.style === style)
      if (season) data = data.filter(o => o.season === season)
    }

    // Enrich with product details
    const enriched = await Promise.all(
      data.map(async (outfit) => {
        let products: Array<Record<string, unknown>> = []
        try {
          const productIds: string[] = typeof outfit.productIds === 'string'
            ? JSON.parse(outfit.productIds)
            : outfit.productIds as string[]

          if (productIds.length > 0) {
            const fetched = await prisma.product.findMany({
              where: { id: { in: productIds } },
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                category: { select: { name: true } },
              },
            })
            products = fetched.map(p => ({
              ...p,
              category: p.category?.name,
            }))
          }
        } catch {
          // Products might not exist
        }

        return {
          ...outfit,
          productIds: typeof outfit.productIds === 'string'
            ? JSON.parse(outfit.productIds)
            : outfit.productIds,
          products,
          productCount: typeof outfit.productIds === 'string'
            ? JSON.parse(outfit.productIds).length
            : (outfit.productIds as string[]).length,
          totalPrice: products.reduce((sum, p) => sum + ((p.price as number) || 0), 0),
        }
      })
    )

    return NextResponse.json({
      data: enriched,
      count: enriched.length,
      styles: ['casual', 'formal', 'sporty', 'streetwear', 'bohemian'],
      seasons: ['spring', 'summer', 'fall', 'winter', 'all'],
    })
  } catch (error) {
    console.error('Outfits fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outfits' },
      { status: 500 }
    )
  }
}

// POST /api/outfits Create a new outfit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, productIds, style, season, createdBy } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Outfit name is required' },
        { status: 400 }
      )
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 product IDs are required' },
        { status: 400 }
      )
    }

    const validStyles = ['casual', 'formal', 'sporty', 'streetwear', 'bohemian']
    if (style && !validStyles.includes(style)) {
      return NextResponse.json(
        { error: `Invalid style. Must be one of: ${validStyles.join(', ')}` },
        { status: 400 }
      )
    }

    const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all']
    if (season && !validSeasons.includes(season)) {
      return NextResponse.json(
        { error: `Invalid season. Must be one of: ${validSeasons.join(', ')}` },
        { status: 400 }
      )
    }

    // Create the outfit record
    const outfit = await prisma.outfit.create({
      data: {
        name,
        productIds: JSON.stringify(productIds),
        style: style || null,
        season: season || null,
        createdBy: createdBy || null,
        likes: 0,
      },
    })

    return NextResponse.json({
      success: true,
      outfit: {
        id: outfit.id,
        name: outfit.name,
        productIds: JSON.parse(outfit.productIds),
        style: outfit.style,
        season: outfit.season,
        createdBy: outfit.createdBy,
        likes: outfit.likes,
      },
      message: 'Outfit created successfully!',
    }, { status: 201 })
  } catch (error) {
    console.error('Outfit creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create outfit' },
      { status: 500 }
    )
  }
}
