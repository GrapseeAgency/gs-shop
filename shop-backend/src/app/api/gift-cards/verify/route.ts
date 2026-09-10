import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Gift card code required' },
        { status: 400 }
      )
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!giftCard) {
      return NextResponse.json(
        { valid: false, error: 'Invalid gift card code' },
        { status: 404 }
      )
    }

    if (!giftCard.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Gift card is inactive' },
        { status: 400 }
      )
    }

    if (giftCard.isRedeemed) {
      return NextResponse.json(
        { valid: false, error: 'Gift card already redeemed' },
        { status: 400 }
      )
    }

    if (giftCard.expiryDate && new Date() > new Date(giftCard.expiryDate)) {
      return NextResponse.json(
        { valid: false, error: 'Gift card expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.amount,
        balance: giftCard.balance,
        expiryDate: giftCard.expiryDate,
      },
    })
  } catch (error) {
    console.error('Error verifying gift card:', error)
    return NextResponse.json(
      { error: 'Failed to verify gift card' },
      { status: 500 }
    )
  }
}
