import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/orders?userId=xxx or ?email=xxx List orders by userId or email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { error: "userId or email parameter is required" },
        { status: 400 },
      );
    }

    let where: any = {};
    if (userId) {
      where = { userId };
    } else if (email) {
      // Find user by email first, then get their orders
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true }
      });
      if (user) {
        where = { userId: user.id };
      } else {
        // Fallback: search by customerEmail for guest orders
        where = { customerEmail: email };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST /api/orders Create a new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      userId,
      customerPhone,
      paymentMethod,
      couponCode,
      discount,
      discountAmount,
      shippingCost,
      notes,
      shippingAddress,
      items,
    } = body;

    const resolvedDiscount = discount ?? discountAmount ?? 0;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: customerName and items are required",
        },
        { status: 400 },
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );
    const total = subtotal - (resolvedDiscount || 0) + (shippingCost || 0);

    const order = await prisma.order.create({
      data: {
        customerName,
        customerEmail: customerEmail || null,
        user: userId ? { connect: { id: userId } } : undefined,
        customerPhone: customerPhone || null,
        paymentMethod: paymentMethod || null,
        couponCode: couponCode || null,
        discount: resolvedDiscount,
        notes: notes || null,
        shippingAddress: shippingAddress || null,
        total,
        status: "pending",
        items: {
          create: items.map(
            (item: {
              productId: string;
              productName: string;
              price: number;
              quantity: number;
              imageUrl?: string;
            }) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || null,
            }),
          ),
        },
      },
      include: { items: true },
    });

    // If coupon was used, increment usage count
    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Note: Products are NOT marked as sold here.
    // Payment APIs (/api/payment/card, /api/payment/bank-transfer) handle inventory
    // and isSold status AFTER successful payment to prevent marking sold without payment.

    // Notify Grapsee.com to send email receipt (Phase VI Email Receipt Handover)
    try {
      const grapseeEmailUrl = process.env.GRAPSEE_EMAIL_RECEIPT_URL;
      if (grapseeEmailUrl) {
        const emailPayload = {
          shopOrderId: order.id,
          customerEmail: customerEmail,
          customerName: customerName,
          totalAmount: total,
          currency: "USD",
          paymentMethod: paymentMethod,
          items: items.map((item: { productId: string; productName: string; quantity: number; price: number }) => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
          orderDate: order.createdAt,
          shopName: "Grapsee Shop",
          shopDomain: "shop.grapsee.com",
          timestamp: new Date().toISOString(),
        };

        await fetch(grapseeEmailUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Grapsee-Shop-Key": process.env.GRAPSEE_SHOP_API_KEY || "",
            "X-Grapsee-Signature": process.env.GRAPSEE_WEBHOOK_SECRET || "",
          },
          body: JSON.stringify(emailPayload),
        });
      }
    } catch (emailError) {
      // Non-blocking: log error but don't fail order creation
      console.error("Failed to notify Grapsee for email receipt:", emailError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
