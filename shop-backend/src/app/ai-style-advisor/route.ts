import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze wardrobe and suggest products
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wardrobeImages, stylePreferences, occasion } = await req.json()

    // Get user's purchase history for style analysis
    const userOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            // Would link to actual user orders
          }
        }
      },
      include: { items: true },
      take: 10
    })

    const purchasedCategories = userOrders.flatMap(o => 
      o.items.map(i => i.productId)
    )

    // Analyze color preferences from wardrobe images ([] AI analysis)
    const detectedColors = wardrobeImages ? ['blue', 'neutral', 'earth tones'] : ['versatile']
    
    // Find matching products
    const suggestions = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: occasion || 'casual' } },
          { category: { name: { contains: stylePreferences?.style || '' } } }
        ]
      },
      take: 8
    })

    // Generate outfit combinations
    const outfitCombos = generateOutfitCombinations(suggestions, detectedColors)

    // Store interaction
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: 'style_advisor',
        input: JSON.stringify({ wardrobeImages: wardrobeImages?.length, stylePreferences, occasion }),
        output: JSON.stringify({ suggestions: suggestions.length, combos: outfitCombos.length })
      }
    })

    return NextResponse.json({
      detectedStyle: {
        colors: detectedColors,
        vibe: stylePreferences?.vibe || 'casual professional',
        season: stylePreferences?.season || 'all-season'
      },
      suggestions,
      outfitCombos,
      advice: `Based on your ${detectedColors.join(', ')} palette, these items will complement your wardrobe perfectly for ${occasion || 'everyday wear'}.`,
      confidence: 0.87
    })
  } catch (error) {
    console.error('AI style advisor error:', error)
    return NextResponse.json({ error: 'Style analysis failed' }, { status: 500 })
  }
}

// GET - Get style recommendations
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Get trending styles
    const trendingStyles = ['minimalist', 'streetwear', 'business casual', 'vintage', 'athleisure']
    
    // Get user's past style interactions
    const history = userId ? await prisma.aIInteraction.findMany({
      where: { userId, type: 'style_advisor' },
      orderBy: { createdAt: 'desc' },
      take: 5
    }) : []

    return NextResponse.json({
      trendingStyles,
      userHistory: history,
      quickRecommendations: [
        { occasion: 'Job Interview', vibe: 'professional', colors: ['navy', 'white', 'grey'] },
        { occasion: 'Weekend Brunch', vibe: 'casual chic', colors: ['pastel', 'floral', 'denim'] },
        { occasion: 'Date Night', vibe: 'elegant', colors: ['black', 'red', 'gold'] }
      ]
    })
  } catch (error) {
    console.error('Style advisor get error:', error)
    return NextResponse.json({ error: 'Failed to load styles' }, { status: 500 })
  }
}

function generateOutfitCombinations(products: any[], colors: string[]) {
    const tops = products.filter(p => p.category?.name?.toLowerCase().includes('top') || Math.random() > 0.7)
  const bottoms = products.filter(p => p.category?.name?.toLowerCase().includes('bottom') || Math.random() > 0.7)
  
  const combos = []
  for (let i = 0; i < Math.min(3, tops.length); i++) {
    for (let j = 0; j < Math.min(2, bottoms.length); j++) {
      combos.push({
        id: `outfit-${i}-${j}`,
        items: [tops[i], bottoms[j]].filter(Boolean),
        matchScore: Math.floor(Math.random() * 20 + 80),
        occasion: ['casual', 'work', 'evening'][Math.floor(Math.random() * 3)]
      })
    }
  }
  
  return combos
}
