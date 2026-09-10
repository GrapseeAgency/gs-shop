// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get seasonal recommendations based on weather patterns
export async function POST(req: NextRequest) {
  try {
    const { location, season, temperature } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Determine season and needs
    const now = new Date()
    const currentMonth = now.getMonth() // 0-11
    
    const seasonConfig: Record<string, { name: string; needs: string[]; message: string }> = {
      monsoon: {
        name: 'Monsoon',
        needs: ['waterproof', 'rain', 'umbrella', 'dry', 'humidity', 'mold-resistant'],
        message: 'Monsoon coming in 2 weeks! Stay dry and prepared.'
      },
      summer: {
        name: 'Summer',
        needs: ['cooling', 'sunscreen', 'hydration', 'lightweight', 'breathable', 'ac'],
        message: 'Summer heat ahead! Beat the heat with these essentials.'
      },
      winter: {
        name: 'Winter',
        needs: ['heating', 'warm', 'cozy', 'insulated', 'winter-care', 'moisturizer'],
        message: 'Winter is coming! Stay warm and cozy.'
      },
      spring: {
        name: 'Spring',
        needs: ['allergy', 'fresh', 'cleaning', 'organizing', 'renewal'],
        message: 'Spring season! Time for renewal and preparation.'
      }
    }

    const detectedSeason = season || getSeasonByMonth(currentMonth)
    const config = seasonConfig[detectedSeason]

    // Get products matching seasonal needs
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: config.needs.map(need => ({
          OR: [
            { tags: { contains: need } },
            { name: { contains: need } },
            { description: { contains: need } }
          ]
        }))
      },
      take: 12
    })

    // Get user's purchase history for this season
    let relevantHistory = []
    if (userId) {
      const lastYearSameSeason = await prisma.order.findMany({
        where: {
          customerEmail: userId,
          createdAt: {
            gte: new Date(now.getFullYear() - 1, currentMonth - 1, 1),
            lt: new Date(now.getFullYear() - 1, currentMonth + 2, 1)
          }
        },
        include: { items: { include: { product: true } } }
      })
      
      relevantHistory = lastYearSameSeason.flatMap(o => o.items.map(i => i.product?.name)).filter(Boolean)
    }

    // Predict what user might need based on weather
    const weatherPredictions = []
    if (temperature && temperature > 35) {
      weatherPredictions.push({ type: 'heatwave', message: 'Heatwave expected! Cooling products essential.' })
    }
    if (detectedSeason === 'monsoon') {
      weatherPredictions.push({ type: 'rain', message: 'Heavy rain forecast for next week.' })
    }

    return NextResponse.json({
      season: detectedSeason,
      seasonName: config.name,
      message: config.message,
      products,
      weatherPredictions,
      basedOnHistory: relevantHistory.length > 0,
      lastYearPurchases: relevantHistory.slice(0, 5),
      preparationCountdown: getDaysUntilSeason(detectedSeason),
      checklist: generateChecklist(detectedSeason)
    })
  } catch (error) {
    console.error('Seasonal curation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getSeasonByMonth(month: number): string {
  if (month >= 5 && month <= 8) return 'monsoon'
  if (month >= 2 && month <= 4) return 'summer'
  if (month >= 9 && month <= 11) return 'winter'
  return 'spring'
}

function getDaysUntilSeason(season: string): number {
  const now = new Date()
  const monthMap: Record<string, number> = { summer: 2, monsoon: 5, winter: 9, spring: 0 }
  const targetMonth = monthMap[season]
  const currentMonth = now.getMonth()
  
  if (targetMonth > currentMonth) {
    return (targetMonth - currentMonth) * 30
  }
  return (12 - currentMonth + targetMonth) * 30
}

function generateChecklist(season: string): string[] {
  const checklists: Record<string, string[]> = {
    monsoon: ['Check waterproofing', 'Stock up on rain gear', 'Protect electronics', 'Anti-mold supplies'],
    summer: ['AC servicing', 'Sunscreen stock', 'Hydration supplies', 'Cool clothing'],
    winter: ['Heater check', 'Warm clothing', 'Skin moisturizers', 'Immunity boosters'],
    spring: ['Deep cleaning', 'Allergy prep', 'Fresh linens', 'Organization tools']
  }
  return checklists[season] || []
}
