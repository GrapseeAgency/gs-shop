import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// POST - Admin reply to a review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { reply } = body
    if (!reply) return NextResponse.json({ error: 'Reply text required' }, { status: 400 })

    const review = await prisma.review.update({
      where: { id },
      data: { adminReply: reply, adminRepliedAt: new Date() },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } }
      }
    })
    return NextResponse.json({ success: true, message: 'Reply added', review })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 })
  }
}
