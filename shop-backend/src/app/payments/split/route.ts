import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, walletAmount, cardAmount, cardToken } = await req.json()

    const totalAmount = walletAmount + cardAmount

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet || wallet.balance < walletAmount) {
      return NextResponse.json({ 
        error: 'Insufficient wallet balance',
        currentBalance: wallet?.balance || 0,
        required: walletAmount 
      }, { status: 400 })
    }

    // Create split payment record
    const splitPayment = await prisma.splitPayment.create({
      data: {
        orderId,
        walletAmount,
        cardAmount,
        totalAmount,
        status: 'pending'
      }
    })

    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: walletAmount } }
    })

    // Create wallet transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'debit',
        amount: walletAmount,
        description: `Split payment for order ${orderId}`,
        referenceId: splitPayment.id
      }
    })

    // If card amount is 0, complete immediately
    if (cardAmount === 0) {
      await prisma.splitPayment.update({
        where: { id: splitPayment.id },
        data: { 
          status: 'completed',
          completedAt: new Date(),
          walletTxId: splitPayment.id
        }
      })

      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'confirmed',
          splitPayment: true,
          walletAmount,
          cardAmount: 0
        }
      })

      return NextResponse.json({
        success: true,
        splitPaymentId: splitPayment.id,
        status: 'completed',
        message: 'Payment completed using wallet only'
      })
    }

    // Return split payment info for card processing
    return NextResponse.json({
      success: true,
      splitPaymentId: splitPayment.id,
      status: 'pending',
      walletPaid: walletAmount,
      cardRequired: cardAmount,
      message: 'Wallet payment processed. Complete card payment to finish.'
    })
  } catch (error) {
    console.error('Split payment error:', error)
    return NextResponse.json({ error: 'Failed to process split payment' }, { status: 500 })
  }
}

// Complete card portion of split payment
export async function PUT(req: NextRequest) {
  try {
    const { splitPaymentId, cardTxId } = await req.json()

    const splitPayment = await prisma.splitPayment.findUnique({
      where: { id: splitPaymentId }
    })

    if (!splitPayment) {
      return NextResponse.json({ error: 'Split payment not found' }, { status: 404 })
    }

    if (splitPayment.status === 'completed') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 })
    }

    // Update split payment
    await prisma.splitPayment.update({
      where: { id: splitPaymentId },
      data: { 
        status: 'completed',
        cardTxId,
        completedAt: new Date()
      }
    })

    // Update order
    await prisma.order.update({
      where: { id: splitPayment.orderId },
      data: { 
        status: 'confirmed',
        splitPayment: true,
        walletAmount: splitPayment.walletAmount,
        cardAmount: splitPayment.cardAmount,
        paymentId: cardTxId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Split payment completed successfully'
    })
  } catch (error) {
    console.error('Split payment completion error:', error)
    return NextResponse.json({ error: 'Failed to complete payment' }, { status: 500 })
  }
}
