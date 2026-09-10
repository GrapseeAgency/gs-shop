import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, planId, billingPeriod, paymentMethod } = body
  
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId }
  })
  
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }
  
  const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      status: 'active',
      billingPeriod,
      price,
      paymentMethod,
      startDate: new Date(),
      nextOrderDate: billingPeriod === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })
  
  return NextResponse.json(subscription)
}
