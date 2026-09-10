import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
}

// Webhook to notify Grapsee when seller is approved
async function sendSellerWebhook(event: string, seller: any, actor: string, metadata?: any) {
  const webhookUrl = process.env.SHOP_WEBHOOK_URL || 'https://grapsee.com/api/webhooks/seller'
  const webhookSecret = process.env.GRAPSEE_WEBHOOK_SECRET
  
  if (!webhookUrl || !webhookSecret) {
    console.log('[WEBHOOK] Skipping - no webhook URL or secret configured')
    return
  }
  
  try {
    const payload = {
      event,
      sellerId: seller.id,
      timestamp: new Date().toISOString(),
      data: {
        businessName: seller.onboarding?.businessName || seller.name,
        ...(event === 'seller.approved' && { approvedBy: actor }),
        ...(event === 'seller.rejected' && { rejectedBy: actor, reason: metadata?.reason }),
      },
    }
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      },
      body: JSON.stringify(payload),
    })
    
    console.log(`[WEBHOOK] Sent ${event} for seller ${seller.id}`)
  } catch (error) {
    console.error(`[WEBHOOK] Failed to send ${event}:`, error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify request using X-API-Key
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.GRAPSEE_SHOP_API_KEY
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { approvedBy, notes } = body

    // Find seller with onboarding details
    const seller = await prisma.seller.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        onboarding: true,
      },
    })

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' }, 
        { status: 404, headers: corsHeaders }
      )
    }

    // Update seller status
    const updatedSeller = await prisma.seller.update({
      where: { id },
      data: {
        onboardingStatus: 'approved',
        isOnboarded: true,
        verificationBadge: 'verified',
        isVerified: true,
      },
    })

    // Update onboarding record with notes
    await prisma.sellerOnboarding.update({
      where: { sellerId: id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: approvedBy,
        notes: notes || undefined,
      },
    })

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: seller.userId!,
        type: 'seller',
        title: 'Seller Application Approved! ',
        message: `Congratulations! Your seller application has been approved. You can now start selling on Grapsee.`,
        linkUrl: '/seller-center',
      },
    })

    // Send webhook to Grapsee
    await sendSellerWebhook('seller.approved', seller, approvedBy || 'system')

    // Log for admin audit
    console.log(`[ADMIN] Seller ${id} approved by ${approvedBy || 'system'}`, {
      notes,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      sellerId: updatedSeller.id,
      status: 'approved',
      updatedAt: updatedSeller.verifiedAt?.toISOString(),
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error approving seller:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve seller' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}
