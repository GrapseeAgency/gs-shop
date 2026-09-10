import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const dealTypeConfig: Record<string, { icon: string; color: string; label: string }> = {
  flash: { icon: '', color: 'amber', label: 'Flash Sale' },
  bundle: { icon: '', color: 'violet', label: 'Bundle Deal' },
  clearance: { icon: '', color: 'rose', label: 'Clearance' },
  seasonal: { icon: '', color: 'emerald', label: 'Seasonal' },
  anniversary: { icon: '', color: 'pink', label: 'Anniversary' },
  black_friday: { icon: '', color: 'gray', label: 'Black Friday' },
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dealType = searchParams.get('type')
    const month = searchParams.get('month')
    const activeOnly = searchParams.get('active') !== 'false'
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (dealType) where.dealType = dealType
    if (activeOnly) where.isActive = true

    let deals = await prisma.dealCalendar.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      take: limit,
    })

    if (deals.length === 0) {
      deals = [] as any
    }

    // Enrich deals with computed fields
    let result = deals.map((d: any) => {
      const startDate = new Date(d.startsAt)
      const endDate = new Date(d.endsAt)
      const now = new Date()

      return {
        ...d,
        month: getMonthKey(d.startsAt),
        config: dealTypeConfig[d.dealType] || { icon: '', color: 'gray', label: d.dealType },
        isLive: now >= startDate && now <= endDate,
        isUpcoming: now < startDate,
        isPast: now > endDate,
        daysUntilStart: Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        daysUntilEnd: Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      }
    })

    // Filter by month if specified
    if (month) {
      result = result.filter((d: any) => d.month.toLowerCase().includes(month.toLowerCase()))
    }

    // Group by month
    const byMonth: Record<string, any[]> = {}
    for (const deal of result) {
      const key = deal.month
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(deal)
    }

    // Current and upcoming live deals
    const liveDeals = result.filter((d: any) => d.isLive)
    const upcomingDeals = result.filter((d: any) => d.isUpcoming).slice(0, 5)

    return NextResponse.json({
      deals: result,
      total: result.length,
      byMonth,
      liveDeals,
      upcomingDeals,
      dealTypes: Object.entries(dealTypeConfig).map(([key, val]) => ({ type: key, ...val })),
    })
  } catch (error) {
    console.error('Deal calendar list error:', error)
    return NextResponse.json(
      {
        deals: [].map(d => ({
          ...d,
          config: dealTypeConfig[d.dealType] || { icon: '', color: 'gray', label: d.dealType },
          isLive: false,
          isUpcoming: true,
          isPast: false,
          daysUntilStart: 30,
          daysUntilEnd: 37,
          durationDays: 7,
        })),
        total: [].length,
        byMonth: {},
        liveDeals: [],
        upcomingDeals: [].slice(0, 5),
        dealTypes: Object.entries(dealTypeConfig).map(([key, val]) => ({ type: key, ...val })),
      },
      { status: 200 }
    )
  }
}
