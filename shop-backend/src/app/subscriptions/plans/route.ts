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
  const { name, description, price, monthlyPrice, yearlyPrice, features, duration } = body

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      description,
      price: price || monthlyPrice || yearlyPrice || 0,
      monthlyPrice,
      yearlyPrice,
      features,
      duration: duration || 'monthly',
      isActive: true
    }
  })

  return NextResponse.json(plan)
}
