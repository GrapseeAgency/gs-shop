import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all flashback products or a single flashback product link
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const flashbackProduct = await prisma.flashbackProduct.findUnique({
        where: { id },
        include: { product: true }
      })
      if (!flashbackProduct) {
        return NextResponse.json({ error: 'Flashback product not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, flashbackProduct })
    }

    const flashbackProducts = await prisma.flashbackProduct.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      count: flashbackProducts.length,
      flashbackProducts
    })

  } catch (error) {
    console.error('Fetch flashback products error:', error)
    return NextResponse.json({ error: 'Failed to fetch flashback products' }, { status: 500 })
  }
}

// POST - Create a new flashback product link
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { productId, flashStart, flashEnd, discount, isActive } = body

    if (!productId || !flashStart || !flashEnd || discount === undefined) {
      return NextResponse.json({ error: 'Missing required fields (productId, flashStart, flashEnd, discount)' }, { status: 400 })
    }

    const flashbackProduct = await prisma.flashbackProduct.create({
      data: {
        product: {
          connect: { id: productId as string }
        },
        originalPrice: 100, // Default original price
        flashStart: new Date(flashStart),
        flashEnd: new Date(flashEnd),
        discount: Number(discount),
        isActive: isActive !== undefined ? Boolean(isActive) : true
      },
      include: { product: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Flashback product created successfully',
      flashbackProduct
    })

  } catch (error) {
    console.error('Create flashback product error:', error)
    return NextResponse.json({ error: 'Failed to create flashback product' }, { status: 500 })
  }
}

// PUT - Update flashback product link
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, productId, flashStart, flashEnd, discount, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Flashback product ID required' }, { status: 400 })
    }

    const updateFields: any = {}
    if (productId !== undefined) updateFields.productId = productId
    if (flashStart !== undefined) updateFields.flashStart = new Date(flashStart)
    if (flashEnd !== undefined) updateFields.flashEnd = new Date(flashEnd)
    if (discount !== undefined) updateFields.discount = Number(discount)
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)

    const flashbackProduct = await prisma.flashbackProduct.update({
      where: { id },
      data: updateFields,
      include: { product: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Flashback product updated successfully',
      flashbackProduct
    })

  } catch (error) {
    console.error('Update flashback product error:', error)
    return NextResponse.json({ error: 'Failed to update flashback product' }, { status: 500 })
  }
}

// DELETE - Delete a flashback product link
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Flashback product ID required' }, { status: 400 })
    }

    await prisma.flashbackProduct.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Flashback product deleted successfully'
    })

  } catch (error) {
    console.error('Delete flashback product error:', error)
    return NextResponse.json({ error: 'Failed to delete flashback product' }, { status: 500 })
  }
}
