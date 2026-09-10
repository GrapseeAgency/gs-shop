import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get A/B tests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get('active') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.isActive = true
      where.endAt = { gte: new Date() }
    }

    const tests = await prisma.aBTest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Get results for each test
    const testsWithResults = await Promise.all(
      tests.map(async (test) => {
        const results = await prisma.aBTestResult.findMany({
          where: { testId: test.id }
        })

        const variants = JSON.parse(test.variants || '[]')

        return {
          ...test,
          variants: variants.map((v: any) => ({
            ...v,
            stats: results.find(r => r.variantId === v.id) || {
              impressions: 0,
              clicks: 0,
              conversions: 0,
              revenue: 0
            }
          }))
        }
      })
    )

    return NextResponse.json({ tests: testsWithResults })
  } catch (error) {
    console.error('A/B test fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
  }
}

// POST - Create A/B test
export async function POST(req: NextRequest) {
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

    const {
      name,
      description,
      type,
      variants,
      trafficSplit,
      startAt,
      endAt
    } = await req.json()

    const test = await prisma.aBTest.create({
      data: {
        name,
        description,
        type,
        variants: JSON.stringify(variants),
        trafficSplit: trafficSplit || '50,50',
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        isActive: true
      }
    })

    // Initialize result tracking for each variant
    for (const variant of variants) {
      await prisma.aBTestResult.create({
        data: {
          testId: test.id,
          variantId: variant.id
        }
      })
    }

    return NextResponse.json({ success: true, test })
  } catch (error) {
    console.error('A/B test creation error:', error)
    return NextResponse.json({ error: 'Failed to create test' }, { status: 500 })
  }
}

// PUT - Track A/B test event
export async function PUT(req: NextRequest) {
  try {
    const { testId, variantId, eventType } = await req.json()

    const update: any = {}
    
    switch (eventType) {
      case 'impression':
        update.impressions = { increment: 1 }
        break
      case 'click':
        update.clicks = { increment: 1 }
        break
      case 'conversion':
        update.conversions = { increment: 1 }
        break
      case 'revenue':
        // Would need amount in request
        break
    }

    await prisma.aBTestResult.updateMany({
      where: { testId, variantId },
      data: update
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('A/B test tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
