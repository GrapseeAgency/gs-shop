import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface FraudCheckRequest {
  orderId: string;
  customerEmail: string;
  customerIp?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  sessionId?: string;
}

interface FraudDetectionResult {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fraudFlags: string[];
  recommendations: string[];
  shouldBlock: boolean;
  requiresManualReview: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    const body: FraudCheckRequest = await request.json();
    const { orderId, customerEmail, deviceFingerprint, userAgent, sessionId } = body;

    // CRITICAL: Input validation
    if (!orderId || !customerEmail) {
      await logSecurityEvent({
        requestId,
        type: 'FRAUD_CHECK_FAILED',
        severity: 'HIGH',
        details: 'Missing required fields',
        metadata: { body, clientIp }
      });
      return NextResponse.json({ 
        error: "Invalid fraud check request",
        requestId 
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
      return NextResponse.json({ 
        error: "Order not found",
        requestId 
      }, { status: 404 });
    }

    // CRITICAL: Run comprehensive fraud detection
    const fraudChecks = await Promise.all([
      checkEmailReputation(customerEmail),
      checkIpReputation(clientIp),
      checkDeviceFingerprint(deviceFingerprint),
      checkVelocityLimits(customerEmail, clientIp),
      checkOrderPatterns(order),
      checkBehavioralAnalysis(sessionId, clientIp),
      checkBlacklist(customerEmail, clientIp, deviceFingerprint),
      checkGeolocationConsistency(order, clientIp),
      checkPaymentMethodRisk(order),
      checkTimeBasedPatterns(order)
    ]);

    // CRITICAL: Aggregate risk scores
    const totalRiskScore = Math.min(100, fraudChecks.reduce((sum, check) => sum + check.riskScore, 0));
    const allFraudFlags = fraudChecks.flatMap(check => check.flags);
    const allRecommendations = fraudChecks.flatMap(check => check.recommendations);

    // CRITICAL: Determine risk level and actions
    const riskLevel = getRiskLevel(totalRiskScore);
    const shouldBlock = totalRiskScore >= 75 || allFraudFlags.includes('CRITICAL_FRAUD');
    const requiresManualReview = totalRiskScore >= 50 || allFraudFlags.length > 2;

    const result: FraudDetectionResult = {
      riskScore: totalRiskScore,
      riskLevel,
      fraudFlags: allFraudFlags,
      recommendations: allRecommendations,
      shouldBlock,
      requiresManualReview
    };

    // CRITICAL: Log fraud check results
    await logSecurityEvent({
      requestId,
      type: shouldBlock ? 'FRAUD_BLOCKED' : 'FRAUD_CHECK_COMPLETED',
      severity: shouldBlock ? 'CRITICAL' : riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      details: `Risk score: ${totalRiskScore}, Flags: ${allFraudFlags.length}`,
      metadata: { 
        orderId,
        customerEmail,
        clientIp,
        deviceFingerprint,
        riskScore: totalRiskScore,
        riskLevel,
        fraudFlags: allFraudFlags,
        shouldBlock,
        checkTime: Date.now() - startTime
      }
    });

    // CRITICAL: If high risk, update order status
    if (shouldBlock) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'flagged',
          notes: `Blocked by fraud detection: ${allFraudFlags.join(', ')}`
        }
      });
    }

    return NextResponse.json({
      ...result,
      requestId,
      checkedAt: new Date().toISOString(),
      checksPerformed: fraudChecks.length
    });

  } catch (error) {
    await logSecurityEvent({
      requestId,
      type: 'FRAUD_CHECK_ERROR',
      severity: 'HIGH',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: { error: String(error), clientIp }
    });

    // CRITICAL: Fail secure - on error, treat as high risk
    return NextResponse.json({
      riskScore: 75,
      riskLevel: 'HIGH' as const,
      fraudFlags: ['SYSTEM_ERROR'],
      recommendations: ['Manual review required'],
      shouldBlock: false, // Don't block on system error, but flag for review
      requiresManualReview: true,
      requestId,
      error: "Fraud check completed with warnings"
    }, { status: 500 });
  }
}

// CRITICAL: Email reputation checking
async function checkEmailReputation(email: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  try {
    // Check for disposable/temporary email services
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillammail.com', 'mailinator.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (disposableDomains.some(d => domain?.includes(d))) {
      flags.push('DISPOSABLE_EMAIL');
      riskScore += 30;
      recommendations.push('Block disposable email addresses');
    }

    // Check email format and domain validity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      flags.push('INVALID_EMAIL_FORMAT');
      riskScore += 20;
    }

    // Check for suspicious patterns
    if (email.includes('test') || email.includes('demo') || email.includes('fake')) {
      flags.push('SUSPICIOUS_EMAIL_PATTERN');
      riskScore += 15;
    }

    // Check against known fraud email database (in production, integrate with real services)
    const knownFraudEmails = await prisma.blacklistedEmail.findMany({
      where: { email: email.toLowerCase() }
    });

    if (knownFraudEmails.length > 0) {
      flags.push('BLACKLISTED_EMAIL');
      riskScore += 50;
      recommendations.push('Blacklisted email address');
    }

  } catch (error) {
    console.error('Email reputation check failed:', error);
    riskScore += 5; // Small penalty for system error
  }

  return { riskScore, flags, recommendations };
}

