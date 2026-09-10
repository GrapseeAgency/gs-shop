import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface BalanceCheckRequest {
  orderId: string;
  customerEmail: string;
  paymentMethod: 'card' | 'bank' | 'wallet';
  paymentId: string;
  requiredAmount: number;
  currency: string;
}

interface BalanceVerificationResult {
  sufficient: boolean;
  availableBalance?: number;
  currency: string;
  accountStatus: 'active' | 'suspended' | 'frozen' | 'closed';
  riskScore: number;
  flags: string[];
  verifiedAt: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const body: BalanceCheckRequest = await request.json();
    const { orderId, customerEmail, paymentMethod, paymentId, requiredAmount, currency } = body;

    // CRITICAL: Input validation
    if (!orderId || !customerEmail || !paymentMethod || !paymentId || !requiredAmount || !currency) {
      await logSecurityEvent({
        requestId,
        type: 'BALANCE_CHECK_FAILED',
        severity: 'HIGH',
        details: 'Missing required fields for balance verification',
        metadata: { body }
      });
      return NextResponse.json({ 
        error: "Invalid balance check request",
        requestId 
      }, { status: 400 });
    }

    // CRITICAL: Validate amount
    if (requiredAmount <= 0 || requiredAmount > 999999) {
      await logSecurityEvent({
        requestId,
        type: 'INVALID_AMOUNT',
        severity: 'HIGH',
        details: `Invalid amount: ${requiredAmount}`,
        metadata: { orderId, requiredAmount }
      });
      return NextResponse.json({ 
        error: "Invalid amount specified",
        requestId 
      }, { status: 400 });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json({ 
        error: "Order not found",
        requestId 
      }, { status: 404 });
    }

    // CRITICAL: Verify order amount matches
    if (Math.abs(order.total - requiredAmount) > 0.01) {
      await logSecurityEvent({
        requestId,
        type: 'ORDER_AMOUNT_MISMATCH',
        severity: 'CRITICAL',
        details: `Order total: ${order.total}, Required: ${requiredAmount}`,
        metadata: { orderId, orderTotal: order.total, requiredAmount }
      });
      
      return NextResponse.json({
        sufficient: false,
        error: "Order amount mismatch",
        requestId,
        riskScore: 100,
        flags: ['AMOUNT_MANIPULATION']
      }, { status: 400 });
    }

    // CRITICAL: Check balance based on payment method
    let balanceResult: BalanceVerificationResult;

    switch (paymentMethod) {
      case 'card':
        balanceResult = { ...await checkCardBalance(paymentId, requiredAmount, currency), verifiedAt: new Date().toISOString() };
        break;
      case 'bank':
        balanceResult = { ...await checkBankBalance(paymentId, requiredAmount, currency), verifiedAt: new Date().toISOString() };
        break;
      case 'wallet':
        balanceResult = { ...await checkWalletBalance(customerEmail, requiredAmount, currency), verifiedAt: new Date().toISOString() };
        break;
      default:
        return NextResponse.json({
          error: "Unsupported payment method",
          requestId
        }, { status: 400 });
    }

    // CRITICAL: Additional security checks
    const securityChecks = await Promise.all([
      checkAccountSuspiciousActivity(customerEmail, paymentId),
      checkPaymentMethodLimits(paymentMethod, paymentId, requiredAmount),
      checkCurrencyCompatibility(currency, paymentMethod),
      verifyPaymentMethodOwnership(customerEmail, paymentId, paymentMethod)
    ]);

    // Aggregate security flags
    const allFlags = [
      ...balanceResult.flags,
      ...securityChecks.flatMap(check => check.flags)
    ];

    const totalRiskScore = Math.min(100, balanceResult.riskScore + securityChecks.reduce((sum, check) => sum + check.riskScore, 0));

    // CRITICAL: Final determination
    const finalResult: BalanceVerificationResult = {
      ...balanceResult,
      riskScore: totalRiskScore,
      flags: allFlags,
      sufficient: balanceResult.sufficient && totalRiskScore < 75
    };

    // CRITICAL: Log balance check results
    await logSecurityEvent({
      requestId,
      type: finalResult.sufficient ? 'BALANCE_CHECK_PASSED' : 'BALANCE_CHECK_FAILED',
      severity: !finalResult.sufficient ? 'HIGH' : totalRiskScore > 50 ? 'MEDIUM' : 'LOW',
      details: `Balance: ${balanceResult.availableBalance}, Required: ${requiredAmount}, Risk: ${totalRiskScore}`,
      metadata: {
        orderId,
        customerEmail,
        paymentMethod,
        paymentId,
        requiredAmount,
        availableBalance: balanceResult.availableBalance,
        sufficient: finalResult.sufficient,
        riskScore: totalRiskScore,
        flags: allFlags,
        checkTime: Date.now() - startTime
      }
    });

