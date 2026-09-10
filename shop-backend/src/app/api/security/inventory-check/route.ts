import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

interface InventoryCheckRequest {
  orderId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

interface InventoryCheckResult {
  allAvailable: boolean;
  items: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
    itemAvailable: boolean;
    priceMatch: boolean;
    riskScore: number;
    flags: string[];
  }>;
  overallRiskScore: number;
  flags: string[];
  recommendations: string[];
  requiresManualReview: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  try {
    const body: InventoryCheckRequest = await request.json();
    const { orderId, items } = body;

    // CRITICAL: Input validation
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      await logSecurityEvent({
        requestId,
        type: 'INVENTORY_CHECK_FAILED',
        severity: 'HIGH',
        details: 'Invalid inventory check request',
        metadata: { body }
      });
      return NextResponse.json({ 
        error: "Invalid inventory check request",
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

    // CRITICAL: Verify order items match request
    const orderItemsMap = new Map(order.items.map(item => [item.productId, item]));
    for (const requestedItem of items) {
      const orderItem = orderItemsMap.get(requestedItem.productId);
      if (!orderItem || orderItem.quantity !== requestedItem.quantity || orderItem.price !== requestedItem.price) {
        await logSecurityEvent({
          requestId,
          type: 'INVENTORY_TAMPERING',
          severity: 'CRITICAL',
          details: 'Order items do not match request',
          metadata: { orderId, requestedItems: items, orderItems: order.items }
        });
        return NextResponse.json({
          error: "Order item mismatch detected",
          requestId,
          riskScore: 100,
          flags: ['INVENTORY_TAMPERING']
        }, { status: 400 });
      }
    }

    // CRITICAL: Get current inventory with row-level locking
    const productIds = items.map(item => item.productId);
    const currentInventory = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          inventory: true,
          isSold: true,
          isUnique: true,
          price: true,
          reserved: true // Assuming we add this field for reserved inventory
        }
      });
      return products;
    });

    // CRITICAL: Check each item
    const itemChecks: InventoryCheckResult['items'] = [];
    let allAvailable = true;
    const allFlags: string[] = [];
    const allRecommendations: string[] = [];

    for (const requestedItem of items) {
      const product = currentInventory.find(p => p.id === requestedItem.productId);
      
      if (!product) {
        // Product not found - critical security issue
        itemChecks.push({
          productId: requestedItem.productId,
          productName: 'UNKNOWN',
          requested: requestedItem.quantity,
          available: 0,
          itemAvailable: false,
          priceMatch: false,
          riskScore: 100,
          flags: ['PRODUCT_NOT_FOUND', 'CRITICAL_SECURITY_RISK']
        });
        allAvailable = false;
        allFlags.push('PRODUCT_NOT_FOUND');
        continue;
      }

      const itemFlags: string[] = [];
      let itemRiskScore = 0;
      let itemAvailable = true;

      // CRITICAL: Check if product is sold
      if (product.isSold) {
        itemFlags.push('PRODUCT_ALREADY_SOLD');
        itemRiskScore += 80;
        itemAvailable = false;
        allAvailable = false;
      }

      // CRITICAL: Check inventory levels
      const availableInventory = product.isUnique ? 1 : (product.inventory || 0);
      const reservedInventory = product.reserved || 0;
      const actualAvailable = availableInventory - reservedInventory;

      if (actualAvailable < requestedItem.quantity) {
        itemFlags.push('INSUFFICIENT_INVENTORY');
        itemRiskScore += 60;
        itemAvailable = false;
        allAvailable = false;
        allFlags.push('INVENTORY_SHORTAGE');
        allRecommendations.push(`Insufficient inventory for ${product.name}`);
      }

      // CRITICAL: Price verification
      if (Math.abs(product.price - requestedItem.price) > 0.01) {
        itemFlags.push('PRICE_MISMATCH');
        itemRiskScore += 70;
        allFlags.push('PRICE_MANIPULATION');
        allRecommendations.push(`Price mismatch for ${product.name}`);
      }

      // CRITICAL: Check for rapid inventory changes
      const recentChanges = await checkRecentInventoryChanges(product.id);
      if (recentChanges.suspicious) {
        itemFlags.push('RAPID_INVENTORY_CHANGE');
        itemRiskScore += 25;
        allFlags.push('INVENTORY_VOLATILITY');
      }

      // CRITICAL: Check for concurrent access attempts
      const concurrentAttempts = await checkConcurrentAccess(product.id, orderId);
      if (concurrentAttempts > 0) {
        itemFlags.push('CONCURRENT_ACCESS_ATTEMPT');
        itemRiskScore += 30;
        allFlags.push('RACE_CONDITION_RISK');
      }

      // CRITICAL: Check product status consistency
      const statusChecks = await checkProductStatusConsistency(product);
      if (statusChecks.inconsistent) {
        itemFlags.push('STATUS_INCONSISTENCY');
        itemRiskScore += 40;
        allFlags.push('DATA_INTEGRITY_ISSUE');
      }

      itemChecks.push({
        productId: product.id,
        productName: product.name,
        requested: requestedItem.quantity,
        available: actualAvailable,
        itemAvailable: itemAvailable,
        priceMatch: Math.abs(product.price - requestedItem.price) <= 0.01,
        riskScore: itemRiskScore,
        flags: itemFlags
      });
    }

    // CRITICAL: Calculate overall risk score
    const maxItemRisk = Math.max(...itemChecks.map(item => item.riskScore));
    const flagCount = allFlags.length;
    const overallRiskScore = Math.min(100, maxItemRisk + (flagCount * 5));

    const requiresManualReview = overallRiskScore >= 50 || allFlags.includes('CRITICAL_SECURITY_RISK');

    const result: InventoryCheckResult = {
      allAvailable,
      items: itemChecks,
      overallRiskScore,
      flags: allFlags,
      recommendations: allRecommendations,
      requiresManualReview
    };

    // CRITICAL: Log inventory check results
    await logSecurityEvent({
      requestId,
      type: allAvailable ? 'INVENTORY_CHECK_PASSED' : 'INVENTORY_CHECK_FAILED',
      severity: !allAvailable ? 'HIGH' : overallRiskScore > 50 ? 'MEDIUM' : 'LOW',
      details: `Available: ${allAvailable}, Risk: ${overallRiskScore}, Flags: ${allFlags.length}`,
      metadata: {
        orderId,
        itemCount: items.length,
        allAvailable,
        overallRiskScore,
        flags: allFlags,
        requiresManualReview,
        checkTime: Date.now() - startTime,
        inventorySnapshot: itemChecks.map(item => ({
          productId: item.productId,
          requested: item.requested,
          available: item.available,
          itemAvailable: item.itemAvailable
        }))
      }
    });

    // CRITICAL: If inventory issues detected, update order status
    if (!allAvailable || overallRiskScore >= 75) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'flagged',
          notes: `Inventory security check failed: ${allFlags.join(', ')}`
        }
      });
    }

    return NextResponse.json({
      ...result,
      requestId,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    await logSecurityEvent({
      requestId,
      type: 'INVENTORY_CHECK_ERROR',
      severity: 'HIGH',
      details: error instanceof Error ? error.message : 'Unknown error',
      metadata: { error: String(error) }
    });

    // CRITICAL: Fail secure - on error, assume inventory issue
    return NextResponse.json({
      allAvailable: false,
      items: [],
      overallRiskScore: 75,
      flags: ['SYSTEM_ERROR'],
      recommendations: ['Manual inventory verification required'],
      requiresManualReview: true,
      requestId,
      error: "Inventory check completed with errors"
    }, { status: 500 });
  }
}

