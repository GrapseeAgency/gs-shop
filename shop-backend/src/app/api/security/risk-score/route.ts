import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface RiskScoreRequest {
  orderId: string;
  customerEmail: string;
  paymentId: string;
  amount: number;
  checks: {
    paymentVerification: any;
    fraudDetection: any;
    balanceCheck: any;
    inventoryCheck: any;
  };
}

interface RiskAssessmentResult {
  overallRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'REJECT';
  confidence: number; // 0-100
  factors: {
    paymentRisk: number;
    fraudRisk: number;
    financialRisk: number;
    inventoryRisk: number;
    behavioralRisk: number;
  };
  flags: string[];
  recommendations: string[];
  requiresManualReview: boolean;
  autoBlockReason?: string;
  nextSteps: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const body: RiskScoreRequest = await request.json();
    const { orderId, customerEmail, paymentId, amount, checks } = body;

    // CRITICAL: Input validation
    if (!orderId || !customerEmail || !paymentId || !amount || !checks) {
      await logSecurityEvent({
        requestId,
        type: 'RISK_SCORING_FAILED',
        severity: 'HIGH',
        details: 'Missing required fields for risk assessment',
        metadata: { body }
      });
      return NextResponse.json({ 
        error: "Invalid risk scoring request",
        requestId 
      }, { status: 400 });
    }

    // Get order and customer context
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

    // CRITICAL: Calculate individual risk factors
    const riskFactors = await Promise.all([
      calculatePaymentRisk(checks.paymentVerification, order),
      calculateFraudRisk(checks.fraudDetection, customerEmail),
      calculateFinancialRisk(checks.balanceCheck, amount, order),
      calculateInventoryRisk(checks.inventoryCheck, order),
      calculateBehavioralRisk(customerEmail, order, request)
    ]);

    // CRITICAL: Apply risk scoring algorithm
    const weightedRisk = calculateWeightedRisk(riskFactors);
    
    // CRITICAL: Apply contextual adjustments
    const contextualAdjustments = await applyContextualAdjustments(
      weightedRisk,
      customerEmail,
      order,
      riskFactors
    );

    // CRITICAL: Apply business rules
    const businessRuleAdjustments = applyBusinessRules(contextualAdjustments, order);

    // CRITICAL: Final risk assessment
    const finalAssessment = generateFinalAssessment(businessRuleAdjustments, riskFactors);

    // CRITICAL: Generate recommendations
    const recommendations = generateRecommendations(finalAssessment, riskFactors);

    // CRITICAL: Log risk assessment
    await logSecurityEvent({
      requestId,
      type: finalAssessment.decision === 'BLOCK' || finalAssessment.decision === 'REJECT' ? 'RISK_ASSESSMENT_BLOCKED' : 'RISK_ASSESSMENT_COMPLETED',
      severity: finalAssessment.decision === 'BLOCK' || finalAssessment.decision === 'REJECT' ? 'CRITICAL' : 
                finalAssessment.decision === 'REVIEW' ? 'HIGH' : 'MEDIUM',
      details: `Risk Score: ${finalAssessment.overallRiskScore}, Decision: ${finalAssessment.decision}`,
      metadata: {
        orderId,
        customerEmail,
        overallRiskScore: finalAssessment.overallRiskScore,
        riskLevel: finalAssessment.riskLevel,
        decision: finalAssessment.decision,
        confidence: finalAssessment.confidence,
        factors: finalAssessment.factors,
        flags: finalAssessment.flags,
        requiresManualReview: finalAssessment.requiresManualReview,
        assessmentTime: Date.now() - startTime
      }
    });

    // CRITICAL: Update order based on decision
    if (finalAssessment.decision === 'BLOCK' || finalAssessment.decision === 'REJECT') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'rejected',
          notes: `Rejected by risk assessment: ${finalAssessment.autoBlockReason || 'High risk score'}`
        }
      });
    } else if (finalAssessment.requiresManualReview) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'review',
          notes: `Flagged for manual review: ${finalAssessment.flags.join(', ')}`
        }
      });
    }

    return NextResponse.json({
      ...finalAssessment,
      requestId,
      assessedAt: new Date().toISOString(),
      assessmentTime: Date.now() - startTime
    });

  } catch (error) {
    await logSecurityEvent({
      requestId,
      type: 'RISK_SCORING_ERROR',
      severity: 'HIGH',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: { error: String(error) }
    });

    // CRITICAL: Fail secure - on error, treat as high risk
    return NextResponse.json({
      overallRiskScore: 75,
      riskLevel: 'HIGH' as const,
      decision: 'REVIEW' as const,
      confidence: 50,
      factors: {
        paymentRisk: 50,
        fraudRisk: 50,
        financialRisk: 50,
        inventoryRisk: 50,
        behavioralRisk: 50
      },
      flags: ['SYSTEM_ERROR'],
      recommendations: ['Manual review required due to system error'],
      requiresManualReview: true,
      nextSteps: ['Manual review required'],
      requestId,
      error: "Risk assessment completed with warnings"
    }, { status: 500 });
  }
}