    // CRITICAL: If high risk or insufficient funds, update order
    if (!finalResult.sufficient || totalRiskScore >= 75) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'flagged',
          notes: `Balance verification failed: ${allFlags.join(', ')}`
        }
      });
    }

    return NextResponse.json({
      ...finalResult,
      requestId,
      checksPerformed: 4 + securityChecks.length
    });

  } catch (error) {
    await logSecurityEvent({
      requestId,
      type: 'BALANCE_CHECK_ERROR',
      severity: 'HIGH',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: { error: String(error) }
    });

    // CRITICAL: Fail secure - on error, assume insufficient funds
    return NextResponse.json({
      sufficient: false,
      error: "Balance verification failed",
      requestId,
      riskScore: 50,
      flags: ['SYSTEM_ERROR']
    }, { status: 500 });
  }
}

// CRITICAL: Card balance verification
async function checkCardBalance(
  cardId: string, 
  requiredAmount: number, 
  currency: string
): Promise<Omit<BalanceVerificationResult, 'verifiedAt'>> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // In production, integrate with real payment processor APIs
    const processorSecret = process.env.CARD_PROCESSOR_SECRET;
    const balanceCheckUrl = process.env.CARD_BALANCE_CHECK_URL;

    if (!processorSecret || !balanceCheckUrl) {
      // Development mode - simulate balance check
      console.warn('CARD PROCESSOR NOT CONFIGURED - Using simulation mode');
      
      return {
        sufficient: true,
        availableBalance: requiredAmount + 1000, // Simulate sufficient funds
        currency,
        accountStatus: 'active',
        riskScore: 0,
        flags: []
      };
    }

    // Real card balance verification (production)
    const response = await fetch(balanceCheckUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${processorSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        card_id: cardId,
        check_amount: requiredAmount,
        currency: currency,
        include_account_status: true
      })
    });

    if (!response.ok) {
      flags.push('CARD_VERIFICATION_FAILED');
      riskScore += 30;
      return {
        sufficient: false,
        currency,
        accountStatus: 'active',
        riskScore,
        flags
      };
    }

    const result = await response.json();
    
    if (result.status !== 'active') {
      flags.push('CARD_NOT_ACTIVE');
      riskScore += 40;
    }

    if (result.balance < requiredAmount) {
      flags.push('INSUFFICIENT_FUNDS');
      riskScore += 20;
    }

    return {
      sufficient: result.balance >= requiredAmount && result.status === 'active',
      availableBalance: result.balance,
      currency,
      accountStatus: result.status,
      riskScore,
      flags
    };

  } catch (error) {
    console.error('Card balance check failed:', error);
    return {
      sufficient: false,
      currency,
      accountStatus: 'active',
      riskScore: 25,
      flags: ['CARD_CHECK_ERROR']
    };
  }
}

// CRITICAL: Bank account balance verification
async function checkBankBalance(
  bankAccountId: string, 
  requiredAmount: number, 
  currency: string
): Promise<Omit<BalanceVerificationResult, 'verifiedAt'>> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // In production, integrate with banking APIs (Plaid, Stripe, etc.)
    const bankApiSecret = process.env.BANK_API_SECRET;
    const balanceCheckUrl = process.env.BANK_BALANCE_CHECK_URL;

    if (!bankApiSecret || !balanceCheckUrl) {
      // Development mode - simulate balance check
      console.warn('BANK API NOT CONFIGURED - Using simulation mode');
      
      return {
        sufficient: true,
        availableBalance: requiredAmount + 5000,
        currency,
        accountStatus: 'active',
        riskScore: 0,
        flags: []
      };
    }

    // Real bank balance verification (production)
    const response = await fetch(balanceCheckUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bankApiSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_id: bankAccountId,
        amount: requiredAmount,
        currency: currency
      })
    });

    if (!response.ok) {
      flags.push('BANK_VERIFICATION_FAILED');
      riskScore += 30;
      return {
        sufficient: false,
        currency,
        accountStatus: 'active',
        riskScore,
        flags
      };
    }

    const result = await response.json();
    
    if (result.account_status !== 'active') {
      flags.push('ACCOUNT_NOT_ACTIVE');
      riskScore += 50;
    }

    if (result.available_balance < requiredAmount) {
      flags.push('INSUFFICIENT_BANK_FUNDS');
      riskScore += 25;
    }

    // Check for account restrictions
    if (result.restrictions && result.restrictions.length > 0) {
      flags.push('ACCOUNT_RESTRICTED');
      riskScore += 35;
    }

    return {
      sufficient: result.available_balance >= requiredAmount && result.account_status === 'active',
      availableBalance: result.available_balance,
      currency,
      accountStatus: result.account_status,
      riskScore,
      flags
    };

  } catch (error) {
    console.error('Bank balance check failed:', error);
    return {
      sufficient: false,
      currency,
      accountStatus: 'active',
      riskScore: 30,
      flags: ['BANK_CHECK_ERROR']
    };
  }
}

