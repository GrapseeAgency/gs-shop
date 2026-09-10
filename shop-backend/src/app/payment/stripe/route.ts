import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// POST /api/payment/stripe Create a PaymentIntent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'usd', orderId, customerEmail, customerName } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      metadata: {
        orderId: orderId || '',
        customerEmail: customerEmail || '',
        customerName: customerName || '',
      },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('[STRIPE_CREATE_INTENT]', error)
    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY')) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}

// POST /api/payment/stripe/webhook (handled separately for signature verification)
