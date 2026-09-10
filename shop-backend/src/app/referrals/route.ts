import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'REF-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function GET() {
  try {
    const referrals = await db.referral.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: referrals })
  } catch (error) {
    console.error('[REFERRALS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referrerName } = body

    if (!referrerName || typeof referrerName !== 'string' || !referrerName.trim()) {
      return NextResponse.json(
        { error: 'Referrer name is required' },
        { status: 400 }
      )
    }

    const referrerCode = generateReferralCode()

    const referral = await db.referral.create({
      data: {
        referrerCode,
        referrerName: referrerName.trim(),
        status: 'pending',
        reward: 100,
      },
    })

    return NextResponse.json({ data: referral }, { status: 201 })
  } catch (error) {
    console.error('[REFERRALS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}
