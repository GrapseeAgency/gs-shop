import { NextRequest, NextResponse } from 'next/server'

// GET - Convert prices to multiple currencies
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const amount = parseFloat(searchParams.get('amount') || '0')

    // Exchange rates ([] - would fetch from API in production)
    const rates: Record<string, number> = {
      'INR': 1,
      'USD': 0.012,
      'EUR': 0.011,
      'GBP': 0.0095,
      'AED': 0.044,
      'BDT': 1.35,
      'PKR': 3.35
    }

    const converted = Object.entries(rates).map(([currency, rate]) => ({
      currency,
      code: currency,
      amount: Math.round(amount * rate * 100) / 100,
      symbol: getCurrencySymbol(currency)
    }))

    return NextResponse.json({
      baseAmount: amount,
      baseCurrency: 'INR',
      converted,
      forExpats: {
        message: 'Sending gifts home? See prices in your family\'s currency.',
        useCase: 'Compare before you buy'
      }
    })
  } catch (error) {
    console.error('Currency converter error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'INR': '',
    'USD': '$',
    'EUR': '',
    'GBP': '',
    'AED': '.',
    'BDT': '',
    'PKR': ''
  }
  return symbols[currency] || currency
}
