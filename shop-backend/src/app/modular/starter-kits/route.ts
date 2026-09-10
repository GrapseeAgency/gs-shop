import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get starter kit templates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kitType = searchParams.get('type') // 'school', 'moving', 'baby', 'festival', 'apartment'

    const kits: Record<string, any> = {
      school: {
        name: 'School Supply Kit',
        description: 'Complete school supplies based on grade level',
        inputs: ['grade', 'schoolName'],
        categories: ['stationery', 'books', 'bags', 'lunch']
      },
      moving: {
        name: 'Moving House Kit',
        description: 'Everything you need for a new home',
        inputs: ['houseSize', 'familySize'],
        categories: ['packing', 'cleaning', 'kitchen', 'bathroom', 'bedroom']
      },
      baby: {
        name: 'New Baby Starter Pack',
        description: 'Essentials for expecting parents',
        inputs: ['dueDate', 'budget'],
        categories: ['clothing', 'feeding', 'diapers', 'nursery', 'safety']
      },
      festival: {
        name: 'Festival Shopping Kit',
        description: 'Complete festival preparation',
        inputs: ['festival', 'familySize'],
        categories: ['clothes', 'gifts', 'food', 'decorations']
      },
      apartment: {
        name: 'First Apartment Kit',
        description: 'Everything for your first place',
        inputs: ['budget', 'apartmentSize'],
        categories: ['furniture', 'kitchen', 'bathroom', 'cleaning', 'electronics']
      }
    }

    if (!kitType || !kits[kitType]) {
      return NextResponse.json({
        availableKits: Object.keys(kits).map(k => ({
          id: k,
          name: kits[k].name,
          description: kits[k].description
        }))
      })
    }

    const kit = kits[kitType]

    // Get products for each category
    const productsByCategory: Record<string, any[]> = {}
    for (const category of kit.categories) {
      productsByCategory[category] = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { tags: { contains: category } },
            { category: { name: { contains: category } } }
          ]
        },
        take: 8
      })
    }

    return NextResponse.json({
      kit: {
        ...kit,
        id: kitType
      },
      productsByCategory,
      totalEstimate: Object.values(productsByCategory).flat().reduce((sum, p) => sum + p.price, 0),
      customization: {
        canAddItems: true,
        canRemoveItems: true,
        canSetBudget: true
      }
    })
  } catch (error) {
    console.error('Starter kit error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Generate custom kit
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { kitType, inputs, selectedItems, budget } = await req.json()

    // Filter items by budget if specified
    let finalItems = selectedItems
    if (budget) {
      let currentTotal = 0
      finalItems = selectedItems.filter((item: any) => {
        if (currentTotal + item.price <= budget) {
          currentTotal += item.price
          return true
        }
        return false
      })
    }

    // Mock kit
    const kit = {
      id: 'mock-' + Date.now(),
      userId: userId || null,
      kitType,
      inputs: JSON.stringify(inputs),
      items: JSON.stringify(finalItems),
      total: finalItems.reduce((sum: number, item: any) => sum + item.price, 0),
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      kit,
      itemCount: finalItems.length,
      total: kit.total,
      savings: `Bundle saves ${Math.round(finalItems.length * 5)}% vs individual purchases`,
      checkoutUrl: `/checkout?starterKit=${kit.id}`
    })
  } catch (error) {
    console.error('Kit creation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
