import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    if (!q.trim()) {
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        query: q,
      })
    }

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ],
    }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { rating: 'desc' },
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
        },
      }),
      prisma.product.count({ where
      }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query: q,
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
