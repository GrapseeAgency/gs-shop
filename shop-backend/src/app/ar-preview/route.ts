import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get AR-compatible products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (productId) {
      // Get specific product AR data
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          arModelUrl: true,
          dimensions: true,
          imageUrl: true
        }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({
        product: {
          ...product,
          arSupported: !!product.arModelUrl,
          placementType: product.dimensions ? 'surface' : 'wall',
          scale: 1.0
        }
      })
    }

    // Get all AR-enabled products
    const products = await prisma.product.findMany({
      where: {
        arModelUrl: { not: null }
      },
      take: 20,
      select: {
        id: true,
        name: true,
        arModelUrl: true,
        imageUrl: true,
        category: true
      }
    })

    return NextResponse.json({ 
      products,
      total: products.length,
      instructions: 'Point your camera at a flat surface to place the product'
    })
  } catch (error) {
    console.error('AR preview error:', error)
    return NextResponse.json({ error: 'Failed to load AR data' }, { status: 500 })
  }
}

// POST - Track AR session
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, sessionDuration, placedSuccessfully } = await req.json()

    await prisma.aRExperience.create({
      data: {
        userId: userId || 'anonymous',
        productId,
        sessionDuration,
        placedSuccessfully,
        deviceType: req.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ 
      success: true,
      message: placedSuccessfully ? 'AR experience recorded' : 'AR session logged'
    })
  } catch (error) {
    console.error('AR tracking error:', error)
    return NextResponse.json({ error: 'Failed to track AR' }, { status: 500 })
  }
}
