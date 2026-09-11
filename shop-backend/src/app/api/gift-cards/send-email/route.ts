import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { giftCardId, recipientEmail, recipientName, personalMessage } = body

    if (!giftCardId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Gift card ID and recipient email required' },
        { status: 400 }
      )
    }

    // Verify gift card exists and belongs to user
    const giftCard = await prisma.giftCard.findFirst({
      where: {
        id: giftCardId,
        userId: session.user.id,
      },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 404 }
      )
    }

    // Create or update delivery record
    const existingDelivery = await prisma.giftCardDelivery.findFirst({
      where: { giftCardId },
    })

    const delivery = existingDelivery
      ? await prisma.giftCardDelivery.update({
          where: { id: existingDelivery.id },
          data: {
            recipientEmail,
            recipientName: recipientName || null,
            personalMessage: personalMessage || null,
            emailSentAt: new Date(),
            status: 'sent',
          },
        })
      : await prisma.giftCardDelivery.create({
          data: {
            giftCardId: giftCardId,
            purchaserId: session.user.id,
            recipientEmail,
            recipientName: recipientName || null,
            personalMessage: personalMessage || null,
            emailSentAt: new Date(),
            status: 'sent',
          },
        })

    return NextResponse.json({
      success: true,
      message: 'Gift card email sent successfully',
      delivery,
    })
  } catch (error) {
    console.error('Error sending gift card email:', error)
    return NextResponse.json(
      { error: 'Failed to send gift card email' },
      { status: 500 }
    )
  }
}
