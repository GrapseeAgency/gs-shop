import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check expiry date guarantee eligibility
export async function POST(req: NextRequest) {
  try {
    const { orderId, productId } = await req.json()
    const userId = req.headers.get('x-user-id')

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const item = order.items.find(i => i.productId === productId)
    if (!item || !item.product) {
      return NextResponse.json({ error: 'Product not in order' }, { status: 404 })
    }

    // Check if product has expiry info
    const expiryDate = item.product.expiryDate
    if (!expiryDate) {
      return NextResponse.json({ eligible: false, reason: 'No expiry date available' })
    }

    const monthsUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    )

    const isEligible = monthsUntilExpiry < 6 && monthsUntilExpiry >= 0

    return NextResponse.json({
      eligible: isEligible,
      product: {
        name: item.product.name,
        expiryDate,
        monthsUntilExpiry
      },
      guarantee: {
        months: 6,
        message: isEligible
          ? ` Product expires in ${monthsUntilExpiry} months. Eligible for free replacement!`
          : monthsUntilExpiry >= 6
          ? ` Product valid for ${monthsUntilExpiry} months. Standard warranty applies.`
          : ' Product expired. Contact support immediately.'
      },
      action: isEligible
        ? {
            type: 'replace',
            message: 'Claim free replacement',
            url: `/support/claim?order=${orderId}&product=${productId}`
          }
        : null
    })
  } catch (error) {
    console.error('Expiry guarantee error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
