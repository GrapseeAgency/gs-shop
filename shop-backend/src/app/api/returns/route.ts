import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session?.user?.id
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    // Build where clause
    const where: any = { userId }
    if (status && status !== 'all') {
      where.status = status
    }
    if (orderId) {
      where.orderId = orderId
    }

    const returns = await prisma.returnRequest.findMany({
      where,
      include: {
        order: {
          select: { 
            id: true,
            total: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    // Generate timeline for each return
    const returnsWithTimeline = returns.map(returnRequest => ({
      ...returnRequest,
      timeline: generateTimeline(returnRequest.status, returnRequest.createdAt, returnRequest.updatedAt)
    }))

    return NextResponse.json({
      success: true,
      data: returnsWithTimeline,
      total: returns.length
    })
  } catch (error) {
    console.error('Error fetching returns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch returns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const {
      orderId,
      reason,
      description,
      itemIds,
      refundMethod = 'original',
      userId
    } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 }
      )
    }

    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, error: 'Order ID and reason are required' },
        { status: 400 }
      )
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerEmail: session?.user?.email || (await prisma.user.findUnique({ where: { id: targetUserId }, select: { email: true } }))?.email
      },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    // Check if return already exists for this order
    const existingReturn = await prisma.returnRequest.findFirst({
      where: { orderId }
    })

    if (existingReturn) {
      return NextResponse.json(
        { success: false, error: 'Return request already exists for this order' },
        { status: 409 }
      )
    }

    // Check if order is eligible for return (within return window)
    const returnWindow = 30 // days
    const orderDate = new Date(order.createdAt)
    const returnDeadline = new Date(orderDate.getTime() + returnWindow * 24 * 60 * 60 * 1000)
    
    if (new Date() > returnDeadline) {
      return NextResponse.json(
        { success: false, error: 'Return window has expired' },
        { status: 400 }
      )
    }

    // Calculate refund amount based on items being returned
    const itemsToReturn = itemIds 
      ? order.items.filter(item => itemIds.includes(item.id))
      : order.items

    if (itemsToReturn.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid items specified for return' },
        { status: 400 }
      )
    }

    const refundAmount = itemsToReturn.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create return request
    const returnRequest = await prisma.returnRequest.create({
      data: {
        userId: targetUserId,
        orderId,
        productId: itemsToReturn[0]?.productId || '',
        productName: itemsToReturn[0]?.productName || '',
        reason,
        description: description || '',
        refundAmount,
        status: 'pending'
      }
    })

    // Update order status to indicate return in progress
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'return_requested' }
    })

    // Create timeline entry
    const timeline = generateTimeline('submitted', returnRequest.createdAt, returnRequest.createdAt)

    return NextResponse.json({
      success: true,
      data: {
        ...returnRequest,
        timeline
      },
      message: 'Return request submitted successfully',
      estimatedProcessingTime: '3-5 business days'
    })
  } catch (error) {
    console.error('Error creating return request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create return request' },
      { status: 500 }
    )
  }
}

// Helper function to generate timeline
function generateTimeline(status: string, createdAt: Date, updatedAt: Date): Array<{status: string, date: string, label: string}> {
  const timeline = [
    { status: 'submitted', date: createdAt.toISOString(), label: 'Return Requested' }
  ]

  const statusMap: { [key: string]: { label: string, order: number } } = {
    submitted: { label: 'Return Requested', order: 1 },
    reviewing: { label: 'Under Review', order: 2 },
    approved: { label: 'Request Approved', order: 3 },
    rejected: { label: 'Request Rejected', order: 3 },
    processing: { label: 'Refund Processing', order: 4 },
    completed: { label: 'Refund Completed', order: 5 },
    cancelled: { label: 'Return Cancelled', order: 5 }
  }

  const currentStatus = statusMap[status] || statusMap.submitted
  const currentOrder = currentStatus.order

  // Add intermediate statuses based on current status
  if (currentOrder >= 2) {
    timeline.push({ 
      status: 'reviewing', 
      date: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString(), 
      label: 'Under Review' 
    })
  }

  if (status === 'approved' && currentOrder >= 3) {
    timeline.push({ 
      status: 'approved', 
      date: updatedAt.toISOString(), 
      label: 'Request Approved' 
    })
  }

  if (status === 'rejected' && currentOrder >= 3) {
    timeline.push({ 
      status: 'rejected', 
      date: updatedAt.toISOString(), 
      label: 'Request Rejected' 
    })
  }

  if (currentOrder >= 4) {
    timeline.push({ 
      status: 'processing', 
      date: new Date(updatedAt.getTime() - 24 * 60 * 60 * 1000).toISOString(), 
      label: 'Refund Processing' 
    })
  }

  if (status === 'completed') {
    timeline.push({ 
      status: 'completed', 
      date: updatedAt.toISOString(), 
      label: 'Refund Completed' 
    })
  }

  if (status === 'cancelled') {
    timeline.push({ 
      status: 'cancelled', 
      date: updatedAt.toISOString(), 
      label: 'Return Cancelled' 
    })
  }

  return timeline
}
