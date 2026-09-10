import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_DIGITAL || ''

function generateLicenseKey(): string {
  return `LIC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`
}

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Extract metadata
      const { userId, productId, productName, productPrice } = paymentIntent.metadata

      if (!userId || !productId) {
        console.error('[STRIPE_WEBHOOK] Missing metadata:', paymentIntent.metadata)
        return NextResponse.json({ received: true })
      }

      try {
        // Check if purchase already exists (idempotency)
        const existingPurchase = await prisma.digitalPurchase.findFirst({
          where: {
            userId,
            productId,
            paymentMethod: 'stripe'
          }
        })

        if (existingPurchase) {
          console.log('[STRIPE_WEBHOOK] Purchase already exists:', existingPurchase.id)
          return NextResponse.json({ received: true, existing: true })
        }

        // Create digital purchase record
        const licenseKey = generateLicenseKey()
        const purchase = await prisma.digitalPurchase.create({
          data: {
            userId,
            productId,
            purchasePrice: parseFloat(productPrice) / 100, // Convert from cents
            paymentMethod: 'stripe',
            licenseKey,
            downloadsRemaining: 3,
            totalDownloads: 0,
            isActive: true
          }
        })

        // Send confirmation email (would integrate with email service)
        console.log('[STRIPE_WEBHOOK] Digital purchase created:', {
          purchaseId: purchase.id,
          licenseKey: purchase.licenseKey,
          userId,
          productId
        })

      } catch (error) {
        console.error('[STRIPE_WEBHOOK] Error creating purchase:', error)
        return NextResponse.json(
          { error: 'Failed to create purchase record' },
          { status: 500 }
        )
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.log('[STRIPE_WEBHOOK] Payment failed:', failedPayment.id)
      break

    default:
      console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
