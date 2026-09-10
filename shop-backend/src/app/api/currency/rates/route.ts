import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_RATES: Record<string, number> = {
  BDT: 1,
  USD: 0.0083,
  INR: 0.69,
  AED: 0.030,
  EUR: 0.0077,
  GBP: 0.0065
}

// GET - Get currency rates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || 'BDT'
    const to = searchParams.get('to')

    if (to) {
      // Get specific rate
      const rate = await prisma.currencyRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: from,
            toCurrency: to
          }
        }
      })

      if (rate) {
        return NextResponse.json({ rate })
      }

      // Calculate via inverse if direct not available
      const inverse = await prisma.currencyRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: to,
            toCurrency: from
          }
        }
      })

      if (inverse) {
        return NextResponse.json({
          rate: {
            fromCurrency: from,
            toCurrency: to,
            rate: 1 / inverse.rate,
            updatedAt: inverse.updatedAt
          }
        })
      }

      // Return default
      return NextResponse.json({
        rate: {
          fromCurrency: from,
          toCurrency: to,
          rate: DEFAULT_RATES[to] / DEFAULT_RATES[from] || 1,
          updatedAt: new Date()
        }
      })
    }

    // Get all rates from currency
    const rates = await prisma.currencyRate.findMany({
      where: { fromCurrency: from }
    })

    return NextResponse.json({ rates })
  } catch (error) {
    console.error('Currency rate error:', error)
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
  }
}

// POST - Convert amount
export async function POST(req: NextRequest) {
  try {
    const { amount, from, to } = await req.json()

    if (!amount || !from || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get rate
    const rateRecord = await prisma.currencyRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: from,
          toCurrency: to
        }
      }
    })

    let rate: number
    
    if (rateRecord) {
      rate = rateRecord.rate
    } else {
      // Use default or calculate
      rate = DEFAULT_RATES[to] / DEFAULT_RATES[from] || 1
    }

    const converted = amount * rate

    return NextResponse.json({
      original: { amount, currency: from },
      converted: { amount: converted, currency: to },
      rate,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json({ error: 'Failed to convert' }, { status: 500 })
  }
}

// PUT - Update rates (admin only)
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Verify admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { rates } = await req.json()

    // Bulk update rates
    const updated = await Promise.all(
      rates.map(async (r: any) => {
        return prisma.currencyRate.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency: r.from,
              toCurrency: r.to
            }
          },
          update: { rate: r.rate, updatedAt: new Date() },
          create: {
            fromCurrency: r.from,
            toCurrency: r.to,
            rate: r.rate
          }
        })
      })
    )

    return NextResponse.json({ success: true, updated: updated.length })
  } catch (error) {
    console.error('Rate update error:', error)
    return NextResponse.json({ error: 'Failed to update rates' }, { status: 500 })
  }
}
