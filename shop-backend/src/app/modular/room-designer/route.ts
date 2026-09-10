import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get room designer products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roomType = searchParams.get('room') || 'living'

    const categories: Record<string, string[]> = {
      living: ['furniture', 'decor', 'lighting', 'rugs'],
      bedroom: ['bed', 'mattress', 'bedding', 'nightstand'],
      kitchen: ['appliance', 'cookware', 'storage', 'utensil'],
      office: ['desk', 'chair', 'storage', 'tech'],
      bathroom: ['towel', 'storage', 'accessories', 'organizer']
    }

    const tags = categories[roomType] || categories.living

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: tags.map(tag => ({
          tags: { contains: tag }
        }))
      },
      take: 30
    })

    // Room presets
    const presets = [
      { id: 'modern', name: 'Modern Minimal', colors: ['white', 'gray', 'black'] },
      { id: 'cozy', name: 'Cozy Warm', colors: ['beige', 'brown', 'cream'] },
      { id: 'bold', name: 'Bold & Bright', colors: ['navy', 'yellow', 'white'] },
      { id: 'natural', name: 'Natural Earth', colors: ['green', 'wood', 'white'] }
    ]

    return NextResponse.json({
      roomType,
      products,
      presets,
      designTips: getDesignTips(roomType)
    })
  } catch (error) {
    console.error('Room designer error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Save room design
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { roomType, items, preset, totalBudget } = await req.json()

    const design = {
      roomType,
      items,
      preset,
      totalBudget,
      createdAt: new Date()
    }

    if (userId) {
      // Room design saved mock
    }

    return NextResponse.json({
      success: true,
      design,
      message: 'Room design saved!',
      buyAllUrl: `/checkout?roomDesign=true`,
      estimatedTotal: items.reduce((sum: number, item: any) => sum + item.price, 0)
    })
  } catch (error) {
    console.error('Save design error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getDesignTips(roomType: string): string[] {
  const tips: Record<string, string[]> = {
    living: [
      'Choose a focal point (fireplace, TV, or artwork)',
      'Ensure conversation areas with proper spacing',
      'Layer lighting: ambient, task, and accent'
    ],
    bedroom: [
      'Position bed against the longest wall',
      'Nightstands should be within arm\'s reach',
      'Use calming colors for better sleep'
    ],
    kitchen: [
      'Keep work triangle in mind (sink-stove-fridge)',
      'Maximize counter space',
      'Good lighting is essential for cooking'
    ],
    office: [
      'Desk should face the door when possible',
      'Natural light reduces eye strain',
      'Ergonomic chair is worth the investment'
    ],
    bathroom: [
      'Storage should be easily accessible',
      'Use moisture-resistant materials',
      'Good ventilation prevents mold'
    ]
  }
  return tips[roomType] || []
}
