import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get moderation queue
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    const contentType = searchParams.get('type')

    const where: any = { status }
    if (contentType) where.contentType = contentType

    const queue = await prisma.moderationQueue.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 50
    })

    return NextResponse.json({ queue })
  } catch (error) {
    console.error('Moderation queue error:', error)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// POST - Report content for moderation
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const {
      contentType,
      contentId,
      content,
      reason,
      reporterId
    } = await req.json()

    const queueItem = await prisma.moderationQueue.create({
      data: {
        contentType,
        contentId,
        content,
        reason,
        reporterId: reporterId || userId || 'anonymous'
      }
    })

    return NextResponse.json({
      success: true,
      id: queueItem.id,
      message: 'Content reported for review'
    })
  } catch (error) {
    console.error('Moderation report error:', error)
    return NextResponse.json({ error: 'Failed to report' }, { status: 500 })
  }
}

// PUT - Moderate content (approve/reject)
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id, status, notes } = await req.json()

    const updated = await prisma.moderationQueue.update({
      where: { id },
      data: {
        status,
        moderatedBy: userId,
        moderatedAt: new Date()
      }
    })

    // Take action based on content type
    if (status === 'rejected') {
      // Delete or hide the content
      switch (updated.contentType) {
        case 'review':
          await prisma.review.deleteMany({ where: { id: updated.contentId } })
          break
        case 'forum_post':
          await prisma.forumTopic.deleteMany({ where: { id: updated.contentId } })
          break
        // Add other content types
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: userId,
        action: status === 'approved' ? 'approve' : 'delete',
        resource: updated.contentType,
        resourceId: updated.contentId,
        newValue: JSON.stringify({ status, notes })
      }
    })

    return NextResponse.json({
      success: true,
      message: `Content ${status}`
    })
  } catch (error) {
    console.error('Moderation action error:', error)
    return NextResponse.json({ error: 'Failed to moderate' }, { status: 500 })
  }
}
