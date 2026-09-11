import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Get all messages with this user
    const messages = await prisma.sellerMessage.findMany({
      where: {
        sellerId: seller.id,
        userId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Mark unread messages as read
    await prisma.sellerMessage.updateMany({
      where: {
        sellerId: seller.id,
        userId,
        isRead: false,
        isFromSeller: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching message thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
