import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get forum topics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.forumTopic.count({ where
      })
    ])

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Forum topics error:', error)
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
  }
}

// POST - Create new topic
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, category, tags } = await req.json()

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const topic = await prisma.forumTopic.create({
      data: {
        authorId: userId,
        title,
        content,
        category,
        tags: tags ? JSON.stringify(tags) : '[]'
      }
    })

    return NextResponse.json({
      success: true,
      topic,
      message: 'Topic created successfully'
    })
  } catch (error) {
    console.error('Forum topic creation error:', error)
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 })
  }
}
