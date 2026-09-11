import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments: string[] = []
  for (let s = 0; s < 4; s++) {
    let segment = ''
    for (let i = 0; i < 4; i++) {
    }
    segments.push(segment)
  }
  return segments.join('-')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session?.user?.id
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
    const status = searchParams.get('status')

    // Build where clause
    const whereClause: any = {
      // Note: isActive doesn't exist in GiftCard schema
    }
    if (userId) whereClause.userId = userId
    if (status) whereClause.status = status

    const [giftCards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where: whereClause,
        include: {
          deliveries: {
            select: {
              id: true,
              recipientEmail: true,
              recipientName: true,
              status: true,
              emailSentAt: true,
              claimedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.giftCard.count({ where: whereClause })
    ])

    return NextResponse.json({ 
      success: true,
      data: giftCards,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      isAuthenticated: !!session?.user?.id
    })
  } catch (error) {
    console.error('[GIFT_CARDS_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to purchase gift cards' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { 
      amount, 
      design, 
      message,
      paymentMethod = 'wallet',
      recipientEmail,
      recipientName,
      personalMessage
    } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'A valid positive amount is required' },
        { status: 400 }
      )
    }

    // Handle wallet payment
    if (paymentMethod === 'wallet') {
      const wallet = await prisma.wallet.findUnique({ where: { userId } })
      
      if (!wallet || wallet.balance < amount) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Insufficient wallet balance',
            required: amount,
            current: wallet?.balance || 0,
            needsTopUp: true
          },
          { status: 400 }
        )
      }

      // Deduct from wallet
      await prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } }
      })

      // Create transaction record
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: amount,
          description: `Gift Card Purchase: ${generateGiftCardCode().slice(0, 8)}...`,
        }
      })
    } else if (paymentMethod === 'stripe') {
      return NextResponse.json({
        success: true,
        requiresStripe: true,
        amount,
        design,
        message,
        recipientEmail,
        recipientName,
        personalMessage
      })
    }

    const validDesigns = ['classic', 'birthday', 'holiday', 'premium']
    const cardDesign = validDesigns.includes(design) ? design : 'classic'

    const code = generateGiftCardCode()

    const giftCard = await prisma.giftCard.create({
      data: {
        userId,
        code,
        amount,
        balance: amount,
        design: cardDesign,
        message: message || null,
        status: 'active'
      },
    })

    // Create delivery record if sending to someone
    let delivery = null
    if (recipientEmail) {
      delivery = await prisma.giftCardDelivery.create({
        data: {
          giftCardId: giftCard.id,
          purchaserId: userId,
          recipientEmail,
          recipientName: recipientName || null,
          personalMessage: personalMessage || null,
          status: 'sent',
          emailSentAt: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      data: giftCard,
      code,
      delivery,
      message: recipientEmail 
        ? `Gift card sent to ${recipientEmail}!` 
        : 'Gift card purchased successfully!'
    }, { status: 201 })
  } catch (error) {
    console.error('[GIFT_CARDS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create gift card' },
      { status: 500 }
    )
  }
}
