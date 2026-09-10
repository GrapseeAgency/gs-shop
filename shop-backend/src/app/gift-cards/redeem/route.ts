import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, email } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Gift card code is required' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required to redeem a gift card' },
        { status: 400 }
      )
    }

    const giftCard = await db.giftCard.findUnique({
      where: { code: code.trim().toUpperCase() },
    })

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 404 }
      )
    }

    if (!giftCard.isActive) {
      return NextResponse.json(
        { error: 'This gift card is no longer active' },
        { status: 400 }
      )
    }

    if (giftCard.isRedeemed) {
      return NextResponse.json(
        { error: 'This gift card has already been redeemed' },
        { status: 400 }
      )
    }

    if (giftCard.balance <= 0) {
      return NextResponse.json(
        { error: 'This gift card has no remaining balance' },
        { status: 400 }
      )
    }

    const updatedGiftCard = await db.giftCard.update({
      where: { id: giftCard.id },
      data: {
        isRedeemed: true,
        redeemedBy: email,
        balance: 0,
      },
    })

    return NextResponse.json({
      data: updatedGiftCard,
      redeemedAmount: giftCard.balance,
      message: `Gift card redeemed successfully! ${giftCard.balance} added to your wallet.`,
    })
  } catch (error) {
    console.error('[GIFT_CARDS_REDEEM_POST]', error)
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    )
  }
}