// CRITICAL: Payment risk calculation
async function calculatePaymentRisk(paymentVerification: any, order: any): Promise<number> {
  let riskScore = 0;

  if (!paymentVerification.valid) {
    riskScore += 50;
  }

  if (paymentVerification.riskScore > 50) {
    riskScore += paymentVerification.riskScore * 0.5;
  }

  if (paymentVerification.fraudFlags && paymentVerification.fraudFlags.length > 0) {
    riskScore += paymentVerification.fraudFlags.length * 15;
  }

  // Payment method risk weights
  const paymentMethodRisk = {
    'card': 10,
    'bank': 15,
    'wallet': 20
  };

  riskScore += paymentMethodRisk[order.paymentMethod as keyof typeof paymentMethodRisk] || 25;

  return Math.min(100, riskScore);
}

// CRITICAL: Fraud risk calculation
async function calculateFraudRisk(fraudDetection: any, customerEmail: string): Promise<number> {
  let riskScore = 0;

  if (fraudDetection.riskScore > 0) {
    riskScore += fraudDetection.riskScore;
  }

  if (fraudDetection.fraudFlags && fraudDetection.fraudFlags.length > 0) {
    const criticalFlags = ['BLACKLISTED_EMAIL', 'BLACKLISTED_IP', 'COMPROMISED_DEVICE'];
    const hasCriticalFlag = fraudDetection.fraudFlags.some((flag: string) => criticalFlags.includes(flag));
    
    if (hasCriticalFlag) {
      riskScore += 50;
    } else {
      riskScore += fraudDetection.fraudFlags.length * 10;
    }
  }

  // Historical fraud analysis
  const historicalRisk = await getHistoricalFraudRisk(customerEmail);
  riskScore += historicalRisk;

  return Math.min(100, riskScore);
}

// CRITICAL: Financial risk calculation
async function calculateFinancialRisk(balanceCheck: any, amount: number, order: any): Promise<number> {
  let riskScore = 0;

  if (!balanceCheck.sufficient) {
    riskScore += 60;
  }

  if (balanceCheck.riskScore > 30) {
    riskScore += balanceCheck.riskScore * 0.7;
  }

  // Amount-based risk
  if (amount > 1000) riskScore += 15;
  if (amount > 5000) riskScore += 25;
  if (amount > 10000) riskScore += 35;

  // Account status risk
  if (balanceCheck.accountStatus !== 'active') {
    riskScore += 40;
  }

  return Math.min(100, riskScore);
}

// CRITICAL: Inventory risk calculation
async function calculateInventoryRisk(inventoryCheck: any, order: any): Promise<number> {
  let riskScore = 0;

  if (!inventoryCheck.allAvailable) {
    riskScore += 70;
  }

  if (inventoryCheck.overallRiskScore > 40) {
    riskScore += inventoryCheck.overallRiskScore * 0.6;
  }

  // Check for high-value items
  const hasHighValueItem = order.items.some((item: any) => item.price > 1000);
  if (hasHighValueItem) {
    riskScore += 20;
  }

  // Check for unique items (higher risk)
  const hasUniqueItem = order.items.some((item: any) => item.product?.isUnique);
  if (hasUniqueItem) {
    riskScore += 15;
  }

  return Math.min(100, riskScore);
}

// CRITICAL: Behavioral risk calculation
async function calculateBehavioralRisk(customerEmail: string, order: any, request: NextRequest): Promise<number> {
  let riskScore = 0;

  try {
    // Customer history analysis
    const customerHistory = await getCustomerHistory(customerEmail);
    
    // New customer risk
    if (customerHistory.orderCount === 0) {
      riskScore += 20;
    }

    // Recent account creation
    if (customerHistory.accountAge < 24 * 60 * 60 * 1000) { // Less than 1 day
      riskScore += 25;
    }

    // Unusual behavior patterns
    if (customerHistory.unusualPatterns) {
      riskScore += 30;
    }

    // Time-based patterns
    const orderHour = new Date(order.createdAt).getHours();
    if (orderHour >= 1 && orderHour <= 5) { // Unusual ordering hours
      riskScore += 10;
    }

    // Velocity checks
    if (customerHistory.recentOrderCount > 5) {
      riskScore += 20;
    }

  } catch (error) {
    console.error('Behavioral risk calculation failed:', error);
    riskScore += 10;
  }

  return Math.min(100, riskScore);
}

