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
    const { licenseKey } = body

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key required' },
        { status: 400 }
      )
    }

    // Find purchase by license key
    const purchase = await prisma.digitalPurchase.findFirst({
      where: {
        licenseKey,
        userId: session.user.id,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Invalid license key or unauthorized' },
        { status: 404 }
      )
    }

    // Check download limit
    if (purchase.downloadsRemaining <= 0) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 }
      )
    }

    // Increment download count
    await prisma.digitalPurchase.update({
      where: { id: purchase.id },
      data: {
        downloadsRemaining: { decrement: 1 },
        totalDownloads: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    })

    return NextResponse.json({
      downloadUrl: `/api/digital-downloads/download?token=${licenseKey}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      remainingDownloads: purchase.downloadsRemaining - 1,
    })
  } catch (error) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
