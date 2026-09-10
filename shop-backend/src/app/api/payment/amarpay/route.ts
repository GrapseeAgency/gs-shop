import { NextRequest, NextResponse } from "next/server";

// aamarPay integration for Bangladesh payments
// Docs: https://aamarpay.readme.io/reference/initiate-payment-json

const getAmarPayConfig = () => {
  const isSandbox = process.env.AMARPAY_SANDBOX !== "false";
  return {
    baseUrl: isSandbox
      ? "https://sandbox.aamarpay.com/jsonpost.php"
      : "https://secure.aamarpay.com/jsonpost.php",
    storeId: process.env.AMARPAY_STORE_ID || "aamarpaytest",
    signatureKey:
      process.env.AMARPAY_SIGNATURE_KEY ||
      "dbb74894e82415a2f7ff0ec3a97e4183",
    isSandbox,
  };
};

// POST /api/payment/amarpay Initiate payment and return gateway URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      currency = "BDT",
      customerEmail,
      customerName,
      customerPhone,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const config = getAmarPayConfig();
    const baseUrl =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Generate unique transaction ID
    const tranId = `ORD_${orderId}_${Date.now()}`;

    const payload = {
      store_id: config.storeId,
      signature_key: config.signatureKey,
      tran_id: tranId,
      success_url: `${baseUrl}/api/payment/amarpay/callback?status=success&orderId=${orderId}`,
      fail_url: `${baseUrl}/api/payment/amarpay/callback?status=fail&orderId=${orderId}`,
      cancel_url: `${baseUrl}/checkout`,
      amount: amount.toFixed(2),
      currency: currency,
      desc: `Order #${orderId} - Grapsee Shop`,
      cus_name: customerName || "Customer",
      cus_email: customerEmail || "customer@example.com",
      cus_phone: customerPhone || "+8801XXXXXXXXX",
      cus_add1: "Dhaka",
      cus_add2: "Bangladesh",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1206",
      cus_country: "Bangladesh",
      type: "json",
    };

    const response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AMARPAY_ERROR]", errorText);
      return NextResponse.json(
        { error: "Failed to initiate aamarPay payment" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // aamarPay returns { result: "true", payment_url: "..." }
    if (data.result === "true" && data.payment_url) {
      return NextResponse.json({
        gatewayPageURL: data.payment_url,
        tranId: tranId,
        orderId: orderId,
      });
    }

    console.error("[AMARPAY_ERROR]", data);
    return NextResponse.json(
      { error: data.message || "aamarPay initiation failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[AMARPAY_CREATE_PAYMENT]", error);
    return NextResponse.json(
      { error: "Failed to create aamarPay payment" },
      { status: 500 }
    );
  }
}
