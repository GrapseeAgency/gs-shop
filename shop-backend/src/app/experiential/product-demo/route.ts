import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get interactive product demo
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate demo content
    const demo = {
      product: {
        id: product.id,
        name: product.name,
        images: [product.imageUrl],
        videoUrl: null
      },
      interactiveFeatures: [
        {
          type: '360_view',
          available: true,
          description: 'Drag to rotate product'
        },
        {
          type: 'zoom',
          available: true,
          description: 'Pinch or scroll to zoom'
        },
        {
          type: 'color_switcher',
          available: false,
          options: []
        },
        {
          type: 'size_comparison',
          available: true,
          description: 'See product dimensions with common objects'
        }
      ],
      hotspots: generateHotspots(product),
      specifications: {},
      howToUse: generateUsageGuide(product),
      relatedDemos: [] // Would fetch similar products
    }

    return NextResponse.json(demo)
  } catch (error) {
    console.error('Product demo error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateHotspots(product: any) {
  const hotspots = []
  
  if (product.features) {
    hotspots.push({
      position: { x: 50, y: 30 },
      title: 'Key Feature',
      description: product.features
    })
  }

  if (product.material) {
    hotspots.push({
      position: { x: 30, y: 60 },
      title: 'Material',
      description: product.material
    })
  }

  return hotspots
}

function generateUsageGuide(product: any) {
  const category = product.category?.name?.toLowerCase() || ''
  
  if (category.includes('electronics')) {
    return ['Unbox carefully', 'Read manual', 'Charge before first use', 'Install apps']
  }
  
  if (category.includes('clothing')) {
    return ['Check size on label', 'Wash before first wear', 'Follow care instructions']
  }
  
  if (category.includes('food')) {
    return ['Check expiry date', 'Store properly', 'Serve as desired']
  }
  
  return ['Read instructions', 'Use as intended', 'Contact support if needed']
}
