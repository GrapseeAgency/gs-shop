import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Single placement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const placement = await prisma.customPlacement.findUnique({ where: { id } })
    if (!placement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, placement })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT - Update placement
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
    const fields = ['zone', 'title', 'content', 'imageUrl', 'linkUrl', 'bgColor', 'textColor', 'type', 'isActive', 'order']
    fields.forEach((f) => { if (body[f] !== undefined) updateFields[f] = body[f] })
    if (body.order !== undefined) updateFields.order = Number(body.order)
    if (body.isActive !== undefined) updateFields.isActive = Boolean(body.isActive)

    const placement = await prisma.customPlacement.update({
      where: { id },
      data: updateFields
    })
    return NextResponse.json({ success: true, placement })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete placement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.customPlacement.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
