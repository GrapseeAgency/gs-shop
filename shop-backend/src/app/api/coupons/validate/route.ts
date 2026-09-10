import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal, items } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Coupon not found' })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'This coupon is no longer active' })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This coupon has expired' })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit' })
    }

    if (coupon.minOrder && cartTotal < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount is ${coupon.minOrder}`,
        minOrder: coupon.minOrder,
      })
    }

    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round(cartTotal * (coupon.discount / 100) * 100) / 100
    } else {
      discount = coupon.discount
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount,
      discountType: coupon.type,
      discountValue: coupon.discount,
      minOrder: coupon.minOrder,
      expiresAt: coupon.expiresAt,
      message: `Coupon applied! You save ${discount}`,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
