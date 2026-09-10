import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get weather-based shopping recommendations
export async function POST(req: NextRequest) {
  try {
    const { weather, temperature, location } = await req.json()
    const userId = req.headers.get('x-user-id')

    const recommendations: Array<{type: string; message: string; products: any[]; urgency?: string}> = []
    const alerts: Array<{type: string; message: string; action?: string}> = []

    // Rainy weather
    if (weather.includes('rain') || weather.includes('drizzle')) {
      const rainProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'umbrella' } },
            { tags: { contains: 'raincoat' } },
            { tags: { contains: 'waterproof' } },
            { name: { contains: 'boot' } }
          ]
        },
        take: 5
      })

      recommendations.push({
        type: 'rainy_weather',
        message: `It's raining in ${location}! Stay dry with these essentials.`,
        products: rainProducts,
        urgency: 'high'
      })

      alerts.push({
        type: 'delivery',
        message: 'Rain may cause slight delivery delays',
        action: 'track_order'
      })
    }

    // Hot weather
    if (temperature > 35) {
      const coolProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'cooling' } },
            { tags: { contains: 'fan' } },
            { tags: { contains: 'summer' } },
            { name: { contains: 'ac' } }
          ]
        },
        take: 5
      })

      recommendations.push({
        type: 'heatwave',
        message: `Heatwave alert! ${temperature}C expected. Beat the heat!`,
        products: coolProducts,
        urgency: 'high'
      })
    }

    // Cold weather
    if (temperature < 15) {
      const warmProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'heater' } },
            { tags: { contains: 'warm' } },
            { tags: { contains: 'winter' } },
            { name: { contains: 'blanket' } }
          ]
        },
        take: 5
      })

      recommendations.push({
        type: 'cold_snap',
        message: `Brrr! ${temperature}C today. Stay cozy with these.`,
        products: warmProducts,
        urgency: 'medium'
      })
    }

    // Allergies (spring)
    if (weather.includes('pollen') || (temperature > 20 && temperature < 30)) {
      const allergyProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'air purifier' } },
            { tags: { contains: 'allergy' } },
            { tags: { contains: 'mask' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'allergy_season',
        message: 'Allergy season! Protect yourself.',
        products: allergyProducts,
        urgency: 'low'
      })
    }

    return NextResponse.json({
      weather: { condition: weather, temperature, location },
      recommendations,
      alerts,
      dressRecommendation: getDressRecommendation(weather, temperature),
      activityIdeas: getActivityIdeas(weather)
    })
  } catch (error) {
    console.error('Weather shopper error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getDressRecommendation(weather: string, temp: number): string {
  if (weather.includes('rain')) return 'Waterproof jacket and boots recommended'
  if (temp > 35) return 'Light, breathable fabrics. Stay hydrated!'
  if (temp < 15) return 'Layer up! Warm coat and thermal wear'
  if (temp > 25) return 'Comfortable summer wear perfect today'
  return 'Comfortable layers for mild weather'
}

function getActivityIdeas(weather: string): string[] {
  if (weather.includes('rain')) return ['Movie marathon', 'Indoor gaming', 'Online shopping!']
  if (weather.includes('sunny')) return ['Outdoor sports', 'Picnic', 'Shopping trip']
  return ['Cafe hopping', 'Museum visit', 'Relax at home']
}
