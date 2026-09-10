import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get revisions for an order
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const revisions = await prisma.revisionRequest.findMany({
      where: { orderId },
      orderBy: { requestedAt: 'desc' }
    })

    return NextResponse.json({ revisions })
  } catch (error) {
    console.error('Revisions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 })
  }
}

// POST - Create revision request
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, description, priority, attachments } = await req.json()

    // Check revision count
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.revisionCount >= order.maxRevisions) {
      return NextResponse.json({ 
        error: 'Maximum revisions reached',
        maxRevisions: order.maxRevisions 
      }, { status: 400 })
    }

    const revision = await prisma.revisionRequest.create({
      data: {
        orderId,
        userId,
        description,
        priority: priority || 'normal',
        attachments: attachments ? JSON.stringify(attachments) : null
      }
    })

    // Increment order revision count
    await prisma.order.update({
      where: { id: orderId },
      data: { revisionCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      revision,
      remainingRevisions: order.maxRevisions - order.revisionCount - 1,
      message: 'Revision request submitted'
    })
  } catch (error) {
    console.error('Revision creation error:', error)
    return NextResponse.json({ error: 'Failed to create revision' }, { status: 500 })
  }
}

// PUT - Update revision status
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { revisionId, status } = await req.json()

    const update: any = { status }
    
    if (status === 'completed') {
      update.completedAt = new Date()
    } else if (status === 'in_review') {
      update.respondedAt = new Date()
    }

    const revision = await prisma.revisionRequest.update({
      where: { id: revisionId },
      data: update
    })

    return NextResponse.json({
      success: true,
      revision,
      message: `Revision ${status}`
    })
  } catch (error) {
    console.error('Revision update error:', error)
    return NextResponse.json({ error: 'Failed to update revision' }, { status: 500 })
  }
}
