import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      plans: [],
      activeWarranties: [],
      coverageDetails: [
        { feature: 'Manufacturing Defects', standard: true, extended: true, premium: true, lifetime: true },
        { feature: 'Accidental Damage', standard: false, extended: true, premium: true, lifetime: true },
        { feature: 'Liquid Damage', standard: false, extended: false, premium: true, lifetime: true },
        { feature: 'Free Repairs', standard: false, extended: true, premium: true, lifetime: true },
        { feature: 'Replacement Guarantee', standard: false, extended: false, premium: true, lifetime: true },
        { feature: 'Worldwide Coverage', standard: false, extended: false, premium: true, lifetime: true },
        { feature: 'No Claim Limits', standard: false, extended: false, premium: false, lifetime: true },
        { feature: 'Dedicated Agent', standard: false, extended: false, premium: false, lifetime: true },
      ],
    })
  } catch (error) {
    console.error('[WARRANTY-CENTER] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load warranty data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productValue, planId, productName } = body

    if (!productValue || !planId) {
      return NextResponse.json({ success: false, error: 'Product value and plan ID required' }, { status: 400 })
    }

    const plan = [].find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ success: false, error: 'Invalid plan ID' }, { status: 400 })
    }

    const warrantyPrice = Math.round(productValue * plan.priceMultiplier * 100) / 100

    return NextResponse.json({
      success: true,
      warranty: {
        id: `warranty-${Date.now()}`,
        productName: productName || 'Product',
        plan: plan.name,
        duration: plan.duration,
        price: warrantyPrice,
        coverageAmount: Math.min(productValue, plan.maxCoverage),
        startDate: new Date().toISOString(),
        features: plan.features,
      },
    })
  } catch (error) {
    console.error('[WARRANTY-CENTER] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to register warranty' }, { status: 500 })
  }
}