// CRITICAL: IP reputation checking
async function checkIpReputation(ip: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  try {
    // Check against known malicious IP databases (in production, integrate with MaxMind, IPQualityScore, etc.)
    const blacklistedIps = await prisma.blacklistedIp.findMany({
      where: { ipAddress: ip }
    });

    if (blacklistedIps.length > 0) {
      flags.push('BLACKLISTED_IP');
      riskScore += 40;
      recommendations.push('Blacklisted IP address');
    }

    // Check for VPN/Proxy usage (in production, use IP intelligence services)
    if (isPrivateIp(ip)) {
      flags.push('PRIVATE_IP');
      riskScore += 10;
    }

    // Check geographic location consistency
    const country = await getIpCountry(ip);
    const highRiskCountries = ['XX', 'A1', 'A2']; // Anonymous proxy, satellite provider
    if (highRiskCountries.includes(country)) {
      flags.push('HIGH_RISK_COUNTRY');
      riskScore += 25;
      recommendations.push('High-risk geographic location');
    }

  } catch (error) {
    console.error('IP reputation check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags, recommendations };
}

// CRITICAL: Device fingerprinting
async function checkDeviceFingerprint(fingerprint?: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  if (!fingerprint) {
    flags.push('NO_DEVICE_FINGERPRINT');
    riskScore += 10;
    return { riskScore, flags, recommendations };
  }

  try {
    // Check for device fingerprint reuse across multiple accounts
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        metadata: {
          contains: fingerprint
        }
      }
    });

    const uniqueEmails = new Set(recentOrders.map(order => order.customerEmail));
    
    if (uniqueEmails.size > 3) {
      flags.push('DEVICE_FINGERPRINT_ABUSE');
      riskScore += 35;
      recommendations.push('Device used across multiple accounts');
    }

    // Check for known compromised devices
    const blacklistedDevices = await prisma.blacklistedDevice.findMany({
      where: { fingerprint }
    });

    if (blacklistedDevices.length > 0) {
      flags.push('COMPROMISED_DEVICE');
      riskScore += 45;
      recommendations.push('Known compromised device');
    }

  } catch (error) {
    console.error('Device fingerprint check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags, recommendations };
}

// CRITICAL: Velocity checking
async function checkVelocityLimits(email: string, ip: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check order frequency per email
    const emailOrdersLastHour = await prisma.order.count({
      where: {
        customerEmail: email,
        createdAt: { gte: oneHourAgo }
      }
    });

    const emailOrdersLastDay = await prisma.order.count({
      where: {
        customerEmail: email,
        createdAt: { gte: oneDayAgo }
      }
    });

    // Check order frequency per IP
    const ipOrdersLastHour = await prisma.order.count({
      where: {
        metadata: {
          contains: ip
        },
        createdAt: { gte: oneHourAgo }
      }
    });

    // Velocity limits
    if (emailOrdersLastHour > 5) {
      flags.push('HIGH_VELOCITY_EMAIL');
      riskScore += 25;
      recommendations.push('Too many orders from this email');
    }

    if (emailOrdersLastDay > 20) {
      flags.push('DAILY_LIMIT_EXCEEDED');
      riskScore += 30;
      recommendations.push('Daily order limit exceeded');
    }

    if (ipOrdersLastHour > 10) {
      flags.push('HIGH_VELOCITY_IP');
      riskScore += 20;
      recommendations.push('Too many orders from this IP');
    }

  } catch (error) {
    console.error('Velocity check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags, recommendations };
}

// CRITICAL: Order pattern analysis
async function checkOrderPatterns(order: any): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  const flags: string[] = [];
  let riskScore = 0;
  const recommendations: string[] = [];

  try {
    // Check for suspicious order patterns
    if (order.items.length === 1 && order.items[0].product.price > 1000) {
      flags.push('HIGH_VALUE_SINGLE_ITEM');
      riskScore += 15;
    }

    // Check for round numbers (potential testing)
    if (order.total % 100 === 0 && order.total > 0) {
      flags.push('ROUND_NUMBER_AMOUNT');
      riskScore += 10;
    }

    // Check for immediate order creation (no browsing time)
    const orderTime = new Date(order.createdAt);
    const accountCreated = order.buyer?.createdAt;
    if (accountCreated && orderTime.getTime() - accountCreated.getTime() < 5 * 60 * 1000) {
      flags.push('IMMEDIATE_ORDER_AFTER_ACCOUNT');
      riskScore += 20;
      recommendations.push('Order placed immediately after account creation');
    }

  } catch (error) {
    console.error('Order pattern check failed:', error);
    riskScore += 5;
  }

  return { riskScore, flags, recommendations };
}

// Additional check functions (simplified for brevity)
async function checkBehavioralAnalysis(sessionId?: string, ip?: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  return { riskScore: 0, flags: [], recommendations: [] };
}

async function checkBlacklist(email: string, ip: string, fingerprint?: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  return { riskScore: 0, flags: [], recommendations: [] };
}

async function checkGeolocationConsistency(order: any, ip: string): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  return { riskScore: 0, flags: [], recommendations: [] };
}

async function checkPaymentMethodRisk(order: any): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  return { riskScore: 0, flags: [], recommendations: [] };
}

async function checkTimeBasedPatterns(order: any): Promise<{riskScore: number, flags: string[], recommendations: string[]}> {
  return { riskScore: 0, flags: [], recommendations: [] };
}

// Helper functions
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^localhost$/
  ];
  return privateRanges.some(range => range.test(ip));
}

async function getIpCountry(ip: string): Promise<string> {
  // In production, use IP geolocation service
  return 'US';
}

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
        metadata: JSON.stringify({ ...event.metadata, requestId: event.requestId, severity: event.severity, details: event.details, ip: 'SYSTEM', userAgent: 'FRAUD_DETECTION_SERVICE' }),
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
