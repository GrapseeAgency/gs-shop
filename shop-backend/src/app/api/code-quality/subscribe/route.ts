import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

const qualityPlans = {
  basic: { name: 'Basic Coverage', coverageDays: 30, revisions: 2 },
  pro: { name: 'Pro Assurance', coverageDays: 90, revisions: 5 },
  enterprise: { name: 'Enterprise Shield', coverageDays: 180, revisions: 10 }
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

    if (!planId || !qualityPlans[planId as keyof typeof qualityPlans]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    const plan = qualityPlans[planId as keyof typeof qualityPlans]

    // Store the quality plan subscription in database
    // Using existing WarrantyPlan model as QualityPlan
    const subscription = await prisma.warrantyPlan.create({
      data: {
        name: plan.name,
        duration: plan.coverageDays,
        coverage: JSON.stringify([
          'Bug fixes for critical issues',
          'Code review for security flaws',
          `${plan.revisions} free revisions`,
          `${plan.coverageDays}-day coverage period`
        ]),
        price: planId === 'basic' ? 0 : planId === 'pro' ? 2999 : 7999,
        description: `Quality guarantee subscription - ${plan.name}`,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      planId,
      planName: plan.name,
      subscriptionId: subscription.id,
      message: `Successfully activated ${plan.name}`
    })

  } catch (error) {
    console.error('[CODE_QUALITY_SUBSCRIBE]', error)
    return NextResponse.json(
      { error: 'Failed to activate quality plan' },
      { status: 500 }
    )
  }
}
