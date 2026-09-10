import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// PUT - Approve review
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { isApproved, isVerified } = body

    const updateData: any = {}
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved)
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified)

    const review = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'updated'} successfully`,
      review
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE - Delete review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.review.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
