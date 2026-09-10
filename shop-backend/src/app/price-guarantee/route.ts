import { NextRequest, NextResponse } from 'next/server'

const SUCCESS_STORIES = [
  { id: 'ss-1', name: 'Sarah M.', product: 'MacBook Pro', saved: 250, quote: 'I found it cheaper and got the difference back in 24 hours!', avatar: '' },
  { id: 'ss-2', name: 'James K.', product: 'Samsung Galaxy S24', saved: 120, quote: 'Price guarantee saved me over $100. Incredible service!', avatar: '' },
  { id: 'ss-3', name: 'Maria L.', product: 'Sony WH-1000XM5', saved: 65, quote: 'So easy to claim. Just uploaded a screenshot and got my refund!', avatar: '' },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      guaranteeDays: 30,
      claims: [],
      successStories: SUCCESS_STORIES,
      terms: [
        'Price must be from an authorized retailer',
        'Product must be identical (same model, color, condition)',
        'Lower price must be currently available (not expired deals)',
        'Claim must be submitted within 30 days of purchase',
        'Refund is the difference between our price and the lower price',
        'Maximum one claim per product',
        'Applies to products sold and fulfilled by Grapsee Shop',
      ],
    })
  } catch (error) {
    console.error('[PRICE-GUARANTEE] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load guarantee data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, productName, ourPrice, competitorPrice, competitorUrl } = body

    if (!orderId || !productName || !ourPrice || !competitorPrice) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    if (competitorPrice >= ourPrice) {
      return NextResponse.json({ success: false, error: 'Competitor price must be lower than our price' }, { status: 400 })
    }

    const refundAmount = Math.round((ourPrice - competitorPrice) * 100) / 100

    return NextResponse.json({
      success: true,
      claim: {
        id: `claim-${Date.now()}`,
        orderId,
        productName,
        ourPrice,
        competitorPrice,
        refundAmount,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        estimatedReview: '1-2 business days',
      },
      message: `Claim submitted! Estimated refund: $${refundAmount}`,
    })
  } catch (error) {
    console.error('[PRICE-GUARANTEE] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit claim' }, { status: 500 })
  }
}
