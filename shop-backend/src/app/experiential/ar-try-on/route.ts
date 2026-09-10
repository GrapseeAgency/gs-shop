import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get AR try-on data for product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product supports AR
    const arSupported = checkARSupport(product)

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        arModelUrl: product.arModelUrl || null
      },
      arSupported,
      arType: getARType(product),
      instructions: getARInstructions(product),
      compatible: true,
      features: ['3D preview', 'Size estimation', 'Color matching', 'Share view']
    })
  } catch (error) {
    console.error('AR try-on error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Save AR try-on session or photo
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, photoUrl, shared } = await req.json()

    if (userId) {
      await prisma.arTryOn.create({
        data: {
          userId,
          productId,
          imageUrl: photoUrl,
          arData: JSON.stringify({ shared: shared || false })
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      saved: !!userId,
      shareable: true,
      message: shared
        ? 'AR try-on shared! Others can see how it looks.'
        : 'Try-on saved to your history'
    })
  } catch (error) {
    console.error('AR save error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function checkARSupport(product: any): boolean {
  const arCategories = ['furniture', 'decor', 'shoes', 'eyewear', 'jewelry', 'makeup']
  const category = product.category?.name?.toLowerCase() || ''
  return arCategories.some(c => category.includes(c)) || !!product.arModelUrl
}

function getARType(product: any): string {
  const category = product.category?.name?.toLowerCase() || ''
  if (category.includes('furniture') || category.includes('decor')) return 'room_placement'
  if (category.includes('shoes')) return 'foot_placement'
  if (category.includes('jewelry') || category.includes('eyewear')) return 'face_overlay'
  if (category.includes('makeup')) return 'face_makeup'
  return '3d_preview'
}

function getARInstructions(product: any): string[] {
  const type = getARType(product)
  
  const instructions: Record<string, string[]> = {
    room_placement: [
      'Point camera at floor to detect surface',
      'Tap to place the item',
      'Pinch to resize',
      'Drag to move around'
    ],
    foot_placement: [
      'Point camera at your feet',
      'Tap to place the shoes',
      'See how they look from all angles'
    ],
    face_overlay: [
      'Point camera at your face',
      'The item will appear automatically',
      'Move your head to see from different angles'
    ],
    '3d_preview': [
      'Rotate your device to see the item',
      'Pinch to zoom',
      'Drag to rotate'
    ]
  }
  
  return instructions[type] || instructions['3d_preview']
}
