import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, orderId } = body

    if (!productId || !orderId) {
      return NextResponse.json(
        { error: 'Product ID and Order ID required' },
        { status: 400 }
      )
    }

    // Verify purchase exists
    const purchase = await prisma.digitalPurchase.findFirst({
      where: {
        userId: session.user.id,
        productId,
        orderId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      verified: true,
      purchase: {
        id: purchase.id,
        licenseKey: purchase.licenseKey,
        productId: purchase.productId,
        purchaseDate: purchase.createdAt,
        downloadCount: purchase.totalDownloads,
        remainingDownloads: purchase.downloadsRemaining,
      },
    })
  } catch (error) {
    console.error('Error verifying digital purchase:', error)
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    )
  }
}
