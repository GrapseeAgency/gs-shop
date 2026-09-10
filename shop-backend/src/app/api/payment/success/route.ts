import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface PaymentSuccessRequest {
  orderId: string;
  paymentId: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    // Skip authentication for testing - remove this in production
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body: PaymentSuccessRequest = await request.json();
    const { orderId, paymentId, customerEmail, totalAmount, currency } = body;

    // Input validation
    if (!orderId || !paymentId || !customerEmail || !totalAmount || !currency) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["orderId", "paymentId", "customerEmail", "totalAmount", "currency"]
      }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Skip user verification for testing - remove this in production
    // if (order.customerEmail !== (session.user as any).email) {
    // return NextResponse.json({ error: "Unauthorized order access" }, { status: 403 });
    // }

    // Update order status to completed
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
        updatedAt: new Date()
      }
    });

    // Send email receipt via Grapsee.com
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailPayload = {
        shopOrderId: orderId,
        customerEmail: customerEmail,
        customerName: order.customerName || "Valued Customer",
        totalAmount: totalAmount,
        currency: currency,
        paymentMethod: order.paymentMethod || "card",
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        // Required fields by Grapsee API
        orderDate: order.createdAt.toISOString(),
        shopName: "Grapsee Shop",
        shopDomain: "shop.grapsee.com"
      };

      // Use env var for email receipt URL
      const emailUrl = process.env.GRAPSEE_EMAIL_RECEIPT_URL || 'http://localhost:3001/api/shop/email-receipt';

      const emailResponse = await fetch(emailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-grapsee-shop-key': process.env.GRAPSEE_SHOP_API_KEY || 'gsa_I0wRUXcdjVNvZupfIm7UBchuE1cG4E54',
          'x-request-id': requestId
        },
        body: JSON.stringify(emailPayload)
      });

      if (emailResponse.ok) {
        emailSent = true;
        console.log(`[EMAIL_RECEIPT] Sent successfully to ${customerEmail}`);
      } else {
        emailError = `Email API error: ${emailResponse.status}`;
        console.error(`[EMAIL_RECEIPT] Failed: ${emailResponse.status}`);
      }
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Unknown email error';
      console.error('[EMAIL_RECEIPT] Error:', error);
    }

    // Send mobile notification
    let notificationSent = false;
    let notificationError = null;
    
    try {
      const notificationPayload = {
        userId: customerEmail,
        title: "Payment Successful!",
        message: `Your order ${orderId} has been confirmed. Total: ${currency} ${totalAmount}`,
        type: "PAYMENT_SUCCESS",
        data: {
          orderId: orderId,
          totalAmount: totalAmount,
          currency: currency,
          timestamp: new Date().toISOString()
        },
        priority: "high",
        icon: "",
        requestId: requestId
      };

      // Use mobile push notification service
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(notificationPayload)
      });

      if (notificationResponse.ok) {
        notificationSent = true;
        console.log(`[MOBILE_NOTIFICATION] Sent successfully to user`);
      } else {
        notificationError = `Notification API error: ${notificationResponse.status}`;
        console.error(`[MOBILE_NOTIFICATION] Failed: ${notificationResponse.status}`);
      }
    } catch (error) {
      notificationError = error instanceof Error ? error.message : 'Unknown notification error';
      console.error('[MOBILE_NOTIFICATION] Error:', error);
    }

    // Log success event
    await prisma.securityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: customerEmail, // Use customer email instead of session
        type: 'PAYMENT_SUCCESS_COMPLETED',
        action: 'success',
        metadata: JSON.stringify({
          requestId,
          orderId,
          customerEmail,
          totalAmount,
          currency,
          emailSent,
          notificationSent,
          emailError,
          notificationError,
          processingTime: Date.now() - startTime
        }),
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment success processed",
      requestId,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        total: updatedOrder.total,
        createdAt: updatedOrder.createdAt
      },
      notifications: {
        email: {
          sent: emailSent,
          error: emailError
        },
        mobile: {
          sent: notificationSent,
          error: notificationError
        }
      },
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Payment success processing error:', error);
    
    // Log error
    await prisma.securityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: 'SYSTEM',
        type: 'PAYMENT_SUCCESS_ERROR',
        action: 'error',
        metadata: JSON.stringify({
          requestId,
          error: error instanceof Error ? error.message : 'Unknown error',
          body: await request.clone().json().catch(() => 'Invalid JSON')
        }),
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      error: "Payment success processing failed",
      requestId,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
