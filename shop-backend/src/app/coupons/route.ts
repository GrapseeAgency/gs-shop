import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/coupons List active coupons
export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST /api/coupons Validate a coupon code
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, cartTotal } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const upperCode = code.trim().toUpperCase()

    const coupon = await db.coupon.findUnique({
      where: { code: upperCode },
    })

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' },
        { status: 200 }
      )
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has been deactivated' },
        { status: 200 }
      )
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has expired' },
        { status: 200 }
      )
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' },
        { status: 200 }
      )
    }

    // Check minimum order
    if (coupon.minOrder && cartTotal && cartTotal < coupon.minOrder) {
      return NextResponse.json(
        { valid: false, error: `Minimum order of $${coupon.minOrder} required` },
        { status: 200 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (cartTotal) {
      if (coupon.type === 'percentage') {
        discountAmount = cartTotal * (coupon.discount / 100)
      } else {
        // Fixed amount discount
        discountAmount = Math.min(coupon.discount, cartTotal)
      }
    }

    const discountPercent = coupon.type === 'percentage' ? coupon.discount / 100 : 0

    return NextResponse.json({
      valid: true,
      code: upperCode,
      discount: discountPercent,
      discountAmount,
      type: coupon.type,
      rawDiscount: coupon.discount,
      label: coupon.type === 'percentage'
        ? `${coupon.discount}% off`
        : `$${coupon.discount} off`,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