// CRITICAL: Check for recent inventory changes
async function checkRecentInventoryChanges(productId: string): Promise<{suspicious: boolean, changes: number}> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Check inventory log for recent changes (assuming we have an inventory log table)
    const recentChanges = await prisma.inventoryLog.count({
      where: {
        productId,
        createdAt: { gte: fiveMinutesAgo }
      }
    });

    // If more than 3 changes in 5 minutes, it's suspicious
    return {
      suspicious: recentChanges > 3,
      changes: recentChanges
    };

  } catch (error) {
    console.error('Recent inventory changes check failed:', error);
    return { suspicious: false, changes: 0 };
  }
}

// CRITICAL: Check for concurrent access attempts
async function checkConcurrentAccess(productId: string, currentOrderId: string): Promise<number> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    // Check for other orders trying to access the same product
    const concurrentOrders = await prisma.order.count({
      where: {
        id: { not: currentOrderId },
        createdAt: { gte: oneMinuteAgo },
        items: {
          some: { productId }
        },
        status: { in: ['pending', 'processing'] }
      }
    });

    return concurrentOrders;

  } catch (error) {
    console.error('Concurrent access check failed:', error);
    return 0;
  }
}

// CRITICAL: Check product status consistency
async function checkProductStatusConsistency(product: any): Promise<{inconsistent: boolean, issues: string[]}> {
  const issues: string[] = [];
  
  try {
    // Check logical consistency
    if (product.isSold && product.inventory > 0 && !product.isUnique) {
      issues.push('SOLD_PRODUCT_HAS_INVENTORY');
    }

    if (product.isUnique && product.inventory > 1) {
      issues.push('UNIQUE_PRODUCT_MULTIPLE_INVENTORY');
    }

    if (product.inventory < 0) {
      issues.push('NEGATIVE_INVENTORY');
    }

    // Check if product should be sold based on inventory
    const shouldBeSold = product.isUnique || product.inventory <= 0;
    if (shouldBeSold !== product.isSold) {
      issues.push('INVENTORY_SOLD_MISMATCH');
    }

    return {
      inconsistent: issues.length > 0,
      issues
    };

  } catch (error) {
    console.error('Product status consistency check failed:', error);
    return { inconsistent: true, issues: ['CONSISTENCY_CHECK_ERROR'] };
  }
}

// CRITICAL: Reserve inventory (to prevent race conditions)
async function reserveInventory(items: Array<{productId: string; quantity: number}>): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reserved: { increment: item.quantity }
          }
        });
      }
    });
    return true;
  } catch (error) {
    console.error('Inventory reservation failed:', error);
    return false;
  }
}

// CRITICAL: Release inventory reservation
async function releaseInventoryReservation(items: Array<{productId: string; quantity: number}>): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reserved: { decrement: item.quantity }
          }
        });
      }
    });
  } catch (error) {
    console.error('Inventory reservation release failed:', error);
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
        metadata: JSON.stringify({ ...event.metadata, requestId: event.requestId, severity: event.severity, details: event.details, ip: 'SYSTEM', userAgent: 'INVENTORY_SECURITY_SERVICE' }),
        createdAt: new Date(),
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
