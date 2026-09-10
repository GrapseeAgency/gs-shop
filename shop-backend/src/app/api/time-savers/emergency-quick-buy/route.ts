import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get emergency essential items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location')

    // Essential items for emergencies
    const essentialCategories = ['medicine', 'first_aid', 'water', 'battery', 'flashlight']

    const essentials = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: essentialCategories.map(cat => ({
          OR: [
            { category: { name: { contains: cat } } },
            { tags: { contains: cat } }
          ]
        }))
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { rating: 'desc' },
      take: 20
    })

    // Categorize
    const categorized = {
      medical: essentials.filter(p => 
        p.name.toLowerCase().includes('medicine') || 
        p.tags?.includes('medicine')
      ).slice(0, 5),
      power: essentials.filter(p => 
        p.name.toLowerCase().includes('battery') || 
        p.tags?.includes('battery')
      ).slice(0, 5),
      lighting: essentials.filter(p => 
        p.name.toLowerCase().includes('light') || 
        p.tags?.includes('flashlight')
      ).slice(0, 5),
      water: essentials.filter(p => 
        p.name.toLowerCase().includes('water') || 
        p.tags?.includes('water')
      ).slice(0, 3)
    }

    return NextResponse.json({
      mode: 'emergency',
      deliveryEta: '1 hour', // Priority delivery
      categories: categorized,
      totalItems: Object.values(categorized).flat().length,
      oneClickKit: {
        name: 'Emergency Essentials Kit',
        items: Object.values(categorized).flat().slice(0, 8),
        total: Object.values(categorized).flat().slice(0, 8).reduce((sum, p) => sum + p.price, 0)
      },
      message: 'Emergency mode active. Fastest delivery prioritized.',
      disclaimer: 'For medical emergencies, please call your local emergency services first.'
    })
  } catch (error) {
    console.error('Emergency quick buy error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
