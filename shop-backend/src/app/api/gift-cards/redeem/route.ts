import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const giftCard = await prisma.giftCard.findUnique({
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please create an account first.' },
        { status: 404 }
      )
    }

    // Credit user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    })

    if (wallet) {
      // Update existing wallet
      await prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: giftCard.balance } }
      })
    } else {
      // Create new wallet
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: giftCard.balance,
          currency: 'BDT'
        }
      })
    }

    // Create wallet transaction
    const newWallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (newWallet) {
      await prisma.walletTransaction.create({
        data: {
          walletId: newWallet.id,
          type: 'credit',
          amount: giftCard.balance,
          description: `Gift card redemption: ${code.slice(0, 4)}...`,
          referenceId: giftCard.id
        }
      })
    }

    // Update gift card as redeemed
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        isRedeemed: true,
        redeemedBy: email,
        balance: 0,
      },
    })

    // Update delivery status if this was sent as a gift
    const delivery = await prisma.giftCardDelivery.findFirst({
      where: { giftCardId: giftCard.id }
    })
    
    if (delivery) {
      await prisma.giftCardDelivery.update({
        where: { id: delivery.id },
        data: { status: 'redeemed' }
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedGiftCard,
      redeemedAmount: giftCard.balance,
      newBalance: (wallet?.balance || 0) + giftCard.balance,
      message: `Gift card redeemed successfully! ${formatPrice(giftCard.balance)} has been added to your wallet.`,
    })
  } catch (error) {
    console.error('[GIFT_CARDS_REDEEM_POST]', error)
    return NextResponse.json(
      { error: 'Failed to redeem gift card' },
      { status: 500 }
    )
  }
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-BD')}`
}
