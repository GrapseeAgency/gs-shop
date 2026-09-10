import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, count: orders.length, orders })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// PUT - Update order status (full order lifecycle control)
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, status, trackingNumber, notes, projectMilestone, demoCallUrl, demoCallScheduledAt, deliverableUrl, deliveryProofImage, deliveredAt } = body

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Build update object
    const updateFields: any = {}

    // Status update (order lifecycle: pending processing shipped delivered cancelled)
    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'on_hold']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
      }
      updateFields.status = status
    }

    // Tracking information
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber
    if (notes !== undefined) updateFields.notes = notes

    // Project milestone (for service-based products)
    if (projectMilestone !== undefined) {
      const validMilestones = ['requirement_gathering', 'design', 'development', 'testing', 'delivery', 'completed']
      if (!validMilestones.includes(projectMilestone)) {
        return NextResponse.json({ error: `Invalid milestone. Must be one of: ${validMilestones.join(', ')}` }, { status: 400 })
      }
      updateFields.projectMilestone = projectMilestone
    }

    // Demo/Call scheduling
    if (demoCallUrl !== undefined) updateFields.demoCallUrl = demoCallUrl
    if (demoCallScheduledAt !== undefined) updateFields.demoCallScheduledAt = new Date(demoCallScheduledAt)

    // Delivery information
    if (deliverableUrl !== undefined) updateFields.deliverableUrl = deliverableUrl
    if (deliveryProofImage !== undefined) updateFields.deliveryProofImage = deliveryProofImage
    if (deliveredAt !== undefined) updateFields.deliveredAt = new Date(deliveredAt)

    // Update the order
    const order = await prisma.order.update({
      where: { id },
      data: updateFields,
      include: { items: true }
    })

    return NextResponse.json({
      success: true,
      message: `Order ${id} updated successfully`,
      order
    })

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
