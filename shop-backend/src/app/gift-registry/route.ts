import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const occasion = searchParams.get('occasion')
    const createdBy = searchParams.get('createdBy')
    const isPublic = searchParams.get('public')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (occasion) where.occasion = occasion
    if (createdBy) where.createdBy = createdBy
    if (isPublic === 'true') where.isPublic = true

    let registries = await prisma.giftRegistry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (registries.length === 0) {
      registries = [] as any
    }

    const result = registries.map((r: any) => ({
      ...r,
      productIds: typeof r.productIds === 'string' ? JSON.parse(r.productIds) : r.productIds,
      itemCount: typeof r.productIds === 'string'
        ? JSON.parse(r.productIds).length
        : (r.productIds as any[])?.length || 0,
      daysUntilEvent: r.eventDate
        ? Math.max(0, Math.ceil((new Date(r.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null,
    }))

    return NextResponse.json({ registries: result, total: result.length })
  } catch (error) {
    console.error('Gift registry list error:', error)
    return NextResponse.json(
      { registries: [].map(r => ({
        ...r,
        productIds: JSON.parse(r.productIds),
        itemCount: JSON.parse(r.productIds).length,
        daysUntilEvent: Math.max(0, Math.ceil((new Date(r.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      })), total: [].length },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, occasion, productIds, createdBy, isPublic, eventDate } = body

    if (!title || !occasion || !createdBy) {
      return NextResponse.json(
        { error: 'title, occasion, and createdBy are required' },
        { status: 400 }
      )
    }

    const validOccasions = ['wedding', 'birthday', 'baby', 'housewarming', 'graduation']
    if (!validOccasions.includes(occasion)) {
      return NextResponse.json(
        { error: `Invalid occasion. Must be one of: ${validOccasions.join(', ')}` },
        { status: 400 }
      )
    }

    const registry = await prisma.giftRegistry.create({
      data: {
        title,
        description: description || null,
        occasion,
        productIds: JSON.stringify(productIds || []),
        createdBy,
        isPublic: isPublic !== false,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
    })

    return NextResponse.json({
      success: true,
      registry: {
        ...registry,
        productIds: JSON.parse(registry.productIds),
        itemCount: JSON.parse(registry.productIds).length,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Gift registry create error:', error)
    return NextResponse.json(
      { error: 'Failed to create gift registry' },
      { status: 500 }
    )
  }
}
