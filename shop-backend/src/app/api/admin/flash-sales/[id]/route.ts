import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Fetch a single flash sale
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } }
    })
    if (!flashSale) return NextResponse.json({ error: 'Flash sale not found' }, { status: 404 })
    return NextResponse.json({ success: true, flashSale })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flash sale' }, { status: 500 })
  }
}

// PUT - Update a flash sale
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, productId, productIds, salePrice, discountPercent, startTime, endTime, maxQuantity, isActive } = body

    const updateFields: any = {}
    if (name !== undefined) updateFields.name = name
    if (description !== undefined) updateFields.description = description
    if (productId !== undefined) updateFields.productId = productId
    if (productIds !== undefined) updateFields.productIds = JSON.stringify(productIds)
    if (salePrice !== undefined) updateFields.salePrice = Number(salePrice)
    if (discountPercent !== undefined) updateFields.discountPercent = Number(discountPercent)
    if (startTime !== undefined) updateFields.startTime = new Date(startTime)
    if (endTime !== undefined) updateFields.endTime = new Date(endTime)
    if (maxQuantity !== undefined) updateFields.maxQuantity = maxQuantity ? Number(maxQuantity) : null
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)

    const flashSale = await prisma.flashSale.update({
      where: { id },
      data: updateFields,
      include: { product: { select: { id: true, name: true, imageUrl: true, price: true } } }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Flash sale updated', 
      flashSale: {
        ...flashSale,
        productIds: flashSale.productIds ? JSON.parse(flashSale.productIds) : null,
      }
    })
  } catch (error) {
    console.error('Update flash sale error:', error)
    return NextResponse.json({ error: 'Failed to update flash sale' }, { status: 500 })
  }
}

// DELETE - Delete a flash sale
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'delete')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.flashSale.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Flash sale deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete flash sale' }, { status: 500 })
  }
}
