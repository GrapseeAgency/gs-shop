import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get sleep-based recommendations
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { sleepHours, sleepQuality, bedtime } = await req.json()

    if (!userId) {
      return NextResponse.json({ recommendations: [] })
    }

    // Save sleep data
    await prisma.healthProfile.upsert({
      where: { userId },
      update: {
        sleepHours,
        recommendations: JSON.stringify({ sleepQuality })
      },
      create: {
        userId,
        sleepHours,
        recommendations: JSON.stringify({ sleepQuality })
      }
    }).catch(() => {})

    const recommendations = []

    // Poor sleep quality
    if (sleepQuality === 'poor' || sleepQuality === 'fair') {
      const sleepProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'sleep' } },
            { tags: { contains: 'relaxation' } },
            { tags: { contains: 'aromatherapy' } },
            { name: { contains: 'pillow' } },
            { name: { contains: 'mattress' } }
          ]
        },
        take: 6
      })

      recommendations.push({
        type: 'sleep_aid',
        message: 'Poor sleep detected. Here are products to help you rest better.',
        products: sleepProducts,
        priority: 'high'
      })
    }

    // Insufficient sleep
    if (sleepHours < 6) {
      const energyProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'energy' } },
            { tags: { contains: 'vitamin' } },
            { tags: { contains: 'wellness' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'energy_boost',
        message: 'Low sleep hours detected. Energy boosters for your day.',
        products: energyProducts,
        tips: [
          'Try to maintain a consistent sleep schedule',
          'Avoid screens 1 hour before bed',
          'Keep bedroom cool and dark'
        ]
      })
    }

    // Late bedtime
    if (bedtime && parseInt(bedtime) > 1) { // 1 AM
      recommendations.push({
        type: 'sleep_hygiene',
        message: 'Late bedtime detected. Consider earlier sleep for better health.',
        tips: [
          'Gradually move bedtime earlier by 15 minutes',
          'Use blue light filters on devices',
          'Try meditation apps for winding down'
        ]
      })
    }

    return NextResponse.json({
      sleepData: { hours: sleepHours, quality: sleepQuality },
      recommendations,
      sleepScore: calculateSleepScore(sleepHours, sleepQuality)
    })
  } catch (error) {
    console.error('Sleep tracker error:', error)
    return NextResponse.json({ recommendations: [] })
  }
}

function calculateSleepScore(hours: number, quality: string): number {
  let score = 50
  
  // Hours factor
  if (hours >= 7 && hours <= 9) score += 30
  else if (hours >= 6) score += 20
  else if (hours >= 5) score += 10
  
  // Quality factor
  const qualityScores: Record<string, number> = {
    excellent: 20,
    good: 15,
    fair: 10,
    poor: 0
  }
  score += qualityScores[quality] || 10
  
  return Math.min(100, score)
}