// CRITICAL: Weighted risk calculation
function calculateWeightedRisk(riskFactors: number[]): {
  paymentRisk: number;
  fraudRisk: number;
  financialRisk: number;
  inventoryRisk: number;
  behavioralRisk: number;
  overall: number;
} {
  const weights = {
    paymentRisk: 0.25,
    fraudRisk: 0.30,
    financialRisk: 0.20,
    inventoryRisk: 0.15,
    behavioralRisk: 0.10
  };

  const paymentRisk = riskFactors[0];
  const fraudRisk = riskFactors[1];
  const financialRisk = riskFactors[2];
  const inventoryRisk = riskFactors[3];
  const behavioralRisk = riskFactors[4];

  const overall = Math.min(100, 
    paymentRisk * weights.paymentRisk +
    fraudRisk * weights.fraudRisk +
    financialRisk * weights.financialRisk +
    inventoryRisk * weights.inventoryRisk +
    behavioralRisk * weights.behavioralRisk
  );

  return {
    paymentRisk,
    fraudRisk,
    financialRisk,
    inventoryRisk,
    behavioralRisk,
    overall
  };
}

// CRITICAL: Contextual adjustments
async function applyContextualAdjustments(
  weightedRisk: any,
  customerEmail: string,
  order: any,
  riskFactors: number[]
): Promise<any> {
  let adjustedRisk = { ...weightedRisk };

  try {
    // VIP customer adjustment
    const isVip = await checkVipStatus(customerEmail);
    if (isVip) {
      adjustedRisk.overall = Math.max(0, adjustedRisk.overall - 15);
    }

    // High-value customer adjustment
    const customerValue = await getCustomerValue(customerEmail);
    if (customerValue > 10000) {
      adjustedRisk.overall = Math.max(0, adjustedRisk.overall - 10);
    }

    // Geographic risk adjustment
    const geographicRisk = await getGeographicRisk(order);
    adjustedRisk.overall += geographicRisk;

    // Seasonal adjustment (holiday shopping, etc.)
    const seasonalAdjustment = getSeasonalAdjustment();
    adjustedRisk.overall += seasonalAdjustment;

  } catch (error) {
    console.error('Contextual adjustments failed:', error);
  }

  return adjustedRisk;
}

// CRITICAL: Business rules application
function applyBusinessRules(contextualRisk: any, order: any): any {
  let finalRisk = { ...contextualRisk };

  // Rule: Any single critical flag = immediate high risk
  if (finalRisk.fraudRisk > 80 || finalRisk.financialRisk > 80) {
    finalRisk.overall = Math.max(90, finalRisk.overall);
  }

  // Rule: High-value orders get stricter scrutiny
  if (order.total > 5000) {
    finalRisk.overall = Math.min(100, finalRisk.overall * 1.2);
  }

  // Rule: New customer penalty
  if (finalRisk.behavioralRisk > 50) {
    finalRisk.overall = Math.min(100, finalRisk.overall * 1.1);
  }

  // Rule: Multiple risk factors compound
  const highRiskFactors = Object.values(finalRisk).filter((risk: unknown) => typeof risk === 'number' && risk > 60).length;
  if (highRiskFactors > 2) {
    finalRisk.overall = Math.min(100, finalRisk.overall * 1.15);
  }

  return finalRisk;
}

