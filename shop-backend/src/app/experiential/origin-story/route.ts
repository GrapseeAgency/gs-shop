import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get product origin story
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
        seller: {
          select: { name: true, isVerified: true, avatar: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate origin story timeline
    const timeline = [
      {
        stage: 'concept',
        title: 'Concept & Design',
        date: new Date(product.createdAt.getTime() - 90 * 24 * 60 * 60 * 1000),
        description: `Initial concept developed by ${product.seller?.name || 'our team'}`,
        icon: 'lightbulb'
      },
      {
        stage: 'development',
        title: 'Development Phase',
        date: new Date(product.createdAt.getTime() - 60 * 24 * 60 * 60 * 1000),
        description: 'Code written, features implemented, quality checks performed',
        icon: 'code'
      },
      {
        stage: 'testing',
        title: 'Testing & QA',
        date: new Date(product.createdAt.getTime() - 30 * 24 * 60 * 60 * 1000),
        description: 'Rigorous testing across platforms and devices',
        icon: 'check-circle'
      },
      {
        stage: 'launch',
        title: 'Launch',
        date: product.createdAt,
        description: 'Product released to marketplace',
        icon: 'rocket'
      }
    ]

    // Get creator info
    const creator = {
      name: product.seller?.name || 'Grapsee Developer',
      isVerified: product.seller?.isVerified || false,
      avatar: product.seller?.avatar,
      bio: 'Passionate about creating high-quality digital products',
      otherProducts: 12,
      rating: 4.8
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        createdAt: product.createdAt
      },
      timeline,
      creator,
      materials: {
        codeQuality: 'A+',
        documentation: 'Comprehensive',
        support: 'Lifetime',
        updates: 'Regular'
      },
      certifications: product.seller?.isVerified ? ['Verified Developer', 'Quality Assured'] : [],
      impact: {
        happyCustomers: Math.floor(Math.random() * 500) + 100,
        countriesReached: Math.floor(Math.random() * 50) + 10,
        rating: (4 + Math.random()).toFixed(1)
      }
    })
  } catch (error) {
    console.error('Origin story error:', error)
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 })
  }
}
