import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payment/sslcommerz/callback SSLCommerz redirects here after payment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const orderId = searchParams.get('orderId')

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (status === 'success' && orderId) {
    try {
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { status: 'processing', paymentMethod: 'sslcommerz' },
      })
    } catch {
      // Log but don't block redirect
    }
    return NextResponse.redirect(`${appUrl}/order-success?id=${orderId}`)
  }

  if (status === 'fail' || status === 'cancel') {
    return NextResponse.redirect(`${appUrl}/checkout?payment_failed=1`)
  }

  return NextResponse.redirect(`${appUrl}/`)
}

// POST /api/payment/sslcommerz/callback IPN notification
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tranId = formData.get('tran_id') as string
    const status = formData.get('status') as string

    if (status === 'VALID' && tranId) {
      await prisma.order.updateMany({
        where: { id: tranId },
        data: { status: 'processing', paymentMethod: 'sslcommerz' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[SSLCOMMERZ_IPN]', error)
    return NextResponse.json({ error: 'IPN processing failed' }, { status: 500 })
  }
}
