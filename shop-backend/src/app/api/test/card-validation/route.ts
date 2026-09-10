import { NextRequest, NextResponse } from "next/server";
import { validateInternationalCard, validateInternationalBank } from "@/lib/card-validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, cardData, bankData } = body;

    if (type === 'card') {
      // Test real card validation
      const result = await validateInternationalCard(
        cardData.cardNumber,
        cardData.expiryMonth,
        cardData.expiryYear,
        cardData.cvv
      );

      return NextResponse.json({
        success: true,
        type: 'card',
        result,
        testInfo: {
          cardNumber: `****-****-****-${cardData.cardNumber.slice(-4)}`,
          timestamp: new Date().toISOString()
        }
      });

    } else if (type === 'bank') {
      // Test real bank validation
      const result = await validateInternationalBank(
        bankData.iban,
        bankData.swift,
        bankData.accountHolder
      );

      return NextResponse.json({
        success: true,
        type: 'bank',
        result,
        testInfo: {
          iban: bankData.iban.substring(0, 4) + '****' + bankData.iban.slice(-4),
          swift: bankData.swift,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      return NextResponse.json({
        error: 'Invalid test type. Use "card" or "bank"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Card validation test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Test with sample data
export async function GET() {
  try {
    // Test with known test cards
    const testCards = [
      {
        name: 'Valid Visa Test',
        cardNumber: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123'
      },
      {
        name: 'Valid Mastercard Test',
        cardNumber: '5555555555554444',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123'
      },
      {
        name: 'Invalid Card Test',
        cardNumber: '1234567890123456',
        expiryMonth: '12',
        expiryYear: '25',
        cvv: '123'
      }
    ];

    const results = [];

    for (const testCard of testCards) {
      const result = await validateInternationalCard(
        testCard.cardNumber,
        testCard.expiryMonth,
        testCard.expiryYear,
        testCard.cvv
      );

      results.push({
        name: testCard.name,
        result: {
          valid: result.valid,
          canProcess: result.canProcess,
          fraudScore: result.fraudScore,
          brand: result.brand,
          issuer: result.issuer.name,
          recommendations: result.recommendations
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Card validation system test results',
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Card validation test failed:', error);
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
