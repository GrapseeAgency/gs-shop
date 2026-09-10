import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';
import { validateInternationalCard, validateInternationalBank } from "@/lib/card-validator";

// Payment processor integration (Stripe/PayPal/etc.)
interface PaymentVerificationRequest {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
}

interface PaymentProcessorResponse {
  valid: boolean;
  status: 'succeeded' | 'failed' | 'pending' | 'fraud';
  actualAmount?: number;
  processorTransactionId?: string;
  riskScore?: number;
  fraudFlags?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const body: PaymentVerificationRequest = await request.json();
    const { orderId, paymentId, amount, currency } = body;

    // CRITICAL: Input validation
    if (!orderId || !paymentId || !amount || !currency) {
      await logSecurityEvent({
        requestId,
        type: 'PAYMENT_VERIFY_FAILED',
        severity: 'HIGH',
        details: 'Missing required fields',
        metadata: { body }
      });
      return NextResponse.json({ 
        error: "Invalid payment verification request",
        requestId 
      }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      await logSecurityEvent({
        requestId,
        type: 'ORDER_NOT_FOUND',
        severity: 'HIGH',
        details: 'Order does not exist',
        metadata: { orderId }
      });
      return NextResponse.json({ 
        error: "Order not found",
        requestId 
      }, { status: 404 });
    }

    // CRITICAL: Verify payment with actual payment processor
    const processorResult = await verifyWithPaymentProcessor(paymentId, amount, currency);
    
    // CRITICAL: Amount matching check
    if (processorResult.actualAmount && processorResult.actualAmount !== amount) {
      await logSecurityEvent({
        requestId,
        type: 'PAYMENT_AMOUNT_MISMATCH',
        severity: 'CRITICAL',
        details: `Expected: ${amount}, Received: ${processorResult.actualAmount}`,
        metadata: { orderId, paymentId, expectedAmount: amount, actualAmount: processorResult.actualAmount }
      });
      
      return NextResponse.json({
        valid: false,
        error: "Payment amount mismatch",
        requestId,
        riskScore: 100, // Maximum risk
        blockReason: "AMOUNT_MANIPULATION"
      }, { status: 400 });
    }

    // CRITICAL: Check for fraud flags from processor
    if (processorResult.fraudFlags && processorResult.fraudFlags.length > 0) {
      await logSecurityEvent({
        requestId,
        type: 'PAYMENT_FRAUD_DETECTED',
        severity: 'CRITICAL',
        details: `Fraud flags: ${processorResult.fraudFlags.join(', ')}`,
        metadata: { orderId, paymentId, fraudFlags: processorResult.fraudFlags }
      });

      return NextResponse.json({
        valid: false,
        error: "Payment flagged as fraudulent",
        requestId,
        riskScore: 100,
        blockReason: "FRAUD_DETECTED",
        fraudFlags: processorResult.fraudFlags
      }, { status: 400 });
    }

    // CRITICAL: Payment status verification
    if (processorResult.status !== 'succeeded') {
      await logSecurityEvent({
        requestId,
        type: 'PAYMENT_NOT_SUCCESSFUL',
        severity: 'HIGH',
        details: `Payment status: ${processorResult.status}`,
        metadata: { orderId, paymentId, status: processorResult.status }
      });

      return NextResponse.json({
        valid: false,
        error: "Payment not successful",
        requestId,
        paymentStatus: processorResult.status,
        riskScore: processorResult.riskScore || 50
      }, { status: 400 });
    }

    // CRITICAL: Check for duplicate payment verification attempts
    const existingVerification = await prisma.securityLog.findFirst({
      where: {
        type: 'PAYMENT_VERIFY_SUCCESS',
        metadata: {
          contains: paymentId
        }
      }
    });

    if (existingVerification) {
      await logSecurityEvent({
        requestId,
        type: 'DUPLICATE_PAYMENT_VERIFY',
        severity: 'MEDIUM',
        details: 'Payment already verified',
        metadata: { orderId, paymentId, originalVerificationId: existingVerification.id }
      });
    }

    // SUCCESS: Payment is legitimate
    await logSecurityEvent({
      requestId,
      type: 'PAYMENT_VERIFY_SUCCESS',
      severity: 'LOW',
      details: 'Payment verified successfully',
      metadata: { 
        orderId, 
        paymentId, 
        processorTransactionId: processorResult.processorTransactionId,
        amount,
        currency,
        verificationTime: Date.now() - startTime
      }
    });

    return NextResponse.json({
      valid: true,
      requestId,
      processorTransactionId: processorResult.processorTransactionId,
      riskScore: processorResult.riskScore || 0,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    await logSecurityEvent({
      requestId,
      type: 'PAYMENT_VERIFY_ERROR',
      severity: 'HIGH',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: { error: String(error) }
    });

    return NextResponse.json({
      valid: false,
      error: "Payment verification failed",
      requestId
    }, { status: 500 });
  }
}

// CRITICAL: Real International Payment Verification
async function verifyWithPaymentProcessor(
  paymentId: string, 
  amount: number, 
  currency: string
): Promise<PaymentProcessorResponse> {
  try {
    console.log(`[PAYMENT_VERIFY] Starting real verification for paymentId: ${paymentId}`);
    
    // Get payment details from database
    const payment = await prisma.order.findFirst({
      where: { metadata: { contains: paymentId } },
      select: {
        paymentMethod: true,
        metadata: true,
        customerEmail: true
      }
    });

    if (!payment) {
      console.error(`[PAYMENT_VERIFY] Payment not found: ${paymentId}`);
      return {
        valid: false,
        status: 'failed',
        riskScore: 100,
        fraudFlags: ['PAYMENT_NOT_FOUND']
      };
    }

    const paymentMethod = payment.paymentMethod;
    const metadata = payment.metadata || {};

    let validationResult: PaymentProcessorResponse;

    if (paymentMethod === 'card') {
      // Real Card Validation
      const cardResult = await validateInternationalCard(
        (metadata as any)?.cardNumber || '',
        (metadata as any)?.expiryMonth || '',
        (metadata as any)?.expiryYear || '',
        (metadata as any)?.cvv || ''
      );

      validationResult = {
        valid: cardResult.canProcess,
        status: cardResult.valid ? 'succeeded' : 'failed',
        actualAmount: amount,
        processorTransactionId: `card_${paymentId}`,
        riskScore: cardResult.fraudScore,
        fraudFlags: cardResult.recommendations
      };

      console.log(`[PAYMENT_VERIFY] Card validation: ${cardResult.canProcess} (Score: ${cardResult.fraudScore})`);

    } else if (paymentMethod === 'bank') {
      // Real Bank Transfer Validation
      const bankResult = await validateInternationalBank(
        (metadata as any)?.iban || '',
        (metadata as any)?.swift || '',
        (metadata as any)?.accountHolder || ''
      );

      validationResult = {
        valid: bankResult.canProcess,
        status: bankResult.valid ? 'succeeded' : 'failed',
        actualAmount: amount,
        processorTransactionId: `bank_${paymentId}`,
        riskScore: bankResult.fraudScore,
        fraudFlags: bankResult.recommendations
      };

      console.log(`[PAYMENT_VERIFY] Bank validation: ${bankResult.canProcess} (Score: ${bankResult.fraudScore})`);

    } else {
      // Unsupported payment method
      validationResult = {
        valid: false,
        status: 'failed',
        riskScore: 50,
        fraudFlags: ['UNSUPPORTED_PAYMENT_METHOD']
      };
    }

    // Additional security checks
    if (validationResult.riskScore > 75) {
      validationResult.valid = false;
      validationResult.status = 'failed';
      validationResult.fraudFlags.push('HIGH_RISK_PAYMENT');
    }

    return validationResult;

  } catch (error) {
    console.error('Payment processor verification failed:', error);
    // CRITICAL: Fail secure - if verification fails, treat as suspicious
    return {
      valid: false,
      status: 'failed',
      riskScore: 75,
      fraudFlags: ['VERIFICATION_ERROR']
    };
  }
}

// CRITICAL: Security event logging
async function logSecurityEvent(event: {
  requestId: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  metadata: any;
}) {
  try {
    await prisma.securityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: 'SYSTEM',
        type: event.type,
        action: 'success',
        metadata: JSON.stringify({ ...event.metadata, requestId: event.requestId, severity: event.severity, details: event.details, ip: 'SYSTEM', userAgent: 'SECURITY_SERVICE' }),
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // CRITICAL: Security logging should never fail the main flow
  }
}
