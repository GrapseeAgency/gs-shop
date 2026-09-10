import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Default deals to create if database is empty
const DEFAULT_DEALS = [
  {
    title: 'Spring Tech Flash Sale',
    description: 'Up to 50% off on all tech products',
    dealType: 'flash',
    discount: 50,
    startsAt: new Date('2025-03-15'),
    endsAt: new Date('2025-03-17'),
    isActive: true,
  },
  {
    title: 'Bundle Bonanza Week',
    description: 'Buy 2 get 1 free on selected bundles',
    dealType: 'bundle',
    discount: 33,
    startsAt: new Date('2025-03-20'),
    endsAt: new Date('2025-03-27'),
    isActive: true,
  },
  {
    title: 'Anniversary Mega Sale',
    description: 'Celebrating 5 years with massive discounts',
    dealType: 'anniversary',
    discount: 60,
    startsAt: new Date('2025-04-01'),
    endsAt: new Date('2025-04-07'),
    isActive: true,
  },
  {
    title: 'Clearance Blowout',
    description: 'Last chance for these items at unbeatable prices',
    dealType: 'clearance',
    discount: 70,
    startsAt: new Date('2025-04-10'),
    endsAt: new Date('2025-04-15'),
    isActive: true,
  },
  {
    title: 'Summer Seasonal Sale',
    description: 'Hot deals for the summer season',
    dealType: 'seasonal',
    discount: 40,
    startsAt: new Date('2025-06-01'),
    endsAt: new Date('2025-06-30'),
    isActive: true,
  },
  {
    title: 'Black Friday Early Access',
    description: 'VIP early access to Black Friday deals',
    dealType: 'black_friday',
    discount: 80,
    startsAt: new Date('2025-11-25'),
    endsAt: new Date('2025-11-29'),
    isActive: true,
  },
]

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
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const dealType = searchParams.get('type')
    const month = searchParams.get('month')
    const activeOnly = searchParams.get('active') !== 'false'
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Check if deals exist in database, create default ones if empty
    let dealsCount = await prisma.dealCalendar.count()
    if (dealsCount === 0) {
      await prisma.dealCalendar.createMany({
        data: DEFAULT_DEALS
      })
    }

    // Build where clause
    const whereClause: any = {}
    if (dealType) whereClause.dealType = dealType
    if (activeOnly) whereClause.isActive = true

    const [deals, total] = await Promise.all([
      prisma.dealCalendar.findMany({
        where: whereClause,
        orderBy: { startsAt: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.dealCalendar.count({ where: whereClause })
    ])

    // Enrich deals with computed fields
    let result = deals.map((deal) => {
      const startDate = new Date(deal.startsAt)
      const endDate = new Date(deal.endsAt)
      const now = new Date()

      return {
        ...deal,
        month: getMonthKey(deal.startsAt.toISOString()),
        config: dealTypeConfig[deal.dealType] || { icon: '', color: 'gray', label: deal.dealType },
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
      result = result.filter((d) => d.month.toLowerCase().includes(month.toLowerCase()))
    }

    // Group by month
    const byMonth: Record<string, any[]> = {}
    for (const deal of result) {
      const key = deal.month
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(deal)
    }

    // Current and upcoming live deals
    const liveDeals = result.filter((d) => d.isLive)
    const upcomingDeals = result.filter((d) => d.isUpcoming).slice(0, 5)

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      },
      summary: {
        byMonth,
        liveDeals,
        upcomingDeals,
        dealTypes: Object.entries(dealTypeConfig).map(([key, val]) => ({ type: key, ...val })),
        stats: {
          totalDeals: total,
          activeDeals: liveDeals.length,
          upcomingDeals: upcomingDeals.length
        }
      }
    })
  } catch (error) {
    console.error('Deal calendar list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deal calendar' },
      { status: 500 }
    )
  }
}

// POST - Create a new deal (admin function)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, dealType, discount, startsAt, endsAt, isActive = true } = body

    if (!title || !description || !dealType || !discount || !startsAt || !endsAt) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    if (!Object.keys(dealTypeConfig).includes(dealType)) {
      return NextResponse.json({ success: false, error: 'Invalid deal type' }, { status: 400 })
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json({ success: false, error: 'Discount must be between 0 and 100' }, { status: 400 })
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)

    if (startDate >= endDate) {
      return NextResponse.json({ success: false, error: 'End date must be after start date' }, { status: 400 })
    }

    const deal = await prisma.dealCalendar.create({
      data: {
        title,
        description,
        dealType,
        discount,
        startsAt: startDate,
        endsAt: endDate,
        isActive
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...deal,
        month: getMonthKey(deal.startsAt.toISOString()),
        config: dealTypeConfig[deal.dealType],
        isLive: false,
        isUpcoming: new Date() < startDate,
        isPast: new Date() > endDate,
        daysUntilStart: Math.max(0, Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        daysUntilEnd: Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      message: 'Deal created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Deal creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 })
  }
}

// PUT - Update an existing deal (admin function)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { dealId, title, description, dealType, discount, startsAt, endsAt, isActive } = body

    if (!dealId) {
      return NextResponse.json({ success: false, error: 'Deal ID is required' }, { status: 400 })
    }

    const existingDeal = await prisma.dealCalendar.findUnique({
      where: { id: dealId }
    })

    if (!existingDeal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dealType !== undefined) {
      if (!Object.keys(dealTypeConfig).includes(dealType)) {
        return NextResponse.json({ success: false, error: 'Invalid deal type' }, { status: 400 })
      }
      updateData.dealType = dealType
    }
    if (discount !== undefined) {
      if (discount < 0 || discount > 100) {
        return NextResponse.json({ success: false, error: 'Discount must be between 0 and 100' }, { status: 400 })
      }
      updateData.discount = discount
    }
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt)
    if (endsAt !== undefined) updateData.endsAt = new Date(endsAt)
    if (isActive !== undefined) updateData.isActive = isActive

    // Validate date range if both dates are provided
    if (updateData.startsAt && updateData.endsAt && updateData.startsAt >= updateData.endsAt) {
      return NextResponse.json({ success: false, error: 'End date must be after start date' }, { status: 400 })
    }

    const updatedDeal = await prisma.dealCalendar.update({
      where: { id: dealId },
      data: updateData
    })

    const startDate = new Date(updatedDeal.startsAt)
    const endDate = new Date(updatedDeal.endsAt)
    const now = new Date()

    return NextResponse.json({
      success: true,
      data: {
        ...updatedDeal,
        month: getMonthKey(updatedDeal.startsAt.toISOString()),
        config: dealTypeConfig[updatedDeal.dealType],
        isLive: now >= startDate && now <= endDate,
        isUpcoming: now < startDate,
        isPast: now > endDate,
        daysUntilStart: Math.max(0, Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        daysUntilEnd: Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        durationDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
      message: 'Deal updated successfully'
    })
  } catch (error) {
    console.error('Deal update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update deal' }, { status: 500 })
  }
}

// DELETE - Delete a deal (admin function)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    if (!dealId) {
      return NextResponse.json({ success: false, error: 'Deal ID is required' }, { status: 400 })
    }

    const existingDeal = await prisma.dealCalendar.findUnique({
      where: { id: dealId }
    })

    if (!existingDeal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 })
    }

    await prisma.dealCalendar.delete({
      where: { id: dealId }
    })

    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully'
    })
  } catch (error) {
    console.error('Deal deletion error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete deal' }, { status: 500 })
  }
}
