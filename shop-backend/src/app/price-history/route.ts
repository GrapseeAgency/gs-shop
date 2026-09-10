import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId query parameter is required' },
        { status: 400 }
      )
    }

    const priceHistory = await db.priceHistory.findMany({
      where: { productId },
      orderBy: { recordedAt: 'asc' },
    })

    // Calculate summary statistics
    const prices = priceHistory.map((ph) => ph.price)
    const summary = prices.length > 0
      ? {
          lowest: Math.min(...prices),
          highest: Math.max(...prices),
          average: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
          current: prices[prices.length - 1],
          totalRecords: prices.length,
        }
      : null

    return NextResponse.json({
      data: priceHistory,
      summary,
    })
  } catch (error) {
    console.error('[PRICE_HISTORY_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    )
  }
}
