import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Pet supply auto-pilot setup
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { petType, breed, age, weight, specialNeeds } = await req.json()

    // Calculate monthly consumption
    const consumption = calculatePetConsumption(petType, breed, weight, age)

    // Mock pet profile
    const petProfile = {
      id: 'mock-' + Date.now(),
      userId,
      petType,
      breed,
      age,
      weight
    }

    // Find recommended products
    const foodProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: petType.toLowerCase() } },
          { tags: { contains: 'pet food' } }
        ]
      },
      take: 5
    })

    const treatProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        tags: { contains: 'treat' }
      },
      take: 3
    })

    // Calculate auto-reorder schedule
    const monthlyCost = foodProducts[0]?.price * Math.ceil(consumption.food / 1000) || 0

    return NextResponse.json({
      success: true,
      petProfile: {
        id: petProfile.id,
        type: petType,
        breed,
        monthlyConsumption: consumption
      },
      recommendations: {
        food: foodProducts,
        treats: treatProducts,
        supplies: []
      },
      autoPilot: {
        enabled: true,
        monthlyCost,
        reorderFrequency: 'monthly',
        nextReorder: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        message: `Auto-pilot enabled! We'll reorder ${petType} supplies every month.`
      }
    })
  } catch (error) {
    console.error('Pet supply error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function calculatePetConsumption(type: string, breed: string, weight: number, age: number) {
  const dailyFood: Record<string, number> = {
    'dog': weight * 0.03, // 3% of body weight
    'cat': weight * 0.025,
    'bird': 30,
    'fish': 5
  }

  const daily = dailyFood[type.toLowerCase()] || 50
  const monthly = daily * 30

  return {
    food: Math.round(monthly * 1000), // in grams
    treats: Math.round(monthly * 0.2 * 1000) // 20% of food as treats
  }
}
