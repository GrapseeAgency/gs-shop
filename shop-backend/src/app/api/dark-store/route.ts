import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
    const flashOnly = searchParams.get('flashOnly') === 'true'

    const now = new Date()
    const hour = now.getHours()
    const isOpen = hour >= 22 || hour < 6

    // Calculate next opening/closing time
    let nextEvent: string
    if (isOpen) {
      const closeTime = new Date(now)
      closeTime.setHours(6, 0, 0, 0)
      if (hour >= 22) closeTime.setDate(closeTime.getDate() + 1)
      nextEvent = closeTime.toISOString()
    } else {
      const openTime = new Date(now)
      if (hour >= 6) openTime.setDate(openTime.getDate() + 1)
      openTime.setHours(22, 0, 0, 0)
      nextEvent = openTime.toISOString()
    }

    // Get dark store products (products with significant discounts and flash deals)
    const where: any = { 
      isActive: true, 
      comparePrice: { not: null, gt: 0 }
    }
    
    if (flashOnly) {
      where.isFlashDeal = true
      // Note: flashExpiresAt doesn't exist in schema, using isFlashDeal only
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [
          { isFlashDeal: 'desc' },
          { discount: 'desc' },
          { price: 'asc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.product.count({ where })
    ])

    const darkProducts = products
      .filter((p) => p.comparePrice && p.comparePrice > p.price)
      .map((p) => {
        const discount = Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100)
        const isFlashDeal = p.isFlashDeal
        
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          price: p.price,
          comparePrice: p.comparePrice!,
          discount,
        flashDeal: isFlashDeal,
          flashExpiresAt: null, // Not available in schema
          timeRemaining: null, // Not available without flashExpiresAt
          inStock: true, // Default to true since inventory doesn't exist
          stockLevel: 0, // Not available in schema
          isLowStock: false // Not available in schema
        }
      })

    // Get statistics
    const totalFlashDeals = darkProducts.filter(p => p.flashDeal).length
    const averageDiscount = darkProducts.length > 0 
      ? Math.round(darkProducts.reduce((sum, p) => sum + p.discount, 0) / darkProducts.length)
      : 0
    const maxDiscount = darkProducts.length > 0 
      ? Math.max(...darkProducts.map(p => p.discount))
      : 0

    return NextResponse.json({
      success: true,
      data: {
        isOpen,
        nextEvent,
        operatingHours: { open: '10:00 PM', close: '6:00 AM' },
        products: darkProducts,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        summary: {
          totalProducts: darkProducts.length,
          flashDeals: totalFlashDeals,
          averageDiscount,
          maxDiscount,
          totalSavings: darkProducts.reduce((sum, p) => sum + (p.comparePrice - p.price), 0)
        },
        message: isOpen 
          ? ' Dark Store is OPEN! Exclusive deals await.' 
          : ' Dark Store is closed. Opens at 10 PM.',
      }
    })
  } catch (error) {
    console.error('Dark store fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dark store products' },
      { status: 500 }
    )
  }
}

// POST /api/dark-store Create flash deal (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      productId, 
      flashDeal, 
      flashExpiresAt, 
      comparePrice,
      discount 
    } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 })
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: 'Product is not active' }, { status: 400 })
    }

    // Validate flash deal settings
    if (flashDeal && flashExpiresAt) {
      const expiryDate = new Date(flashExpiresAt)
      if (expiryDate <= new Date()) {
        return NextResponse.json({ success: false, error: 'Flash deal expiry must be in the future' }, { status: 400 })
      }
    }

    // Validate pricing
    if (comparePrice !== undefined && comparePrice <= product.price) {
      return NextResponse.json({ 
        success: false, 
        error: 'Compare price must be greater than current price' 
      }, { status: 400 })
    }

    if (discount !== undefined && (discount < 0 || discount > 100)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Discount must be between 0 and 100' 
      }, { status: 400 })
    }

    // Update product with dark store settings
    const updateData: any = {}
    if (flashDeal !== undefined) updateData.isFlashDeal = flashDeal
    // Note: flashExpiresAt doesn't exist in schema
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice
    if (discount !== undefined) updateData.discount = discount

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    })

    const response = {
      ...updatedProduct,
      discount: updatedProduct.discount || (updatedProduct.comparePrice 
        ? Math.round(((updatedProduct.comparePrice - updatedProduct.price) / updatedProduct.comparePrice) * 100)
        : 0)
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: flashDeal 
        ? 'Flash deal created successfully!' 
        : 'Product updated successfully!'
    })
  } catch (error) {
    console.error('Dark store product update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update dark store product' }, { status: 500 })
  }
}
