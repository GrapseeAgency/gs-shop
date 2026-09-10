import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const commissionTiers = [
  { id: 'starter', name: 'Starter', commissionRate: 5 },
  { id: 'silver', name: 'Silver', commissionRate: 8 },
  { id: 'gold', name: 'Gold', commissionRate: 12 },
  { id: 'platinum', name: 'Platinum', commissionRate: 15 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let affiliate = null
    if (userId) {
      affiliate = await prisma.affiliate.findUnique({
        where: { userId }
      })
    }

    const allAffiliates = await prisma.affiliate.findMany()
    const totalEarnings = allAffiliates.reduce((sum, a) => sum + a.totalEarnings, 0)

    return NextResponse.json({
      success: true,
      commissionTiers,
      programInfo: {
        name: 'Grapsee Affiliate Program',
        description: 'Earn commissions by referring customers to Grapsee Shop',
      },
      stats: {
        totalAffiliates: allAffiliates.length,
        totalPaidOut: totalEarnings,
      },
      userStats: affiliate ? {
        referralCode: affiliate.code,
        currentTier: affiliate.tier,
        totalEarnings: affiliate.totalEarnings,
        totalReferrals: affiliate.totalReferrals,
        commissionRate: affiliate.commissionRate,
      } : null,
      isRegistered: !!affiliate,
    })
  } catch (error) {
    console.error('[AFFILIATE] GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate program info' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, email } = body

    if (!userId || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'User ID, name and email are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate registration
    const existing = await prisma.affiliate.findUnique({ where: { userId } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This user is already registered as an affiliate' },
        { status: 409 }
      )
    }

    const existingEmail = await prisma.affiliate.findFirst({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered as an affiliate' },
        { status: 409 }
      )
    }

    // Generate referral code
    const code = `GRAPSEE-${name.slice(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase()}`

    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        name,
        email,
        code,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Affiliate registration successful',
      registration: affiliate,
    }, { status: 201 })
  } catch (error) {
    console.error('[AFFILIATE] POST Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to register for affiliate program' },
      { status: 500 }
    )
  }
}
