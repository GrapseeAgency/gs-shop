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
