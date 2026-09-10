import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, severity, details } = body;

    if (!type || !severity || !details) {
      return NextResponse.json({
        error: 'type, severity, and details are required'
      }, { status: 400 });
    }

    console.log(`[TEST_SECURITY_LOG] Testing log event: ${type}`);
    
    // Create security log directly
    await prisma.securityLog.create({
      data: {
        id: `test-${Date.now()}`,
        userId: 'TEST_USER',
        type,
        action: 'test',
        metadata: JSON.stringify({ test: true, timestamp: new Date().toISOString(), severity, details }),
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Security event logged successfully',
      event: { type, severity, details },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Security log test failed:', error);
    return NextResponse.json({
      error: 'Security log test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Test multiple security events
export async function GET() {
  try {
    const testEvents = [
      { type: 'test_fraud_check', severity: 'LOW', details: 'Test fraud check event' },
      { type: 'test_balance_check', severity: 'MEDIUM', details: 'Test balance check event' },
      { type: 'test_payment_verify', severity: 'HIGH', details: 'Test payment verification event' },
      { type: 'test_risk_assessment', severity: 'CRITICAL', details: 'Test risk assessment event' }
    ];

    const results = [];

    for (const event of testEvents) {
      try {
        // Create security log directly
        await prisma.securityLog.create({
          data: {
            id: `test-${Date.now()}-${Math.random()}`,
            userId: 'TEST_USER',
            type: event.type,
            action: 'test_batch',
            metadata: JSON.stringify({ test: true, batch: true, severity: event.severity, details: event.details }),
            createdAt: new Date(),
          }
        });

        results.push({
          event: event.type,
          severity: event.severity,
          status: 'success'
        });
      } catch (error) {
        results.push({
          event: event.type,
          severity: event.severity,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;

    return NextResponse.json({
      success: true,
      message: 'Security log batch test completed',
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount
      },
      results
    });

  } catch (error) {
    console.error('Security log batch test failed:', error);
    return NextResponse.json({
      error: 'Batch test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
