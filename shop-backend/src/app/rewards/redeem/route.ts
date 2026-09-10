import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { points } = body

    if (!points || typeof points !== 'number') {
      return NextResponse.json({ error: 'Points amount is required' }, { status: 400 })
    }

    if (points < 500) {
      return NextResponse.json(
        { error: 'Minimum 500 points required for redemption' },
        { status: 400 }
      )
    }

    if (points % 500 !== 0) {
      return NextResponse.json(
        { error: 'Points must be redeemed in increments of 500' },
        { status: 400 }
      )
    }

    // Generate discount code
    const discountAmount = (points / 500) * 10
    const codePrefix = 'GRAPSEE'
    const codeSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    const discountCode = `${codePrefix}${codeSuffix}`

    return NextResponse.json({
      success: true,
      discountCode,
      pointsRedeemed: points,
      discountAmount,
      message: `Successfully redeemed ${points} points for $${discountAmount} discount!`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 })
  }
}
