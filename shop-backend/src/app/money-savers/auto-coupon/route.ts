import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Auto-find and apply best coupon
export async function POST(req: NextRequest) {
  try {
    const { cartTotal, cartItems, userId } = await req.json()

    // Get all active coupons
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        expiryDate: { gt: new Date() },
        OR: [
          { minOrderAmount: { lte: cartTotal } },
          { minOrderAmount: null }
        ]
      }
    })

    // Calculate savings for each coupon
    const scoredCoupons = coupons.map(coupon => {
      let savings = 0
      
      if (coupon.discountType === 'percentage') {
        savings = (cartTotal * coupon.discountValue) / 100
        if (coupon.maxDiscount && savings > coupon.maxDiscount) {
          savings = coupon.maxDiscount
        }
      } else {
        savings = coupon.discountValue
      }

      return {
        ...coupon,
        savings,
        effectiveDiscount: ((savings / cartTotal) * 100).toFixed(1)
      }
    }).sort((a, b) => b.savings - a.savings)

    const bestCoupon = scoredCoupons[0]

    // Check user-specific coupons
    let userBestCoupon = null
    if (userId) {
      // User coupons mock - skip personal coupons for now
      userBestCoupon = null
    }

    // Choose best overall
    const finalBest = userBestCoupon && userBestCoupon.savings > (bestCoupon?.savings || 0) 
      ? { ...userBestCoupon.coupon, savings: userBestCoupon.savings, source: 'personal' }
      : bestCoupon 
        ? { ...bestCoupon, source: 'public' }
        : null

    return NextResponse.json({
      bestCoupon: finalBest,
      allOptions: scoredCoupons.slice(0, 5),
      originalTotal: cartTotal,
      finalTotal: finalBest ? cartTotal - finalBest.savings : cartTotal,
      savings: finalBest?.savings || 0,
      autoApplied: !!finalBest,
      message: finalBest 
        ? `Best coupon auto-applied: ${finalBest.code} (Save ${finalBest.savings})`
        : 'No applicable coupons found'
    })
  } catch (error) {
    console.error('Auto coupon error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
