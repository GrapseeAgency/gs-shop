import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all reviews
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        product: {
          select: { id: true, name: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, count: reviews.length, reviews })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST - Admin reply to a review
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { reviewId, reply } = body

    if (!reviewId || !reply) {
      return NextResponse.json({ error: 'Review ID and reply text are required' }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { 
        adminReply: reply,
        adminRepliedAt: new Date()
      },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      review
    })
  } catch (error) {
    console.error('Admin reply to review error:', error)
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 })
  }
}
