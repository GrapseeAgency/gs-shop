import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Single flashback product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const flashbackProduct = await prisma.flashbackProduct.findUnique({
      where: { id },
      include: { product: true }
    })
    if (!flashbackProduct) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, flashbackProduct })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT - Update flashback product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const updateFields: any = {}
    if (body.productId !== undefined) updateFields.productId = body.productId
    if (body.flashStart !== undefined) updateFields.flashStart = new Date(body.flashStart)
    if (body.flashEnd !== undefined) updateFields.flashEnd = new Date(body.flashEnd)
    if (body.discount !== undefined) updateFields.discount = Number(body.discount)
    if (body.isActive !== undefined) updateFields.isActive = Boolean(body.isActive)

    const flashbackProduct = await prisma.flashbackProduct.update({
      where: { id },
      data: updateFields,
      include: { product: true }
    })
    return NextResponse.json({ success: true, flashbackProduct })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete flashback product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.flashbackProduct.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
