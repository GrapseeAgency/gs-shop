import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Fetch a single order by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PUT - Update a single order (status, tracking, delivery info)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { status, trackingNumber, notes, projectMilestone, demoCallUrl, demoCallScheduledAt, deliverableUrl, deliveryProofImage, deliveredAt } = body

    const updateFields: any = {}
    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
      }
      updateFields.status = status
    }
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber
    if (notes !== undefined) updateFields.notes = notes
    if (projectMilestone !== undefined) updateFields.projectMilestone = projectMilestone
    if (demoCallUrl !== undefined) updateFields.demoCallUrl = demoCallUrl
    if (demoCallScheduledAt !== undefined) updateFields.demoCallScheduledAt = new Date(demoCallScheduledAt)
    if (deliverableUrl !== undefined) updateFields.deliverableUrl = deliverableUrl
    if (deliveryProofImage !== undefined) updateFields.deliveryProofImage = deliveryProofImage
    if (deliveredAt !== undefined) updateFields.deliveredAt = new Date(deliveredAt)

    const order = await prisma.order.update({
      where: { id },
      data: updateFields,
      include: { items: true }
    })

    return NextResponse.json({ success: true, message: 'Order updated', order })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE - Cancel/delete an order
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'delete')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.orderItem.deleteMany({ where: { orderId: id } })
    await prisma.order.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
