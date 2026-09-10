import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-API-Key, Content-Type, X-Webhook-Secret',
}

// POST - Webhook to notify main Grapsee admin when seller submits application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, event = 'submitted' } = body

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: 'Seller ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get full seller details
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        onboarding: true,
        documents: true,
      },
    })

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Prepare payload for main Grapsee admin
    const webhookPayload = {
      event: 'seller.submitted',
      timestamp: new Date().toISOString(),
      data: {
        sellerId: seller.id,
        businessName: seller.onboarding?.businessName || seller.name,
        email: seller.user?.email,
      },
    }

    // Send to main Grapsee webhook (if configured)
    const grapseeWebhookUrl = process.env.SHOP_WEBHOOK_URL || 'https://grapsee.com/api/webhooks/seller'
    const webhookSecret = process.env.GRAPSEE_WEBHOOK_SECRET
    
    if (grapseeWebhookUrl && webhookSecret) {
      try {
        const response = await fetch(grapseeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhookSecret,
          },
          body: JSON.stringify(webhookPayload),
        })

        if (!response.ok) {
          console.error('Failed to notify Grapsee admin:', await response.text())
        } else {
          console.log(`[WEBHOOK] Sent seller.submitted for ${seller.id}`)
        }
      } catch (error) {
        console.error('Error sending webhook to Grapsee:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed',
      payload: webhookPayload,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error processing seller application webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}
