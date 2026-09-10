import { NextRequest, NextResponse } from "next/server";
import { checkFraudExternal } from "@/lib/external-apis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, email, device } = body;

    if (!ip) {
      return NextResponse.json({
        error: 'IP address is required'
      }, { status: 400 });
    }

    console.log(`[TEST_FRAUD] Testing IP: ${ip}`);
    const result = await checkFraudExternal(ip, email, device);

    return NextResponse.json({
      success: true,
      ip,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fraud detection test failed:', error);
    return NextResponse.json({
      error: 'Fraud detection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Test with sample IPs
export async function GET() {
  try {
    const testIPs = [
      { ip: '8.8.8.8', name: 'Google DNS (Safe)' },
      { ip: '1.1.1.1', name: 'Cloudflare DNS (Safe)' },
      { ip: '192.168.1.1', name: 'Private IP' }
    ];

    const results = [];

    for (const testIP of testIPs) {
      const result = await checkFraudExternal(testIP.ip);
      
      results.push({
        name: testIP.name,
        ip: testIP.ip,
        result: {
          riskScore: result.riskScore,
          isVPN: result.isVPN,
          isProxy: result.isProxy,
          isTor: result.isTor,
          country: result.country,
          source: result.source
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Fraud detection system test results',
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Fraud detection test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
