// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: 'asc' }
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, description, monthlyPrice, yearlyPrice, features, billingPeriod } = body
  
  const subscription = await prisma.subscription.create({
    data: {
      name,
      description,
      monthlyPrice,
      yearlyPrice,
      features,
      billingPeriod,
      active: true,
      startDate: new Date()
    }
  })
  
  return NextResponse.json(subscription)
}
