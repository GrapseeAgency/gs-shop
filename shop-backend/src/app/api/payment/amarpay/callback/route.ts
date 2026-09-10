import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment/amarpay/callback Handle payment callback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const baseUrl =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    if (!orderId) {
      return NextResponse.redirect(`${baseUrl}/checkout?error=invalid_order`);
    }

    if (status === "success") {
      // Update order status to paid
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "processing" },
        });
      } catch {
        // Order might not exist or already updated, continue to success
      }

      return NextResponse.redirect(
        `${baseUrl}/order-success?id=${orderId}`
      );
    }

    // Fail or cancel
    return NextResponse.redirect(
      `${baseUrl}/checkout?error=payment_${status}`
    );
  } catch (error) {
    console.error("[AMARPAY_CALLBACK_ERROR]", error);
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/checkout?error=callback_failed`);
  }
}
