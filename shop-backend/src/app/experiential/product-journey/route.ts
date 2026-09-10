import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get product journey/timeline
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        seller: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Build journey timeline
    const journey = [
      {
        stage: 'concept',
        title: 'Idea Born',
        date: new Date(product.createdAt.getTime() - 30 * 24 * 60 * 60 * 1000),
        description: 'Product concept developed by designer',
        icon: ''
      },
      {
        stage: 'design',
        title: 'Design Phase',
        date: new Date(product.createdAt.getTime() - 20 * 24 * 60 * 60 * 1000),
        description: 'Prototypes created and tested',
        icon: ''
      },
      {
        stage: 'manufacturing',
        title: 'Manufacturing',
        date: new Date(product.createdAt.getTime() - 10 * 24 * 60 * 60 * 1000),
        description: 'Crafted with care by skilled artisans',
        icon: ''
      },
      {
        stage: 'quality',
        title: 'Quality Check',
        date: new Date(product.createdAt.getTime() - 5 * 24 * 60 * 60 * 1000),
        description: 'Rigorous quality assurance passed',
        icon: ''
      },
      {
        stage: 'listed',
        title: 'Listed on Store',
        date: product.createdAt,
        description: 'Product made available for purchase',
        icon: ''
      }
    ]

    // Add impact metrics
    const impact = {
      carbonFootprint: product.carbonFootprint || '2.3kg CO2e',
      materials: product.materials?.split(',') || ['Cotton', 'Polyester'],
      origin: product.origin || 'India',
      workersInvolved: Math.floor(Math.random() * 50) + 10,
      hoursToCreate: Math.floor(Math.random() * 20) + 5
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        image: product.imageUrl
      },
      journey,
      impact,
      story: `This ${product.name} was carefully crafted with attention to detail, from initial concept to final quality check.`,
      maker: {
        name: product.seller?.name || 'Artisan Team',
        location: product.origin || 'Local Workshop',
        yearsExperience: Math.floor(Math.random() * 15) + 5
      }
    })
  } catch (error) {
    console.error('Product journey error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
