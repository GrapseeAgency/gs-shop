import { NextRequest, NextResponse } from "next/server";
import { validateIBANComplete } from "@/lib/external-apis";

export async function GET() {
  try {
    console.log('[TEST_IBAN] Starting IBAN validation pipeline test');
    
    // Test cases for complete IBAN validation
    const testCases = [
      {
        name: 'Valid German IBAN',
        iban: 'DE89370400440532013000',
        expectedValid: true
      },
      {
        name: 'Valid French IBAN',
        iban: 'FR1420041010050500013M02606',
        expectedValid: true
      },
      {
        name: 'Invalid IBAN format',
        iban: 'INVALID123',
        expectedValid: false
      },
      {
        name: 'Invalid checksum IBAN',
        iban: 'DE89370400440532013001', // Changed last digit
        expectedValid: false
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`[TEST_IBAN] Testing: ${testCase.name}`);
        const result = await validateIBANComplete(testCase.iban);
        
        results.push({
          name: testCase.name,
          iban: testCase.iban,
          expectedValid: testCase.expectedValid,
          actualValid: result.success,
          source: result.source,
          data: result.data,
          error: result.error,
          passed: result.success === testCase.expectedValid
        });

      } catch (error) {
        results.push({
          name: testCase.name,
          iban: testCase.iban,
          expectedValid: testCase.expectedValid,
          actualValid: false,
          source: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          passed: false
        });
      }
    }

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;

    return NextResponse.json({
      success: true,
      message: 'IBAN validation pipeline test results',
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        allPassed: passedTests === totalTests
      },
      results
    });

  } catch (error) {
    console.error('IBAN validation test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'IBAN validation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Test with custom IBAN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { iban } = body;

    if (!iban) {
      return NextResponse.json({
        error: 'IBAN is required'
      }, { status: 400 });
    }

    console.log(`[TEST_IBAN] Testing custom IBAN: ${iban}`);
    const result = await validateIBANComplete(iban);

    return NextResponse.json({
      success: true,
      iban,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom IBAN test failed:', error);
    return NextResponse.json({
      error: 'Custom IBAN test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
