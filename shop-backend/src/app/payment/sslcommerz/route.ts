import { NextRequest, NextResponse } from 'next/server'

const SSLCOMMERZ_URL =
  process.env.SSLCOMMERZ_IS_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

// POST /api/payment/sslcommerz Initiate SSLCommerz payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      amount,
      currency = 'BDT',
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
    } = body

    if (!orderId || !amount || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'orderId, amount, customerName, customerEmail are required' },
        { status: 400 }
      )
    }

    const storeId = process.env.SSLCOMMERZ_STORE_ID
    const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD

    if (!storeId || !storePassword) {
      return NextResponse.json(
        { error: 'SSLCommerz is not configured. Please add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD.' },
        { status: 503 }
      )
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: String(amount),
      currency,
      tran_id: orderId,
      success_url: `${appUrl}/api/payment/sslcommerz/callback?status=success&orderId=${orderId}`,
      fail_url: `${appUrl}/api/payment/sslcommerz/callback?status=fail&orderId=${orderId}`,
      cancel_url: `${appUrl}/api/payment/sslcommerz/callback?status=cancel&orderId=${orderId}`,
      cus_name: customerName,
      cus_email: customerEmail,
      cus_phone: customerPhone || 'N/A',
      cus_add1: customerAddress || 'N/A',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: `Grapsee Order #${orderId}`,
      product_category: 'Digital Services',
      product_profile: 'general',
    })

    const res = await fetch(SSLCOMMERZ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await res.json()

    if (data.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        gatewayPageURL: data.GatewayPageURL,
        sessionKey: data.sessionkey,
      })
    }

    return NextResponse.json(
      { error: data.failedreason || 'SSLCommerz initiation failed' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[SSLCOMMERZ_POST]', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}
