import { NextRequest, NextResponse } from 'next/server'

// POST - Calculate optimal discount combination
export async function POST(req: NextRequest) {
  try {
    const { cartTotal, availableCoupons, walletBalance, loyaltyPoints } = await req.json()

    // Calculate all possible combinations
    const combinations = []

    // Try each coupon
    for (const coupon of availableCoupons) {
      let couponSavings = 0
      
      if (coupon.type === 'percentage') {
        couponSavings = (cartTotal * coupon.value) / 100
        if (coupon.maxDiscount && couponSavings > coupon.maxDiscount) {
          couponSavings = coupon.maxDiscount
        }
      } else {
        couponSavings = coupon.value
      }

      // Try with wallet
      for (const walletPercent of [0, 50, 100]) {
        const walletUsed = Math.min(walletBalance * (walletPercent / 100), cartTotal - couponSavings)
        
        // Try with points (1 point = 0.1)
        for (const pointsPercent of [0, 50, 100]) {
          const pointsUsed = Math.min(
            Math.floor(loyaltyPoints * (pointsPercent / 100)),
            Math.floor((cartTotal - couponSavings - walletUsed) * 10) // Max points needed
          )
          const pointsValue = pointsUsed * 0.1

          const totalSavings = couponSavings + walletUsed + pointsValue
          const finalTotal = Math.max(0, cartTotal - totalSavings)

          combinations.push({
            coupon: coupon.code,
            couponSavings,
            walletUsed,
            pointsUsed,
            pointsValue,
            totalSavings,
            finalTotal,
            effectiveness: (totalSavings / cartTotal) * 100
          })
        }
      }
    }

    // Find best combination
    const bestCombo = combinations.reduce((best, current) => 
      current.totalSavings > best.totalSavings ? current : best
    )

    return NextResponse.json({
      originalTotal: cartTotal,
      bestCombination: bestCombo,
      allOptions: combinations.slice(0, 10),
      savingsBreakdown: {
        coupon: bestCombo.couponSavings,
        wallet: bestCombo.walletUsed,
        points: bestCombo.pointsValue
      },
      message: `Optimal savings: ${Math.round(bestCombo.totalSavings)} (${bestCombo.effectiveness.toFixed(1)}% off)`,
      autoApply: true
    })
  } catch (error) {
    console.error('Discount stacker error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
