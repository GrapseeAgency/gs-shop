import { NextRequest, NextResponse } from "next/server";
import { 
  lookupBINExternal, 
  lookupSWIFTExternal, 
  validateIBANExternal, 
  checkSanctionsExternal,
  checkFraudExternal,
  checkAPIHealth 
} from "@/lib/external-apis";

export async function GET() {
  try {
    console.log('[TEST_APIS] Starting external API health check');
    
    // Test API health
    const healthResults = await checkAPIHealth();
    
    // Test specific APIs with real data
    const testResults = {
      binTest: await testBINAPI(),
      swiftTest: await testSWIFTAPI(),
      ibanTest: await testIBANAPI(),
      sanctionTest: await testSanctionAPI(),
      fraudTest: await testFraudGuardAPI()
    };
    
    return NextResponse.json({
      success: true,
      message: 'External API test results',
      timestamp: new Date().toISOString(),
      health: healthResults,
      tests: testResults,
      summary: {
        totalAPIs: Object.keys(healthResults).length,
        workingAPIs: Object.values(healthResults).filter(Boolean).length,
        allWorking: Object.values(healthResults).every(Boolean)
      }
    });

  } catch (error) {
    console.error('External API test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function testBINAPI() {
  try {
    const result = await lookupBINExternal('411111');
    return {
      success: result.success,
      source: result.source,
      data: result.success ? {
        scheme: result.data?.scheme,
        bank: result.data?.bank?.name,
        country: result.data?.bank?.country?.alpha2
      } : null,
      error: result.error
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testSWIFTAPI() {
  try {
    const result = await lookupSWIFTExternal('CITIUS33');
    return {
      success: result.success,
      source: result.source,
      data: result.success ? {
        name: result.data?.name,
        country: result.data?.country
      } : null,
      error: result.error
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testIBANAPI() {
  try {
    const result = await validateIBANExternal('GB82WEST12345698765432');
    return {
      success: result.success,
      source: result.source,
      data: result.success ? {
        valid: result.data?.valid
      } : null,
      error: result.error
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testSanctionAPI() {
  try {
    // Test with a known safe bank
    const safeResult = await checkSanctionsExternal('US', 'Bank of America');
    
    // Test with a potentially sanctioned bank
    const sanctionedResult = await checkSanctionsExternal('IR', 'Bank Melli Iran');
    
    return {
      success: true,
      tests: {
        safeBank: {
          success: safeResult.success,
          source: safeResult.source,
          isSanctioned: safeResult.data?.isSanctioned,
          reason: safeResult.data?.reason
        },
        potentiallySanctioned: {
          success: sanctionedResult.success,
          source: sanctionedResult.source,
          isSanctioned: sanctionedResult.data?.isSanctioned,
          reason: sanctionedResult.data?.reason,
          matches: sanctionedResult.data?.matches?.length || 0
        }
      }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function testFraudGuardAPI() {
  try {
    // Test with a known safe IP (Google DNS)
    const safeIPResult = await checkFraudExternal('test@example.com', '8.8.8.8');
    
    // Test with localhost
    const localIPResult = await checkFraudExternal('test@example.com', '127.0.0.1');
    
    return {
      success: true,
      tests: {
        safePublicIP: {
          success: safeIPResult.success,
          source: safeIPResult.source,
          riskScore: safeIPResult.data?.riskScore,
          flags: safeIPResult.data?.flags,
          recommendations: safeIPResult.data?.recommendations
        },
        localIP: {
          success: localIPResult.success,
          source: localIPResult.source,
          riskScore: localIPResult.data?.riskScore,
          flags: localIPResult.data?.flags,
          recommendations: localIPResult.data?.recommendations
        }
      }
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// POST - Test with custom data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    let result;
    
    switch (type) {
      case 'bin':
        result = await testBINAPI();
        break;
      case 'swift':
        result = await testSWIFTAPI();
        break;
      case 'iban':
        result = await testIBANAPI();
        break;
      case 'sanction':
        result = await testSanctionAPI();
        break;
      default:
        return NextResponse.json({
          error: 'Invalid test type. Use: bin, swift, iban, or sanction'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom API test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
