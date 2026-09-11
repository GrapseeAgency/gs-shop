import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// PUT - Approve a review
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isVerified: true },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json({ success: true, message: 'Review approved', review })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 })
  }
}
