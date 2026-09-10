import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const days = parseInt(searchParams.get('days') || '90', 10)

    if (!productId) {
      return NextResponse.json({ error: 'productId query parameter is required' }, { status: 400 })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)

    const priceHistory = await prisma.priceHistory.findMany({
      where: { productId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
    })

    const prices = priceHistory.map((ph) => ph.price)
    const summary = prices.length > 0
      ? {
          lowest: Math.min(...prices),
          highest: Math.max(...prices),
          average: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
          current: prices[prices.length - 1],
          totalRecords: prices.length,
          daysTracked: days,
        }
      : null

    return NextResponse.json({ data: priceHistory, summary })
  } catch (error) {
    console.error('[PRICE_HISTORY_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 })
  }
}

// Record current price for a product (call on price change or daily cron)
// Dedup: only inserts if no entry exists for this product today
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, price } = body

    if (!productId || typeof price !== 'number') {
      return NextResponse.json({ error: 'productId and price are required' }, { status: 400 })
    }

    // Check if we already have an entry for today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existingToday = await prisma.priceHistory.findFirst({
      where: { productId, recordedAt: { gte: todayStart, lte: todayEnd } },
    })

    if (existingToday) {
      // Update today's entry if price changed
      if (existingToday.price !== price) {
        const updated = await prisma.priceHistory.update({
          where: { id: existingToday.id },
          data: { price },
        })
        return NextResponse.json({ entry: updated, action: 'updated' })
      }
      return NextResponse.json({ entry: existingToday, action: 'unchanged' })
    }

    const entry = await prisma.priceHistory.create({
      data: { productId, price },
    })

    return NextResponse.json({ entry, action: 'created' }, { status: 201 })
  } catch (error) {
    console.error('[PRICE_HISTORY_POST]', error)
    return NextResponse.json({ error: 'Failed to record price' }, { status: 500 })
  }
}
