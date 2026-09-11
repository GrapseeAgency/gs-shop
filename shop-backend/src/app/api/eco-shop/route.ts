import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

const badgeColors: Record<string, string> = {
  organic: 'emerald',
  recycled: 'sky',
  sustainable: 'teal',
  'carbon-neutral': 'lime',
  'fair-trade': 'amber',
}

const badgeIcons: Record<string, string> = {
  organic: '',
  recycled: '',
  sustainable: '',
  'carbon-neutral': '',
  'fair-trade': '',
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const badge = searchParams.get('badge')
    const minScore = Math.min(100, Math.max(0, parseInt(searchParams.get('minScore') || '0')))
    const sort = searchParams.get('sort') || 'score'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    const validBadges = Object.keys(badgeColors)
    if (badge && !validBadges.includes(badge)) {
      return NextResponse.json(
        { success: false, error: `Invalid badge. Must be one of: ${validBadges.join(', ')}` },
        { status: 400 }
      )
    }

    const where: any = {}
    if (badge) where.ecoBadge = badge
    if (minScore > 0) where.ecoScore = { gte: minScore }

    const [ecoProducts, total] = await Promise.all([
      prisma.ecoProduct.findMany({
        where,
        orderBy: sort === 'score' ? { ecoScore: 'desc' } : { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.ecoProduct.count({ where
      })
    ])

    // Enrich with product details
    const enrichedProducts = await Promise.all(
      ecoProducts.map(async (ep) => {
        const product = await prisma.product.findUnique({
          where: { id: ep.productId },
          select: { 
            name: true, 
            price: true, 
            imageUrl: true, 
            slug: true,
            isActive: true,
                      },
        })
        
        if (!product || !product.isActive) {
          return null
        }

        return {
          ...ep,
          product,
        }
      })
    )

    const validProducts = enrichedProducts.filter(p => p !== null)

    // Add visual metadata and impact calculations
    const finalResult = validProducts.map((p: any) => ({
      ...p,
      badgeColor: badgeColors[p.ecoBadge] || 'gray',
      badgeIcon: badgeIcons[p.ecoBadge] || '',
      scoreLevel: p.ecoScore >= 90 ? 'excellent' : p.ecoScore >= 75 ? 'great' : p.ecoScore >= 60 ? 'good' : 'fair',
      totalImpact: {
        co2Saved: p.co2Saved || 0,
        waterSaved: p.waterSaved || 0,
        treesEquivalent: Math.round((p.co2Saved || 0) / 22),
      },
    }))

    // Summary stats
    const totalCo2 = finalResult.reduce((sum: number, p: any) => sum + (p.co2Saved || 0), 0)
    const totalWater = finalResult.reduce((sum: number, p: any) => sum + (p.waterSaved || 0), 0)
    const avgScore = finalResult.length > 0
      ? Math.round(finalResult.reduce((sum: number, p: any) => sum + p.ecoScore, 0) / finalResult.length)
      : 0

    const badgeDistribution = finalResult.reduce((acc: Record<string, number>, p: any) => {
      acc[p.ecoBadge] = (acc[p.ecoBadge] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        ecoProducts: finalResult,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        summary: { 
          totalCo2, 
          totalWater, 
          avgScore, 
          badgeTypes: Object.keys(badgeColors),
          badgeDistribution,
          totalTreesEquivalent: Math.round(totalCo2 / 22)
        },
        filters: {
          badges: Object.keys(badgeColors).map(badge => ({
            value: badge,
            label: badge.charAt(0).toUpperCase() + badge.slice(1).replace('-', ' '),
            color: badgeColors[badge],
            icon: badgeIcons[badge]
          })),
          scoreRanges: [
            { label: 'All', min: 0, max: 100 },
            { label: 'Excellent (90+)', min: 90, max: 100 },
            { label: 'Great (75-89)', min: 75, max: 89 },
            { label: 'Good (60-74)', min: 60, max: 74 },
            { label: 'Fair (0-59)', min: 0, max: 59 }
          ]
        }
      }
    })
  } catch (error) {
    console.error('Eco shop fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch eco shop products' },
      { status: 500 }
    )
  }
}

// POST /api/eco-shop Create or update eco product data (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      productId, 
      ecoScore, 
      ecoBadge, 
      co2Saved, 
      waterSaved, 
      description,
      certifications 
    } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 })
    }

    if (ecoScore !== undefined && (ecoScore < 0 || ecoScore > 100)) {
      return NextResponse.json({ success: false, error: 'Eco score must be between 0 and 100' }, { status: 400 })
    }

    if (ecoBadge && !Object.keys(badgeColors).includes(ecoBadge)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid eco badge. Must be one of: ${Object.keys(badgeColors).join(', ')}` 
      }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Check if eco product already exists
    const existingEcoProduct = await prisma.ecoProduct.findFirst({
      where: { productId }
    })

    let ecoProduct
    if (existingEcoProduct) {
      // Update existing eco product
      const updateData: any = {}
      if (ecoScore !== undefined) updateData.ecoScore = ecoScore
      if (ecoBadge !== undefined) updateData.ecoBadge = ecoBadge
      if (co2Saved !== undefined) updateData.co2Saved = co2Saved
      if (waterSaved !== undefined) updateData.waterSaved = waterSaved
      if (description !== undefined) updateData.description = description
      if (certifications !== undefined) updateData.certifications = JSON.stringify(certifications)

      ecoProduct = await prisma.ecoProduct.update({
        where: { id: existingEcoProduct.id },
        data: updateData
      })

      return NextResponse.json({
        success: true,
        data: {
          ...ecoProduct,
          certifications: ecoProduct.certifications ? JSON.parse(ecoProduct.certifications) : null
        },
        message: 'Eco product updated successfully'
      })
    } else {
      // Create new eco product
      ecoProduct = await prisma.ecoProduct.create({
        data: {
          productId,
          ecoScore: ecoScore || 75,
          ecoBadge: ecoBadge || 'sustainable',
          co2Saved: co2Saved || 0,
          waterSaved: waterSaved || 0
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          ...ecoProduct,
          certifications: ecoProduct.certifications ? JSON.parse(ecoProduct.certifications) : null
        },
        message: 'Eco product created successfully'
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Eco product create/update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create/update eco product' }, { status: 500 })
  }
}
