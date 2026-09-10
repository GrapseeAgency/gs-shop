import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get gift recommendations based on person description
export async function POST(req: NextRequest) {
  try {
    const { 
      recipientAge, 
      recipientGender, 
      relationship, 
      occasion, 
      interests, 
      budget,
      personality
    } = await req.json()

    // Build search query based on inputs
    const searchTerms = [
      ...(interests || []),
      occasion,
      relationship,
      personality
    ].filter(Boolean).join(' ')

    // Find matching products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { name: { contains: searchTerms } },
              { description: { contains: searchTerms } },
              { tags: { contains: searchTerms } }
            ]
          },
          budget ? {
            price: {
              gte: budget.min || 0,
              lte: budget.max || 999999
            }
          } : {}
        ]
      },
      take: 12
    })

    // AI ranking of gifts based on compatibility
    const rankedGifts = products.map(product => {
      let score = 50 // Base score
      
      // Budget match
      if (budget && product.price >= budget.min && product.price <= budget.max) {
        score += 20
      }
      
      // Interest match
      if (interests?.some((i: string) => 
        product.name.toLowerCase().includes(i.toLowerCase()) ||
        product.description.toLowerCase().includes(i.toLowerCase())
      )) {
        score += 25
      }
      
      // Occasion match
      if (product.tags?.toLowerCase().includes(occasion?.toLowerCase())) {
        score += 15
      }
      
      // High rated products get bonus
      if (product.rating > 4.5) {
        score += 10
      }

      return {
        ...product,
        matchScore: Math.min(score, 100),
        whyRecommended: generateReason(product, interests, occasion, relationship)
      }
    }).sort((a, b) => b.matchScore - a.matchScore)

    // Generate gift message suggestions
    const giftMessages = generateGiftMessages(occasion, relationship)

    return NextResponse.json({
      recommendations: rankedGifts.slice(0, 8),
      categories: groupByCategory(rankedGifts),
      giftMessages,
      summary: {
        recipientProfile: `${recipientAge}-year-old ${recipientGender || 'person'}`,
        occasion,
        budget: budget ? `$${budget.min}-$${budget.max}` : 'any',
        totalMatches: rankedGifts.length
      }
    })
  } catch (error) {
    console.error('Gift recommender error:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

// GET - Get gift occasions and templates
export async function GET(req: NextRequest) {
  return NextResponse.json({
    occasions: [
      { id: 'birthday', name: 'Birthday', message: 'Happy Birthday! Hope you love this!' },
      { id: 'anniversary', name: 'Anniversary', message: 'Happy Anniversary! Love you always!' },
      { id: 'wedding', name: 'Wedding', message: 'Wishing you a lifetime of happiness!' },
      { id: 'housewarming', name: 'Housewarming', message: 'May your new home be filled with joy!' },
      { id: 'graduation', name: 'Graduation', message: 'Congrats on your achievement!' },
      { id: 'baby_shower', name: 'Baby Shower', message: 'Can\'t wait to meet the little one!' },
      { id: 'get_well', name: 'Get Well Soon', message: 'Wishing you a speedy recovery!' },
      { id: 'thank_you', name: 'Thank You', message: 'Thank you for everything you do!' }
    ],
    relationships: [
      'Spouse/Partner',
      'Parent',
      'Sibling',
      'Friend',
      'Colleague',
      'Child',
      'Grandparent',
      'Mentor'
    ],
    interests: [
      'Technology', 'Fashion', 'Home Decor', 'Books', 'Sports',
      'Cooking', 'Art', 'Music', 'Travel', 'Gaming',
      'Fitness', 'Photography', 'Gardening', 'DIY'
    ]
  })
}

function generateReason(product: any, interests: string[], occasion: string, relationship: string) {
  const reasons = [
    `Perfect for ${occasion} celebrations`,
    `Great for ${interests?.[0] || 'everyday'} enthusiasts`,
    `A thoughtful ${relationship} gift`,
    `Highly rated by customers like you`,
    `Trending gift choice for ${occasion}`
  ]
}

function generateGiftMessages(occasion: string, relationship: string) {
  return {
    funny: `I spent hours picking this... okay, the AI picked it, but I approved!`,
    heartfelt: `This made me think of you. Hope it brings you joy!`,
    simple: `Happy ${occasion}! Enjoy your gift!`,
    personalized: `For my amazing ${relationship.toLowerCase()} - you deserve the best!`
  }
}

function groupByCategory(products: any[]) {
  const groups: Record<string, any[]> = {}
  products.forEach(p => {
    const cat = p.category?.name || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(p)
  })
  return groups
}