// CRITICAL: Final assessment generation
function generateFinalAssessment(
  finalRisk: any, 
  riskFactors: number[]
): Omit<RiskAssessmentResult, 'recommendations' | 'nextSteps' | 'requestId' | 'assessedAt' | 'assessmentTime'> {
  const overallRiskScore = Math.round(finalRisk.overall);
  
  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (overallRiskScore >= 80) riskLevel = 'CRITICAL';
  else if (overallRiskScore >= 60) riskLevel = 'HIGH';
  else if (overallRiskScore >= 30) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  // Determine decision
  let decision: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'REJECT';
  let autoBlockReason: string | undefined;
  let requiresManualReview = false;

  if (overallRiskScore >= 85 || riskFactors[1] > 90) { // Critical fraud risk
    decision = 'REJECT';
    autoBlockReason = 'Critical security risk detected';
  } else if (overallRiskScore >= 75) {
    decision = 'BLOCK';
    autoBlockReason = 'High risk score - automatic block';
  } else if (overallRiskScore >= 50) {
    decision = 'REVIEW';
    requiresManualReview = true;
  } else {
    decision = 'APPROVE';
  }

  // Calculate confidence
  const confidence = Math.max(0, 100 - Math.abs(50 - overallRiskScore));

  // Generate flags
  const flags: string[] = [];
  if (finalRisk.paymentRisk > 60) flags.push('PAYMENT_RISK');
  if (finalRisk.fraudRisk > 60) flags.push('FRAUD_RISK');
  if (finalRisk.financialRisk > 60) flags.push('FINANCIAL_RISK');
  if (finalRisk.inventoryRisk > 60) flags.push('INVENTORY_RISK');
  if (finalRisk.behavioralRisk > 60) flags.push('BEHAVIORAL_RISK');

  return {
    overallRiskScore,
    riskLevel,
    decision,
    confidence,
    factors: {
      paymentRisk: Math.round(finalRisk.paymentRisk),
      fraudRisk: Math.round(finalRisk.fraudRisk),
      financialRisk: Math.round(finalRisk.financialRisk),
      inventoryRisk: Math.round(finalRisk.inventoryRisk),
      behavioralRisk: Math.round(finalRisk.behavioralRisk)
    },
    flags,
    requiresManualReview,
    autoBlockReason
  };
}

// CRITICAL: Generate recommendations
function generateRecommendations(
  assessment: Omit<RiskAssessmentResult, 'recommendations' | 'nextSteps'>,
  riskFactors: number[]
): { recommendations: string[]; nextSteps: string[] } {
  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  if (assessment.decision === 'APPROVE') {
    nextSteps.push('Process order normally');
    if (assessment.overallRiskScore > 20) {
      recommendations.push('Monitor order fulfillment');
    }
  } else if (assessment.decision === 'REVIEW') {
    recommendations.push('Manual review required');
    recommendations.push('Verify customer identity');
    nextSteps.push('Queue for manual review');
    nextSteps.push('Notify security team');
  } else if (assessment.decision === 'BLOCK') {
    recommendations.push('Order blocked automatically');
    recommendations.push('Investigate suspicious activity');
    nextSteps.push('Notify customer of block');
    nextSteps.push('Create security incident ticket');
  } else if (assessment.decision === 'REJECT') {
    recommendations.push('Order rejected - critical risk');
    recommendations.push('Blacklist if necessary');
    nextSteps.push('Permanently reject order');
    nextSteps.push('Escalate to security leadership');
  }

  // Specific recommendations based on risk factors
  if (assessment.factors.paymentRisk > 50) {
    recommendations.push('Verify payment method authenticity');
  }
  if (assessment.factors.fraudRisk > 50) {
    recommendations.push('Enhanced fraud monitoring required');
  }
  if (assessment.factors.financialRisk > 50) {
    recommendations.push('Verify customer financial capacity');
  }
  if (assessment.factors.inventoryRisk > 50) {
    recommendations.push('Verify inventory availability');
  }
  if (assessment.factors.behavioralRisk > 50) {
    recommendations.push('Monitor customer behavior patterns');
  }

  return { recommendations, nextSteps };
}

// Helper functions (simplified implementations)
async function getHistoricalFraudRisk(customerEmail: string): Promise<number> {
  // Check customer's historical fraud indicators
  return 0;
}

async function getCustomerHistory(customerEmail: string): Promise<{
  orderCount: number;
  accountAge: number;
  unusualPatterns: boolean;
  recentOrderCount: number;
}> {
  return {
    orderCount: 0,
    accountAge: Date.now(),
    unusualPatterns: false,
    recentOrderCount: 0
  };
}

async function checkVipStatus(customerEmail: string): Promise<boolean> {
  return false;
}

async function getCustomerValue(customerEmail: string): Promise<number> {
  return 0;
}

async function getGeographicRisk(order: any): Promise<number> {
  return 0;
}

function getSeasonalAdjustment(): number {
  return 0;
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
        metadata: JSON.stringify({ ...event.metadata, requestId: event.requestId, severity: event.severity, details: event.details, ip: 'SYSTEM', userAgent: 'RISK_SCORING_ENGINE' }),
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