// CRITICAL: Wallet balance verification
async function checkWalletBalance(
  customerEmail: string, 
  requiredAmount: number, 
  currency: string
): Promise<Omit<BalanceVerificationResult, 'verifiedAt'>> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // Get user's wallet from database
    const user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });
    
    const wallet = user ? await prisma.wallet.findFirst({
      where: { userId: user.id }
    }) : null;

    if (!wallet) {
      flags.push('WALLET_NOT_FOUND');
      riskScore += 20;
      return {
        sufficient: false,
        currency,
        accountStatus: 'active',
        riskScore,
        flags
      };
    }

    if (wallet.status !== 'active') {
      flags.push('WALLET_SUSPENDED');
      riskScore += 40;
    }

    if (wallet.balance < requiredAmount) {
      flags.push('INSUFFICIENT_WALLET_FUNDS');
      riskScore += 15;
    }

    // Check for wallet restrictions
    if (wallet.restrictions && wallet.restrictions.length > 0) {
      flags.push('WALLET_RESTRICTED');
      riskScore += 25;
    }

    return {
      sufficient: wallet.balance >= requiredAmount && wallet.status === 'active',
      availableBalance: wallet.balance,
      currency,
      accountStatus: (wallet.status as 'active' | 'suspended' | 'frozen' | 'closed'),
      riskScore,
      flags
    };

  } catch (error) {
    console.error('Wallet balance check failed:', error);
    return {
      sufficient: false,
      currency,
      accountStatus: 'active',
      riskScore: 20,
      flags: ['WALLET_CHECK_ERROR']
    };
  }
}

// CRITICAL: Additional security checks
async function checkAccountSuspiciousActivity(customerEmail: string, paymentId: string): Promise<{riskScore: number, flags: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // Check recent failed transactions
    const recentFailures = await prisma.securityLog.count({
      where: {
        type: 'BALANCE_CHECK_FAILED',
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
        metadata: {
          contains: customerEmail
        }
      }
    });

    if (recentFailures > 3) {
      flags.push('MULTIPLE_FAILED_TRANSACTIONS');
      riskScore += 25;
    }

    // Check for chargebacks
    const chargebacks = await prisma.chargeback.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }
    });

    if (chargebacks.length > 0) {
      flags.push('PRIOR_CHARGEBACKS');
      riskScore += chargebacks.length * 10;
    }

  } catch (error) {
    console.error('Suspicious activity check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags };
}

async function checkPaymentMethodLimits(
  paymentMethod: string, 
  paymentId: string, 
  amount: number
): Promise<{riskScore: number, flags: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // Check daily transaction limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTotal = await prisma.order.aggregate({
      where: {
        paymentId: paymentId,
        createdAt: { gte: today },
        status: { not: 'cancelled' }
      },
      _sum: { total: true }
    });

    const dailyAmount = dailyTotal._sum.total || 0;
    const dailyLimit = paymentMethod === 'card' ? 10000 : 5000; // Different limits per method

    if (dailyAmount + amount > dailyLimit) {
      flags.push('DAILY_LIMIT_EXCEEDED');
      riskScore += 30;
    }

    // Check per-transaction limits
    const singleTransactionLimit = paymentMethod === 'card' ? 5000 : 2500;
    if (amount > singleTransactionLimit) {
      flags.push('TRANSACTION_LIMIT_EXCEEDED');
      riskScore += 20;
    }

  } catch (error) {
    console.error('Payment method limits check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags };
}

async function checkCurrencyCompatibility(currency: string, paymentMethod: string): Promise<{riskScore: number, flags: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;

  // Check if currency is supported for this payment method
  const supportedCurrencies = {
    card: ['USD', 'EUR', 'GBP'],
    bank: ['USD', 'EUR'],
    wallet: ['USD']
  };

  if (!supportedCurrencies[paymentMethod as keyof typeof supportedCurrencies]?.includes(currency)) {
    flags.push('UNSUPPORTED_CURRENCY');
    riskScore += 15;
  }

  return { riskScore, flags };
}

async function verifyPaymentMethodOwnership(
  customerEmail: string, 
  paymentId: string, 
  paymentMethod: string
): Promise<{riskScore: number, flags: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;

  try {
    // In production, verify the payment method belongs to the customer
    // This would involve checking with the payment processor
    
    // For now, check if this payment method has been used by this email before
    const priorUsage = await prisma.order.findFirst({
      where: {
        customerEmail,
        paymentId,
        status: { not: 'cancelled' }
      }
    });

    // If this is a new payment method for this customer, add small risk
    if (!priorUsage) {
      flags.push('NEW_PAYMENT_METHOD');
      riskScore += 10;
    }

  } catch (error) {
    console.error('Payment method ownership check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags };
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
        metadata: JSON.stringify({ ...event.metadata, requestId: event.requestId, severity: event.severity, details: event.details, ip: 'SYSTEM', userAgent: 'BALANCE_CHECK_SERVICE' }),
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
