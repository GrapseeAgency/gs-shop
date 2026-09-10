import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

const protectionPlans = {
  standard: { name: 'Standard Protection', refundPercent: 50, milestones: 3 },
  pro: { name: 'Pro Protection', refundPercent: 75, milestones: 5 },
  enterprise: { name: 'Enterprise Shield', refundPercent: 100, milestones: 7 }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { planId } = body

    if (!planId || !protectionPlans[planId as keyof typeof protectionPlans]) {
      return NextResponse.json(
        { error: 'Invalid protection plan selected' },
        { status: 400 }
      )
    }

    const plan = protectionPlans[planId as keyof typeof protectionPlans]
    const price = planId === 'standard' ? 0 : planId === 'pro' ? 4999 : 14999

    // If paid plan, check wallet
    if (price > 0) {
      const wallet = await prisma.wallet.findUnique({ where: { userId } })
      
      if (!wallet || wallet.balance < price) {
        return NextResponse.json(
          { 
            error: 'Insufficient wallet balance',
            required: price,
            current: wallet?.balance || 0
          },
          { status: 400 }
        )
      }

      // Deduct from wallet
      await prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: price } }
      })

      // Create transaction
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'debit',
          amount: price,
          description: `Delivery Protection: ${plan.name}`,
          referenceId: null
        }
      })
    }

    // Store protection subscription using PriceGuarantee model as DeliveryProtection
    const subscription = await prisma.priceGuarantee.create({
      data: {
        productId: 'delivery-protection',
        productName: plan.name,
        ourPrice: price,
        competitorUrl: '',
        competitorPrice: 0,
        status: 'approved',
        customerEmail: session.user.email || ''
      }
    })

    return NextResponse.json({
      success: true,
      planId,
      planName: plan.name,
      subscriptionId: subscription.id,
      refundPercent: plan.refundPercent,
      message: `Delivery protection activated: ${plan.name}`
    })

  } catch (error) {
    console.error('[DELIVERY_PROTECTION_SUBSCRIBE]', error)
    return NextResponse.json(
      { error: 'Failed to activate delivery protection' },
      { status: 500 }
    )
  }
}
